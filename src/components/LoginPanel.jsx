import { useState } from "react";

function LoginPanel({ backend, users, session, onLogin, onLogout, authBusy, authError }) {
  const [userId, setUserId] = useState(users[0]?.id ?? "");
  const [password, setPassword] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    await onLogin({ userId, password });
    setPassword("");
  }

  if (session?.user) {
    return (
      <section className="panel sidebar-panel">
        <div className="panel-header compact">
          <div>
            <p className="eyebrow">Account</p>
            <h2>ログイン中</h2>
          </div>
          <span className="mode-pill">{backend.label}</span>
        </div>
        <div className="account-card">
          <strong>{session.user.displayName}</strong>
          <span>@{session.user.id}</span>
        </div>
        <p className="meta-text">{backend.description}</p>
        <button className="button ghost-button" type="button" onClick={onLogout}>
          ログアウト
        </button>
      </section>
    );
  }

  return (
    <section className="panel sidebar-panel">
      <div className="panel-header compact">
        <div>
          <p className="eyebrow">Login</p>
          <h2>投票するにはログイン</h2>
        </div>
        <span className="mode-pill">{backend.label}</span>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>ID</span>
          <select value={userId} onChange={(event) => setUserId(event.target.value)}>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.displayName} ({user.id})
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="password"
          />
        </label>

        <button className="button primary-button" type="submit" disabled={authBusy}>
          {authBusy ? "ログイン中..." : "ログイン"}
        </button>
      </form>

      <p className="hint">{backend.passwordHint}</p>
      <p className="meta-text">{backend.description}</p>
      {authError ? <p className="error-text">{authError}</p> : null}
    </section>
  );
}

export default LoginPanel;
