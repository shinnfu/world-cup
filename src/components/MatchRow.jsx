import { getBaseAssetUrl, getMatchStatus, getSourceLabel } from "../lib/tournament";

function TeamSlot({ team, source }) {
  if (team) {
    return (
      <div className="team-slot">
        <img alt="" className="flag-icon" src={getBaseAssetUrl(team.flagAsset)} />
        <span>{team.shortName}</span>
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

  return (
    <button className="bracket-match-row" type="button" onClick={() => onOpen(match.id)}>
      <div className="bracket-card-header">
        <span>{match.id}</span>
        <span>{match.points} pt</span>
      </div>
      <span className={`match-status-tag ${statusToneClass}`}>{status.label}</span>
      <div className="bracket-card-body">
        <TeamSlot team={match.team1} source={match.team1Source} />
        <TeamSlot team={match.team2} source={match.team2Source} />
      </div>
    </button>
  );
}

export default MatchRow;
