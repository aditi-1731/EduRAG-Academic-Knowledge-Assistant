import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import QuestionBox from "./components/QuestionBox";
import AnswerCard from "./components/AnswerCard";
import Sources from "./components/Sources";

import Register from "./pages/Register";
import Login from "./pages/Login";

import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";


function Home() {

  const [result, setResult] = useState(null);


  return (
    <div className="app">

      <Header />

      <main className="main-content">

        <section className="hero">

          <div className="hero-badge">
            AI-Powered Academic Assistant
          </div>

          <h2>
            Ask. Learn. Understand.
          </h2>

          <p>
            Ask questions from your study material and get
            clear, context-based answers with source references.
          </p>

        </section>


        <QuestionBox
          onResult={setResult}
        />


        <AnswerCard
          result={result}
        />


        <Sources
          result={result}
        />

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
      <Route path="/" element={ <ProtectedRoute> <Home /> </ProtectedRoute>}/>
      <Route path="/register" element={<Register />}/>
      <Route path="/login" element={<Login />}/>
    </Routes>
  )
}

export default App;