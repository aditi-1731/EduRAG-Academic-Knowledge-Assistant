import base64
import re
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import pymupdf
from langchain_core.messages import HumanMessage

from app.services.llm import get_llm


# Words that appear constantly in normal English text. If a page has
# plenty of words but almost none of these, the text layer is garbled.
COMMON_WORDS = {
    "the", "and", "is", "of", "to", "in", "for", "that", "it", "as",
    "are", "with", "on", "by", "an", "or", "this", "be", "from",
}

OCR_PROMPT = (
    "Transcribe all the text on this page exactly as written. "
    "Keep headings, bullet points, numbered lists and tables as plain text. "
    "Return only the transcribed text, with no commentary. "
    "If the page contains no readable text, return nothing."
)

OCR_DPI = 130
OCR_WORKERS = 3           # pages transcribed at the same time
OCR_MAX_RETRIES = 3
OCR_RETRY_DELAY = 20      # seconds to wait after a rate-limit error
MAX_OCR_PAGES = 60        # safety cap so one upload cannot burn all quota


def is_text_corrupted(text: str) -> bool:
    """
    Detect empty or garbled text extraction.

    Some PDFs (often converted from Word) use custom font encodings,
    so the text layer comes out as symbols instead of real letters.
    """

    if not text:
        return True

    total_chars = len(text)
    alphabetic_chars = sum(character.isalpha() for character in text)

    # Mostly symbols instead of letters.
    if alphabetic_chars / max(total_chars, 1) < 0.25:
        return True

    # Plenty of words, but almost no normal English words.
    words = re.findall(r"[A-Za-z]+", text.lower())

    if len(words) >= 15:
        common_hits = sum(word in COMMON_WORDS for word in words)

        if common_hits / len(words) < 0.05:
            return True

    return False


def render_page_to_base64(page) -> str:
    """
    Render one PDF page to a PNG image (base64 encoded).
    Done one page at a time because PyMuPDF pages are not thread-safe.
    """

    pixmap = page.get_pixmap(dpi=OCR_DPI)

    return base64.b64encode(pixmap.tobytes("png")).decode("utf-8")


def ocr_image_with_gemini(image_b64: str, page_number: int) -> str:
    """
    Let Gemini transcribe one page image.
    Needs no extra system packages, so it works on Render's free plan.
    """

    message = HumanMessage(
        content=[
            {"type": "text", "text": OCR_PROMPT},
            {
                "type": "image_url",
                "image_url": {"url": f"data:image/png;base64,{image_b64}"},
            },
        ]
    )

    llm = get_llm()

    last_error = None

    for attempt in range(1, OCR_MAX_RETRIES + 1):

        try:
            response = llm.invoke([message])

            content = response.content

            if isinstance(content, list):
                content = "".join(
                    block.get("text", "")
                    for block in content
                    if isinstance(block, dict)
                )

            content = content.strip()

            if content:
                return content

            print(
                f"Page {page_number}: OCR returned empty text "
                f"(attempt {attempt}/{OCR_MAX_RETRIES})."
            )

        except Exception as error:
            last_error = error

            print(
                f"Page {page_number}: OCR attempt "
                f"{attempt}/{OCR_MAX_RETRIES} failed: {error}"
            )

            if attempt < OCR_MAX_RETRIES:
                time.sleep(OCR_RETRY_DELAY)

    if last_error is not None:
        raise RuntimeError(f"OCR failed for page {page_number}.") from last_error

    return ""


def load_pdf(pdf_path: str) -> list[dict]:
    """
    Extract text from a PDF page by page.

    Uses PyMuPDF's standard text extraction first. If a page's text
    is empty or garbled, the page is transcribed with Gemini vision
    instead (several pages in parallel), so unreadable text is never
    stored.

    Returns:
        A list of dictionaries containing:
        - page_content: extracted text
        - metadata: document and page information
    """

    path = Path(pdf_path)

    if not path.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    if path.suffix.lower() != ".pdf":
        raise ValueError("The provided file must be a PDF.")

    page_texts = {}   # page number -> text
    ocr_images = {}   # page number -> base64 image

    with pymupdf.open(path) as pdf:

        for page_number, page in enumerate(pdf, start=1):

            text = page.get_text(
                "text",
                sort=True,
            ).strip()

            if not is_text_corrupted(text):
                page_texts[page_number] = text
                continue

            if len(ocr_images) >= MAX_OCR_PAGES:
                print(
                    f"Page {page_number}: unreadable text and OCR "
                    f"page limit reached. Skipping page."
                )
                continue

            ocr_images[page_number] = render_page_to_base64(page)

    skipped_pages = []

    if ocr_images:
        print(
            f"Running OCR on {len(ocr_images)} page(s) "
            f"with {OCR_WORKERS} workers..."
        )

        with ThreadPoolExecutor(max_workers=OCR_WORKERS) as executor:
            futures = {
                page_number: executor.submit(
                    ocr_image_with_gemini,
                    image_b64,
                    page_number,
                )
                for page_number, image_b64 in ocr_images.items()
            }

        for page_number, future in futures.items():

            try:
                text = future.result()
            except RuntimeError as error:
                print(f"Page {page_number}: {error} Skipping page.")
                text = ""

            if text:
                print(f"Page {page_number}: OCR read {len(text)} characters.")
                page_texts[page_number] = text
            else:
                skipped_pages.append(page_number)

    if skipped_pages:
        print(f"Pages with no usable text (skipped): {sorted(skipped_pages)}")

    return [
        {
            "page_content": page_texts[page_number],
            "metadata": {
                "source": path.name,
                "page": page_number,
            },
        }
        for page_number in sorted(page_texts)
    ]