from fastapi import FastAPI, HTTPException

from app.rag.pipeline import generate_answer
from app.schemas.question import QuestionRequest


app = FastAPI(
    title="EduRAG API",
    description="Academic Question Answering System using RAG",
    version="1.0.0",
)


@app.get("/")
def root():
    return {
        "message": "EduRAG API is running!"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


@app.post("/ask")
def ask_question(request: QuestionRequest):

    try:

        result = generate_answer(request.question)

        return result

    except Exception as error:

        error_message = str(error)

        if "429" in error_message or "RESOURCE_EXHAUSTED" in error_message:

            raise HTTPException(
                status_code=429,
                detail="Gemini API quota has been exceeded. Please try again later.",
            )

        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing the question.",
        )