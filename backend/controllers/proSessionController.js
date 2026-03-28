import asyncHandler from "express-async-handler";
import ProSession from "../models/ProSession.js";
import User from "../models/User.js";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import OpenAI from "openai";
import { refreshWeeklyInterviewWindow, isProActive } from "../utils/proAccess.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const OPENAI_TEXT_MODEL = process.env.OPENAI_TEXT_MODEL || "gpt-4.1-mini";
const OPENAI_TRANSCRIBE_MODEL =
  process.env.OPENAI_TRANSCRIBE_MODEL || "gpt-4o-mini-transcribe";

const pushSocketUpdate = (io, userId, sessionId, status, message, session = null) => {
  io.to(userId.toString()).emit("proSessionUpdate", {
    sessionId,
    status,
    message,
    session,
  });
};

const safeJsonParse = (text, fallbackMessage = "Invalid JSON from OpenAI") => {
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("JSON parse failed. Raw OpenAI output:", text);
    throw new Error(fallbackMessage);
  }
};

const buildQuestionsPrompt = ({ role, level, count, interviewType }) => `
Generate exactly ${count} interview questions for a ${level} ${role} candidate.

Interview type: ${interviewType}

Rules:
- Return ONLY valid JSON.
- Do not include markdown.
- Do not include explanation.
- Output format must be:
{
  "questions": [
    {
      "questionText": "question here",
      "questionType": "oral"
    }
  ]
}
- questionType must be either "oral" or "coding".
- If interview type is "oral-only", all questions must be "oral".
- If interview type is "coding-mix", include around 20% "coding" questions and the rest "oral".
- Questions must be realistic, technical, concise, and suitable for interview practice.
- No duplicate questions.
`;

const buildEvaluationPrompt = ({
  question,
  questionType,
  role,
  level,
  userAnswer,
  userCode,
}) => `
You are an expert technical interviewer.

Evaluate the candidate's answer for the following interview question.

Role: ${role}
Level: ${level}
Question Type: ${questionType}
Question: ${question}

Candidate theory answer:
${userAnswer || "(No theory answer provided)"}

Candidate code answer:
${userCode || "(No code provided)"}

Return ONLY valid JSON in this exact format:
{
  "technicalScore": 0,
  "confidenceScore": 0,
  "aiFeedback": "string",
  "idealAnswer": "string"
}

Rules:
- technicalScore must be an integer from 0 to 100.
- confidenceScore must be an integer from 0 to 100.
- aiFeedback should be detailed but readable, around 4 to 8 sentences.
- idealAnswer should be a strong model answer for this question.
- No markdown.
- No explanation outside JSON.
`;

const generateQuestionsWithOpenAI = async ({ role, level, count, interviewType }) => {
  const response = await openai.responses.create({
    model: OPENAI_TEXT_MODEL,
    input: buildQuestionsPrompt({ role, level, count, interviewType }),
  });

  const outputText = response.output_text?.trim();

  if (!outputText) {
    throw new Error("Empty question generation response from OpenAI");
  }

  const parsed = safeJsonParse(outputText, "Failed to parse generated questions");
  const questions = Array.isArray(parsed.questions) ? parsed.questions : [];

  if (!questions.length) {
    throw new Error("No questions returned by OpenAI");
  }

  return questions.map((item) => ({
    questionText: String(item.questionText || "").trim(),
    questionType: item.questionType === "coding" ? "coding" : "oral",
    isEvaluated: false,
    isSubmitted: false,
  }));
};

const evaluateAnswerWithOpenAI = async ({
  question,
  questionType,
  role,
  level,
  userAnswer,
  userCode,
}) => {
  const response = await openai.responses.create({
    model: OPENAI_TEXT_MODEL,
    input: buildEvaluationPrompt({
      question,
      questionType,
      role,
      level,
      userAnswer,
      userCode,
    }),
  });

  const outputText = response.output_text?.trim();

  if (!outputText) {
    throw new Error("Empty evaluation response from OpenAI");
  }

  const parsed = safeJsonParse(outputText, "Failed to parse evaluation result");

  return {
    technicalScore: Math.max(0, Math.min(100, Number(parsed.technicalScore) || 0)),
    confidenceScore: Math.max(0, Math.min(100, Number(parsed.confidenceScore) || 0)),
    aiFeedback: String(parsed.aiFeedback || "No feedback generated."),
    idealAnswer: String(parsed.idealAnswer || "No ideal answer generated."),
  };
};

const transcribeAudioWithOpenAI = async (audioFilePath) => {
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(audioFilePath),
    model: OPENAI_TRANSCRIBE_MODEL,
  });

  return transcription?.text || "";
};

