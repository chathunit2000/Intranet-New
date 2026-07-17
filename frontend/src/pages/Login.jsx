import { useState } from "react";
import { login } from "../services/api";

export default function Login({ onSuccess }) {
  const [serviceNo, setServiceNo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(serviceNo, password);
      onSuccess();
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid service number or password"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="card"
        style={{ width: 320 }}
      >
        <h3>Intranet Login</h3>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Service No
          </label>
          <input
            value={serviceNo}
            onChange={(e) => setServiceNo(e.target.value)}
            required
            style={{
              width: "100%",
              padding: 8,
              marginTop: 4,
              borderRadius: 8,
              border: "1px solid var(--border-soft)",
              background: "var(--navy-800)",
              color: "var(--text-light)",
            }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: 8,
              marginTop: 4,
              borderRadius: 8,
              border: "1px solid var(--border-soft)",
              background: "var(--navy-800)",
              color: "var(--text-light)",
            }}
          />
        </div>
        {error && (
          <div style={{ color: "var(--red-1)", fontSize: 12, marginBottom: 10 }}>
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="btn-link"
          style={{ width: "100%" }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
