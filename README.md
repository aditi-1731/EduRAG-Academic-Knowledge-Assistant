# EduRAG — Academic Knowledge Assistant

> An AI-powered academic question-answering system that uses Retrieval-Augmented Generation (RAG) to answer questions from student-provided study materials.

## 🌐 Live Demo
- **Frontend:** https://edu-rag-academic-knowledge-assistant-6jt540s76.vercel.app
- **Backend API docs:** https://edurag-backend-qx7v.onrender.com/docs

> The backend runs on Render's free tier, so the first request after inactivity can take 30–60 seconds while it wakes up.

## 📌 Overview

EduRAG is an AI-based academic assistant designed to help students understand and explore their study materials more efficiently.

Users can create an account, upload academic PDF documents such as lecture notes, textbooks, unit-wise notes, and study materials, and ask questions about the uploaded content.

The system extracts text from PDFs, divides the content into meaningful chunks, generates vector embeddings using Google Gemini, and stores the embeddings in ChromaDB.

When a student asks a question, EduRAG retrieves the most relevant content from the selected study material and provides that context to Google Gemini. The generated answer is grounded in the retrieved academic material and includes source information such as the document name and page number.

The system also provides user authentication, document management, document search, document deletion, conversation history, and a clean web-based interface.

---

## 🎯 Problem Statement

Students often have large collections of PDFs, lecture notes, textbooks, and other study materials. Finding specific information inside these documents can be time-consuming.

Traditional approaches require students to:

- Search through multiple PDF files
- Identify relevant pages
- Read large amounts of content
- Manually combine information to understand a topic

EduRAG aims to simplify this process by allowing students to ask questions directly about their uploaded study materials.

---

## 💡 Proposed Solution

EduRAG uses a Retrieval-Augmented Generation pipeline to connect a student's study material with an AI question-answering system.

```text
Academic PDF
     ↓
Text Extraction
     ↓
Text Chunking
     ↓
Gemini Embeddings
     ↓
ChromaDB Vector Store
     ↓
Student Question
     ↓
Similarity Search
     ↓
Relevant Context
     ↓
Google Gemini
     ↓
Grounded Answer + Sources
```
---

## ✨ Features

### 🔐 Authentication
- User registration
- User login
- JWT-based authentication
- Protected application routes
- Password hashing using Argon2
- User-specific document access and retrieval
- User isolation between accounts

### 📄 Document Management
- Upload academic PDF documents
- Automatic PDF text extraction
- Automatic text chunking
- Gemini-powered embeddings
- ChromaDB vector storage
- Personal study-material library
- Search uploaded documents
- Delete documents
- Document ownership and isolation
  
### 🤖 Academic Question Answering
- Ask questions about uploaded study material
- Retrieval-Augmented Generation (RAG)
- Semantic similarity search
- Context-grounded answers
- Source-aware responses
- Page-level source references
- Protection against unsupported answers when information is unavailable

### 💬 Chat Experience
- Multiple questions in one conversation
- Conversation history during the current session
- New Chat functionality
- Thinking/loading state
- Automatic new conversation when a new document is uploaded
- Clear error handling

### 🖥️ User Interface
- React-based web application
- Responsive academic dashboard
- Collapsible study-material sidebar
- Document search
- Clean question-and-answer interface
- Login and registration pages

---

## 🏗️ System Architecture
```
                         ┌──────────────────────┐
                         │       Student        │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   React Frontend     │
                         │                      │
                         │  Login / Register    │
                         │  Upload PDF          │
                         │  Study Materials     │
                         │  Ask Questions       │
                         │  View Answers        │
                         └──────────┬───────────┘
                                    │
                                  REST API
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      FastAPI         │
                         │      Backend         │
                         │                      │
                         │  Authentication      │
                         │  Document APIs       │
                         │  Question API        │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    RAG Pipeline      │
                         │                      │
                         │ Retrieval            │
                         │ Context Construction │
                         │ Prompt Generation    │
                         └───────┬───────┬──────┘
                                 │       │
                    ┌────────────┘       └────────────┐
                    ▼                                 ▼
          ┌──────────────────┐              ┌──────────────────┐
          │     ChromaDB     │              │   Google Gemini  │
          │                  │              │                  │
          │ Vector Retrieval │              │ Embeddings + LLM │
          └──────────────────┘              └──────────────────┘

                         ┌──────────────────────┐
                         │     PostgreSQL       │
                         │                      │
                         │ Users                │
                         │ Documents            │
                         └──────────────────────┘
```
---

## 🔄 RAG Workflow
### 1. Document Ingestion
```
PDF
 ↓
PyMuPDF Text Extraction
 ↓
Recursive Text Chunking
 ↓
Gemini Embedding Generation
 ↓
ChromaDB
```
---
### 2. Question Answering
```
Student Question
 ↓
Authenticated User + Document
 ↓
Similarity Search
 ↓
Top Relevant Chunks
 ↓
Context Construction
 ↓
Academic RAG Prompt
 ↓
Google Gemini
 ↓
Answer + Source Information
```
---

## 🛡️ Answer Grounding

EduRAG is designed to reduce hallucination by using a strict academic RAG prompt.

The system instructs Gemini to:

