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
        role: "assistant",
        result: {
          error: "Please upload a study material first.",
        },
      });
      return;
    }

    const currentQuestion = question.trim();

    onResult({
      role: "user",
      content: currentQuestion,
    });

    onResult({
      role: "assistant",
      result: {
        loading: true,
      },
    });

    setLoading(true);
    setQuestion("");

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
            question: currentQuestion,
            document_id: documentId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        onResult({
          role: "assistant",
          result: {
            error:
              data.detail ||
              "Something went wrong.",
          },
        });

        return;
      }

      onResult({
        role: "assistant",
        result: data,
      });
    } catch {
      onResult({
        role: "assistant",
        result: {
          error:
            "Unable to connect to the EduRAG server.",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      askQuestion();
    }
  };

  return (
    <section className="question-workspace">
      <div className="question-workspace-header">
        <div>
          <span className="workspace-eyebrow">
            AI STUDY ASSISTANT
          </span>

          <h2>
            What would you like to learn?
          </h2>

          <p>
            Ask anything from your uploaded study
            material and get a grounded answer.
          </p>
        </div>

        <div className="ai-status">
          <span className="ai-status-dot"></span>
          EduRAG ready
        </div>
      </div>

      <div className="question-composer">
        <textarea
          value={question}
          onChange={(event) =>
            setQuestion(event.target.value)
          }
          onKeyDown={handleKeyDown}
          placeholder={
            documentId
              ? "Ask a question about your study material..."
              : "Upload a PDF above to activate EduRAG."
          }
          rows={4}
          disabled={loading || !documentId}
        />

        <div className="composer-footer">
          <div className="composer-hint">
            <span className="keyboard-key">
              Enter
            </span>
            <span>to ask</span>

            <span className="keyboard-key">
              Shift + Enter
            </span>
            <span>for a new line</span>
          </div>

          <button
            type="button"
            className="ask-button"
            onClick={askQuestion}
            disabled={
              loading ||
              !question.trim() ||
              !documentId
            }
          >
            {loading ? (
              <>
                <span className="button-spinner"></span>
                Thinking...
              </>
            ) : (
              <>
                Ask EduRAG
                <span className="button-arrow">
                  →
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {!documentId && (
        <div className="question-empty-state">
          <span className="empty-state-icon">
            ✦
          </span>

          <span>
            Upload a PDF above to activate EduRAG.
          </span>
        </div>
      )}
    </section>
  );
}

export default QuestionBox;