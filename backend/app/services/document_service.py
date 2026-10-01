from app.services.pdf_loader import load_pdf
from app.services.text_splitter import split_documents
from app.services.vector_store import create_vector_store


def process_uploaded_pdf(
    file_path: str,
    filename: str,
) -> dict:
    documents = load_pdf(file_path)

    if not documents:
        raise ValueError(
            "The PDF does not contain readable text."
        )

    chunks = split_documents(documents)

    if not chunks:
        raise ValueError(
            "No text chunks could be created from the PDF."
        )

    create_vector_store(chunks)

    return {
        "filename": filename,
        "pages": len(documents),
        "chunks": len(chunks),
    }