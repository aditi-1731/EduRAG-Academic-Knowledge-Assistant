from app.services.pdf_loader import load_pdf
from app.services.text_splitter import split_documents
from app.services.vector_store import create_vector_store

PDF_PATH = "data/documents/WT_Unit_1.pdf"

print("Loading PDF...")

documents = load_pdf(PDF_PATH)

print(f"Pages extracted: {len(documents)}")


print("\nSplitting documents...")

chunks = split_documents(documents)

print(f"Chunks created: {len(chunks)}")

print("\nCreating ChromaDB vector store...")

vector_store = create_vector_store(chunks)

print("\nVector store created successfully!")

print(f"Stored {len(chunks)} chunks in ChromaDB.")