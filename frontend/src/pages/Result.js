import { useEffect, useState } from "react";
import API from "./apiClient";
import { useNavigate } from "react-router-dom";

function Result() {
  const [result, setResult] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [responses, setResponses] = useState([]);
  const navigate = useNavigate();
  const interviewId = localStorage.getItem("interviewId");

  useEffect(() => {
  if (!localStorage.getItem("token")) navigate("/login");
}, []);

  useEffect(() => {
    fetchResult();
    generateFeedback();
  }, []);

 const fetchResult = async () => {
  try {
    const token = localStorage.getItem("token");
   const res = await API.get(`/api/interview/result/${interviewId}`,
      { headers: { Authorization: `Bearer ${token}` } });
    setResult(res.data);
    setResponses(res.data.responses || []);
  } catch (err) { console.log(err); }
};

  const generateFeedback = async () => {
    try {
      const token = localStorage.getItem("token");
      const answers = JSON.parse(localStorage.getItem("answers"));
      const res = await API.post("/api/interview/ai-feedback",
        { answers }, { headers: { Authorization: `Bearer ${token}` } });
      setFeedback(res.data.feedback);
    } catch (err) { console.log(err); }
    finally { setFeedbackLoading(false); }
  };

  if (!result) return (
    <div style={s.loading}>
      <div style={s.pulse}>⚡</div>
      <p style={s.loadingText}>Calculating your results...</p>
    </div>
  );

  const maxScore = result.totalQuestions * 10;
  const pct = maxScore ? Math.round((result.score / maxScore) * 100) : 0;
  const grade = pct >= 80 ? { label: "Excellent", color: "#10b981", bg: "#d1fae5", emoji: "🏆" }
    : pct >= 60 ? { label: "Good", color: "#f59e0b", bg: "#fef3c7", emoji: "👍" }
    : pct >= 40 ? { label: "Fair", color: "#f97316", bg: "#fff7ed", emoji: "📈" }
    : { label: "Needs Work", color: "#ef4444", bg: "#fef2f2", emoji: "💪" };

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.brand}>⚡ PrepAI</div>
        <button onClick={() => navigate("/dashboard")} style={s.backBtn}>← Back to Dashboard</button>
      </div>

      <div style={s.main}>
        {/* Score Hero */}
        <div style={s.scoreHero}>
          <div style={s.scoreLeft}>
            <p style={s.eyebrow}>INTERVIEW COMPLETE</p>
            <h1 style={s.heroTitle}>Here's how you did</h1>
            <p style={s.heroSub}>You answered {result.totalQuestions} questions. Keep practicing to improve!</p>
          </div>
          <div style={s.scoreRight}>
            <div style={{ ...s.gradeBadge, background: grade.bg, color: grade.color }}>
              <span style={s.gradeEmoji}>{grade.emoji}</span>
              <span style={s.gradeLabel}>{grade.label}</span>
            </div>
            <div style={s.scoreCircle}>
              <span style={s.scoreNum}>{result.score}</span>
              <span style={s.scoreMax}>/ {maxScore}</span>
            </div>
            <p style={s.scorePct}>{pct}% score</p>
          </div>
        </div>

        {/* Stats row */}
        <div style={s.statsRow}>
          {[
            ["📝", "Questions", result.totalQuestions],
            ["⭐", "Points Earned", result.score],
            ["🎯", "Accuracy", `${pct}%`],
            ["📊", "Max Possible", maxScore],
          ].map(([icon, label, val]) => (
            <div key={label} style={s.statCard}>
              <span style={s.statIcon}>{icon}</span>
              <span style={s.statVal}>{val}</span>
              <span style={s.statLabel}>{label}</span>
            </div>
          ))}
        </div>

