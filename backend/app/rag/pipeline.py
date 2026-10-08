import time
from functools import lru_cache

from langchain_chroma import Chroma

from app.services.embeddings import get_embeddings
from app.services.llm import get_llm
from app.rag.prompts import ACADEMIC_RAG_PROMPT


VECTORSTORE_DIR = "vectorstore"

# Keep retries limited so the user does not wait too long.
MAX_LLM_RETRIES = 2

# Short delay between temporary retries.
LLM_RETRY_DELAY = 2


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
    Retrieve the most relevant chunks belonging only to
    the authenticated user and selected document.
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

    print("\n========== RETRIEVED DOCUMENTS ==========")

    for index, document in enumerate(results, start=1):
        source = document.metadata.get(
            "source",
            "Unknown",
        )

        page = document.metadata.get(
            "page",
            "Unknown",
        )

        content = document.page_content.strip()

        print(f"\n--- Result {index} ---")
        print(f"Source: {source}")
        print(f"Page: {page}")
        print(f"Content preview:")
        print(content[:1000])

    print("\n=========================================\n")

    return results


def build_context(documents):
    """
    Build the context that will be sent to Gemini.
    """

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

    context = "\n\n---\n\n".join(context_parts)

    print("\n========== FINAL RAG CONTEXT ==========")
    print(context)
    print("=======================================\n")

    return context


def is_temporary_gemini_error(error: Exception) -> bool:
    """
    Identify Gemini errors that may be temporary.
    """

    error_text = str(error).upper()

    temporary_error_indicators = [
        "503",
        "UNAVAILABLE",
        "429",
        "RESOURCE_EXHAUSTED",
        "TOO MANY REQUESTS",
        "SERVER DISCONNECTED",
        "CONNECTION",
        "TIMEOUT",
        "DEADLINE_EXCEEDED",
    ]

    return any(
        indicator in error_text
        for indicator in temporary_error_indicators
    )


def generate_llm_response(prompt: str):
    """
    Generate a Gemini response with limited retry handling.
    """

    llm = get_llm()

    last_error = None

    for attempt in range(1, MAX_LLM_RETRIES + 1):

        try:
            print(
                f"Gemini generation attempt "
                f"{attempt}/{MAX_LLM_RETRIES}..."
            )

            response = llm.invoke(prompt)

            return response

        except Exception as error:
            last_error = error

            print(
                f"Gemini generation error: {error}"
            )

            if not is_temporary_gemini_error(error):
                raise error

            if attempt == MAX_LLM_RETRIES:
                break

            print(
                "Gemini is temporarily unavailable. "
                f"Retrying in {LLM_RETRY_DELAY} seconds..."
            )

            time.sleep(LLM_RETRY_DELAY)

    raise RuntimeError(
        "Gemini is temporarily unavailable. "
        "Please try again in a few moments."
    ) from last_error


def generate_answer(
    question: str,
    user_id: int,
    document_id: int,
):
    total_start = time.perf_counter()

    # ---------------------------------------------------------
    # Retrieval
    # ---------------------------------------------------------

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

    # ---------------------------------------------------------
    # Context + Prompt
    # ---------------------------------------------------------

    context_start = time.perf_counter()

    context = build_context(documents)

    prompt = ACADEMIC_RAG_PROMPT.format(
        context=context,
        question=question,
    )

    context_time = time.perf_counter() - context_start

    # ---------------------------------------------------------
    # Gemini Generation
    # ---------------------------------------------------------

    llm_start = time.perf_counter()

    try:
        response = generate_llm_response(prompt)

    except RuntimeError as error:
        return {
            "answer": (
                "EduRAG could not generate the answer right now. "
                "Gemini is temporarily unavailable. "
                "Please try again in a few moments."
            ),
            "sources": [],
            "error": str(error),
        }

    llm_time = time.perf_counter() - llm_start

    # ---------------------------------------------------------
    # Extract Answer
    # ---------------------------------------------------------

    answer = response.content

    if isinstance(answer, list):
        answer = "".join(
            block.get("text", "")
            for block in answer
            if isinstance(block, dict)
        )

    # ---------------------------------------------------------
    # Sources
    # ---------------------------------------------------------

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

        sources.append(
            {
                "source": source,
                "page": page,
            }
        )

    # ---------------------------------------------------------
    # Performance
    # ---------------------------------------------------------

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