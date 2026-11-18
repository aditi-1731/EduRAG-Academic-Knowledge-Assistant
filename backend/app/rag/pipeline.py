import time

from app.services.llm import get_llm
from app.services.vector_store import (
    get_vector_store,
    delete_vectors_for_document,
)
from app.rag.prompts import ACADEMIC_RAG_PROMPT


# Keep retries limited so the user does not wait too long.
MAX_LLM_RETRIES = 2

# Short delay between temporary retries.
LLM_RETRY_DELAY = 2

# Retrieval settings
RETRIEVAL_K = 8          # chunks sent to Gemini
RETRIEVAL_FETCH_K = 30   # candidates considered before MMR picks K
SHORT_QUESTION_WORDS = 8  # questions shorter than this get expanded


def expand_question(question: str) -> str:
    """
    Short questions like "What is operating system" match many chunks
    almost equally. Adding intent words helps definition-style chunks
    rank higher. Longer, more specific questions are left unchanged.
    """

    if len(question.split()) < SHORT_QUESTION_WORDS:
        return f"{question}. Definition, meaning and explanation."

    return question


def retrieve_documents(
    question: str,
    user_id: int,
    document_id: int,
    k: int = RETRIEVAL_K,
):
    """
    Retrieve the most relevant chunks belonging only to
    the authenticated user and selected document.
    """

    vector_store = get_vector_store()

    search_filter = {
        "$and": [
            {"user_id": {"$eq": user_id}},
            {"document_id": {"$eq": document_id}},
        ]
    }

    search_query = expand_question(question)

    try:
        # MMR returns varied chunks instead of near-duplicates.
        results = vector_store.max_marginal_relevance_search(
            search_query,
            k=k,
            fetch_k=RETRIEVAL_FETCH_K,
            filter=search_filter,
        )
    except Exception as error:
        print(f"MMR search failed ({error}). Falling back to similarity search.")

        results = vector_store.similarity_search(
            search_query,
            k=k,
            filter=search_filter,
        )

    print("\n========== RETRIEVED DOCUMENTS ==========")
    print(f"Search query: {search_query}")

    for index, document in enumerate(results, start=1):
        source = document.metadata.get("source", "Unknown")
        page = document.metadata.get("page", "Unknown")
        content = document.page_content.strip()

        print(f"\n--- Result {index} ---")
        print(f"Source: {source}")
        print(f"Page: {page}")
        print("Content preview:")
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

        source = document.metadata.get("source", "Unknown")
        page = document.metadata.get("page", "Unknown")

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

            print(f"Gemini generation error: {error}")

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
    # Sources (deduplicated by file + page)
    # ---------------------------------------------------------

    sources = []
    seen_sources = set()

    for document in documents:
        source = document.metadata.get("source", "Unknown")
        page = document.metadata.get("page", "Unknown")

        key = (source, page)

        if key in seen_sources:
            continue

        seen_sources.add(key)

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
    delete_vectors_for_document(user_id, document_id)