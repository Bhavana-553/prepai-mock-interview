import express from 'express';
import pool from '../config/db.js';
import authMiddleware from "../middleware/authMiddleware.js";
import { generateContent } from "../config/gemini.js";

const router = express.Router();

router.post("/start", authMiddleware, async (req, res) => {
    const userId = req.user.userId;
    try {
        const result = await pool.query("INSERT INTO interviews(user_id) VALUES($1) RETURNING *", [userId]);
        res.json(result.rows[0]);
    } catch (err) {
        console.log("START ERROR:", err.message);
        res.status(500).json({ msg: "Error starting interview" });
    }
});

router.post("/generate-questions", authMiddleware, async (req, res) => {
    const { topic } = req.body;
    try {
        const prompt = `Generate 5 interview questions for ${topic}. Return only the questions, one per line.`;
        const response = await generateContent(prompt);
        const questions = response.split("\n").filter((q) => q.trim() !== "");
        res.json({ questions });
    } catch (err) {
        console.log("AI ERROR:", err.message);
        res.status(500).json({ msg: "AI generation failed" });
    }
});

router.post("/submit", authMiddleware, async (req, res) => {
    const { interviewId, question, answer } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO responses (interview_id, question, answer) VALUES($1,$2,$3) RETURNING *`,
            [interviewId, question, answer]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ msg: "Error saving answer" });
    }
});

router.get("/history", authMiddleware, async (req, res) => {
    const userId = req.user.userId;
    try {
        const result = await pool.query(
            "SELECT * FROM interviews WHERE user_id=$1 ORDER BY created_at DESC",
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.log("HISTORY ERROR:", err.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

router.get("/result/:id", authMiddleware, async (req, res) => {
  const interviewId = req.params.id;
  try {
    const responses = await pool.query(
      `SELECT * FROM responses WHERE interview_id = $1`,
      [interviewId]
    );

    let totalScore = 0;

    for (const item of responses.rows) {
      const prompt = `You are an interview evaluator. Rate this answer out of 10 based on clarity, relevance, and depth.
Question: ${item.question}
Answer: ${item.answer}
Reply with ONLY a number between 0 and 10. Nothing else.`;

      try {
        const aiScore = await generateContent(prompt);
        const parsed = parseInt(aiScore.trim());
        totalScore += isNaN(parsed) ? 0 : Math.min(10, Math.max(0, parsed));
      } catch {
        totalScore += item.answer.length > 20 ? 5 : 0;
      }
    }

    await pool.query(
      `UPDATE interviews SET score = $1 WHERE id = $2`,
      [totalScore, interviewId]
    );

    res.json({
      totalQuestions: responses.rows.length,
      score: totalScore
    });
  } catch (err) {
    console.log("RESULT ERROR:", err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

router.post("/ai-feedback", authMiddleware, async (req, res) => {
    const { answers } = req.body;
    try {
        const prompt = `Evaluate these interview answers and give short feedback:\n${answers.join("\n")}`;
        const feedback = await generateContent(prompt);
        res.json({ feedback });
    } catch (err) {
        console.log("FEEDBACK ERROR:", err.message);
        res.status(500).json({ msg: "AI Feedback Failed" });
    }
});

export default router;