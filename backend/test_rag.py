from app.rag.pipeline import generate_answer


question = "What are the binary search trees?"


print("\nRunning EduRAG...\n")


result = generate_answer(question)


print("=" * 70)
print("EDURAG ANSWER")
print("=" * 70)

print(result["answer"])


print("\n")
print("=" * 70)
print("SOURCES")
print("=" * 70)


for document in result["documents"]:

    source = document.metadata.get("source")
    page = document.metadata.get("page")

    print(f"- {source}, Page {page}")