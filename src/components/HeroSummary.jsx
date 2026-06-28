import MatchRow from "./MatchRow";
import { getUpcomingMatches, getFinishedMatches } from "../lib/tournament";

const VARIANT_META = {
  finished: {
    eyebrow: "Finished",
    title: "結果確定"
  },
  next: {
    eyebrow: "Next",
    title: "次の試合"
  }
};

function HeroSummary({ currentUser, data, now, onOpenMatch, variant = "next", votesByMatch = {} }) {
  const upcomingMatches = getUpcomingMatches(data.matches, Date.now(), 5);
  const finishedMatches = getFinishedMatches(data.matches, 5);
  const matches = variant === "finished" ? finishedMatches : upcomingMatches;
  const meta = VARIANT_META[variant] || VARIANT_META.next;

  return (
    <section className="hero-upcoming-flat">
      <div className="panel-header compact">
        <div>
          <p className="eyebrow">{meta.eyebrow}</p>
          <h2>{meta.title}</h2>
        </div>
      </div>
      <div className="hero-match-list">
        {matches.map((match) => (
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
}

export default HeroSummary;
