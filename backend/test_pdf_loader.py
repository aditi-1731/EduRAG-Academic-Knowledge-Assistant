from app.services.pdf_loader import load_pdf


PDF_PATH = "data/documents/WT_Unit_1.pdf"


documents = load_pdf(PDF_PATH)

print(f"\nTotal pages extracted: {len(documents)}")

for document in documents[:3]:
    print("\n" + "=" * 60)
    print(f"Source: {document['metadata']['source']}")
    print(f"Page: {document['metadata']['page']}")
    print("=" * 60)
    print(document["page_content"][:1000])