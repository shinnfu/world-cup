function RankingPanel({ rankings }) {
  return (
    <section className="panel sidebar-panel">
      <div className="panel-header compact">
        <div>
          <p className="eyebrow">Ranking</p>
          <h2>ランキング</h2>
        </div>
      </div>

      <div className="ranking-list">
        {rankings.map((row) => (
          <article
            className={`ranking-card ${row.isFirst ? "ranking-card-first" : ""} ${row.isSecond ? "ranking-card-second" : ""}`}
            key={row.user.id}
          >
            <div className="ranking-topline">
              <span className="ranking-rank">{row.rank}位</span>
              <strong>{row.user.displayName}</strong>
            </div>
            <div className="ranking-metrics">
              <span>{row.totalPoints.toFixed(1)} pt</span>
              <span>{row.correctCount} 的中</span>
              <span>{row.votedCount} 投票</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default RankingPanel;
