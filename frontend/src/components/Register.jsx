import React, { useState } from "react";

const styles = {
  container: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  card:      { background: "#fff", padding: 40, borderRadius: 8, boxShadow: "0 30px 40px 0 rgba(212,217,232,.25)", width: 360 },
  title:     { fontSize: 24, fontWeight: "bold", marginBottom: 8, color: "#232f3e" },
  subtitle:  { color: "#666", marginBottom: 24 },
  label:     { display: "block", marginBottom: 4, fontWeight: "bold", fontSize: 14 },
  input:     { width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 4, marginBottom: 4, fontSize: 14, boxSizing: "border-box" },
  hint:      { fontSize: 12, color: "#999", marginBottom: 12 },
  btn:       { width: "100%", padding: "12px", background: "#bd2430", color: "#fff", border: "none", borderRadius: 4, fontSize: 16, cursor: "pointer", fontWeight: "bold", marginTop: 8 },
  link:      { marginTop: 16, textAlign: "center", fontSize: 14, color: "#666" },
  linkBtn:   { color: "#bd2430", background: "none", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: 14 },
  error:     { background: "#ffeaea", color: "#c0392b", padding: "10px 12px", borderRadius: 4, marginBottom: 16, fontSize: 14 },
  success:   { background: "#eafff0", color: "#27ae60", padding: "10px 12px", borderRadius: 4, marginBottom: 16, fontSize: 14 },
  strength:  (s) => ({ height: 4, borderRadius: 2, marginBottom: 12, background: ["#eee","#e74c3c","#e67e22","#f1c40f","#27ae60"][s], width: `${s * 25}%`, transition: "all 0.3s" })
};

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

function getStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8)          score++;
  if (/[A-Z]/.test(pwd))        score++;
  if (/\d/.test(pwd))           score++;
  if (/[!@#$%^&*]/.test(pwd))   score++;
  return score;
}

export default function Register({ onRegister, onConfirm, onGoLogin }) {
  const [step, setStep]           = useState("form"); // "form" | "confirm"
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [code, setCode]           = useState("");
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");
  const [loading, setLoading]     = useState(false);

  const strength = getStrength(password);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!PASSWORD_REGEX.test(password)) {
      setError("Password must contain at least 8 characters, one uppercase letter, one number, and one symbol (!@#$%^&*).");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await onRegister(email, password);
      setStep("confirm");
      setSuccess("A verification code has been sent to your email.");
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onConfirm(email, code.trim());
      setSuccess("Account verified! You can now sign in.");
      setTimeout(onGoLogin, 1500);
    } catch (err) {
      setError(err.message || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create an account</h1>
        <p style={styles.subtitle}>
          {step === "form" ? "Fill out the form to create your account" : "Enter the code received by email"}
        </p>

        {error   && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        {step === "form" ? (
          <form onSubmit={handleRegister} noValidate>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <div style={styles.strength(strength)} />
            <p style={styles.hint}>Min. 8 characters, 1 uppercase letter, 1 number, 1 symbol</p>

            <label style={styles.label}>Confirm password</label>
            <input
              style={styles.input}
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
            />

            <button style={styles.btn} type="submit" disabled={loading}>
              {loading ? "Signing up..." : "Sign up"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleConfirm}>
            <label style={styles.label}>Verification code</label>
            <input
              style={styles.input}
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              maxLength={6}
              placeholder="123456"
              autoComplete="one-time-code"
              required
            />
            <button style={styles.btn} type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Confirm"}
            </button>
          </form>
        )}

        <div style={styles.link}>
          Already have an account?{" "}
          <button style={styles.linkBtn} onClick={onGoLogin}>Sign in</button>
        </div>
      </div>
    </div>
  );
}
