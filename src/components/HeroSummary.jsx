import { formatGeneratedAt, formatKickoff, getUpcomingMatches, getStagePointSummary } from "../lib/tournament";

function HeroSummary({ data }) {
  const upcomingMatches = getUpcomingMatches(data.matches);
  const pointSummary = getStagePointSummary(data.tournament);

  return (
    <section className="hero-grid">
      <section className="hero-card spotlight-card">
        <p className="eyebrow">World Cup 2026 Vote App</p>
        <h1>決勝トーナメント予想サイト</h1>
        <p className="hero-copy">
          トーナメント表、投票カード、ランキングを 1 画面にまとめて、更新しやすく見やすい形で管理します。
        </p>
        <div className="point-rules">
          {pointSummary.map((item) => (
            <article className="point-rule-card" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value} pt</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="hero-card aside-card">
        <div className="panel-header compact">
          <div>
            <p className="eyebrow">Data</p>
            <h2>次の試合</h2>
          </div>
          <span className="meta-text">更新: {formatGeneratedAt(data.generatedAt)}</span>
        </div>
        <div className="upcoming-list">
          {upcomingMatches.map((match) => (
            <article className="upcoming-item" key={match.id}>
              <div>
                <strong>{match.team1?.shortName ?? "未定"}</strong>
                <span>vs</span>
                <strong>{match.team2?.shortName ?? "未定"}</strong>
              </div>
              <p>{formatKickoff(match.kickoffAt)}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

export default HeroSummary;
