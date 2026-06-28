function SummaryStrip({ users, teams, matches, statusCounts }) {
  return (
    <section className="stats-grid">
      <article className="stat-card">
        <span className="stat-label">参加ユーザー</span>
        <strong>{users.length}</strong>
      </article>
      <article className="stat-card">
        <span className="stat-label">対象チーム</span>
        <strong>{Object.keys(teams).length}</strong>
      </article>
      <article className="stat-card">
        <span className="stat-label">投票受付中</span>
        <strong>{statusCounts.open}</strong>
      </article>
      <article className="stat-card">
        <span className="stat-label">結果確定</span>
        <strong>{statusCounts.final}</strong>
      </article>
      <article className="stat-card">
        <span className="stat-label">受付終了</span>
        <strong>{statusCounts.closed}</strong>
      </article>
      <article className="stat-card">
        <span className="stat-label">対戦国未確定</span>
        <strong>{statusCounts.team_pending}</strong>
      </article>
      <article className="stat-card">
        <span className="stat-label">総試合数</span>
        <strong>{matches.length}</strong>
      </article>
    </section>
  );
}

export default SummaryStrip;
