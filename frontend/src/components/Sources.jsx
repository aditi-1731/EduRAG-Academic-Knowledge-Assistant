function Sources({ result }) {

  if (!result || result.error || !result.sources) {
    return null;
  }

  return (
    <section className="sources-section">

      <div className="section-heading">
        <div>
          <h2>Sources</h2>
          <p className="sources-description">
            Information retrieved from your study material.
          </p>
        </div>

        <span className="source-count">
          {result.sources.length} source
          {result.sources.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="sources-list">

        {result.sources.map((source, index) => (

          <div
            className="source-card"
            key={index}
          >

            <div className="source-number">
              {index + 1}
            </div>

            <div className="source-info">

              <strong>
                {source.source}
              </strong>

              <span>
                Page {source.page}
              </span>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}

export default Sources;