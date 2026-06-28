import {
  formatKickoff,
  getBaseAssetUrl,
  getMatchStatus,
  getVotesForUsers,
  getVoteTallies
} from "../lib/tournament";

function MatchDetailModal({ match, users, votesByMatch, currentUser, now, onClose, onVote, voteBusyMatchId }) {
  if (!match) {
    return null;
  }

  const status = getMatchStatus(match, now);
  const rows = getVotesForUsers(users, votesByMatch, match.id);
  const tallies = getVoteTallies(match, votesByMatch);
  const voteDisabled = status.key !== "open" || !currentUser;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <section className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="panel-header">
          <div>
            <p className="eyebrow">{match.stageLabel}</p>
            <h2>{match.id}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose}>
            閉じる
          </button>
        </div>

        <div className="modal-match-overview">
          <div className="modal-team-card">
            {match.team1 ? <img alt="" className="flag-icon large" src={getBaseAssetUrl(match.team1.flagAsset)} /> : null}
            <strong>{match.team1?.name ?? "未定"}</strong>
            <span>{tallies[match.team1Code] || 0}票</span>
            <button
              className="button subtle-button"
              disabled={voteDisabled || !match.team1Code || voteBusyMatchId === match.id}
              type="button"
              onClick={() => onVote(match.id, match.team1Code)}
            >
              ここに投票
            </button>
          </div>
          <div className="modal-center">
            <span className={status.chipClassName}>{status.label}</span>
            <strong className="modal-score">
              {match.result?.team1Score ?? "-"} : {match.result?.team2Score ?? "-"}
            </strong>
            <p>{formatKickoff(match.kickoffAt)}</p>
            <p>{match.points} pt</p>
            {match.result?.summary ? <p className="meta-text">{match.result.summary}</p> : null}
          </div>
          <div className="modal-team-card">
            {match.team2 ? <img alt="" className="flag-icon large" src={getBaseAssetUrl(match.team2.flagAsset)} /> : null}
            <strong>{match.team2?.name ?? "未定"}</strong>
            <span>{tallies[match.team2Code] || 0}票</span>
            <button
              className="button subtle-button"
              disabled={voteDisabled || !match.team2Code || voteBusyMatchId === match.id}
              type="button"
              onClick={() => onVote(match.id, match.team2Code)}
            >
              ここに投票
            </button>
          </div>
        </div>

        <div className="modal-vote-table">
          {rows.map(({ user, vote }) => (
            <div className="vote-row" key={user.id}>
              <div>
                <strong>{user.displayName}</strong>
                <span>@{user.id}</span>
              </div>
              <div className="vote-row-choice">
                <span>{vote?.predictedWinnerCode ? match.team1Code === vote.predictedWinnerCode ? match.team1?.shortName : match.team2?.shortName : "未投票"}</span>
                <small>{vote?.updatedAt ? "投票済み" : "未投票"}</small>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default MatchDetailModal;
