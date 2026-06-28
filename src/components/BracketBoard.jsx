import { useEffect, useMemo, useState } from "react";
import MatchRow from "./MatchRow";

const DESKTOP_ROW_HEIGHT = 82;
const MOBILE_ROW_HEIGHT = 72;
const DESKTOP_BASE_OFFSET = 20;
const MOBILE_BASE_OFFSET = 12;
const DESKTOP_ROW_GAP = 10;
const MOBILE_ROW_GAP = 8;

function getStageLayouts(isMobile) {
  const rowHeight = isMobile ? MOBILE_ROW_HEIGHT : DESKTOP_ROW_HEIGHT;
  const baseOffset = isMobile ? MOBILE_BASE_OFFSET : DESKTOP_BASE_OFFSET;
  const rowGap = isMobile ? MOBILE_ROW_GAP : DESKTOP_ROW_GAP;

  const layoutById = {};
  const stages = ["roundOf32", "roundOf16", "quarterfinal", "semifinal", "thirdPlace", "final"];

  stages.forEach((id, index) => {
    if (id === "roundOf32") {
      layoutById[id] = {
        marginTop: `${baseOffset}px`,
        display: "grid",
        gap: `${rowGap}px`
      };
      return;
    }

    const previousIndex = index - 1;
    const previousStage = layoutById[stages[previousIndex]];
    const previousOffset = Number.parseFloat(previousStage.marginTop || "0");
    const previousGap = Number.parseFloat(previousStage.gap || `${rowGap}`);
    const offset = previousOffset + previousGap + rowHeight + rowGap;

    layoutById[id] = {
      marginTop: `${offset}px`,
      display: "grid",
      gap: `${rowGap}px`
    };
  });

  return layoutById;
}

function BracketBoard({ stages, onOpenMatch, currentUser, now, votesByMatch }) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia("(max-width: 760px)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(max-width: 760px)");
    const handleChange = (event) => setIsMobile(event.matches);

    handleChange(mediaQuery);
    mediaQuery.addEventListener?.("change", handleChange);

    return () => mediaQuery.removeEventListener?.("change", handleChange);
  }, []);

  const stageLayouts = useMemo(() => getStageLayouts(isMobile), [isMobile]);

  return (
    <section className="panel bracket-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Bracket</p>
          <h2>トーナメント表</h2>
        </div>
      </div>

      <div className="bracket-scroll">
        <div className="bracket-grid">
          {stages.map((stage) => {
            const layout = stageLayouts[stage.id] || {};

            return (
              <section className={`stage-column stage-${stage.id}`} key={stage.id}>
                <header className="stage-header">
                  <span>{stage.shortLabel}</span>
                </header>
                <div className="stage-stack" style={layout}>
                  {stage.matches.map((match) => (
                    <MatchRow
                      currentUser={currentUser}
                      key={match.id}
                      match={match}
                      now={now}
                      onOpen={onOpenMatch}
                      votesByMatch={votesByMatch}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default BracketBoard;
