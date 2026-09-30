import { useState } from "react";

function QuestionBox({ onResult }) {

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {

    if (!question.trim()) {
      return;
    }

    setLoading(true);
    onResult(null);

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/ask",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            question: question.trim(),
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

    } catch {

      onResult({
        error: "Unable to connect to the EduRAG server.",
      });

    } finally {

      setLoading(false);

    }
  };

  return (
    <section className="question-section">

      <div className="question-heading">

        <div>
          <h2>Ask a Question</h2>

          <p className="section-description">
            Ask a question from your academic study material.
          </p>
        </div>

        <span className="question-hint">
          Press the button to ask
        </span>

      </div>

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

      <div className="question-footer">

        <span className="question-length">
          {question.length} characters
        </span>

        <button
          className="ask-button"
          onClick={askQuestion}
          disabled={loading || !question.trim()}
        >

          {loading ? (
            <span className="loading-content">

              <span className="spinner"></span>

              Thinking...

            </span>
          ) : (
            "Ask EduRAG"
          )}

        </button>

      </div>

    </section>
  );
}

export default QuestionBox;