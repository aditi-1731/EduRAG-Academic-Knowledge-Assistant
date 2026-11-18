import os
import time
from functools import lru_cache

from dotenv import load_dotenv
from langchain_postgres import PGVector
from sqlalchemy import create_engine, text

from app.services.embeddings import get_embeddings

load_dotenv()

COLLECTION_NAME = "academic_documents"


def _get_connection_string() -> str:
    """
    Read DATABASE_URL and make sure it uses the psycopg (v3) driver.
    """

    url = os.getenv("DATABASE_URL")

    if not url:
        raise ValueError("DATABASE_URL is not set in the environment.")

    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+psycopg://", 1)
    elif url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+psycopg://", 1)

    return url


@lru_cache(maxsize=1)
def get_engine():
    """
    One shared SQLAlchemy engine for the vector store.

    pool_pre_ping and pool_recycle keep connections healthy
    when Neon scales its compute to zero while idle.
    """

    return create_engine(
        _get_connection_string(),
        pool_pre_ping=True,
        pool_recycle=300,
    )


@lru_cache(maxsize=1)
def get_vector_store() -> PGVector:
    """
    Vector store stored in PostgreSQL (pgvector).
    Data persists across Render restarts and redeploys.
    """

    return PGVector(
        embeddings=get_embeddings(),
        collection_name=COLLECTION_NAME,
        connection=get_engine(),
        use_jsonb=True,
    )


def create_vector_store(chunks: list[dict]) -> PGVector:
    """
    Embed document chunks and store them in pgvector.
    """

    if not chunks:
        raise ValueError("No chunks provided.")

    vector_store = get_vector_store()

    texts = [chunk["page_content"] for chunk in chunks]
    metadatas = [chunk["metadata"] for chunk in chunks]

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


def delete_vectors_for_document(user_id: int, document_id: int) -> None:
    """
    Delete every chunk that belongs to one user's document.
    """

    # Make sure the pgvector tables exist before deleting.
    get_vector_store()

    with get_engine().begin() as connection:
        connection.execute(
            text(
                """
                DELETE FROM langchain_pg_embedding
                WHERE collection_id IN (
                    SELECT uuid
                    FROM langchain_pg_collection
                    WHERE name = :collection_name
                )
                AND cmetadata->>'user_id' = :user_id
                AND cmetadata->>'document_id' = :document_id
                """
            ),
            {
                "collection_name": COLLECTION_NAME,
                "user_id": str(user_id),
                "document_id": str(document_id),
            },
        )