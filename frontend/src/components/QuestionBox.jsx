import { useState } from "react";

import { useAuth } from "../context/useAuth";

function QuestionBox({ onResult, documentId }) {
  const { token } = useAuth();

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    if (!question.trim()) return;

    if (!documentId) {
      onResult({
        error: "Please select a study material first.",
      });
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
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            question: question.trim(),
            document_id: documentId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        onResult({
          error:
            data.detail ||
            "Something went wrong.",
        });

        return;
      }

      onResult(data);
    } catch {
      onResult({
        error:
          "Unable to connect to the EduRAG server.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="question-section">
      <div className="question-heading">
        <h2>Ask a Question</h2>

        <p>
          Ask questions related to the study material you uploaded.
        </p>
      </div>

      <textarea
        value={question}
        onChange={(event) =>
          setQuestion(event.target.value)
        }
        placeholder="Ask a question about your uploaded PDF..."
        rows={5}
        disabled={loading}
      />

      <button
        type="button"
        onClick={askQuestion}
        disabled={
          loading ||
          !question.trim() ||
          !documentId
        }
      >
        {loading
          ? "Processing Question..."
          : "Ask EduRAG"}
      </button>
    </section>
  );
}

export default QuestionBox;