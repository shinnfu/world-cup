import { formatKickoff, getBaseAssetUrl, getMatchStatus, getSourceLabel, getVoteShare } from "../lib/tournament";

function TeamSlot({ count, fillRatio, isPickedByCurrentUser, side, team, source, isWinner }) {
  if (team) {
    return (
      <div className={`team-slot team-slot-${side} ${isWinner ? "winner" : ""}`}>
        <span className={`team-slot-fill team-slot-fill-${side}`} style={{ width: `${fillRatio * 100}%` }} />
        <div className="team-slot-main">
          <img alt="" className="flag-icon" src={getBaseAssetUrl(team.flagAsset)} />
          <span>{team.shortName}</span>
          {isWinner ? <span className="team-slot-winner-badge">🏆</span> : null}
        </div>
        <div className="team-slot-vote-meta">
          {isPickedByCurrentUser ? <span className="team-slot-check">✓</span> : null}
          <strong className="team-slot-count">{count}</strong>
        </div>
      </div>
    );
  }

  return (
    <div className="team-slot team-slot-pending">
      <span>{getSourceLabel(source)}</span>
    </div>
  );
}

function MatchRow({ match, now, onOpen, currentUser, votesByMatch }) {
  const status = getMatchStatus(match, now);
  const currentVote = currentUser ? votesByMatch[match.id]?.[currentUser.id] || null : null;
  const statusToneClass =
    status.key === "open"
      ? currentVote
        ? "match-status-tag-voted"
        : "match-status-tag-unvoted"
      : "match-status-tag-neutral";
  const rowToneClass =
    status.key === "open"
      ? currentVote
        ? "match-card-voted"
        : "match-card-unvoted"
      : status.key === "closed"
        ? "match-card-closed"
        : "";
  const share = getVoteShare(match, votesByMatch);

  return (
    <button className={`bracket-match-row ${rowToneClass}`.trim()} type="button" onClick={() => onOpen(match.id)}>
      <div className="bracket-card-header">
        <span>{match.id}</span>
        <span className="bracket-card-points">{match.points} pt</span>
      </div>
      <p className="bracket-card-kickoff">{formatKickoff(match.kickoffAt)}</p>
      <span className={`match-status-tag ${statusToneClass}`}>{status.label}</span>
      <div className="bracket-card-body">
        <TeamSlot
          count={share.left}
          fillRatio={share.leftSlotRatio}
          isPickedByCurrentUser={currentVote?.predictedWinnerCode === match.team1Code}
          side="left"
          team={match.team1}
          source={match.team1Source}
          isWinner={Boolean(match.result?.winnerCode && match.result.winnerCode === match.team1Code)}
        />
        <TeamSlot
          count={share.right}
          fillRatio={share.rightSlotRatio}
          isPickedByCurrentUser={currentVote?.predictedWinnerCode === match.team2Code}
          side="right"
          team={match.team2}
          source={match.team2Source}
          isWinner={Boolean(match.result?.winnerCode && match.result.winnerCode === match.team2Code)}
        />
      </div>
    </button>
  );
}

export default MatchRow;
