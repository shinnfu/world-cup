import {
  formatKickoff,
  getBaseAssetUrl,
  getMatchStatus,
  getVotesForUsers,
  getVoteShare
} from "../lib/tournament";

function MatchDetailModal({ match, users, votesByMatch, currentUser, now, onClose, onVote, voteBusyMatchId }) {
  if (!match) {
    return null;
  }

  const status = getMatchStatus(match, now);
  const rows = getVotesForUsers(users, votesByMatch, match.id);
  const share = getVoteShare(match, votesByMatch);
  const voteDisabled = status.key !== "open" || !currentUser;
  const currentUserVote = currentUser ? votesByMatch[match.id]?.[currentUser.id] || null : null;

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
          <div className="modal-team-card modal-team-card-left">
            {match.team1 ? <img alt="" className="flag-icon large" src={getBaseAssetUrl(match.team1.flagAsset)} /> : null}
            <strong>{match.team1?.name ?? "未定"}</strong>
            <span>{share.left}票</span>
            <button
              className={`button modal-vote-button modal-vote-button-left ${currentUserVote?.predictedWinnerCode === match.team1Code ? "modal-vote-button-active" : ""}`}
              disabled={voteDisabled || !match.team1Code || voteBusyMatchId === match.id}
              type="button"
              onClick={() => onVote(match.id, match.team1Code)}
            >
              ここに投票
            </button>
          </div>

          <div className="modal-center">
            <span className={`${status.chipClassName} modal-status-chip`}>{status.label}</span>
            <strong className="modal-score">
              {match.result?.team1Score ?? "-"} : {match.result?.team2Score ?? "-"}
            </strong>
            <p className="modal-kickoff">{formatKickoff(match.kickoffAt)}</p>
            <p className="modal-points">{match.points} pt</p>
          </div>

          <div className="modal-team-card modal-team-card-right">
            {match.team2 ? <img alt="" className="flag-icon large" src={getBaseAssetUrl(match.team2.flagAsset)} /> : null}
            <strong>{match.team2?.name ?? "未定"}</strong>
            <span>{share.right}票</span>
            <button
              className={`button modal-vote-button modal-vote-button-right ${currentUserVote?.predictedWinnerCode === match.team2Code ? "modal-vote-button-active" : ""}`}
              disabled={voteDisabled || !match.team2Code || voteBusyMatchId === match.id}
              type="button"
              onClick={() => onVote(match.id, match.team2Code)}
            >
              ここに投票
            </button>
          </div>
        </div>

        <div className="modal-vote-meter" aria-hidden="true">
          <div className="modal-vote-meter-left" style={{ width: `${share.leftRatio * 100}%` }} />
          <div className="modal-vote-meter-right" style={{ width: `${share.rightRatio * 100}%` }} />
        </div>

        <div className="modal-vote-table">
          {rows.map(({ user, vote }) => {
            const selectedLeft = vote?.predictedWinnerCode === match.team1Code;
            const selectedRight = vote?.predictedWinnerCode === match.team2Code;

            return (
              <div className="vote-row" key={user.id}>
                <strong>{user.displayName}</strong>
                <div className="vote-row-choice">
                  {selectedLeft ? <span className="vote-choice-pill vote-choice-pill-left">{match.team1?.shortName}</span> : null}
                  {selectedRight ? <span className="vote-choice-pill vote-choice-pill-right">{match.team2?.shortName}</span> : null}
                  {!selectedLeft && !selectedRight ? <span className="vote-choice-empty" /> : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default MatchDetailModal;
