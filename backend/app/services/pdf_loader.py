from pathlib import Path
import pymupdf


def load_pdf(pdf_path: str) -> list[dict]:
    """
    Extract text from a PDF page by page.

    Uses PyMuPDF's standard text extraction first.
    If the extracted text appears corrupted, attempts
    extraction through the PDF's raw text representation.

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

    with pymupdf.open(path) as pdf:

        for page_number, page in enumerate(pdf, start=1):

            # -------------------------------------------------
            # Standard text extraction
            # -------------------------------------------------

            text = page.get_text(
                "text",
                sort=True
            ).strip()

            # -------------------------------------------------
            # Basic corruption detection
            # -------------------------------------------------

            # A healthy English academic page should contain
            # a reasonable number of alphabetic characters.
            alphabetic_chars = sum(
                character.isalpha()
                for character in text
            )

            total_chars = len(text)

            is_corrupted = (
                not text
                or total_chars == 0
                or alphabetic_chars / max(total_chars, 1) < 0.25
            )

            if is_corrupted:
                print(
                    f"Warning: suspicious text extraction "
                    f"on page {page_number}"
                )

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

    return documents