import time
from app.services.pdf_loader import load_pdf
from app.services.text_splitter import split_documents
from app.services.vector_store import create_vector_store

def process_uploaded_pdf(
    file_path: str,
    filename: str,
    user_id: int,
    document_id: int,
) -> dict:
    total_start = time.perf_counter()

    documents = load_pdf(file_path)

    extraction_time = time.perf_counter() - total_start

    if not documents:
        raise ValueError(
            "The PDF does not contain readable text."
        )

    chunk_start = time.perf_counter()

    chunks = split_documents(documents)

    chunking_time = time.perf_counter() - chunk_start

    if not chunks:
        raise ValueError(
            "No text chunks could be created from the PDF."
        )

    for chunk in chunks:
        chunk["metadata"]["source"] = filename
        chunk["metadata"]["user_id"] = user_id
        chunk["metadata"]["document_id"] = document_id

    embedding_start = time.perf_counter()

    create_vector_store(chunks)

    embedding_time = time.perf_counter() - embedding_start

    total_time = time.perf_counter() - total_start

    print("\n--- EduRAG Upload Performance ---")
    print(f"Extraction:  {extraction_time:.2f}s")
    print(f"Chunking:    {chunking_time:.2f}s")
    print(f"Embedding:   {embedding_time:.2f}s")
    print(f"Total:       {total_time:.2f}s")
    print(f"Pages:       {len(documents)}")
    print(f"Chunks:      {len(chunks)}")
    print("---------------------------------\n")

    return {
        "filename": filename,
        "pages": len(documents),
        "chunks": len(chunks),
    }