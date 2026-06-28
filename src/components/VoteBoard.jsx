import {
  formatKickoff,
  getBaseAssetUrl,
  getMatchStatus,
  getTeamSlotLabel,
  getVoteTallies
} from "../lib/tournament";

function VoteAction({ currentUserVote, code, label, disabled, onVote }) {
  const active = currentUserVote?.predictedWinnerCode === code;

  return (
    <button
      className={`vote-choice ${active ? "vote-choice-active" : ""}`}
      disabled={disabled}
      type="button"
      onClick={() => onVote(code)}
    >
      <span>{label}</span>
      {active ? <strong>投票中</strong> : null}
    </button>
  );
}

function VoteBoard({
  matches,
  users,
  votesByMatch,
  currentUser,
  now,
  onVote,
  onOpenMatch,
  voteBusyMatchId
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Voting</p>
          <h2>試合カード一覧</h2>
        </div>
        <p className="meta-text">投票締切は各試合の kickoff 時刻です。</p>
      </div>

      <div className="vote-card-grid">
        {matches.map((match) => {
          const status = getMatchStatus(match, now);
          const currentUserVote = currentUser ? votesByMatch[match.id]?.[currentUser.id] || null : null;
          const tallies = getVoteTallies(match, votesByMatch);
          const disabled = status.key !== "open" || !currentUser;

          return (
            <article className="vote-card" key={match.id}>
              <div className="vote-card-head">
                <div>
                  <p className="eyebrow">{match.stageLabel}</p>
                  <h3>{match.id}</h3>
                </div>
                <span className={status.chipClassName}>{status.label}</span>
              </div>

              <button className="vote-card-summary" type="button" onClick={() => onOpenMatch(match.id)}>
                <div className="vote-team-line">
                  {match.team1 ? <img alt="" className="flag-icon" src={getBaseAssetUrl(match.team1.flagAsset)} /> : null}
                  <strong>{getTeamSlotLabel(match, "team1")}</strong>
                  <span>{tallies[match.team1Code] || 0}票</span>
                </div>
                <div className="vote-team-line">
                  {match.team2 ? <img alt="" className="flag-icon" src={getBaseAssetUrl(match.team2.flagAsset)} /> : null}
                  <strong>{getTeamSlotLabel(match, "team2")}</strong>
                  <span>{tallies[match.team2Code] || 0}票</span>
                </div>
              </button>

              <div className="vote-card-meta">
                <span>{formatKickoff(match.kickoffAt)}</span>
                <span>{match.points} pt</span>
              </div>

              <div className="vote-actions">
                <VoteAction
                  currentUserVote={currentUserVote}
                  code={match.team1Code}
                  disabled={disabled || !match.team1Code || voteBusyMatchId === match.id}
                  label={match.team1?.shortName ?? "未定"}
                  onVote={(code) => onVote(match.id, code)}
                />
                <VoteAction
                  currentUserVote={currentUserVote}
                  code={match.team2Code}
                  disabled={disabled || !match.team2Code || voteBusyMatchId === match.id}
                  label={match.team2?.shortName ?? "未定"}
                  onVote={(code) => onVote(match.id, code)}
                />
              </div>

              {!currentUser ? <p className="hint">投票するにはログインが必要です。</p> : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default VoteBoard;
