from datetime import datetime

from pydantic import BaseModel, ConfigDict

class DocumentUploadResponse(BaseModel):
    message: str
    document_id : int
    filename: str
    pages: int
    chunks: int

class DocumentResponse(BaseModel):
    id: int
    filename: str
    uploaded_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )