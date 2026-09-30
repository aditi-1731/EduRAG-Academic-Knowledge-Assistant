from app.services.llm import get_llm


llm = get_llm()


question = "What is HTML?"


response = llm.invoke(question)


print("\nGemini response:")
print(response.content)