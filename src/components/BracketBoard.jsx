import MatchRow from "./MatchRow";

function BracketBoard({ stages, onOpenMatch, currentUser, now, votesByMatch }) {
  return (
    <section className="panel bracket-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Bracket</p>
          <h2>トーナメント表</h2>
        </div>
      </div>

      <div className="bracket-scroll">
        <div className="bracket-grid">
          {stages.map((stage) => (
            <section className={`stage-column stage-${stage.id}`} key={stage.id}>
              <header className="stage-header">
                <span>{stage.shortLabel}</span>
              </header>
              <div className="stage-stack">
                {stage.matches.map((match) => (
                  <MatchRow
                    currentUser={currentUser}
                    key={match.id}
                    match={match}
                    now={now}
                    onOpen={onOpenMatch}
                    votesByMatch={votesByMatch}
                  />
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
