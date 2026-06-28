import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import {
  getDatabase,
  onValue,
  ref,
  set,
  serverTimestamp
} from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export function isFirebaseConfigured() {
  return Object.values(firebaseConfig).every(Boolean);
}

function toLoginEmail(userId) {
  return `${userId}@worldcup2026.local`;
}

export function createFirebaseBackend() {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const database = getDatabase(app);

  return {
    id: "firebase",
    label: "Firebase Live",
    description: "Firebase Auth + Realtime Database に接続しています。",
    passwordHint: "設定済みの password を入力してください。",
    subscribeAuth(users, callback) {
      return onAuthStateChanged(auth, (authUser) => {
        if (!authUser) {
          callback(null);
          return;
        }

        const userId = authUser.email?.split("@")[0] || authUser.uid;
        callback({
          userId,
          mode: "firebase",
          user: users.find((entry) => entry.id === userId) || null
        });
      });
    },
    subscribeVotes(callback) {
      const votesRef = ref(database, "votes");
      return onValue(votesRef, (snapshot) => {
        callback(snapshot.val() || {});
      });
    },
    async login({ userId, password, users }) {
      const user = users.find((entry) => entry.id === userId);
      if (!user) {
        throw new Error("そのIDのユーザーは存在しません。");
      }

      await signInWithEmailAndPassword(auth, toLoginEmail(userId), password);
      return {
        userId,
        mode: "firebase",
        user
      };
    },
    async logout() {
      await signOut(auth);
    },
    async saveVote({ matchId, userId, predictedWinnerCode }) {
      await set(ref(database, `votes/${matchId}/${userId}`), {
        userId,
        predictedWinnerCode,
        updatedAt: serverTimestamp()
      });
    }
  };
}
