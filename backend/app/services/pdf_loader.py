from pathlib import Path
import pymupdf

def load_pdf(pdf_path: str) -> list[dict]:
    """
    Extract text from a PDF page by page.

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

            text = page.get_text("text", sort=True).strip()

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