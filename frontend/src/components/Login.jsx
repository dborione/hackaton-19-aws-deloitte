import React, { useState } from "react";

const styles = {
  container: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  card: { background: "#fff", padding: 40, borderRadius: 8, boxShadow: "0 30px 40px 0 rgba(212,217,232,.25)", width: 360 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 8, color: "#4f4f4f" },
  subtitle: { color: "#666", marginBottom: 24 },
  label: { display: "block", marginBottom: 4, fontWeight: "bold", fontSize: 14 },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 4, marginBottom: 16, fontSize: 14 },
  btn: { width: "100%", padding: "12px", background: "#bd2430", color: "#fff", border: "none", borderRadius: 4, fontSize: 16, cursor: "pointer", fontWeight: "bold" },
  error: { background: "#ffeaea", color: "#c0392b", padding: "10px 12px", borderRadius: 4, marginBottom: 16, fontSize: 14 }
};

export default function Login({ onLogin, onGoRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onLogin(username, password);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>A&G Funerals</h1>
        <p style={styles.subtitle}>Sign in to access your account</p>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Email</label>
          <input style={styles.input} type="email" value={username} onChange={e => setUsername(e.target.value)} autoComplete="email" required />
          <label style={styles.label}>Password</label>
          <input style={styles.input} type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required />
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <div style={{ marginTop: 16, textAlign: "center", fontSize: 14, color: "#666" }}>
          Don't have an account yet?{" "}
          <button style={{ color: "#bd2430", background: "none", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: 14 }} onClick={onGoRegister}>
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}
