from app.rag.pipeline import generate_answer

question = "What are the features of HTML?"

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


for source in result["sources"]:

    print(
        f"- {source['source']}, "
        f"Page {source['page']}"
    )