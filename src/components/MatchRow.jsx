import { formatKickoff, getBaseAssetUrl, getMatchStatus, getSourceLabel, getVoteShare } from "../lib/tournament";

function TeamSlot({ count, fillRatio, isPickedByCurrentUser, side, team, source }) {
  if (team) {
    const fillColor = side === "left" ? "rgba(224, 86, 71, 0.30)" : "rgba(55, 108, 227, 0.30)";

    return (
      <div
        className={`team-slot team-slot-${side}`}
        style={{
          backgroundImage: `linear-gradient(to left, ${fillColor} 0%, ${fillColor} ${fillRatio * 100}%, rgba(255, 255, 255, 0) ${fillRatio * 100}%, rgba(255, 255, 255, 0) 100%)`
        }}
      >
        <div className="team-slot-main">
          <span className="team-slot-flag-wrap">
            <img alt="" className="flag-icon" src={getBaseAssetUrl(team.flagAsset)} />
            {isPickedByCurrentUser ? <span className="team-slot-check">✓</span> : null}
          </span>
          <span>{team.shortName}</span>
        </div>
        <strong className="team-slot-count">{count}</strong>
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
  const share = getVoteShare(match, votesByMatch);

  return (
    <button className="bracket-match-row" type="button" onClick={() => onOpen(match.id)}>
      <div className="bracket-card-header">
        <span>{match.id}</span>
        <span>{match.points} pt</span>
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
        />
        <TeamSlot
          count={share.right}
          fillRatio={share.rightSlotRatio}
          isPickedByCurrentUser={currentVote?.predictedWinnerCode === match.team2Code}
          side="right"
          team={match.team2}
          source={match.team2Source}
        />
      </div>
    </button>
  );
}

export default MatchRow;
