import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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


/* =========================================================
   PAGE ANIMATION SETTINGS
========================================================= */

const pageVariants = {
  hidden: {
    opacity: 0,
    y: 8,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut",
    },
  },
};


const heroVariants = {
  hidden: {
    opacity: 0,
    y: 18,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};


const contentVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};


const messageVariants = {
  hidden: {
    opacity: 0,
    y: 14,
    scale: 0.985,
  },

  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};


/* =========================================================
   HOME PAGE
========================================================= */

function Home() {
  const [messages, setMessages] = useState([]);
  const [documentId, setDocumentId] = useState(null);
  const [documentsRefresh, setDocumentsRefresh] = useState(0);

  return (
    <motion.div
      className="app"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <Header />

      <main className="main-content">

        {/* =================================================
            HERO
        ================================================= */}

        <motion.section
          className="hero"
          variants={heroVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="hero-badge"
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              delay: 0.15,
              duration: 0.3,
            }}
          >
            AI-Powered Academic Assistant
          </motion.div>

          <motion.h2
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.1,
              duration: 0.4,
            }}
          >
            Ask. Learn. Understand.
          </motion.h2>

          <motion.p
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.2,
              duration: 0.4,
            }}
          >
            Ask questions from your study material and get
            clear, context-based answers with source
            references.
          </motion.p>
        </motion.section>


        {/* =================================================
            DOCUMENT SIDEBAR / LIST
        ================================================= */}

        <motion.div
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          transition={{
            delay: 0.15,
          }}
        >
          <DocumentList
            refreshTrigger={documentsRefresh}
          />
        </motion.div>


        {/* =================================================
            MAIN WORKSPACE
        ================================================= */}

        <motion.div
          className="main-panel"
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          transition={{
            delay: 0.2,
          }}
        >

          {/* =================================================
              CHAT TOOLBAR
          ================================================= */}

          <div className="chat-toolbar">

            <motion.button
              type="button"
              className="new-chat-button"
              onClick={() => setMessages([])}
              whileHover={{
                scale: 1.02,
              }}
              whileTap={{
                scale: 0.98,
              }}
              transition={{
                duration: 0.2,
              }}
            >
              <span aria-hidden="true">+</span>
              New Chat
            </motion.button>

          </div>


          {/* =================================================
              DOCUMENT UPLOAD
          ================================================= */}

          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            transition={{
              delay: 0.25,
            }}
          >
            <DocumentUpload
              onUploadSuccess={(newDocumentId) => {
                /*
                  Existing functionality preserved:
                  - clear chat
                  - make newly uploaded document active
                  - refresh sidebar documents
                */

                setMessages([]);

                setDocumentId(newDocumentId);

                setDocumentsRefresh(
                  (previous) => previous + 1
                );
              }}
            />
          </motion.div>


          {/* =================================================
              QUESTION BOX
          ================================================= */}

          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            transition={{
              delay: 0.3,
            }}
          >
            <QuestionBox
              onResult={(newMessage) => {
                setMessages(
                  (previousMessages) => [
                    ...previousMessages,
                    newMessage,
                  ]
                );
              }}
              documentId={documentId}
            />
          </motion.div>


          {/* =================================================
              CHAT HISTORY
          ================================================= */}

          <div className="chat-container">

            <AnimatePresence initial={false}>

              {messages.map((message, index) => (

                <motion.div
                  key={index}
                  className={`chat-message ${
                    message.role === "user"
                      ? "chat-message-user"
                      : "chat-message-assistant"
                  }`}
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{
                    opacity: 0,
                    y: -8,
                    transition: {
                      duration: 0.2,
                    },
                  }}
                  layout
                >

                  {/* =================================================
                      USER MESSAGE
                  ================================================= */}

                  {message.role === "user" ? (
                    <>
                      <div className="chat-message-label">
                        You
                      </div>

                      <motion.div
                        className="chat-user-message"
                        whileHover={{
                          y: -1,
                        }}
                        transition={{
                          duration: 0.2,
                        }}
                      >
                        {message.content}
                      </motion.div>
                    </>
                  ) : (

                    /* =================================================
                       ASSISTANT MESSAGE
                    ================================================= */

                    <>
                      <div className="chat-message-label">
                        EduRAG
                      </div>

                      <div className="chat-assistant-message">

                        {message.result?.loading ? (

                          <motion.div
                            className="thinking-message"
                            initial={{
                              opacity: 0,
                              scale: 0.98,
                            }}
                            animate={{
                              opacity: 1,
                              scale: 1,
                            }}
                          >
                            <span>
                              EduRAG is thinking
                            </span>

                            <span
                              className="thinking-dots"
                              aria-hidden="true"
                            >
                              <span>.</span>
                              <span>.</span>
                              <span>.</span>
                            </span>
                          </motion.div>

                        ) : (

                          <>
                            <motion.div
                              initial={{
                                opacity: 0,
                                y: 8,
                              }}
                              animate={{
                                opacity: 1,
                                y: 0,
                              }}
                              transition={{
                                duration: 0.3,
                              }}
                            >
                              <AnswerCard
                                result={message.result}
                              />
                            </motion.div>

                            <motion.div
                              initial={{
                                opacity: 0,
                                y: 8,
                              }}
                              animate={{
                                opacity: 1,
                                y: 0,
                              }}
                              transition={{
                                delay: 0.08,
                                duration: 0.3,
                              }}
                            >
                              <Sources
                                result={message.result}
                              />
                            </motion.div>
                          </>

                        )}

                      </div>
                    </>
                  )}

                </motion.div>

              ))}

            </AnimatePresence>

          </div>

        </motion.div>
      </main>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="footer">
        <p>
          EduRAG
          <span className="footer-separator">•</span>
          Academic Question Answering System
        </p>
      </footer>

    </motion.div>
  );
}


/* =========================================================
   ROUTER
========================================================= */

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