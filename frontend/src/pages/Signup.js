// ==========================
// client/src/pages/Signup.js
// ==========================

import { useState } from "react";
import API from "./apiClient";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async () => {
    setError("");
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      await API.post("/api/auth/signUp", {
        name,
        email,
        password,
      });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.msg || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Left panel */}
      <div style={styles.left}>
        <div style={styles.brand}>
          <span style={styles.brandIcon}>🤖</span>
          <span style={styles.brandName}>InterviewAI</span>
        </div>
        <h1 style={styles.heroText}>
          Ace your next<br />interview with AI.
        </h1>
        <p style={styles.heroSub}>
          Practice with real interview questions, get instant AI feedback, and
          track your progress over time.
        </p>
        <div style={styles.features}>
          {["AI-generated questions", "Instant scoring & feedback", "Topic-wise analytics"].map(
            (f) => (
              <div key={f} style={styles.featureItem}>
                <span style={styles.featureDot}>✦</span>
                <span>{f}</span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Right panel */}
      <div style={styles.right}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Create your account</h2>
          <p style={styles.cardSub}>
            Already have an account?{" "}
            <span style={styles.link} onClick={() => navigate("/login")}>
              Sign in
            </span>
          </p>

          <div style={styles.form}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                placeholder="Bhavana Reddy"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
                onFocus={(e) => (e.target.style.borderColor = "#6c63ff")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                onFocus={(e) => (e.target.style.borderColor = "#6c63ff")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                onFocus={(e) => (e.target.style.borderColor = "#6c63ff")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <button
              onClick={handleSignup}
              disabled={loading}
              style={{
                ...styles.button,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.background = "#574fd6";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#6c63ff";
              }}
            >
              {loading ? "Creating account..." : "Create Account →"}
            </button>
          </div>

          <p style={styles.terms}>
            By signing up, you agree to our{" "}
            <span style={styles.link}>Terms of Service</span> and{" "}
            <span style={styles.link}>Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    backgroundColor: "#0f0e17",
  },
  left: {
    flex: 1,
    padding: "60px 64px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 100%)",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "60px",
  },
  brandIcon: {
    fontSize: "28px",
  },
  brandName: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: "-0.3px",
  },
  heroText: {
    fontSize: "52px",
    fontWeight: "800",
    color: "#ffffff",
    lineHeight: "1.1",
    margin: "0 0 20px 0",
    letterSpacing: "-1.5px",
  },
  heroSub: {
    fontSize: "17px",
    color: "#a0aec0",
    lineHeight: "1.7",
    maxWidth: "400px",
    margin: "0 0 40px 0",
  },
  features: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "#e2e8f0",
    fontSize: "15px",
  },
  featureDot: {
    color: "#6c63ff",
    fontSize: "12px",
  },
  right: {
    width: "480px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7f8fc",
    padding: "40px",
  },
  card: {
    width: "100%",
    maxWidth: "380px",
  },
  cardTitle: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#1a202c",
    margin: "0 0 8px 0",
    letterSpacing: "-0.5px",
  },
  cardSub: {
    fontSize: "14px",
    color: "#718096",
    margin: "0 0 32px 0",
  },
  link: {
    color: "#6c63ff",
    cursor: "pointer",
    fontWeight: "600",
    textDecoration: "none",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#4a5568",
    letterSpacing: "0.3px",
  },
  input: {
    padding: "12px 16px",
    fontSize: "15px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "10px",
    outline: "none",
    backgroundColor: "#ffffff",
    color: "#1a202c",
    transition: "border-color 0.2s",
    width: "100%",
    boxSizing: "border-box",
  },
  error: {
    fontSize: "13px",
    color: "#e53e3e",
    backgroundColor: "#fff5f5",
    border: "1px solid #fed7d7",
    borderRadius: "8px",
    padding: "10px 14px",
    margin: "0",
  },
  button: {
    padding: "14px",
    fontSize: "15px",
    fontWeight: "700",
    backgroundColor: "#6c63ff",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "background 0.2s",
    letterSpacing: "0.2px",
    marginTop: "4px",
  },
  terms: {
    fontSize: "12px",
    color: "#a0aec0",
    textAlign: "center",
    marginTop: "20px",
    lineHeight: "1.6",
  },
};

export default Signup;