import { useState } from "react";

import Header from "./components/Header";
import QuestionBox from "./components/QuestionBox";
import AnswerCard from "./components/AnswerCard";
import Sources from "./components/Sources";

import "./App.css";

function App() {

  const [result, setResult] = useState(null);


  return (
    <div className="app">

      <Header />


      <main className="main-content">

        <section className="hero">

          <h2>
            Learn from your study material.
          </h2>

          <p>
            EduRAG uses Retrieval-Augmented Generation
            to answer academic questions using your
            provided documents.
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

export default App;