function Sources({ result }) {

  if (!result || result.error || !result.sources) {
    return null;
  }


  return (
    <section className="sources-section">

      <h2>Sources</h2>

      {result.sources.map((source, index) => (

        <div
          className="source-card"
          key={index}
        >

          <strong>
            {source.source}
          </strong>

          <span>
            Page {source.page}
          </span>

        </div>

      ))}

    </section>
  );
}


export default Sources;