import { getBaseAssetUrl, getMatchStatus, getSourceLabel, getTeamVoteTone, getVoteShare } from "../lib/tournament";

function TeamSlot({ count, side, team, source, tone }) {
  if (team) {
    return (
      <div className={`team-slot team-slot-${side}`} style={{ backgroundColor: tone }}>
        <div className="team-slot-main">
          <img alt="" className="flag-icon" src={getBaseAssetUrl(team.flagAsset)} />
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
      <span className={`match-status-tag ${statusToneClass}`}>{status.label}</span>
      <div className="bracket-card-body">
        <TeamSlot
          count={share.left}
          side="left"
          team={match.team1}
          source={match.team1Source}
          tone={getTeamVoteTone("left", share.leftRatio)}
        />
        <TeamSlot
          count={share.right}
          side="right"
          team={match.team2}
          source={match.team2Source}
          tone={getTeamVoteTone("right", share.rightRatio)}
        />
      </div>
    </button>
  );
}

export default MatchRow;
