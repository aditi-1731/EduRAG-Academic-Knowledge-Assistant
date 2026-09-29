# EduRAG — Academic Knowledge Assistant

> An AI-powered academic question-answering system that uses Retrieval-Augmented Generation (RAG) to answer questions from student-provided study materials.

## 📌 Overview

EduRAG is an AI-based academic assistant designed to help students understand and explore their study materials more efficiently.

Users can upload academic PDFs such as lecture notes, textbooks, unit-wise notes, and study materials. The system processes the documents, divides their content into meaningful chunks, converts the chunks into vector embeddings, and stores them in a vector database.

When a student asks a question, EduRAG retrieves the most relevant information from the uploaded documents and provides it as context to a Large Language Model (LLM). Google Gemini then generates an answer grounded in the retrieved academic material.

The goal is to provide answers based on the user's study material rather than relying only on the model's general knowledge.

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

EduRAG uses a Retrieval-Augmented Generation pipeline:

```text
Academic PDFs
     ↓
Text Extraction
     ↓
Text Chunking
     ↓
Embeddings
     ↓
Vector Database
     ↓
Question
     ↓
Similarity Search
     ↓
Relevant Context
     ↓
Google Gemini
     ↓
Grounded Answer
```
## ✨ Features
### Current / Planned Features
- 📄 Upload academic PDF documents
- 🔎 Semantic search over study materials
- 🤖 AI-powered question answering
- 📚 Retrieval-Augmented Generation (RAG)
-🧠 Gemini-powered embeddings and answer generation
- 🗂️ Vector-based document storage
- 📌 Source-aware answers
- 📖 Subject and unit-based document organization
- 💬 Interactive academic Q&A interface
- 🌐 Modern web-based frontend
- ⚡ FastAPI backend
- 🔐 Secure API key management using environment variables

## 🏗️ System Architecture
                    ┌──────────────────────┐
                    │       Student        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    React Frontend    │
                    │                      │
                    │ Upload PDFs           │
                    │ Ask Questions         │
                    │ View Answers          │
                    └──────────┬───────────┘
                               │
                              REST
                               │
                               ▼
                    ┌──────────────────────┐
                    │      FastAPI         │
                    │       Backend        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │     RAG Pipeline     │
                    └──────────┬───────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ▼                     ▼
             ┌──────────────┐      ┌──────────────┐
             │   ChromaDB   │      │    Gemini    │
             │ Vector Store │      │     LLM      │
             └──────────────┘      └──────────────┘
--- 

## 🔄 RAG Workflow
### 1. Document Ingestion
```
PDF
 ↓
Text Extraction
 ↓
Text Cleaning
 ↓
Chunking
 ↓
Embedding Generation
 ↓
ChromaDB
```
### 2. Question Answering
```
Student Question
 ↓
Question Embedding
 ↓
Similarity Search
 ↓
Top Relevant Chunks
 ↓
Context Construction
 ↓
Gemini LLM
 ↓
Final Answer
```
## 🛠️ Technology Stack
### Backend
- Python
- FastAPI
- LangChain
- PyMuPDF

### AI
- Google Gemini
- Gemini Embeddings
- Retrieval-Augmented Generation (RAG)
- Vector Database
- ChromaDB

### Frontend
- React
- Vite
- CSS

### Development Tools
- Git
- GitHub
- VS Code
- Python Virtual Environment

## Project Structure
```
EduRAG/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── rag/
│   │   ├── services/
│   │   ├── config.py
│   │   └── main.py
│   │
│   ├── data/
│   │   ├── documents/
│   │   └── processed/
│   │
│   ├── vectorstore/
│   ├── tests/
│   ├── .env
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── public/
│   └── package.json
│
├── .gitignore
└── README.md
```
---
## 🚀 Project Development Roadmap
### Phase 1 — Project Setup
 - Initialize repository
 - Configure Python environment
 - Configure Gemini API
 - Configure backend structure
 - Configure React frontend

### Phase 2 — Document Processing
 - PDF upload
 - PDF text extraction
 - Text cleaning
 - Document chunking
 - Metadata extraction

### Phase 3 — RAG
 - Generate embeddings
 - Store embeddings in ChromaDB
 - Implement similarity search
 - Build retriever
 - Connect Gemini LLM
 - Generate grounded answers

### Phase 4 — Web Application
 - Build document upload interface
 - Build academic Q&A interface
 - Add document library
 - Add source references
 - Add loading and error states
 - Connect React frontend with FastAPI

### Phase 5 — Improvements
 - Subject filtering
 - Unit filtering
 - Answer modes
 - Conversation history
 - Improved retrieval
 - RAG evaluation
 - Hallucination reduction
 - Performance optimization

## 🔐 Environment Variables

Create a .env file inside the backend directory:
```
GEMINI_API_KEY=your_api_key_here
```
---

## 🧪 Example
### Input
```
Explain Second Normal Form with an example.
```
### Retrieval

The system searches the uploaded academic documents and retrieves the most relevant chunks related to:

- Normalization
- First Normal Form
- Second Normal Form
- Partial dependency

### Generated Answer

Gemini receives:
```
Question
+
Retrieved academic context
```
and generates an answer based on the retrieved study material.
---
## 🎓 Academic Use Case

EduRAG can be used with:

- University lecture notes
- Course textbooks
- Unit-wise study materials
- Class notes
- Technical documentation
- Exam preparation material
---
## ⚠️ Limitations

The quality of the generated answer depends on:

- Quality of uploaded documents
- PDF text extraction
- Chunking strategy
- Embedding quality
- Retrieval accuracy
- LLM response quality

The system should indicate when sufficient information cannot be found in the uploaded material instead of presenting unsupported information as fact.

## 🔮 Future Scope

Potential future improvements include:

- Multi-document conversations
- User accounts
- Persistent chat history
- Exam-oriented answer generation
- Automatic question generation
- Quiz generation
- Flashcard generation
- Multilingual academic assistance
- Citation-aware answers
- RAG evaluation dashboards
- Support for additional document formats

## 👩‍💻 Author

### **Aditi Tripathi**
