import { useState } from "react";
import { formatKickoff, getUserPointHistory } from "../lib/tournament";

function RankingPanel({ rankings, matches, votesByMatch }) {
  const [openUserId, setOpenUserId] = useState("");

  return (
    <section className="panel ranking-panel">
      <div className="panel-header compact">
        <div>
          <p className="eyebrow">Ranking</p>
          <h2>ランキング</h2>
        </div>
      </div>

      <div className="ranking-list">
        {rankings.map((row) => {
          const open = openUserId === row.user.id;
          const history = open ? getUserPointHistory(row.user.id, matches, votesByMatch) : [];

          return (
            <article
              className={`ranking-card ${row.isFirst ? "ranking-card-first" : ""} ${row.isSecond ? "ranking-card-second" : ""}`}
              key={row.user.id}
            >
              <button className="ranking-button" type="button" onClick={() => setOpenUserId(open ? "" : row.user.id)}>
                <div className="ranking-topline">
                  <span className="ranking-rank">{row.rank}位</span>
                  <strong>{row.user.displayName}</strong>
                </div>
                <div className="ranking-score">{row.totalPoints.toFixed(1)} pt</div>
              </button>

              {open ? (
                <div className="ranking-history">
                  {history.map((item) => {
                    const pickedLabel =
                      item.pickedCode === item.team1?.code
                        ? item.team1?.shortName
                        : item.pickedCode === item.team2?.code
                          ? item.team2?.shortName
                          : "—";

                    return (
                      <div className="ranking-history-row" key={`${row.user.id}-${item.matchId}`}>
                        <div>
                          <strong>{item.matchId}</strong>
                          <span>{formatKickoff(item.kickoffAt)}</span>
                        </div>
                        <div className="ranking-history-choice">
                          <span>{pickedLabel}</span>
                          <strong>{item.earnedPoints.toFixed(1)} pt</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default RankingPanel;
