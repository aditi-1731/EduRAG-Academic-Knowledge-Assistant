from pathlib import Path
import time

from langchain_chroma import Chroma

from app.services.embeddings import get_embeddings


VECTORSTORE_DIR = Path("vectorstore")


def create_vector_store(chunks: list[dict]) -> Chroma:
    """
    Create and persist a ChromaDB vector store
    from document chunks.
    """

    if not chunks:
        raise ValueError("No chunks provided.")

    embeddings = get_embeddings()

    texts = [chunk["page_content"] for chunk in chunks]
    metadatas = [chunk["metadata"] for chunk in chunks]

    vector_store = Chroma(
        collection_name="academic_documents",
        embedding_function=embeddings,
        persist_directory=str(VECTORSTORE_DIR),
    )

    batch_size = 20

    for start in range(0, len(texts), batch_size):

        end = min(start + batch_size, len(texts))

        batch_texts = texts[start:end]
        batch_metadatas = metadatas[start:end]

        print(f"Embedding chunks {start + 1}-{end}...")

        for attempt in range(3):

            try:
                vector_store.add_texts(
                    texts=batch_texts,
                    metadatas=batch_metadatas,
                )

                break

            except Exception as error:

                if attempt == 2:
                    raise error

                print("Embedding request hit a limit. Retrying in 20 seconds...")
                time.sleep(20)

    return vector_store