{/* Q&A Review */}
{responses.length > 0 && (
  <div style={s.qaCard}>
    <h2 style={s.feedbackTitle}>Your Answers</h2>
    <p style={s.feedbackSub}>Review what you said for each question</p>
    <div style={s.qaList}>
      {responses.map((item, i) => (
        <div key={i} style={s.qaItem}>
          <div style={s.qaQuestion}>
            <span style={s.qaNum}>Q{i + 1}</span>
            <p style={s.qaQuestionText}>{item.question}</p>
          </div>
          <div style={s.qaAnswer}>
            <span style={s.qaAnswerLabel}>Your answer</span>
            <p style={s.qaAnswerText}>{item.answer || <em style={{color:"#9ca3af"}}>No answer given</em>}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

        {/* AI Feedback */}
        <div style={s.feedbackCard}>
          <div style={s.feedbackHeader}>
            <div style={s.feedbackIconBox}>🤖</div>
            <div>
              <h2 style={s.feedbackTitle}>AI Feedback</h2>
              <p style={s.feedbackSub}>Personalised analysis of your answers</p>
            </div>
          </div>
          {feedbackLoading ? (
            <div style={s.feedbackLoading}>
              <div style={s.loadingDots}>
                <span style={s.dot1}>●</span>
                <span style={s.dot2}>●</span>
                <span style={s.dot3}>●</span>
              </div>
              <p style={{ color: "#9ca3af", fontSize: "14px" }}>Analysing your answers...</p>
            </div>
          ) : (
            <div style={s.feedbackContent}>
              {feedback.split("\n").filter(l => l.trim()).map((line, i) => (
                <p key={i} style={{ ...s.feedbackLine, fontWeight: line.startsWith("**") || line.startsWith("#") ? "700" : "400" }}>
                  {line.replace(/\*\*/g, "").replace(/^#+\s/, "")}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={s.actions}>
          <button onClick={() => navigate("/dashboard")} style={s.primaryBtn}
            onMouseEnter={e => e.target.style.background = "#6d28d9"}
            onMouseLeave={e => e.target.style.background = "#7c3aed"}>
            Practice Again →
          </button>
          <button onClick={() => navigate("/analytics")} style={s.secondaryBtn}
            onMouseEnter={e => e.target.style.background = "#f3f4f6"}
            onMouseLeave={e => e.target.style.background = "#fff"}>
            View Analytics
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#f3f4f6", fontFamily: "'Inter','Segoe UI',sans-serif" },
  loading: { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" },
  pulse: { fontSize: "48px", animation: "pulse 1s infinite" },
  loadingText: { color: "#6b7280", fontSize: "15px" },
  qaCard: { background: "#fff", borderRadius: "16px", padding: "32px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
qaList: { display: "flex", flexDirection: "column", gap: "16px", marginTop: "20px" },
qaItem: { border: "1.5px solid #f3f4f6", borderRadius: "12px", overflow: "hidden" },
qaQuestion: { background: "#faf5ff", padding: "16px 20px", display: "flex", gap: "12px", alignItems: "flex-start" },
qaNum: { fontSize: "11px", fontWeight: "800", color: "#7c3aed", background: "#ede9fe", padding: "3px 8px", borderRadius: "6px", flexShrink: 0, marginTop: "2px" },
qaQuestionText: { fontSize: "15px", fontWeight: "600", color: "#1f2937", margin: 0, lineHeight: "1.5" },
qaAnswer: { padding: "16px 20px" },
qaAnswerLabel: { fontSize: "11px", fontWeight: "700", color: "#9ca3af", letterSpacing: "1px", display: "block", marginBottom: "6px" },
qaAnswerText: { fontSize: "14px", color: "#374151", lineHeight: "1.7", margin: 0 },
  header: { background: "#0a0a0f", padding: "16px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  brand: { fontSize: "18px", fontWeight: "800", color: "#fff" },
  backBtn: { fontSize: "13px", color: "#9ca3af", background: "none", border: "1px solid #374151", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontFamily: "inherit" },
  main: { maxWidth: "860px", margin: "40px auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: "24px" },
  scoreHero: { background: "linear-gradient(135deg,#0a0a0f,#1e1b2e)", borderRadius: "20px", padding: "40px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  scoreLeft: { flex: 1 },
  eyebrow: { fontSize: "10px", fontWeight: "700", letterSpacing: "3px", color: "#7c3aed", margin: "0 0 12px 0" },
  heroTitle: { fontSize: "36px", fontWeight: "900", color: "#fff", letterSpacing: "-1px", margin: "0 0 12px 0" },
  heroSub: { fontSize: "15px", color: "#6b7280", margin: 0 },
  scoreRight: { display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" },
  gradeBadge: { display: "flex", alignItems: "center", gap: "8px", padding: "8px 20px", borderRadius: "30px", fontWeight: "700", fontSize: "14px" },
  gradeEmoji: { fontSize: "18px" },
  gradeLabel: {},
  scoreCircle: { display: "flex", alignItems: "baseline", gap: "4px" },
  scoreNum: { fontSize: "72px", fontWeight: "900", color: "#fff", lineHeight: 1 },
  scoreMax: { fontSize: "24px", color: "#6b7280", fontWeight: "600" },
  scorePct: { fontSize: "14px", color: "#a78bfa", fontWeight: "600", margin: 0 },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" },
  statCard: { background: "#fff", borderRadius: "14px", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
  statIcon: { fontSize: "22px" },
  statVal: { fontSize: "24px", fontWeight: "800", color: "#111827" },
  statLabel: { fontSize: "12px", color: "#9ca3af", fontWeight: "500" },
  feedbackCard: { background: "#fff", borderRadius: "16px", padding: "32px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
  feedbackHeader: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px", paddingBottom: "20px", borderBottom: "1px solid #f3f4f6" },
  feedbackIconBox: { fontSize: "32px", width: "52px", height: "52px", background: "#ede9fe", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center" },
  feedbackTitle: { fontSize: "18px", fontWeight: "700", color: "#111827", margin: "0 0 4px 0" },
  feedbackSub: { fontSize: "13px", color: "#9ca3af", margin: 0 },
  feedbackLoading: { display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "32px" },
  loadingDots: { display: "flex", gap: "6px", fontSize: "24px", color: "#a78bfa" },
  dot1: {}, dot2: {}, dot3: {},
  feedbackContent: { display: "flex", flexDirection: "column", gap: "8px" },
  feedbackLine: { fontSize: "15px", color: "#374151", lineHeight: "1.7", margin: 0 },
  actions: { display: "flex", gap: "12px", paddingBottom: "40px" },
  primaryBtn: { flex: 1, padding: "14px", fontSize: "15px", fontWeight: "700", background: "#7c3aed", color: "#fff", border: "none", borderRadius: "12px", cursor: "pointer", transition: "background 0.15s" },
  secondaryBtn: { flex: 1, padding: "14px", fontSize: "15px", fontWeight: "600", background: "#fff", color: "#374151", border: "1.5px solid #e5e7eb", borderRadius: "12px", cursor: "pointer", transition: "background 0.15s" },
};

export default Result;