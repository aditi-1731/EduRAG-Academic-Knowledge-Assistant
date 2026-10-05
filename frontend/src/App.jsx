import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import QuestionBox from "./components/QuestionBox";
import AnswerCard from "./components/AnswerCard";
import Sources from "./components/Sources";
import DocumentUpload from "./components/DocumentUpload";
import DocumentList from "./components/DocumentList";

import Register from "./pages/Register";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";

function Home() {
  const [messages, setMessages] = useState([]);
  const [documentId, setDocumentId] = useState(null);
  const [documentsRefresh, setDocumentsRefresh] = useState(0);

  return (
    <div className="app">
      <Header />

      <main className="main-content">
        <section className="hero">
          <div className="hero-badge">
            AI-Powered Academic Assistant
          </div>

          <h2>Ask. Learn. Understand.</h2>

          <p>
            Ask questions from your study material and get
            clear, context-based answers with source
            references.
          </p>
        </section>

        <DocumentList
          refreshTrigger={documentsRefresh}
        />

        <div className="main-panel">
          <div className="chat-toolbar">
            <button
              type="button"
              className="new-chat-button"
              onClick={() => setMessages([])}
            >
              + New Chat
            </button>
          </div>

          <DocumentUpload
            onUploadSuccess={(newDocumentId) => {
              setMessages([]);
              setDocumentId(newDocumentId);
              setDocumentsRefresh(
                (previous) => previous + 1
              );
            }}
          />

          <QuestionBox
            onResult={(newMessage) => {
              setMessages((previousMessages) => [
                ...previousMessages,
                newMessage,
              ]);
            }}
            documentId={documentId}
          />

          <div className="chat-container">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chat-message ${
                  message.role === "user"
                    ? "chat-message-user"
                    : "chat-message-assistant"
                }`}
              >
                {message.role === "user" ? (
                  <>
                    <div className="chat-message-label">
                      You
                    </div>

                    <div className="chat-user-message">
                      {message.content}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="chat-message-label">
                      EduRAG
                    </div>

                    <div className="chat-assistant-message">
                      {message.result?.loading ? (
                        <div className="thinking-message">
                          EduRAG is thinking...
                        </div>
                      ) : (
                        <>
                          <AnswerCard
                            result={message.result}
                          />

                          <Sources
                            result={message.result}
                          />
                      </>
                      )}
                    </div>

                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>
          EduRAG • Academic Question Answering System
        </p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/login"
        element={<Login />}
      />
    </Routes>
  );
}

export default App;