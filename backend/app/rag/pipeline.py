import time
from langchain_chroma import Chroma

from app.services.embeddings import get_embeddings
from app.services.llm import get_llm
from app.rag.prompts import ACADEMIC_RAG_PROMPT
from functools import lru_cache

VECTORSTORE_DIR = "vectorstore"

@lru_cache(maxsize=1)
def get_vector_store():
    embeddings = get_embeddings()

    vector_store = Chroma(
        collection_name="academic_documents",
        embedding_function=embeddings,
        persist_directory=VECTORSTORE_DIR,
    )

    return vector_store

def retrieve_documents(
    question: str,
    user_id: int,
    document_id: int,
    k: int = 5,
):
    """
    Retrieve only chunks belonging to the
    authenticated user and selected document.
    """

    vector_store = get_vector_store()

    results = vector_store.similarity_search(
        question,
        k=k,
        filter={
            "$and": [
                {"user_id": user_id},
                {"document_id": document_id},
            ]
        },
    )

    return results

def build_context(documents):
    context_parts = []
    seen_content = set()

    for document in documents:
        content = document.page_content.strip()

        if not content:
            continue

        if content in seen_content:
            continue

        seen_content.add(content)

        source = document.metadata.get(
            "source",
            "Unknown",
        )

        page = document.metadata.get(
            "page",
            "Unknown",
        )

        context_parts.append(
            f"Source: {source}\n"
            f"Page: {page}\n"
            f"Content:\n{content}"
        )

    return "\n\n---\n\n".join(context_parts)

def generate_answer(
    question: str,
    user_id: int,
    document_id: int,
):
    total_start = time.perf_counter()

    retrieval_start = time.perf_counter()

    documents = retrieve_documents(
        question,
        user_id,
        document_id,
    )

    retrieval_time = time.perf_counter() - retrieval_start
    if not documents:
        return {
            "answer": (
            "The answer is not available in the "
            "provided study material."
            ),
            "sources": [],
        }
    context_start = time.perf_counter()

    context = build_context(documents)

    prompt = ACADEMIC_RAG_PROMPT.format(
        context=context,
        question=question,
    )

    context_time = time.perf_counter() - context_start

    llm_start = time.perf_counter()

    llm = get_llm()
    response = llm.invoke(prompt)

    llm_time = time.perf_counter() - llm_start

    answer = response.content

    if isinstance(answer, list):
        answer = "".join(
            block.get("text", "")
            for block in answer
            if isinstance(block, dict)
        )

    sources = []

    for document in documents:
        source = document.metadata.get(
            "source",
            "Unknown",
        )

        page = document.metadata.get(
            "page",
            "Unknown",
        )

        sources.append({
            "source": source,
            "page": page,
        })

    total_time = time.perf_counter() - total_start

    print("\n--- EduRAG Performance ---")
    print(f"Retrieval: {retrieval_time:.2f}s")
    print(f"Context:   {context_time:.2f}s")
    print(f"Gemini:    {llm_time:.2f}s")
    print(f"Total:     {total_time:.2f}s")
    print("--------------------------\n")

    return {
        "answer": answer,
        "sources": sources,
    }

def delete_document_vectors(
    user_id: int,
    document_id: int,
):
    vector_store = get_vector_store()

    vector_store.delete(
        where={
            "$and": [
                {"user_id": user_id},
                {"document_id": document_id},
            ]
        }
    )