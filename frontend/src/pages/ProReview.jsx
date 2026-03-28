// SAME IMPORTS (NO CHANGE)
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

// SAME FUNCTIONS (NO CHANGE)
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
  const { activeProSession, isLoading } = useSelector((state) => state.proSessions);

  useEffect(() => {
    dispatch(getProSessionById(sessionId));
  }, [dispatch, sessionId]);

  // 🔥 GOLD LOADING
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07040a] text-white">
        <div className="mx-auto flex min-h-[70vh] items-center justify-center">
          <p className="text-amber-300 font-black animate-pulse">
            Generating Pro Analysis...
          </p>
        </div>
      </div>
    );
  }

  if (!activeProSession || activeProSession.status !== "completed") {
    return (
      <div className="min-h-screen bg-[#07040a] text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-black text-white mb-4">
            Report Not Ready
          </h2>
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

  const { overallScore, metrics, role, level, questions } = activeProSession;

  const barData = {
    labels: questions.map((_, i) => `Q${i + 1}`),
    datasets: [
      {
        label: "Technical Score",
        data: questions.map((q) => q.technicalScore || 0),
        backgroundColor: "#f59e0b", // 🔥 GOLD
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#07040a] text-white px-4 py-8">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-black">
          <span className="bg-gradient-to-r from-amber-200 to-orange-400 bg-clip-text text-transparent">
            Pro Review
          </span>
        </h1>
        <p className="text-white/50">{role} ({level})</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-amber-400/10 p-5 rounded-xl">
          <p className="text-sm text-white/50">Overall</p>
          <p className="text-2xl font-black text-amber-300">
            {overallScore}%
          </p>
        </div>

        <div className="bg-white/5 p-5 rounded-xl">
          <p className="text-sm text-white/50">Technical</p>
          <p className="text-2xl font-black text-white">
            {metrics?.avgTechnical}%
          </p>
        </div>

        <div className="bg-white/5 p-5 rounded-xl">
          <p className="text-sm text-white/50">Confidence</p>
          <p className="text-2xl font-black text-white">
            {metrics?.avgConfidence}%
          </p>
        </div>
      </div>

      {/* GRAPH */}
      <div className="bg-white/5 p-6 rounded-xl mb-8">
        <Bar data={barData} />
      </div>

      {/* QUESTIONS */}
      {questions.map((q, i) => (
        <div key={i} className="bg-white/5 p-6 rounded-xl mb-6">
          <h3 className="font-bold text-lg mb-3">
            Q{i + 1}. {sanitizeQuestionText(q.questionText)}
          </h3>

          <p className="text-sm text-white/60 mb-2">Your Answer</p>
          <p className="mb-4">{q.userAnswerText || "No answer"}</p>

          <p className="text-sm text-white/60 mb-2">AI Feedback</p>
          <p className="text-amber-200 mb-4">{q.aiFeedback}</p>

          <p className="text-sm text-white/60 mb-2">Ideal Answer</p>
          <pre className="bg-black/40 p-4 rounded text-sm">
            {formatIdealAnswer(q.idealAnswer)}
          </pre>
        </div>
      ))}
    </div>
  );
}

export default ProReview;
