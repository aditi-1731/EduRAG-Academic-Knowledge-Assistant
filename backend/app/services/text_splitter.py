from langchain_text_splitters import RecursiveCharacterTextSplitter


def split_documents(documents: list[dict]) -> list[dict]:
    """
    Split extracted PDF documents into smaller chunks
    while preserving metadata.
    """

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
    )

    chunks = []

    for document in documents:
        split_texts = text_splitter.split_text(
            document["page_content"]
        )

        for text in split_texts:
            chunks.append(
                {
                    "page_content": text,
                    "metadata": document["metadata"].copy(),
                }
            )

    return chunks