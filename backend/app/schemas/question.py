from pydantic import BaseModel

class QuestionRequest(BaseModel):
    question: str
    document_id: int