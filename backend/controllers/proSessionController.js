import asyncHandler from "express-async-handler";
import ProSession from "../models/ProSession.js";
import User from "../models/User.js";
import fetch from "node-fetch";
import fs from "fs";
import FormData from "form-data";
import path from "path";
import mongoose from "mongoose";
import { refreshWeeklyInterviewWindow, isProActive } from "../utils/proAccess.js";

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "https://preppilot-ai-service.onrender.com";

const generationLocks = new Map();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const pushSocketUpdate = (
  io,
  userId,
  sessionId,
  status,
  message,
  session = null
) => {
  io.to(userId.toString()).emit("proSessionUpdate", {
    sessionId,
    status,
    message,
    session,
  });
};

const getErrorText = async (response) => {
  try {
    return await response.text();
  } catch {
    return "Unknown AI service error";
  }
};

const isRetryableStatus = (status) => [429, 500, 502, 503, 504].includes(status);

const fetchWithRetry = async (url, options, retries = 3, baseDelay = 2000) => {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const errorBody = await getErrorText(response);
        const error = new Error(
          `AI Service error: ${response.status} - ${errorBody}`
        );
        error.status = response.status;

        if (attempt < retries && isRetryableStatus(response.status)) {
          const delay = Math.min(baseDelay * Math.pow(2, attempt), 10000);
          await sleep(delay);
          continue;
        }

        throw error;
      }

      return response;
    } catch (error) {
      lastError = error;

      const retryable =
        error?.status && isRetryableStatus(error.status);

      if (attempt < retries && retryable) {
        const delay = Math.min(baseDelay * Math.pow(2, attempt), 10000);
        await sleep(delay);
        continue;
      }

      throw lastError;
    }
  }

  throw lastError;
};

// @desc    Create a new pro interview session and start AI question generation
// @route   POST /api/pro-sessions/
// @access  Private
const createProSession = asyncHandler(async (req, res) => {
  const { role, level, interviewType, count } = req.body;
  const userId = req.user._id;
  const userIdStr = userId.toString();

  if (!role || !level || !interviewType || !count) {
    res.status(400);
    throw new Error("Please specify role, level, interview type, and question count.");
  }

  if (generationLocks.get(userIdStr)) {
    res.status(429);
    throw new Error("A pro interview is already being generated. Please wait a few seconds.");
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

  generationLocks.set(userIdStr, true);

  (async () => {
    try {
      pushSocketUpdate(
        io,
        userId,
        session._id,
        "AI_GENERATING_QUESTIONS",
        `Generating ${count} questions for ${role}...`
      );

      const aiResponse = await fetchWithRetry(
        `${AI_SERVICE_URL}/generate-questions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role,
            level,
            count,
            interview_type: interviewType,
          }),
        },
        3,
        2000
      );

      const aiData = await aiResponse.json();
      const codingCount =
        interviewType === "coding-mix" ? Math.floor(count * 0.2) : 0;

      const questionsArray = (aiData.questions || []).map((qText, index) => ({
        questionText: qText,
        questionType: index < codingCount ? "coding" : "oral",
        isEvaluated: false,
        isSubmitted: false,
      }));

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
      console.error(`Pro Session Creation Failure for ${session._id}:`, error.message);

      session.status = "failed";
      await session.save();

      let friendlyMessage = `Question generation failed. Reason: ${error.message}.`;

      if (error.message.includes("429")) {
        friendlyMessage =
          "Question generation failed. AI service is busy right now. Please wait a few seconds and try again.";
      }

      pushSocketUpdate(
        io,
        userId,
        session._id,
        "GENERATION_FAILED",
        friendlyMessage
      );
    } finally {
      generationLocks.delete(userIdStr);
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

      const formData = new FormData();
      formData.append("file", fs.createReadStream(audioFilePath));

      const transResponse = await fetchWithRetry(
        `${AI_SERVICE_URL}/transcribe`,
        {
          method: "POST",
          body: formData,
          headers: formData.getHeaders(),
        },
        2,
        1500
      );

      const transData = await transResponse.json();
      transcription = transData.transcription || transcription || "";
    } catch (error) {
      console.error(`Pro Transcription Error: ${error.message}`);
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

    const evalResponse = await fetchWithRetry(
      `${AI_SERVICE_URL}/evaluate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.questionText,
          question_type: question.questionType,
          role: session.role,
          level: session.level,
          user_answer: transcription,
          user_code: code || "",
        }),
      },
      2,
      1500
    );

    const evalData = await evalResponse.json();

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
    console.error(`Pro Evaluation Error: ${error.message}`);
    pushSocketUpdate(
      io,
      userId,
      sessionId,
      "EVALUATION_FAILED",
      "Evaluation failed. Please try again.",
      session
    );
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
