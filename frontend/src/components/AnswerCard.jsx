function AnswerCard({ result }) {

  if (!result) {
    return (
      <section className="answer-section">

        <h2>Answer</h2>

        <div className="answer-card">
          <p>
            Your answer will appear here after you ask a question.
          </p>
        </div>

      </section>
    );
  }


  if (result.error) {
    return (
      <section className="answer-section">

        <h2>Answer</h2>

        <div className="answer-card error-card">
          <p>{result.error}</p>
        </div>

      </section>
    );
  }


  return (
    <section className="answer-section">

      <h2>Answer</h2>

      <div className="answer-card">
        <p>{result.answer}</p>
      </div>

    </section>
  );
}


export default AnswerCard;