from langchain_chroma import Chroma

from app.services.embeddings import get_embeddings
from app.services.llm import get_llm
from app.rag.prompts import ACADEMIC_RAG_PROMPT


VECTORSTORE_DIR = "vectorstore"


def get_vector_store():
    """
    Load the existing ChromaDB vector store.
    """

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
    k: int = 3,
):
    """
    Retrieve only document chunks belonging
    to the authenticated user.
    """

    vector_store = get_vector_store()

    results = vector_store.similarity_search(
        question,
        k=k,
        filter={"user_id": user_id},
    )

    return results


def build_context(documents):
    """
    Combine retrieved document chunks into a single
    context string for the LLM.
    """

    context_parts = []

    for document in documents:
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
            f"Content:\n{document.page_content}"
        )

    return "\n\n---\n\n".join(context_parts)


def generate_answer(
    question: str,
    user_id: int,
):
    """
    Complete user-specific RAG pipeline:

    Question
        ↓
    User-specific Retrieval
        ↓
    Context construction
        ↓
    Prompt
        ↓
    Gemini answer
        ↓
    Structured response
    """

    documents = retrieve_documents(
        question,
        user_id,
    )

    context = build_context(documents)

    prompt = ACADEMIC_RAG_PROMPT.format(
        context=context,
        question=question,
    )

    llm = get_llm()

    response = llm.invoke(prompt)

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

        sources.append(
            {
                "source": source,
                "page": page,
            }
        )

    return {
        "answer": answer,
        "sources": sources,
    }