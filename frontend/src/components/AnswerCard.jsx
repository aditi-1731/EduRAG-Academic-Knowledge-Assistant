function AnswerCard({ result }) {

  if (!result) {

    return (
      <section className="answer-section">

        <div className="section-heading">
          <h2>Answer</h2>
        </div>


        <div className="answer-card empty-card">

          <div className="empty-icon">
            ?
          </div>

          <div>

            <h3>
              No question asked yet
            </h3>

            <p>
              Ask something from your study material
              and EduRAG will generate an answer here.
            </p>

          </div>

        </div>

      </section>
    );
  }


  if (result.error) {

    return (
      <section className="answer-section">

        <div className="section-heading">
          <h2>Answer</h2>
        </div>


        <div className="answer-card error-card">

          <div className="error-icon">
            !
          </div>

          <div>

            <h3>
              Unable to generate answer
            </h3>

            <p>
              {result.error}
            </p>

          </div>

        </div>

      </section>
    );
  }


  return (
    <section className="answer-section">

      <div className="section-heading">

        <h2>
          Answer
        </h2>

        <span className="answer-badge">
          AI Generated
        </span>

      </div>


      <div className="answer-card answer-content">

        <div className="answer-mark">
          ✓
        </div>

        <div className="answer-text">
          {result.answer}
        </div>

      </div>

    </section>
  );
}


export default AnswerCard;