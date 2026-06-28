import { useEffect, useRef, useState } from "react";
import MatchRow from "./MatchRow";

function BracketBoard({ stages, onOpenMatch, currentUser, now, votesByMatch }) {
  const viewportRef = useRef(null);
  const gridRef = useRef(null);
  const [scaleState, setScaleState] = useState({ scale: 1, height: null, width: null });

  useEffect(() => {
    if (!viewportRef.current || !gridRef.current) {
      return undefined;
    }

    function updateScale() {
      const viewportWidth = viewportRef.current.clientWidth;
      const naturalWidth = gridRef.current.scrollWidth;
      const naturalHeight = gridRef.current.scrollHeight;

      if (!viewportWidth || !naturalWidth || !naturalHeight) {
        return;
      }

      const scale = viewportWidth < naturalWidth ? viewportWidth / naturalWidth : 1;
      setScaleState({
        scale,
        width: naturalWidth,
        height: naturalHeight * scale
      });
    }

    const observer = new ResizeObserver(() => {
      updateScale();
    });

    observer.observe(viewportRef.current);
    updateScale();

    return () => observer.disconnect();
  }, [stages]);

  const scaled = scaleState.scale < 1;

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Bracket</p>
          <h2>トーナメント表</h2>
        </div>
        <p className="meta-text">試合を選ぶと詳細と投票を開けます。</p>
      </div>

      <div className="bracket-scroll" ref={viewportRef}>
        <div className="bracket-scale-shell" style={scaled ? { height: `${scaleState.height}px` } : undefined}>
          <div
            className="bracket-scale-inner"
            style={
              scaled
                ? {
                    width: `${scaleState.width}px`,
                    transform: `scale(${scaleState.scale})`
                  }
                : undefined
            }
          >
            <div className="bracket-grid" ref={gridRef}>
              {stages.map((stage) => (
                <section className={`stage-column stage-${stage.id}`} key={stage.id}>
                  <header className="stage-header">
                    <span>{stage.shortLabel}</span>
                  </header>
                  <div className="stage-stack">
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
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BracketBoard;