// @desc    Create a new pro interview session and start AI question generation
// @route   POST /api/pro-sessions/
// @access  Private
const createProSession = asyncHandler(async (req, res) => {
  const { role, level, interviewType, count } = req.body;
  const userId = req.user._id;

  if (!role || !level || !interviewType || !count) {
    res.status(400);
    throw new Error("Please specify role, level, interview type, and question count.");
  }

  const numericCount = Number(count);

  if (!Number.isInteger(numericCount) || numericCount <= 0) {
    res.status(400);
    throw new Error("Question count must be a valid positive number.");
  }

  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  refreshWeeklyInterviewWindow(user);

  const proActive = isProActive(user);

  if (!proActive && user.weeklyInterviewCount >= 2) {
    await user.save();
    res.status(403);
    throw new Error("Free plan limit reached. Upgrade to Pro for unlimited interviews.");
  }

  let session = await ProSession.create({
    user: userId,
    role,
    level,
    interviewType,
    status: "pending",
  });

  if (!proActive) {
    user.weeklyInterviewCount += 1;
    await user.save();
  }

  const io = req.app.get("io");

  res.status(202).json({
    message: "Session created. Generating questions asynchronously...",
    sessionId: session._id,
    status: "processing",
  });

  (async () => {
    try {
      pushSocketUpdate(
        io,
        userId,
        session._id,
        "AI_GENERATING_QUESTIONS",
        `Generating ${numericCount} questions for ${role}...`
      );

      const questionsArray = await generateQuestionsWithOpenAI({
        role,
        level,
        count: numericCount,
        interviewType,
      });

      session.questions = questionsArray;
      session.status = "in-progress";
      await session.save();

      pushSocketUpdate(
        io,
        userId,
        session._id,
        "QUESTIONS_READY",
        "Questions generated successfully. Starting session.",
        session
      );
    } catch (error) {
      console.error(`Session Creation Failure for ${session._id}:`, error.message);

      session.status = "failed";
      await session.save();

      pushSocketUpdate(
        io,
        userId,
        session._id,
        "GENERATION_FAILED",
        `Question generation failed. Reason: ${error.message}.`
      );
    }
  })();
});

const getProSessions = asyncHandler(async (req, res) => {
  const sessions = await ProSession.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .select("-questions.userAnswerText -questions.userSubmittedCode");

  res.json(sessions);
});

const getProSessionById = asyncHandler(async (req, res) => {
  const session = await ProSession.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (session) {
    res.json(session);
  } else {
    res.status(404);
    throw new Error("Session not found or user unauthorized.");
  }
});

const deleteProSession = asyncHandler(async (req, res) => {
  const session = await ProSession.findById(req.params.id);

  if (!session) {
    res.status(404);
    throw new Error("Session not found");
  }

  if (session.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("Not authorized");
  }

  await session.deleteOne();

  res.status(200).json({ id: req.params.id });
});

const evaluateProAnswerAsync = async (
  io,
  userId,
  sessionId,
  questionIndex,
  audioFilePath = null,
  code = null,
  theoryAnswer = null
) => {
  let transcription = theoryAnswer || "";

  const questionIdx =
    typeof questionIndex === "string" ? parseInt(questionIndex, 10) : questionIndex;

  const session = await ProSession.findById(sessionId);

  if (!session) {
    console.error(`Session ${sessionId} not found`);
    return;
  }

  const question = session.questions[questionIdx];

  if (!question) {
    pushSocketUpdate(
      io,
      userId,
      sessionId,
      "EVALUATION_FAILED",
      `Q${questionIdx + 1} not found.`,
      null
    );
    return;
  }

  if (audioFilePath) {
    try {
      pushSocketUpdate(
        io,
        userId,
        sessionId,
        "AI_TRANSCRIBING",
        `Transcribing audio for Q${questionIdx + 1}...`
      );

      const transcriptText = await transcribeAudioWithOpenAI(audioFilePath);
      transcription = transcriptText || transcription || "";
    } catch (error) {
      console.error(`Transcription Error: ${error.message}`);
    } finally {
      if (audioFilePath && fs.existsSync(audioFilePath)) {
        fs.unlinkSync(audioFilePath);
      }
    }
  }

  try {
    pushSocketUpdate(
      io,
      userId,
      sessionId,
      "AI_EVALUATING",
      `AI is analyzing Q${questionIdx + 1}...`
    );

    const evalData = await evaluateAnswerWithOpenAI({
      question: question.questionText,
      questionType: question.questionType,
      role: session.role,
      level: session.level,
      userAnswer: transcription,
      userCode: code || "",
    });

    question.userAnswerText = transcription || "";
    question.userSubmittedCode = code || "";
    question.technicalScore = evalData.technicalScore;
    question.confidenceScore = evalData.confidenceScore;
    question.aiFeedback = evalData.aiFeedback;
    question.idealAnswer = evalData.idealAnswer;
    question.isEvaluated = true;

    const allQuestionsEvaluated = session.questions.every((q) => q.isEvaluated);

    if (session.status === "completed" || allQuestionsEvaluated) {
      const scoreSummary = await calculateProOverallScore(sessionId);

      session.overallScore = scoreSummary.overallScore || 0;
      session.metrics = {
        avgTechnical: scoreSummary.avgTechnical,
        avgConfidence: scoreSummary.avgConfidence,
      };

      if (allQuestionsEvaluated) {
        session.status = "completed";
        session.endTime = session.endTime || new Date();
      }

      await session.save();

      pushSocketUpdate(
        io,
        userId,
        sessionId,
        "SESSION_COMPLETED",
        "Scores finalized.",
        session
      );
    } else {
      await session.save();

      pushSocketUpdate(
        io,
        userId,
        sessionId,
        "EVALUATION_COMPLETE",
        `Feedback for Q${questionIdx + 1} is ready!`,
        session
      );
    }
  } catch (error) {
    console.error(`Evaluation Error: ${error.message}`);
    pushSocketUpdate(io, userId, sessionId, "EVALUATION_FAILED", "Evaluation failed.", session);
  }
};

