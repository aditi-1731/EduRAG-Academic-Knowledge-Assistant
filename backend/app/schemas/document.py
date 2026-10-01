from pydantic import BaseModel

class DocumentUploadResponse(BaseModel):
    message: str
    filename: str
    pages: int
    chunks: int