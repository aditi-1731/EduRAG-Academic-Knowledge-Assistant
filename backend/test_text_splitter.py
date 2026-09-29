from app.services.pdf_loader import load_pdf
from app.services.text_splitter import split_documents


PDF_PATH = "data/documents/WT_Unit_1.pdf"


documents = load_pdf(PDF_PATH)

print(f"Pages extracted: {len(documents)}")


chunks = split_documents(documents)

print(f"Total chunks created: {len(chunks)}")


for index, chunk in enumerate(chunks[:5], start=1):
    print("\n" + "=" * 70)
    print(f"Chunk {index}")
    print(f"Source: {chunk['metadata']['source']}")
    print(f"Page: {chunk['metadata']['page']}")
    print(f"Characters: {len(chunk['page_content'])}")
    print("=" * 70)

    print(chunk["page_content"][:500])