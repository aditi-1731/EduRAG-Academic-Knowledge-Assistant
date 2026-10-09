from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.rag.pipeline import (
    generate_answer,
    delete_document_vectors,
)

from app.schemas.question import QuestionRequest

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.document import Document

from app.schemas.user import (
    UserLogin,
    UserRegister,
    UserResponse,
    TokenResponse,
)

from app.services.security import (
    create_access_token,
    hash_password,
    verify_password,
)

from app.services.auth import get_current_user

from pathlib import Path
from uuid import uuid4

from fastapi import File, UploadFile

from app.schemas.document import (
    DocumentUploadResponse,
    DocumentResponse,
)

from app.services.document_service import process_uploaded_pdf

UPLOAD_DIR = Path("data/uploads")
UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
)

app = FastAPI(
    title="EduRAG API",
    description="Academic Question Answering System using RAG",
    version="1.0.0",
)

from app.database import engine, Base
# Explicitly import models so SQLAlchemy registers their schema metadata
from app.models.user import User
from app.models.document import Document

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://edu-rag-academic-knowledge-assistant-6jt540s76.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

@app.post("/register", response_model=UserResponse)
def register_user(
    user_data: UserRegister,
    db: Session = Depends(get_db),
):
    existing_user = db.scalar(
        select(User).where(
            User.email == user_data.email
        )
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email is already registered.",
        )

    new_user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hash_password(user_data.password),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@app.post("/login", response_model=TokenResponse)
def login_user(
    user_data: UserLogin,
    db: Session = Depends(get_db),
):
    user = db.scalar(
        select(User).where(
            User.email == user_data.email
        )
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    if not verify_password(
        user_data.password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    access_token = create_access_token(user.id)

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }

@app.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user

@app.post("/ask")
def ask_question(
    request: QuestionRequest,
    current_user: User = Depends(get_current_user),
):
    try:
        result = generate_answer(
            request.question,
            current_user.id,
            request.document_id,
        )

        return result

    except HTTPException:
        raise

    except Exception as error:
        error_message = str(error)

        if "429" in error_message:
            raise HTTPException(
                status_code=429,
                detail=(
                    "Gemini API quota has been exceeded. "
                    "Please try again later."
                ),
            )

        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate answer: {error}",
        )

@app.post(
    "/upload",
    response_model=DocumentUploadResponse,
)
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed.",
        )

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="A filename is required.",
        )

    safe_filename = (
        f"{uuid4()}_{file.filename}"
    )

    file_path = UPLOAD_DIR / safe_filename

    try:
        file_content = await file.read()

        if not file_content:
            raise HTTPException(
                status_code=400,
                detail="The uploaded PDF is empty.",
            )

        with open(file_path, "wb") as uploaded_file:
            uploaded_file.write(file_content)

        # Create the document record first so that
        # PostgreSQL generates the document ID.
        document = Document(
            user_id=current_user.id,
            filename=file.filename,
            page_count=0,
            chunk_count=0,
        )

        db.add(document)
        db.flush()

        # Process the PDF and attach both user ID
        # and document ID to the vector metadata.
        result = process_uploaded_pdf(
            str(file_path),
            file.filename,
            current_user.id,
            document.id,
        )

        # Update document information after processing.
        document.page_count = result["pages"]
        document.chunk_count = result["chunks"]

        db.commit()
        db.refresh(document)

        return {
            "message": "PDF uploaded and processed successfully.",
            "document_id":document.id,
            **result,
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to process PDF: {error}",
        )

    finally:
        if file_path.exists():
            file_path.unlink()

@app.get(
    "/documents",
    response_model=list[DocumentResponse],
)
def get_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    documents = db.scalars(
        select(Document)
        .where(
            Document.user_id == current_user.id
        )
        .order_by(Document.uploaded_at.desc())
    ).all()

    return documents

@app.delete("/documents/{document_id}")
def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    document = db.scalar(
        select(Document)
        .where(
            Document.id == document_id,
            Document.user_id == current_user.id,
        )
    )

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )

    try:
        delete_document_vectors(
            user_id=current_user.id,
            document_id=document.id,
        )

        db.delete(document)
        db.commit()

        return {
            "message": "Document deleted successfully."
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete document: {error}",
        )