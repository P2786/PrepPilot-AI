import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { getProSessionById } from "../features/sessions/prosessionSlice";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import useFaviconStatus from "../hooks/useFaviconStatus";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const formatDuration = (start, end) => {
  if (!start || !end) return "N/A";
  const diff = new Date(end) - new Date(start);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
};

const sanitizeQuestionText = (text) => {
  if (!text) return "";
  return text.replace(/^\d+[\s\.\)]+/, "").trim();
};

const formatIdealAnswer = (text) => {
  try {
    if (!text) return "Pending evaluation.";

    let cleanText = text.trim();

    if (cleanText.startsWith("```")) {
      cleanText = cleanText
        .replace(/^```(json)?/, "")
        .replace(/```$/, "")
        .trim();
    }

    if (cleanText.startsWith("{") && cleanText.endsWith("}")) {
      const parsed = JSON.parse(cleanText);

      if (parsed.verbalAnswer || parsed.idealAnswer || parsed.idealanswer) {
        return parsed.verbalAnswer || parsed.idealAnswer || parsed.idealanswer;
      }

      const explanation = parsed.explanation || parsed.understanding || "";
      const code = parsed.code || parsed.codeExample || parsed.example || "";

      if (explanation || code) {
        return `${explanation}\n\n${code}`.trim();
      }
    }

    return text;
  } catch (e) {
    return text;
  }
};

function ProReview() {
  useFaviconStatus("idle");

  const { sessionId } = useParams();
  const dispatch = useDispatch();
  const { activeProSession, isLoading } = useSelector(
    (state) => state.proSessions
  );

  useEffect(() => {
    dispatch(getProSessionById(sessionId));
  }, [dispatch, sessionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07040a] text-white flex items-center justify-center">
        <p className="text-amber-300 font-black animate-pulse">
          Generating Pro Analysis...
        </p>
      </div>
    );
  }

  if (!activeProSession || activeProSession.status !== "completed") {
    return (
      <div className="min-h-screen bg-[#07040a] text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-black mb-4">Report Not Ready</h2>
          <Link
            to="/pro-dashboard"
            className="bg-gradient-to-r from-amber-300 to-orange-400 px-6 py-3 rounded-xl font-bold text-black"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const {
    overallScore,
    metrics,
    role,
    level,
    questions,
    startTime,
    endTime,
  } = activeProSession;

  const finalMetrics = metrics || {};

  const barData = {
    labels: questions.map((_, i) => `Q${i + 1}`),
    datasets: [
      {
        label: "Technical Score",
        data: questions.map((q) => q.technicalScore || 0),
        backgroundColor: "#fbbf24",
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#07040a] text-white overflow-hidden">

      {/* GOLD BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-28 left-[-120px] h-80 w-80 rounded-full bg-amber-400/10 blur-3xl animate-pulse" />
        <div className="absolute top-[18%] right-[-100px] h-96 w-96 rounded-full bg-orange-500/10 blur-3xl animate-pulse" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">

        {/* HEADER */}
        <div className="rounded-[2rem] border border-amber-400/20 bg-white/5 p-6 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <span className="text-xs uppercase text-amber-300 font-bold">
                PRO ANALYSIS COMPLETE
              </span>
              <h1 className="text-4xl font-black mt-2 bg-gradient-to-r from-amber-200 to-orange-400 text-transparent bg-clip-text">
                {role} ({level})
              </h1>
            </div>

            <Link
              to="/pro-dashboard"
              className="mt-4 md:mt-0 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-300 to-orange-400 text-black font-bold"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-amber-400/10 p-5 rounded-2xl">
            <p className="text-xs text-white/50">Overall</p>
            <p className="text-3xl font-black text-amber-300">
              {overallScore ?? 0}%
            </p>
          </div>

          <div className="bg-white/5 p-5 rounded-2xl">
            <p className="text-xs text-white/50">Technical</p>
            <p className="text-3xl font-black">
              {finalMetrics.avgTechnical ?? 0}%
            </p>
          </div>

          <div className="bg-white/5 p-5 rounded-2xl">
            <p className="text-xs text-white/50">Confidence</p>
            <p className="text-3xl font-black">
              {finalMetrics.avgConfidence ?? 0}%
            </p>
          </div>

          <div className="bg-white/5 p-5 rounded-2xl">
            <p className="text-xs text-white/50">Time</p>
            <p className="text-2xl font-black">
              {formatDuration(startTime, endTime)}
            </p>
          </div>
        </div>

        {/* GRAPH */}
        <div className="bg-white/5 p-6 rounded-3xl border border-amber-400/20">
          <h3 className="text-sm font-bold text-amber-300 mb-4">
            Performance Breakdown
          </h3>
          <div className="h-64">
            <Bar data={barData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        {/* QUESTIONS */}
        <div className="space-y-6">
          {questions.map((q, index) => (
            <div
              key={index}
              className="rounded-3xl border border-amber-400/10 bg-white/5 p-6 backdrop-blur-xl"
            >
              <h3 className="text-xl font-bold mb-3">
                Q{index + 1}. {sanitizeQuestionText(q.questionText)}
              </h3>

              <div className="flex gap-3 mb-4">
                <span className="bg-amber-400/10 px-3 py-1 rounded-xl text-sm">
                  Tech: {q.technicalScore ?? 0}%
                </span>
                <span className="bg-blue-400/10 px-3 py-1 rounded-xl text-sm">
                  Conf: {q.confidenceScore ?? 0}%
                </span>
              </div>

              <p className="text-sm text-white/50">Your Answer</p>
              <p className="mb-4 text-white/80">
                {q.userAnswerText || "No answer"}
              </p>

              <p className="text-sm text-white/50">AI Feedback</p>
              <p className="text-amber-200 mb-4">
                {q.aiFeedback || "Pending"}
              </p>

              <p className="text-sm text-white/50">Ideal Answer</p>
              <pre className="bg-black/40 p-4 rounded-xl text-sm">
                {formatIdealAnswer(q.idealAnswer)}
              </pre>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default ProReview;
