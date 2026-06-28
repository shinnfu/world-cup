import { formatKickoff, getMatchStatus, getUpcomingMatches, getFinishedMatches } from "../lib/tournament";

const VARIANT_META = {
  finished: {
    eyebrow: "Finished",
    title: "結果確定"
  },
  next: {
    eyebrow: "Next",
    title: "次の試合"
  }
};

function HeroSummary({ currentUser, data, now, onOpenMatch, variant = "next", votesByMatch = {} }) {
  const upcomingMatches = getUpcomingMatches(data.matches, Date.now(), 5);
  const finishedMatches = getFinishedMatches(data.matches, 5);
  const matches = variant === "finished" ? finishedMatches : upcomingMatches;
  const meta = VARIANT_META[variant] || VARIANT_META.next;

  return (
    <section className="hero-upcoming-flat">
      <div className="panel-header compact">
        <div>
          <p className="eyebrow">{meta.eyebrow}</p>
          <h2>{meta.title}</h2>
        </div>
      </div>
      <div className="upcoming-list">
        {matches.map((match) => {
          const status = getMatchStatus(match, now);
          const currentVote = currentUser ? votesByMatch[match.id]?.[currentUser.id] || null : null;
          const statusToneClass =
            variant === "next" && status.key === "open"
              ? currentVote
                ? "match-status-tag-voted"
                : "match-status-tag-unvoted"
              : "match-status-tag-neutral";

          return (
            <button className="upcoming-item flat-link" key={match.id} type="button" onClick={() => onOpenMatch(match.id)}>
              <div className="upcoming-item-topline">
                <span className="upcoming-item-id">{match.id}</span>
                {variant === "next" ? (
                  <span className={`upcoming-status-tag ${statusToneClass}`}>{status.label}</span>
                ) : null}
              </div>
              <div className="upcoming-item-main">
                <strong>{match.team1?.shortName ?? "未定"}</strong>
                {variant === "finished" ? (
                  <span className="upcoming-item-score">
                    {match.result?.team1Score ?? "-"} : {match.result?.team2Score ?? "-"}
                  </span>
                ) : (
                  <span>vs</span>
                )}
                <strong>{match.team2?.shortName ?? "未定"}</strong>
              </div>
              <p>{formatKickoff(match.kickoffAt)}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default HeroSummary;
