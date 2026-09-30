from app.services.embeddings import get_embeddings
from langchain_chroma import Chroma


VECTORSTORE_DIR = "vectorstore"


print("Loading ChromaDB vector store...")

embeddings = get_embeddings()

vector_store = Chroma(
    collection_name="academic_documents",
    embedding_function=embeddings,
    persist_directory=VECTORSTORE_DIR,
)


query = "What is HTML?"


print(f"\nQuery: {query}")

results = vector_store.similarity_search(
    query,
    k=3,
)


print(f"\nRetrieved {len(results)} chunks:\n")


for index, document in enumerate(results, start=1):

    print("=" * 70)
    print(f"Result {index}")
    print(f"Source: {document.metadata.get('source')}")
    print(f"Page: {document.metadata.get('page')}")
    print("=" * 70)

    print(document.page_content[:500])
    print()