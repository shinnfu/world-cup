import { formatGeneratedAt, formatKickoff, getUpcomingMatches, getStagePointSummary } from "../lib/tournament";

function HeroSummary({ data, onOpenMatch }) {
  const upcomingMatches = getUpcomingMatches(data.matches);
  const pointSummary = getStagePointSummary(data.tournament);

  return (
    <section className="hero-strip">
      <section className="hero-summary-flat">
        <div className="hero-meta-block">
          <p className="eyebrow">Data</p>
          <div className="hero-meta-row">
            <span className="meta-label">データ更新</span>
            <strong>{formatGeneratedAt(data.generatedAt)}</strong>
          </div>
        </div>

        <div className="point-rules compact">
          {pointSummary.map((item) => (
            <article className="point-rule-inline" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value} pt</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="hero-upcoming-flat">
        <div className="panel-header compact">
          <div>
            <p className="eyebrow">Next</p>
            <h2>次の試合</h2>
          </div>
        </div>
        <div className="upcoming-list">
          {upcomingMatches.map((match) => (
            <button className="upcoming-item flat-link" key={match.id} type="button" onClick={() => onOpenMatch(match.id)}>
              <div className="upcoming-item-main">
                <strong>{match.team1?.shortName ?? "未定"}</strong>
                <span>vs</span>
                <strong>{match.team2?.shortName ?? "未定"}</strong>
              </div>
              <p>{formatKickoff(match.kickoffAt)}</p>
            </button>
          ))}
        </div>
      </section>
    </section>
  );
}

export default HeroSummary;
