import { useState } from "react";
import API from "./apiClient";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await API.post("/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div style={s.page}>
      <div style={s.left}>
        <div style={s.brand}>
          <div style={s.brandIcon}>⚡</div>
          <span style={s.brandName}>PrepAI</span>
        </div>
        <div style={s.heroSection}>
          <p style={s.eyebrow}>AI-POWERED INTERVIEW PREP</p>
          <h1 style={s.hero}>Practice like it's<br /><span style={s.heroAccent}>the real thing.</span></h1>
          <p style={s.heroSub}>Real questions. Instant AI feedback. Track every improvement.</p>
        </div>
        <div style={s.stats}>
          {[["500+", "Questions generated"], ["98%", "User satisfaction"], ["3x", "Faster preparation"]].map(([num, label]) => (
            <div key={label} style={s.stat}>
              <span style={s.statNum}>{num}</span>
              <span style={s.statLabel}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={s.right}>
        <div style={s.card}>
          <h2 style={s.cardTitle}>Welcome back</h2>
          <p style={s.cardSub}>Don't have an account? <span style={s.link} onClick={() => navigate("/signup")}>Sign up free</span></p>

          <div style={s.form}>
            <div style={s.field}>
              <label style={s.label}>Email</label>
              <input type="email" placeholder="you@email.com" value={email}
                onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown}
                style={s.input}
                onFocus={e => e.target.style.borderColor = "#7c3aed"}
                onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Password</label>
              <input type="password" placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown}
                style={s.input}
                onFocus={e => e.target.style.borderColor = "#7c3aed"}
                onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
            </div>

            {error && <div style={s.error}>{error}</div>}

            <button onClick={handleLogin} disabled={loading}
              style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}
              onMouseEnter={e => e.target.style.background = "#6d28d9"}
              onMouseLeave={e => e.target.style.background = "#7c3aed"}>
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { display: "flex", minHeight: "100vh", fontFamily: "'Inter', 'Segoe UI', sans-serif", background: "#0a0a0f" },
  left: { flex: 1, padding: "60px", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "linear-gradient(135deg, #0a0a0f 0%, #13111f 100%)", borderRight: "1px solid #1e1b2e" },
  brand: { display: "flex", alignItems: "center", gap: "12px" },
  brandIcon: { width: "36px", height: "36px", background: "linear-gradient(135deg, #7c3aed, #a78bfa)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" },
  brandName: { fontSize: "22px", fontWeight: "800", color: "#fff", letterSpacing: "-0.5px" },
  heroSection: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" },
  eyebrow: { fontSize: "11px", fontWeight: "700", letterSpacing: "3px", color: "#7c3aed", marginBottom: "16px" },
  hero: { fontSize: "56px", fontWeight: "900", color: "#fff", lineHeight: "1.05", letterSpacing: "-2px", margin: "0 0 20px 0" },
  heroAccent: { background: "linear-gradient(90deg, #a78bfa, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  heroSub: { fontSize: "17px", color: "#6b7280", lineHeight: "1.7", maxWidth: "380px" },
  stats: { display: "flex", gap: "40px", paddingTop: "40px", borderTop: "1px solid #1e1b2e" },
  stat: { display: "flex", flexDirection: "column", gap: "4px" },
  statNum: { fontSize: "28px", fontWeight: "800", color: "#a78bfa" },
  statLabel: { fontSize: "12px", color: "#6b7280" },
  right: { width: "460px", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb", padding: "40px" },
  card: { width: "100%", maxWidth: "360px" },
  cardTitle: { fontSize: "30px", fontWeight: "800", color: "#111827", letterSpacing: "-1px", margin: "0 0 8px 0" },
  cardSub: { fontSize: "14px", color: "#9ca3af", margin: "0 0 36px 0" },
  link: { color: "#7c3aed", fontWeight: "600", cursor: "pointer" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#374151" },
  input: { padding: "12px 16px", fontSize: "15px", border: "1.5px solid #e5e7eb", borderRadius: "10px", outline: "none", background: "#fff", color: "#111827", transition: "border-color 0.15s", boxSizing: "border-box", width: "100%" },
  error: { fontSize: "13px", color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "10px 14px" },
  btn: { padding: "14px", fontSize: "15px", fontWeight: "700", background: "#7c3aed", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", transition: "background 0.15s" },
};

export default Login;