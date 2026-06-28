import MatchRow from "./MatchRow";

function BracketBoard({ stages, onOpenMatch }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Bracket</p>
          <h2>トーナメント表</h2>
        </div>
        <p className="meta-text">クリックすると投票詳細を開けます。</p>
      </div>

      <div className="bracket-scroll">
        <div className="bracket-grid">
          {stages.map((stage) => (
            <section className={`stage-column stage-${stage.id}`} key={stage.id}>
              <header className="stage-header">
                <span>{stage.shortLabel}</span>
                <strong>{stage.label}</strong>
              </header>
              <div className="stage-stack">
                {stage.matches.map((match) => (
                  <MatchRow key={match.id} match={match} onOpen={onOpenMatch} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BracketBoard;
