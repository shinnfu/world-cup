import { formatKickoff, getFinishedMatches, getUpcomingMatches } from "../lib/tournament";

function HeroSummary({ data, onOpenMatch }) {
  const upcomingMatches = getUpcomingMatches(data.matches, Date.now(), 5);
  const finishedMatches = getFinishedMatches(data.matches, 5);

  return (
    <section className="hero-strip">
      <section className="hero-upcoming-flat">
        <div className="panel-header compact">
          <div>
            <p className="eyebrow">Finished</p>
            <h2>結果確定</h2>
          </div>
        </div>
        <div className="upcoming-list">
          {finishedMatches.map((match) => (
            <button className="upcoming-item flat-link" key={match.id} type="button" onClick={() => onOpenMatch(match.id)}>
              <div className="upcoming-item-main">
                <strong>{match.team1?.shortName ?? "未定"}</strong>
                <span className="upcoming-item-score">
                  {match.result?.team1Score ?? "-"} : {match.result?.team2Score ?? "-"}
                </span>
                <strong>{match.team2?.shortName ?? "未定"}</strong>
              </div>
              <p>{formatKickoff(match.kickoffAt)}</p>
            </button>
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
