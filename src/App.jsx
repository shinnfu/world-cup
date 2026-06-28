import { startTransition, useEffect, useState } from "react";
import BracketBoard from "./components/BracketBoard";
import HeroSummary from "./components/HeroSummary";
import LoginPanel from "./components/LoginPanel";
import MatchDetailModal from "./components/MatchDetailModal";
import RankingPanel from "./components/RankingPanel";
import SummaryStrip from "./components/SummaryStrip";
import VoteBoard from "./components/VoteBoard";
import { createBackend } from "./lib/backends";
import {
  formatGeneratedAt,
  getMatchStatus,
  getRankings,
  getStageColumns,
  getStatusCounts
} from "./lib/tournament";

const backend = createBackend();
const tournamentDataUrl = `${import.meta.env.BASE_URL}data/tournament.json`;

function App() {
  const [state, setState] = useState({ status: "loading", data: null, error: null });
  const [session, setSession] = useState(null);
  const [votesByMatch, setVotesByMatch] = useState({});
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [voteBusyMatchId, setVoteBusyMatchId] = useState("");
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    let active = true;

    async function loadTournament() {
      try {
        const response = await fetch(tournamentDataUrl);

        if (!response.ok) {
          throw new Error(`Failed to load tournament data: ${response.status}`);
        }

        const data = await response.json();

        if (active) {
          startTransition(() => {
            setState({ status: "ready", data, error: null });
          });
        }
      } catch (error) {
        if (active) {
          setState({
            status: "error",
            data: null,
            error: error instanceof Error ? error.message : "Unknown error"
          });
        }
      }
    }

    loadTournament();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (state.status !== "ready") {
      return undefined;
    }

    const unsubscribeAuth = backend.subscribeAuth(state.data.users, (nextSession) => {
      setSession(nextSession);
    });

    const unsubscribeVotes = backend.subscribeVotes((nextVotes) => {
      startTransition(() => {
        setVotesByMatch(nextVotes);
      });
    });

    return () => {
      unsubscribeAuth?.();
      unsubscribeVotes?.();
    };
  }, [state]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 30000);

    return () => window.clearInterval(timer);
  }, []);

  async function handleLogin({ userId, password }) {
    setAuthBusy(true);
    setAuthError("");

    try {
      await backend.login({ userId, password, users: state.data.users });
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "ログインに失敗しました。");
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleLogout() {
    setAuthError("");
    await backend.logout();
  }

  async function handleVote(matchId, predictedWinnerCode) {
    if (!session?.user) {
      setAuthError("投票するにはログインが必要です。");
      return;
    }

    setVoteBusyMatchId(matchId);
    try {
      await backend.saveVote({
        matchId,
        userId: session.user.id,
        predictedWinnerCode
      });
    } finally {
      setVoteBusyMatchId("");
    }
  }

  return (
    <main className="app-shell">
      {state.status === "loading" ? (
        <section className="panel">
          <h2>Loading</h2>
          <p>大会データを読み込んでいます。</p>
        </section>
      ) : null}

      {state.status === "error" ? (
        <section className="panel error-panel">
          <h2>Data Error</h2>
          <p>{state.error}</p>
          <p className="hint">`public/data/tournament.json` が最新か確認してください。</p>
        </section>
      ) : null}

      {state.status === "ready" ? (
        <Dashboard
          authBusy={authBusy}
          authError={authError}
          backend={backend}
          currentUser={session?.user || null}
          data={state.data}
          now={now}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onOpenMatch={setSelectedMatchId}
          onVote={handleVote}
          selectedMatchId={selectedMatchId}
          setSelectedMatchId={setSelectedMatchId}
          voteBusyMatchId={voteBusyMatchId}
          votesByMatch={votesByMatch}
        />
      ) : null}
    </main>
  );
}

function Dashboard({
  authBusy,
  authError,
  backend,
  currentUser,
  data,
  now,
  onLogin,
  onLogout,
  onOpenMatch,
  onVote,
  selectedMatchId,
  setSelectedMatchId,
  voteBusyMatchId,
  votesByMatch
}) {
  const statusCounts = getStatusCounts(data.matches, now);
  const rankings = getRankings(data.users, data.matches, votesByMatch);
  const stageColumns = getStageColumns(data.stages, data.matchesById);
  const selectedMatch = selectedMatchId ? data.matchesById[selectedMatchId] : null;

  return (
    <>
      <header className="app-header">
        <div>
          <p className="eyebrow">Ready to build</p>
          <h1 className="header-title">{data.tournament.title}</h1>
          <p className="meta-text">生成データ更新: {formatGeneratedAt(data.generatedAt)}</p>
        </div>
        <span className="mode-pill large">{backend.label}</span>
      </header>

      <HeroSummary data={data} />
      <SummaryStrip matches={data.matches} statusCounts={statusCounts} teams={data.teams} users={data.users} />

      <div className="content-grid">
        <div className="main-column">
          <BracketBoard onOpenMatch={onOpenMatch} stages={stageColumns} />
          <VoteBoard
            currentUser={currentUser}
            matches={data.matches}
            now={now}
            onOpenMatch={onOpenMatch}
            onVote={onVote}
            users={data.users}
            voteBusyMatchId={voteBusyMatchId}
            votesByMatch={votesByMatch}
          />
        </div>

        <aside className="sidebar-column">
          <LoginPanel
            authBusy={authBusy}
            authError={authError}
            backend={backend}
            onLogin={onLogin}
            onLogout={onLogout}
            session={currentUser ? { user: currentUser } : null}
            users={data.users}
          />
          <RankingPanel rankings={rankings} />
        </aside>
      </div>

      <MatchDetailModal
        currentUser={currentUser}
        match={selectedMatch}
        now={now}
        onClose={() => setSelectedMatchId("")}
        onVote={onVote}
        users={data.users}
        voteBusyMatchId={voteBusyMatchId}
        votesByMatch={votesByMatch}
      />
    </>
  );
}

export default App;
