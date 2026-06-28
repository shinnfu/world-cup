function SummaryStrip({ matches, statusCounts }) {
  return (
    <section className="summary-strip">
      <article className="summary-item">
        <span className="stat-label">投票受付中</span>
        <strong>{statusCounts.open}</strong>
      </article>
      <article className="summary-item">
        <span className="stat-label">結果確定</span>
        <strong>{statusCounts.final}</strong>
      </article>
      <article className="summary-item">
        <span className="stat-label">受付終了</span>
        <strong>{statusCounts.closed}</strong>
      </article>
      <article className="summary-item">
        <span className="stat-label">対戦国未確定</span>
        <strong>{statusCounts.team_pending}</strong>
      </article>
      <article className="summary-item">
        <span className="stat-label">総試合数</span>
        <strong>{matches.length}</strong>
      </article>
    </section>
  );
}

export default SummaryStrip;
