import { useEffect, useState } from "react";
import API from "./apiClient";
import { useNavigate } from "react-router-dom";

function Interview() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [allAnswers, setAllAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [listening, setListening] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const interviewId = localStorage.getItem("interviewId");
  const topic = localStorage.getItem("topic");

 useEffect(() => {
  if (!localStorage.getItem("token")) navigate("/login");
  const stored = JSON.parse(localStorage.getItem("questions"));
  if (stored) setQuestions(stored);
}, [navigate]);

  useEffect(() => {
    if (timeLeft === 0) {
      const autoNext = async () => {
        try {
          const token = localStorage.getItem("token");
          if (answer.trim()) {
            await API.post("/api/interview/submit",
              { interviewId, question: questions[currentIndex], answer },
              { headers: { Authorization: `Bearer ${token}` } });
          }
          const updated = [...allAnswers, answer];
          setAllAnswers(updated);
          setAnswer("");
          if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setTimeLeft(60);
          } else {
            localStorage.setItem("answers", JSON.stringify(updated));
            navigate("/result");
          }
        } catch (err) { navigate("/result"); }
      };
      autoNext();
      return;
    }
    const timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, allAnswers, navigate, answer, questions, currentIndex, interviewId]);

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Speech recognition not supported in this browser.");
    const recognition = new SR();
    recognition.lang = "en-US";
    setListening(true);
    recognition.onresult = e => { setAnswer(e.results[0][0].transcript); setListening(false); };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  const submitAnswer = async () => {
    if (!answer.trim() || submitting) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await API.post("/api/interview/submit",
        { interviewId, question: questions[currentIndex], answer },
        { headers: { Authorization: `Bearer ${token}` } });
      const updated = [...allAnswers, answer];
      setAllAnswers(updated);
      setAnswer("");
      setTimeLeft(60);
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        localStorage.setItem("answers", JSON.stringify(updated));
        navigate("/result");
      }
    } catch (err) { console.log(err); }
    finally { setSubmitting(false); }
  };

  if (questions.length === 0) return (
    <div style={s.loading}>
      <div style={s.loadingInner}>
        <div style={s.loadingLogo}>⚡</div>
        <p style={s.loadingText}>Loading your interview...</p>
      </div>
    </div>
  );

  const timerPct = (timeLeft / 60) * 100;
  const timerColor = timeLeft > 30 ? "#10b981" : timeLeft > 10 ? "#f59e0b" : "#ef4444";
  const circumference = 2 * Math.PI * 24;
  const strokeDashoffset = circumference - (timerPct / 100) * circumference;

  return (
    <div style={s.page}>
      {/* Header */}
      <header style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.logoMark}>⚡</div>
          <span style={s.logoText}>PrepAI</span>
          <div style={s.divider} />
          <span style={s.headerLabel}>Live Interview</span>
          {topic && <span style={s.topicPill}>{topic}</span>}
        </div>
        <div style={s.headerRight}>
          <div style={s.questionCounter}>
            {currentIndex + 1} <span style={s.counterOf}>/ {questions.length}</span>
          </div>
          <svg width="60" height="60" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="30" cy="30" r="24" fill="none" stroke="#1e293b" strokeWidth="3" />
            <circle cx="30" cy="30" r="24" fill="none" stroke={timerColor} strokeWidth="3"
              strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
              style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s" }} />
            <text x="30" y="35" textAnchor="middle" fill={timerColor}
              fontSize="14" fontWeight="800" style={{ transform: "rotate(90deg)", transformOrigin: "30px 30px" }}>
              {timeLeft}
            </text>
          </svg>
        </div>
      </header>

      {/* Progress bar */}
      <div style={s.progressTrack}>
        <div style={{ ...s.progressFill, width: `${((currentIndex) / questions.length) * 100}%` }} />
      </div>

      {/* Body */}
      <div style={s.body}>
        {/* Left: Question + Answer */}
        <div style={s.mainCol}>
          {/* Step dots */}
          <div style={s.steps}>
            {questions.map((_, i) => (
              <div key={i} style={{
                ...s.step,
                background: i < currentIndex ? "#6366f1" : i === currentIndex ? "#6366f1" : "#e2e8f0",
                opacity: i < currentIndex ? 0.35 : 1,
                width: i === currentIndex ? "24px" : "8px"
              }} />
            ))}
          </div>

          {/* Question card */}
          <div style={s.questionCard}>
            <div style={s.qLabel}>Question {currentIndex + 1}</div>
            <p style={s.questionText}>{questions[currentIndex]}</p>
          </div>

          {/* Answer area */}
          <div style={s.answerCard}>
            <div style={s.answerHeader}>
              <label style={s.answerLabel}>Your Answer</label>
              <span style={{ ...s.charCount, color: answer.length > 200 ? "#10b981" : "#94a3b8" }}>
                {answer.length} chars
              </span>
            </div>
            <textarea
              placeholder="Write your answer here. Be clear, structured, and use examples where possible..."
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              style={s.textarea}
              onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px #eef2ff"; }}
              onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
            />
            <div style={s.answerActions}>
              <button onClick={startListening} disabled={listening} style={{
                ...s.micBtn,
                background: listening ? "#fef3c7" : "#f8fafc",
                borderColor: listening ? "#f59e0b" : "#e2e8f0",
                color: listening ? "#92400e" : "#64748b"
              }}>
                {listening ? "🔴 Listening..." : "🎤 Speak"}
              </button>
              <button onClick={submitAnswer} disabled={submitting || !answer.trim()} style={{
                ...s.nextBtn,
                opacity: submitting || !answer.trim() ? 0.5 : 1
              }}>
                {submitting ? "Saving..." : currentIndex === questions.length - 1 ? "Finish Interview ✓" : "Next Question →"}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Tips */}
        <div style={s.sidebar}>
          <div style={s.tipsCard}>
            <div style={s.tipsHeader}>
              <span style={s.tipsIcon}>💡</span>
              <span style={s.tipsTitle}>Interview Tips</span>
            </div>
            <div style={s.tipsList}>
              {[
                { tip: "Structure clearly", desc: "Use intro, body, conclusion." },
                { tip: "Be specific", desc: "Real examples beat vague answers." },
                { tip: "Stay concise", desc: "Quality over quantity." },
                { tip: "Think first", desc: "A pause is totally fine." },
              ].map(({ tip, desc }) => (
                <div key={tip} style={s.tipItem}>
                  <div style={s.tipDot} />
                  <div>
                    <div style={s.tipTip}>{tip}</div>
                    <div style={s.tipDesc}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={s.progressCard}>
            <div style={s.progressLabel}>Progress</div>
            <div style={s.progressCircles}>
              {questions.map((_, i) => (
                <div key={i} style={{
                  ...s.progressCircle,
                  background: i < currentIndex ? "#6366f1" : i === currentIndex ? "#eef2ff" : "#f1f5f9",
                  border: i === currentIndex ? "2px solid #6366f1" : "2px solid transparent",
                  color: i < currentIndex ? "#fff" : i === currentIndex ? "#6366f1" : "#94a3b8"
                }}>
                  {i < currentIndex ? "✓" : i + 1}
                </div>
              ))}
            </div>
            <div style={s.progressText}>
              {currentIndex} of {questions.length} answered
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", display: "flex", flexDirection: "column" },
  loading: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a" },
  loadingInner: { textAlign: "center" },
  loadingLogo: { fontSize: "48px", marginBottom: "16px" },
  loadingText: { color: "#64748b", fontSize: "15px" },
  header: { background: "#0f172a", padding: "0 40px", height: "64px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b" },
  headerLeft: { display: "flex", alignItems: "center", gap: "12px" },
  logoMark: { width: "28px", height: "28px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" },
  logoText: { fontSize: "16px", fontWeight: "800", color: "#f1f5f9" },
  divider: { width: "1px", height: "18px", background: "#1e293b" },
  headerLabel: { fontSize: "13px", color: "#475569", fontWeight: "500" },
  topicPill: { background: "#1e293b", color: "#a5b4fc", fontSize: "12px", fontWeight: "600", padding: "4px 12px", borderRadius: "20px" },
  headerRight: { display: "flex", alignItems: "center", gap: "16px" },
  questionCounter: { fontSize: "20px", fontWeight: "800", color: "#f1f5f9" },
  counterOf: { fontSize: "14px", color: "#475569", fontWeight: "400" },
  progressTrack: { height: "3px", background: "#1e293b" },
  progressFill: { height: "100%", background: "linear-gradient(90deg,#6366f1,#8b5cf6)", transition: "width 0.6s ease" },
  body: { flex: 1, display: "grid", gridTemplateColumns: "1fr 280px", gap: "24px", padding: "32px 40px", maxWidth: "1100px", margin: "0 auto", width: "100%", boxSizing: "border-box" },
  mainCol: { display: "flex", flexDirection: "column", gap: "16px" },
  steps: { display: "flex", gap: "6px", alignItems: "center" },
  step: { height: "4px", borderRadius: "4px", transition: "all 0.4s ease" },
  questionCard: { background: "#fff", borderRadius: "16px", padding: "28px 32px", border: "1px solid #f1f5f9", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" },
  qLabel: { fontSize: "11px", fontWeight: "700", color: "#6366f1", letterSpacing: "1px", marginBottom: "12px" },
  questionText: { fontSize: "20px", fontWeight: "600", color: "#0f172a", lineHeight: "1.55", margin: 0 },
  answerCard: { background: "#fff", borderRadius: "16px", padding: "24px 28px", border: "1px solid #f1f5f9", boxShadow: "0 1px 2px rgba(0,0,0,0.04)", flex: 1 },
  answerHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" },
  answerLabel: { fontSize: "13px", fontWeight: "600", color: "#334155" },
  charCount: { fontSize: "12px", fontWeight: "500", transition: "color 0.3s" },
  textarea: { width: "100%", minHeight: "160px", padding: "14px 16px", fontSize: "14px", border: "1.5px solid #e2e8f0", borderRadius: "10px", outline: "none", resize: "vertical", lineHeight: "1.7", color: "#0f172a", boxSizing: "border-box", transition: "all 0.15s", fontFamily: "inherit", background: "#fafafa" },
  answerActions: { display: "flex", gap: "10px", marginTop: "14px" },
  micBtn: { padding: "11px 18px", fontSize: "13px", fontWeight: "600", border: "1.5px solid", borderRadius: "10px", cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit" },
  nextBtn: { flex: 1, padding: "12px 24px", fontSize: "14px", fontWeight: "700", background: "#6366f1", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", transition: "opacity 0.15s", fontFamily: "inherit" },
  sidebar: { display: "flex", flexDirection: "column", gap: "16px" },
  tipsCard: { background: "#fff", borderRadius: "16px", padding: "24px", border: "1px solid #f1f5f9", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" },
  tipsHeader: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" },
  tipsIcon: { fontSize: "18px" },
  tipsTitle: { fontSize: "14px", fontWeight: "700", color: "#0f172a" },
  tipsList: { display: "flex", flexDirection: "column", gap: "14px" },
  tipItem: { display: "flex", gap: "10px", alignItems: "flex-start" },
  tipDot: { width: "6px", height: "6px", borderRadius: "50%", background: "#6366f1", marginTop: "5px", flexShrink: 0 },
  tipTip: { fontSize: "13px", fontWeight: "600", color: "#334155" },
  tipDesc: { fontSize: "12px", color: "#94a3b8", marginTop: "2px" },
  progressCard: { background: "#fff", borderRadius: "16px", padding: "20px 24px", border: "1px solid #f1f5f9", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" },
  progressLabel: { fontSize: "11px", fontWeight: "700", color: "#94a3b8", letterSpacing: "1px", marginBottom: "14px" },
  progressCircles: { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" },
  progressCircle: { width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", transition: "all 0.3s" },
  progressText: { fontSize: "12px", color: "#94a3b8" },
};

export default Interview;