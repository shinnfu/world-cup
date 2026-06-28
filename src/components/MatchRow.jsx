import { getBaseAssetUrl, getSourceLabel } from "../lib/tournament";

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

function MatchRow({ match, onOpen }) {
  return (
    <button className="bracket-card" type="button" onClick={() => onOpen(match.id)}>
      <div className="bracket-card-header">
        <span>{match.id}</span>
        <span>{match.points} pt</span>
      </div>
      <div className="bracket-card-body">
        <TeamSlot team={match.team1} source={match.team1Source} />
        <TeamSlot team={match.team2} source={match.team2Source} />
      </div>
    </button>
  );
}

export default MatchRow;
