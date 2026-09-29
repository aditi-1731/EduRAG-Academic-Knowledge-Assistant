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
