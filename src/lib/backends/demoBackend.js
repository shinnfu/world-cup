const SESSION_KEY = "wc2026-demo-session";
const VOTES_KEY = "wc2026-demo-votes";
const SESSION_EVENT = "wc2026:session";
const VOTES_EVENT = "wc2026:votes";

function readJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function createDemoBackend() {
  return {
    id: "demo",
    label: "Demo Mode",
    description: "Firebase 未設定のため、ブラウザ保存で動作しています。",
    passwordHint: "demo では password に user id をそのまま入力してください。",
    subscribeAuth(users, callback) {
      const emit = () => {
        const session = readJson(SESSION_KEY, null);
        callback(session ? { ...session, user: users.find((entry) => entry.id === session.userId) || null } : null);
      };

      const onStorage = (event) => {
        if (event.key === SESSION_KEY || event.type === SESSION_EVENT) {
          emit();
        }
      };

      emit();
      window.addEventListener("storage", onStorage);
      window.addEventListener(SESSION_EVENT, onStorage);

      return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener(SESSION_EVENT, onStorage);
      };
    },
    subscribeVotes(callback) {
      const emit = () => {
        callback(readJson(VOTES_KEY, {}));
      };

      const onStorage = (event) => {
        if (event.key === VOTES_KEY || event.type === VOTES_EVENT) {
          emit();
        }
      };

      emit();
      window.addEventListener("storage", onStorage);
      window.addEventListener(VOTES_EVENT, onStorage);

      return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener(VOTES_EVENT, onStorage);
      };
    },
    async login({ userId, password, users }) {
      const user = users.find((entry) => entry.id === userId);

      if (!user) {
        throw new Error("そのIDのユーザーは存在しません。");
      }

      if (password !== userId) {
        throw new Error("demo mode では password に user id を入力してください。");
      }

      const session = {
        userId,
        mode: "demo",
        loggedInAt: new Date().toISOString()
      };

      writeJson(SESSION_KEY, session);
      window.dispatchEvent(new Event(SESSION_EVENT));
      return { ...session, user };
    },
    async logout() {
      window.localStorage.removeItem(SESSION_KEY);
      window.dispatchEvent(new Event(SESSION_EVENT));
    },
    async saveVote({ matchId, userId, predictedWinnerCode }) {
      const votes = readJson(VOTES_KEY, {});
      const nextVotes = {
        ...votes,
        [matchId]: {
          ...(votes[matchId] || {}),
          [userId]: {
            userId,
            predictedWinnerCode,
            updatedAt: new Date().toISOString()
          }
        }
      };

      writeJson(VOTES_KEY, nextVotes);
      window.dispatchEvent(new Event(VOTES_EVENT));
    }
  };
}
