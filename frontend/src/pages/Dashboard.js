import { useEffect, useState } from "react";
import API from "./apiClient";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiError, setAiError] = useState(false);

  useEffect(() => {
  if (!localStorage.getItem("token")) navigate("/login");
  fetchHistory();
}, [navigate]);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/api/interview/history", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data);
    } catch (err) { console.log(err); }
  };

  const startInterview = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setAiError(false);
    try {
      const token = localStorage.getItem("token");
     const questionRes = await API.post("/api/interview/generate-questions",
        { topic }, { headers: { Authorization: `Bearer ${token}` } });
      localStorage.setItem("questions", JSON.stringify(questionRes.data.questions));
      localStorage.setItem("topic", topic);
      const res = await API.post("/api/interview/start", {},
        { headers: { Authorization: `Bearer ${token}` } });
      localStorage.setItem("interviewId", res.data.id);
      navigate("/interview");
    } catch (err) {
      console.log(err);
      setAiError(true);
    } finally { setLoading(false); }
  };

  const logout = () => {
    ["token", "interviewId", "questions", "answers", "topic"].forEach(k => localStorage.removeItem(k));
    navigate("/login");
  };

  const avgScore = history.length ? Math.round(history.reduce((a, b) => a + b.score, 0) / history.length) : 0;
  const bestScore = history.length ? Math.max(...history.map(h => h.score)) : 0;

  return (
    <div style={s.page}>
      <aside style={s.sidebar}>
        <div style={s.sidebarTop}>
          <div style={s.logo}>
            <div style={s.logoMark}>⚡</div>
            <span style={s.logoText}>PrepAI</span>
          </div>
          <nav style={s.nav}>
            <span style={s.navLabel}>MAIN</span>
            {[
              { icon: "▦", label: "Dashboard", path: "/dashboard", active: true },
              { icon: "↗", label: "Analytics", path: "/analytics", active: false },
            ].map(item => (
              <div key={item.label} onClick={() => navigate(item.path)}
                style={{ ...s.navItem, ...(item.active ? s.navItemActive : {}) }}>
                <span style={s.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
                {item.active && <div style={s.navIndicator} />}
              </div>
            ))}
          </nav>
        </div>
        <div style={s.sidebarFooter}>
          <div style={s.userCard}>
            <div style={s.avatar}>B</div>
            <div style={s.userInfo}>
              <span style={s.userName}>Bhavana</span>
              <span style={s.userRole}>Candidate</span>
            </div>
          </div>
          <div style={s.logoutLink} onClick={logout}>Sign out</div>
        </div>
      </aside>

      <main style={s.main}>
        <div style={s.topbar}>
          <div>
            <h1 style={s.pageTitle}>Dashboard</h1>
            <p style={s.pageSubtitle}>Welcome back — ready for your next round?</p>
          </div>
          <button onClick={() => document.getElementById("topicInput").focus()} style={s.newInterviewBtn}>
            + New Interview
          </button>
        </div>

        <div style={s.statsGrid}>
          {[
            { label: "Sessions", value: history.length, sub: "total completed", color: "#6366f1", bg: "#eef2ff" },
            { label: "Best Score", value: bestScore, sub: "personal record", color: "#0ea5e9", bg: "#e0f2fe" },
            { label: "Avg Score", value: avgScore, sub: "across sessions", color: "#10b981", bg: "#d1fae5" },
          ].map(stat => (
            <div key={stat.label} style={s.statCard}>
              <div style={{ ...s.statDot, background: stat.bg }}>
                <div style={{ ...s.statDotInner, background: stat.color }} />
              </div>
              <div>
                <div style={{ ...s.statValue, color: stat.color }}>{stat.value}</div>
                <div style={s.statLabel}>{stat.label}</div>
                <div style={s.statSub}>{stat.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={s.startSection}>
          <div style={s.startHeader}>
            <span style={s.startEyebrow}>START SESSION</span>
            <h2 style={s.startTitle}>What will you practice today?</h2>
          </div>
          <div style={s.startRow}>
            <div style={s.inputWrap}>
              <span style={s.inputIcon}>🔍</span>
              <input id="topicInput" type="text"
                placeholder="React, System Design, DBMS, HR, Python..."
                value={topic} onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === "Enter" && startInterview()}
                style={s.input}
                onFocus={e => { e.target.parentNode.style.borderColor = "#6366f1"; e.target.parentNode.style.boxShadow = "0 0 0 3px #eef2ff"; }}
                onBlur={e => { e.target.parentNode.style.borderColor = "#e2e8f0"; e.target.parentNode.style.boxShadow = "none"; }}
              />
            </div>
            <button onClick={startInterview} disabled={loading || !topic.trim()}
              style={{ ...s.startBtn, opacity: loading || !topic.trim() ? 0.5 : 1 }}>
              {loading ? "Generating..." : "Start Interview →"}
            </button>
          </div>
          {aiError && (
            <div style={s.errorBar}>
              <span>⚠️ Couldn't generate questions. Check your connection.</span>
              <button onClick={() => { setAiError(false); startInterview(); }} style={s.retryBtn}>Retry</button>
            </div>
          )}
          <div style={s.topicChips}>
            {["React", "Node.js", "DBMS", "System Design", "HR", "Python", "DSA"].map(t => (
              <button key={t} onClick={() => setTopic(t)}
                style={{ ...s.chip, ...(topic === t ? s.chipActive : {}) }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={s.historySection}>
          <div style={s.historyHeader}>
            <h2 style={s.sectionTitle}>Recent Sessions</h2>
            {history.length > 0 && (
              <button onClick={() => navigate("/analytics")} style={s.viewAllBtn}>View analytics →</button>
            )}
          </div>
          {history.length === 0 ? (
            <div style={s.emptyState}>
              <div style={s.emptyIcon}>🎯</div>
              <h3 style={s.emptyTitle}>No sessions yet</h3>
              <p style={s.emptyText}>Start your first interview above to see your history here.</p>
            </div>
          ) : (
            <div style={s.historyTable}>
              <div style={s.tableHeader}>
                <span style={s.th}>#</span>
                <span style={s.th}>Date</span>
                <span style={s.th}>Time</span>
                <span style={{ ...s.th, textAlign: "right" }}>Score</span>
                <span style={{ ...s.th, textAlign: "right" }}>Performance</span>
              </div>
              {history.map((item, i) => {
                const pct = item.score;
                const perf = pct >= 40 ? { label: "Excellent", color: "#10b981", bg: "#d1fae5" }
                  : pct >= 25 ? { label: "Good", color: "#0ea5e9", bg: "#e0f2fe" }
                  : pct >= 10 ? { label: "Fair", color: "#f59e0b", bg: "#fef3c7" }
                  : { label: "Needs Work", color: "#ef4444", bg: "#fee2e2" };
                return (
                  <div key={item.id} style={s.tableRow}
                    onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                    onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                    <span style={s.td}><span style={s.sessionNum}>#{history.length - i}</span></span>
                    <span style={s.td}>{new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    <span style={s.td}>{new Date(item.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                    <span style={{ ...s.td, textAlign: "right", fontWeight: "700", color: "#1e293b" }}>{item.score} pts</span>
                    <span style={{ ...s.td, textAlign: "right" }}>
                      <span style={{ ...s.badge, color: perf.color, background: perf.bg }}>{perf.label}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const s = {
  page: { display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" },
  sidebar: { width: "240px", background: "#0f172a", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "fixed", height: "100vh", borderRight: "1px solid #1e293b" },
  sidebarTop: { flex: 1 },
  logo: { display: "flex", alignItems: "center", gap: "10px", padding: "24px 20px 20px", borderBottom: "1px solid #1e293b", marginBottom: "8px" },
  logoMark: { width: "32px", height: "32px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" },
  logoText: { fontSize: "17px", fontWeight: "800", color: "#f1f5f9", letterSpacing: "-0.3px" },
  nav: { padding: "8px 12px", display: "flex", flexDirection: "column", gap: "2px" },
  navLabel: { fontSize: "10px", fontWeight: "700", color: "#475569", letterSpacing: "1.5px", padding: "8px 8px 6px", display: "block" },
  navItem: { display: "flex", alignItems: "center", gap: "10px", padding: "9px 10px", borderRadius: "8px", color: "#64748b", fontSize: "14px", fontWeight: "500", cursor: "pointer", position: "relative", transition: "all 0.15s" },
  navItemActive: { background: "#1e293b", color: "#e2e8f0" },
  navIcon: { fontSize: "14px", width: "18px", textAlign: "center" },
  navIndicator: { width: "5px", height: "5px", borderRadius: "50%", background: "#6366f1", marginLeft: "auto" },
  sidebarFooter: { borderTop: "1px solid #1e293b", padding: "16px 20px" },
  userCard: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" },
  avatar: { width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "13px", fontWeight: "700" },
  userInfo: { display: "flex", flexDirection: "column" },
  userName: { fontSize: "13px", fontWeight: "600", color: "#e2e8f0" },
  userRole: { fontSize: "11px", color: "#475569" },
  logoutLink: { fontSize: "12px", color: "#475569", cursor: "pointer", padding: "4px 0" },
  main: { marginLeft: "240px", flex: 1, padding: "32px 40px" },
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" },
  pageTitle: { fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: "0 0 4px 0", letterSpacing: "-0.5px" },
  pageSubtitle: { fontSize: "14px", color: "#94a3b8", margin: 0 },
  newInterviewBtn: { padding: "10px 20px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "24px" },
  statCard: { background: "#fff", borderRadius: "14px", padding: "20px 24px", display: "flex", alignItems: "center", gap: "16px", border: "1px solid #f1f5f9", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" },
  statDot: { width: "44px", height: "44px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  statDotInner: { width: "18px", height: "18px", borderRadius: "50%" },
  statValue: { fontSize: "28px", fontWeight: "800", lineHeight: 1, letterSpacing: "-1px" },
  statLabel: { fontSize: "13px", fontWeight: "600", color: "#334155", marginTop: "4px" },
  statSub: { fontSize: "11px", color: "#94a3b8", marginTop: "2px" },
  startSection: { background: "#fff", borderRadius: "16px", padding: "28px 32px", border: "1px solid #f1f5f9", marginBottom: "24px", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" },
  startHeader: { marginBottom: "20px" },
  startEyebrow: { fontSize: "10px", fontWeight: "700", letterSpacing: "2px", color: "#6366f1" },
  startTitle: { fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: "6px 0 0 0", letterSpacing: "-0.3px" },
  startRow: { display: "flex", gap: "12px", marginBottom: "16px" },
  inputWrap: { flex: 1, display: "flex", alignItems: "center", border: "1.5px solid #e2e8f0", borderRadius: "10px", padding: "0 14px", background: "#fff", transition: "all 0.15s" },
  inputIcon: { fontSize: "15px", marginRight: "8px", flexShrink: 0 },
  input: { flex: 1, border: "none", outline: "none", fontSize: "14px", color: "#0f172a", padding: "13px 0", background: "transparent", fontFamily: "inherit" },
  startBtn: { padding: "0 28px", height: "48px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap", transition: "opacity 0.15s", fontFamily: "inherit" },
  errorBar: { display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "10px 16px", fontSize: "13px", color: "#dc2626", marginBottom: "12px" },
  retryBtn: { fontSize: "12px", fontWeight: "700", color: "#dc2626", background: "none", border: "1px solid #fca5a5", padding: "4px 12px", borderRadius: "6px", cursor: "pointer", fontFamily: "inherit" },
  topicChips: { display: "flex", gap: "8px", flexWrap: "wrap" },
  chip: { padding: "6px 14px", fontSize: "12px", fontWeight: "600", border: "1.5px solid #e2e8f0", borderRadius: "20px", background: "#f8fafc", color: "#64748b", cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit" },
  chipActive: { background: "#eef2ff", borderColor: "#6366f1", color: "#6366f1" },
  historySection: { background: "#fff", borderRadius: "16px", padding: "28px 32px", border: "1px solid #f1f5f9", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" },
  historyHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  sectionTitle: { fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: 0 },
  viewAllBtn: { fontSize: "13px", color: "#6366f1", fontWeight: "600", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" },
  emptyState: { textAlign: "center", padding: "48px 20px" },
  emptyIcon: { fontSize: "40px", marginBottom: "12px" },
  emptyTitle: { fontSize: "16px", fontWeight: "700", color: "#334155", margin: "0 0 6px 0" },
  emptyText: { fontSize: "14px", color: "#94a3b8", margin: 0 },
  historyTable: { border: "1px solid #f1f5f9", borderRadius: "10px", overflow: "hidden" },
  tableHeader: { display: "grid", gridTemplateColumns: "48px 1fr 1fr 100px 120px", padding: "10px 16px", background: "#f8fafc", borderBottom: "1px solid #f1f5f9" },
  th: { fontSize: "11px", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.5px" },
  tableRow: { display: "grid", gridTemplateColumns: "48px 1fr 1fr 100px 120px", padding: "14px 16px", borderBottom: "1px solid #f8fafc", background: "#fff", transition: "background 0.1s", alignItems: "center" },
  td: { fontSize: "13px", color: "#475569" },
  sessionNum: { fontSize: "12px", fontWeight: "700", color: "#94a3b8" },
  badge: { fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px" },
};

export default Dashboard;