- Use the provided academic context as the primary source.
- Avoid inventing unsupported information.
- Answer only using information supported by the retrieved material.
- Clearly state when the answer is unavailable in the study material.
- Address multiple parts of a question when the material supports them.
- Preserve important technical terminology.
- Provide clear and student-friendly explanations.
---

## 🧰 Technology Stack
### Backend
- Python 3.13
- FastAPI
- SQLAlchemy
- PostgreSQL
- PyMuPDF
- LangChain
- python-multipart

### AI and RAG
- Google Gemini
- Gemini Embeddings
- Retrieval-Augmented Generation (RAG)
- ChromaDB
- LangChain Chroma integration
- LangChain Google GenAI integration

### Authentication and Security
- JWT
- PyJWT
- Argon2 password hashing
- Environment-based secrets
- User-specific authorization checks

### Frontend
- React
- Vite
- JavaScript
- CSS
- React Router

### Development Tools
- Git
- GitHub
- VS Code
- Python Virtual Environment

---

## 📁 Project Structure
```
EduRAG/
│
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   └── document.py
│   │   │
│   │   ├── rag/
│   │   │   ├── __init__.py
│   │   │   ├── pipeline.py
│   │   │   └── prompts.py
│   │   │
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── document_service.py
│   │   │   ├── embeddings.py
│   │   │   ├── llm.py
│   │   │   ├── pdf_loader.py
│   │   │   ├── security.py
│   │   │   ├── text_splitter.py
│   │   │   └── vector_store.py
│   │   │
│   │   ├── __init__.py
│   │   ├── database.py
│   │   └── main.py
│   │
│   ├── data/
│   │   └── documents/
│   │
│   ├── tests/
│   │
│   └── vectorstore/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── .env
├── .gitignore
├── README.md
└── requirements.txt
```
---
## ⚙️ Environment Variables

Create a .env file in the project root.
```
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET_KEY=your_jwt_secret
```

### 🚀 Local Setup
---
1. Clone the repository
```
git clone https://github.com/aditi-1731/EduRAG-Academic-Knowledge-Assistant.git

cd EduRAG-Academic-Knowledge-Assistant
```
---
2. Create and activate a virtual environment
Windows PowerShell
```
python -m venv venv
.\venv\Scripts\Activate.ps1
```
---
3. Install backend dependencies

```
pip install -r requirements.txt
```
---
4. Configure environment variables

Create the .env file in the project root and add:
```
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET_KEY=your_jwt_secret
```
---
5. Start the FastAPI backend

From the project root:
```
uvicorn backend.app.main:app --reload
```
---
6. Start the React frontend

Open another terminal:
```
cd frontend
npm install
npm run dev
```
The frontend will be available through the Vite development server.

---
## 🚀 Development Roadmap

### Phase 1 — Project Setup

- Initialize repository
- Configure Python environment
- Configure Gemini API
- Configure FastAPI backend
- Configure React frontend

### Phase 2 — Document Processing
- PDF text extraction
- Text chunking
- Document metadata
- Gemini embedding generation
- ChromaDB vector storage

### Phase 3 — RAG Pipeline
- Similarity search
- Context construction
- Academic RAG prompt
- Gemini answer generation
- Source metadata
- Grounded response handling

### Phase 4 — Web Application
- React frontend
- PDF upload interface
- Academic Q&A interface
- FastAPI REST APIs
- Source display
- Loading and error states

### Phase 5 — Authentication and User Data
- User registration
- JWT login
- Protected routes
- PostgreSQL integration
- User-specific documents
- Document ownership checks

### Phase 6 — Document Management
- Personal study-material library
- Document search
- Document deletion
- Active document workflow
- User/document-specific retrieval

### Phase 7 — Chat Experience
- Conversation history
- New Chat
- Thinking/loading state
- New-document conversation reset
- Improved academic Q&A experience

### Phase 8 — Testing and Security
- End-to-end system testing
- Authentication testing
- User-isolation testing
- Document ownership testing
- Security cleanup
- Repository cleanup
---

## 📊 Current Project Status

EduRAG currently provides a complete working academic RAG workflow:
```
Register / Login
       ↓
Upload Study PDF
       ↓
Process and Embed Document
       ↓
Store in ChromaDB
       ↓
Ask Academic Question
       ↓
Retrieve Relevant Content
       ↓
Generate Grounded Answer
       ↓
Display Sources
```
The application has been tested for:

- Authentication
- Protected routes
- PDF upload
- Document processing
- Question answering
- Multiple questions
- Chat history
- New Chat
- New-document workflow
- Document search
- Document deletion
- User isolation
- Backend startup
- Frontend startup
- Repository and secret safety
---

## ⚠️ Limitations

The quality of generated answers depends on:

- Quality of uploaded documents
- PDF text extraction quality
- Chunking strategy
- Embedding quality
- Retrieval accuracy
- Gemini model availability and quota
- Quality and completeness of the academic material
---

## 🔮 Future Scope

Potential future improvements include:

- Multi-document conversations
- Persistent chat history
- Exam-oriented answer generation
- Automatic question generation
- Quiz generation
- Flashcard generation
- Multilingual academic assistance
- Additional document formats
- Advanced RAG evaluation
- Retrieval quality evaluation
- Improved citation handling
- Advanced deployment and infrastructure optimization
- Performance optimization
---

## 👩‍💻 Author

### **Aditi Tripathi**
