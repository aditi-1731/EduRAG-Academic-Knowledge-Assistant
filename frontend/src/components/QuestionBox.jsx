import { useState } from "react";


function QuestionBox({ onResult }) {

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);


  const askQuestion = async () => {

    if (!question.trim()) {
      return;
    }


    setLoading(true);


    try {

      const response = await fetch(
        "http://127.0.0.1:8000/ask",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            question: question,
          }),
        }
      );


      const data = await response.json();


      if (!response.ok) {

        onResult({
          error: data.detail || "Something went wrong.",
        });

        return;
      }


      onResult(data);

    } catch (error) {

      onResult({
        error: "Unable to connect to the EduRAG server.",
      });

    } finally {

      setLoading(false);

    }
  };


  return (
    <section className="question-section">

      <h2>Ask a Question</h2>

      <p className="section-description">
        Ask a question from your academic study material.
      </p>


      <textarea
        className="question-input"

        placeholder="For example: What is HTML?"

        rows="5"

        value={question}

        onChange={(event) =>
          setQuestion(event.target.value)
        }

        disabled={loading}
      />


      <button
        className="ask-button"

        onClick={askQuestion}

        disabled={loading || !question.trim()}
      >

        {loading ? "Thinking..." : "Ask EduRAG"}

      </button>

    </section>
  );
}


export default QuestionBox;