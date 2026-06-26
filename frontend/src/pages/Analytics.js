import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell, LineChart, Line, Area, AreaChart } from "recharts";
import { useEffect, useState } from "react";
import API from "./apiClient";
import { useNavigate } from "react-router-dom";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "10px", padding: "12px 16px", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
        <p style={{ color: "#94a3b8", fontSize: "12px", margin: "0 0 4px 0" }}>{label}</p>
        <p style={{ color: "#a5b4fc", fontSize: "18px", fontWeight: "800", margin: 0 }}>{payload[0].value} pts</p>
      </div>
    );
  }
  return null;
};

function Analytics() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/login");
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/api/interview/history",
        { headers: { Authorization: `Bearer ${token}` } });
      const formatted = res.data.map((item, i) => ({
        name: `S${i + 1}`,
        fullName: `Session ${i + 1}`,
        score: item.score,
        date: new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        time: new Date(item.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      }));
      setData(formatted);
    } catch (err) { console.log(err); }
  };

  const avg = data.length ? Math.round(data.reduce((a, b) => a + b.score, 0) / data.length) : 0;
  const best = data.length ? Math.max(...data.map(d => d.score)) : 0;
  const latest = data.length ? data[data.length - 1].score : 0;
  const trend = data.length >= 2 ? data[data.length - 1].score - data[data.length - 2].score : 0;

  return (
    <div style={s.page}>
      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.sidebarTop}>
          <div style={s.logo}>
            <div style={s.logoMark}>⚡</div>
            <span style={s.logoText}>PrepAI</span>
          </div>
          <nav style={s.nav}>
            <span style={s.navLabel}>MAIN</span>
            {[
              { icon: "▦", label: "Dashboard", path: "/dashboard", active: false },
              { icon: "↗", label: "Analytics", path: "/analytics", active: true },
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
        </div>
      </aside>

      {/* Main */}
      <main style={s.main}>
        <div style={s.topbar}>
          <div>
            <h1 style={s.pageTitle}>Analytics</h1>
            <p style={s.pageSubtitle}>Track your performance over time.</p>
          </div>
          <button onClick={() => navigate("/dashboard")} style={s.backBtn}>← Dashboard</button>
        </div>

        {/* KPI row */}
        <div style={s.kpiRow}>
          {[
            { label: "Total Sessions", value: data.length, icon: "🎯", color: "#6366f1", bg: "#eef2ff" },
            { label: "Best Score", value: best, icon: "🏆", color: "#f59e0b", bg: "#fef3c7" },
            { label: "Average Score", value: avg, icon: "📊", color: "#0ea5e9", bg: "#e0f2fe" },
            { label: "Latest Score", value: latest, icon: "⚡", color: "#10b981", bg: "#d1fae5" },
          ].map(kpi => (
            <div key={kpi.label} style={s.kpiCard}>
              <div style={{ ...s.kpiIcon, background: kpi.bg }}>
                <span style={{ fontSize: "18px" }}>{kpi.icon}</span>
              </div>
              <div style={{ ...s.kpiValue, color: kpi.color }}>{kpi.value}</div>
              <div style={s.kpiLabel}>{kpi.label}</div>
              {kpi.label === "Latest Score" && data.length >= 2 && (
                <div style={{ ...s.trendBadge, color: trend >= 0 ? "#10b981" : "#ef4444", background: trend >= 0 ? "#d1fae5" : "#fee2e2" }}>
                  {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)} vs prev
                </div>
              )}
            </div>
          ))}
        </div>

        {data.length === 0 ? (
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>📊</div>
            <h3 style={s.emptyTitle}>No data yet</h3>
            <p style={s.emptyText}>Complete your first interview to see analytics.</p>
            <button onClick={() => navigate("/dashboard")} style={s.emptyBtn}>Start Interview →</button>
          </div>
        ) : (
          <>
            {/* Chart */}
            <div style={s.chartCard}>
              <div style={s.chartHeader}>
                <div>
                  <h2 style={s.chartTitle}>Score Progression</h2>
                  <p style={s.chartSub}>Your scores across all sessions</p>
                </div>
                <div style={s.chartLegend}>
                  <div style={s.legendDot} />
                  <span style={s.legendText}>Score per session</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5}
                    fill="url(#scoreGrad)" dot={{ fill: "#6366f1", strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, fill: "#6366f1" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Table */}
            <div style={s.tableCard}>
              <h2 style={s.chartTitle}>Session Breakdown</h2>
              <div style={s.table}>
                <div style={s.tableHead}>
                  {["Session", "Date", "Time", "Score", "Rating"].map(h => (
                    <span key={h} style={s.th}>{h}</span>
                  ))}
                </div>
                {data.map((item, i) => {
                  const perf = item.score >= 40 ? { label: "Excellent", color: "#10b981", bg: "#d1fae5" }
                    : item.score >= 25 ? { label: "Good", color: "#0ea5e9", bg: "#e0f2fe" }
                    : item.score >= 10 ? { label: "Fair", color: "#f59e0b", bg: "#fef3c7" }
                    : { label: "Needs Work", color: "#ef4444", bg: "#fee2e2" };
                  return (
                    <div key={i} style={s.tableRow}
                      onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                      onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                      <span style={s.td}><strong style={{ color: "#334155" }}>{item.fullName}</strong></span>
                      <span style={s.td}>{item.date}</span>
                      <span style={s.td}>{item.time}</span>
                      <span style={{ ...s.td, fontWeight: "700", color: "#0f172a" }}>{item.score} pts</span>
                      <span style={s.td}>
                        <span style={{ ...s.badge, color: perf.color, background: perf.bg }}>{perf.label}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
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
  userCard: { display: "flex", alignItems: "center", gap: "10px" },
  avatar: { width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "13px", fontWeight: "700" },
  userInfo: { display: "flex", flexDirection: "column" },
  userName: { fontSize: "13px", fontWeight: "600", color: "#e2e8f0" },
  userRole: { fontSize: "11px", color: "#475569" },
  main: { marginLeft: "240px", flex: 1, padding: "32px 40px" },
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" },
  pageTitle: { fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: "0 0 4px 0", letterSpacing: "-0.5px" },
  pageSubtitle: { fontSize: "14px", color: "#94a3b8", margin: 0 },
  backBtn: { padding: "10px 20px", background: "#fff", color: "#475569", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" },
  kpiRow: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "24px" },
  kpiCard: { background: "#fff", borderRadius: "14px", padding: "20px", border: "1px solid #f1f5f9", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" },
  kpiIcon: { width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" },
  kpiValue: { fontSize: "30px", fontWeight: "800", lineHeight: 1, letterSpacing: "-1px" },
  kpiLabel: { fontSize: "12px", color: "#94a3b8", fontWeight: "500", marginTop: "4px" },
  trendBadge: { fontSize: "11px", fontWeight: "700", padding: "3px 8px", borderRadius: "6px", display: "inline-block", marginTop: "8px" },
  emptyState: { background: "#fff", borderRadius: "16px", padding: "80px 40px", textAlign: "center", border: "1px solid #f1f5f9" },
  emptyIcon: { fontSize: "48px", marginBottom: "16px" },
  emptyTitle: { fontSize: "18px", fontWeight: "700", color: "#334155", margin: "0 0 8px 0" },
  emptyText: { fontSize: "14px", color: "#94a3b8", margin: "0 0 24px 0" },
  emptyBtn: { padding: "12px 28px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" },
  chartCard: { background: "#fff", borderRadius: "16px", padding: "28px 32px", border: "1px solid #f1f5f9", boxShadow: "0 1px 2px rgba(0,0,0,0.04)", marginBottom: "24px" },
  chartHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" },
  chartTitle: { fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: "0 0 4px 0" },
  chartSub: { fontSize: "13px", color: "#94a3b8", margin: 0 },
  chartLegend: { display: "flex", alignItems: "center", gap: "8px" },
  legendDot: { width: "10px", height: "10px", borderRadius: "50%", background: "#6366f1" },
  legendText: { fontSize: "12px", color: "#94a3b8" },
  tableCard: { background: "#fff", borderRadius: "16px", padding: "28px 32px", border: "1px solid #f1f5f9", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" },
  table: { border: "1px solid #f1f5f9", borderRadius: "10px", overflow: "hidden", marginTop: "16px" },
  tableHead: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 100px 120px", padding: "10px 16px", background: "#f8fafc", borderBottom: "1px solid #f1f5f9" },
  th: { fontSize: "11px", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.5px" },
  tableRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 100px 120px", padding: "14px 16px", borderBottom: "1px solid #f8fafc", background: "#fff", transition: "background 0.1s", alignItems: "center" },
  td: { fontSize: "13px", color: "#475569" },
  badge: { fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px" },
};

export default Analytics;