// @desc    Submit an answer (Theory / Code / Optional Audio)
// @route   POST /api/pro-sessions/:id/submit-answer
// @access  Private
const submitProAnswer = asyncHandler(async (req, res) => {
  const sessionId = req.params.id;
  const { questionIndex, code, theoryAnswer } = req.body;
  const userId = req.user._id;

  const session = await ProSession.findById(sessionId);

  if (!session || session.user.toString() !== userId.toString()) {
    res.status(404);
    throw new Error("Session not found or user unauthorized.");
  }

  const questionIdx = parseInt(questionIndex, 10);
  const question = session.questions[questionIdx];

  if (!question) {
    res.status(400);
    throw new Error(`Question at index ${questionIdx} not found.`);
  }

  let audioFilePath = null;
  if (req.file) {
    audioFilePath = path.join(process.cwd(), req.file.path);
  }

  const codeSubmission = code || "";
  const theorySubmission = theoryAnswer || "";

  if (!audioFilePath && !codeSubmission.trim() && !theorySubmission.trim()) {
    res.status(400);
    throw new Error("Please provide code or theory answer.");
  }

  question.isSubmitted = true;
  await session.save();

  res.status(202).json({
    message: "Answer received. Processing asynchronously...",
    status: "received",
  });

  const io = req.app.get("io");

  evaluateProAnswerAsync(
    io,
    userId,
    sessionId,
    questionIdx,
    audioFilePath,
    codeSubmission,
    theorySubmission
  );
});

const calculateProOverallScore = async (sessionId) => {
  const results = await ProSession.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(sessionId) } },
    { $unwind: "$questions" },
    {
      $group: {
        _id: "$_id",
        avgTechnical: {
          $avg: {
            $cond: [{ $eq: ["$questions.isEvaluated", true] }, "$questions.technicalScore", 0],
          },
        },
        avgConfidence: {
          $avg: {
            $cond: [{ $eq: ["$questions.isEvaluated", true] }, "$questions.confidenceScore", 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        overallScore: { $round: [{ $avg: ["$avgTechnical", "$avgConfidence"] }, 0] },
        avgTechnical: { $round: ["$avgTechnical", 0] },
        avgConfidence: { $round: ["$avgConfidence", 0] },
      },
    },
  ]);

  return results[0] || { overallScore: 0, avgTechnical: 0, avgConfidence: 0 };
};

const endProSession = asyncHandler(async (req, res) => {
  const sessionId = req.params.id;
  const userId = req.user._id;

  const session = await ProSession.findById(sessionId);

  if (!session || session.user.toString() !== userId.toString()) {
    res.status(404);
    throw new Error("Session not found or user unauthorized.");
  }

  const isProcessing = session.questions.some((q) => q.isSubmitted && !q.isEvaluated);

  if (isProcessing) {
    res.status(400);
    throw new Error("Cannot end interview while AI is processing answers.");
  }

  if (session.status === "completed") {
    res.status(400);
    throw new Error("Session is already completed.");
  }

  const scoreSummary = await calculateProOverallScore(sessionId);

  session.overallScore = scoreSummary.overallScore || 0;
  session.status = "completed";
  session.endTime = new Date();
  session.metrics = {
    avgTechnical: scoreSummary.avgTechnical,
    avgConfidence: scoreSummary.avgConfidence,
  };

  await session.save();

  const io = req.app.get("io");
  pushSocketUpdate(
    io,
    userId,
    sessionId,
    "SESSION_COMPLETED",
    "Interview session ended early.",
    session
  );

  res.json({ message: "Session ended successfully.", session });
});

export {
  createProSession,
  getProSessionById,
  getProSessions,
  submitProAnswer,
  endProSession,
  calculateProOverallScore,
  deleteProSession,
};
