from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.rag.pipeline import generate_answer
from app.schemas.question import QuestionRequest

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User

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

app = FastAPI(
    title="EduRAG API",
    description="Academic Question Answering System using RAG",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
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