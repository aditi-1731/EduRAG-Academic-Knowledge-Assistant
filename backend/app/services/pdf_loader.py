import base64
import re
import time
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

OCR_DPI = 150
OCR_MAX_RETRIES = 3
OCR_RETRY_DELAY = 20      # seconds to wait after a rate-limit error
OCR_PAGE_DELAY = 1.0      # small pause between pages to stay under limits
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


def ocr_page_with_gemini(page) -> str:
    """
    Render one PDF page to an image and let Gemini transcribe it.
    Needs no extra system packages, so it works on Render's free plan.
    """

    pixmap = page.get_pixmap(dpi=OCR_DPI)
    image_b64 = base64.b64encode(pixmap.tobytes("png")).decode("utf-8")

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

            return content.strip()

        except Exception as error:
            last_error = error

            print(f"OCR attempt {attempt}/{OCR_MAX_RETRIES} failed: {error}")

            if attempt == OCR_MAX_RETRIES:
                break

            time.sleep(OCR_RETRY_DELAY)

    raise RuntimeError("OCR failed for this page.") from last_error


def load_pdf(pdf_path: str) -> list[dict]:
    """
    Extract text from a PDF page by page.

    Uses PyMuPDF's standard text extraction first. If a page's text
    is empty or garbled, the page is transcribed with Gemini vision
    instead, so unreadable text is never stored.

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

    documents = []
    ocr_pages_used = 0

    with pymupdf.open(path) as pdf:

        for page_number, page in enumerate(pdf, start=1):

            text = page.get_text(
                "text",
                sort=True,
            ).strip()

            if is_text_corrupted(text):

                if ocr_pages_used >= MAX_OCR_PAGES:
                    print(
                        f"Page {page_number}: unreadable text and OCR "
                        f"page limit reached. Skipping page."
                    )
                    continue

                print(
                    f"Page {page_number}: unreadable text layer. "
                    f"Running OCR..."
                )

                try:
                    text = ocr_page_with_gemini(page)
                except RuntimeError as error:
                    print(f"Page {page_number}: {error} Skipping page.")
                    continue

                ocr_pages_used += 1

                time.sleep(OCR_PAGE_DELAY)

            if not text:
                continue

            documents.append(
                {
                    "page_content": text,
                    "metadata": {
                        "source": path.name,
                        "page": page_number,
                    },
                }
            )

    if ocr_pages_used:
        print(f"OCR was used on {ocr_pages_used} page(s).")

    return documents