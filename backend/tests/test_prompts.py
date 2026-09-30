from app.services.llm import get_llm
from app.rag.prompts import ACADEMIC_RAG_PROMPT

llm = get_llm()

context = """
HTML stands for HyperText Markup Language.

It is the standard markup language used to create
and structure web pages.

HTML uses tags and elements to organize content
on a web page.
"""

question = "What is HTML?"

prompt = ACADEMIC_RAG_PROMPT.format(
    context=context,
    question=question,
)

response = llm.invoke(prompt)

print("\nEduRAG Answer:\n")
print(response.content)