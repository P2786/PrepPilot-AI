import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { getSessionById } from "../features/sessions/sessionSlice";
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

function SessionReview() {
  useFaviconStatus("idle");

  const { sessionId } = useParams();
  const dispatch = useDispatch();
  const { activeSession, isLoading } = useSelector((state) => state.sessions);

  useEffect(() => {
    dispatch(getSessionById(sessionId));
  }, [dispatch, sessionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#060816] text-white">
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 px-8 py-6 text-center backdrop-blur-xl animate-pulse">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
              Generating Analysis...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!activeSession || activeSession.status !== "completed") {
    return (
      <div className="min-h-screen bg-[#060816] text-white">
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4">
          <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
            <h2 className="mb-4 text-2xl font-black uppercase tracking-tight text-white">
              Report Not Ready
            </h2>
            <p className="mb-8 text-sm font-medium text-white/60 sm:text-base">
              This session is still being processed by our AI network.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 px-8 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:-translate-y-0.5"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { overallScore, metrics, role, level, questions, startTime, endTime } =
    activeSession;
  const finalMetrics = metrics || {};

  const barData = {
    labels: questions.map((_, i) => `Q${i + 1}`),
    datasets: [
      {
        label: "Technical Score",
        data: questions.map((q) => q.technicalScore || 0),
        backgroundColor: questions.map((q) =>
          (q.technicalScore || 0) > 70 ? "#10b981" : "#f59e0b"
        ),
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#060816] text-white overflow-hidden">
      <style>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-10px) translateX(6px); }
        }
        @keyframes floatMedium {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(8px) translateX(-6px); }
        }
        @keyframes cardFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        .animate-float-slow {
          animation: floatSlow 7s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: floatMedium 9s ease-in-out infinite;
        }
        .animate-card-float {
          animation: cardFloat 5s ease-in-out infinite;
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-28 left-[-120px] h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl animate-float-slow" />
        <div className="absolute top-[18%] right-[-100px] h-96 w-96 rounded-full bg-violet-600/10 blur-3xl animate-float-medium" />
        <div className="absolute bottom-[-100px] left-[30%] h-80 w-80 rounded-full bg-fuchsia-500/8 blur-3xl animate-float-slow" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 space-y-8">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-300">
                Assessment Complete
              </span>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">
                {role}{" "}
                <span className="block text-white/35 sm:inline">({level})</span>
              </h1>
            </div>

            <Link
              to="/dashboard"
              className="inline-flex w-fit rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            {
              label: "Overall Result",
              value: `${overallScore ?? 0}%`,
              tone: "teal",
            },
            {
              label: "Avg Technical",
              value: `${finalMetrics.avgTechnical ?? 0}%`,
              tone: "slate",
            },
            {
              label: "Avg Confidence",
              value: `${finalMetrics.avgConfidence ?? 0}%`,
              tone: "slate",
            },
            {
              label: "Session Time",
              value: formatDuration(startTime, endTime),
              tone: "slate",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`animate-card-float rounded-[1.75rem] border p-5 backdrop-blur-xl sm:p-6 ${
                stat.tone === "teal"
                  ? "border-cyan-400/15 bg-cyan-400/10"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                {stat.label}
              </p>
              <p
                className={`mt-3 text-2xl font-black sm:text-4xl ${
                  stat.tone === "teal" ? "text-cyan-300" : "text-white"
                }`}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
          <h3 className="mb-6 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">
            Per-Question Performance
          </h3>
          <div className="h-64 sm:h-80">
            <Bar
              data={barData}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: "#0f172a",
                    titleColor: "#ffffff",
                    bodyColor: "#cbd5e1",
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { color: "#94a3b8" },
                    grid: { color: "rgba(255,255,255,0.08)" },
                  },
                  x: {
                    ticks: { color: "#cbd5e1" },
                    grid: { display: false },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="flex items-center px-1 text-2xl font-black tracking-tight text-white sm:text-3xl uppercase">
            <span className="mr-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg">
              ✓
            </span>
            Answer Intelligence
          </h3>

          <div className="space-y-6">
            {questions.map((q, index) => (
              <div
                key={index}
                className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl transition hover:-translate-y-0.5"
              >
                <div className="space-y-6 p-6 sm:p-8">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <h4 className="flex-1 text-lg font-bold leading-snug text-white sm:text-2xl">
                      <span className="mr-2 font-black italic text-cyan-400">
                        Q{index + 1}.
                      </span>
                      {sanitizeQuestionText(q.questionText)}
                    </h4>

                    <div className="flex gap-2 shrink-0">
                      <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/15 bg-emerald-400/10 px-4 py-2">
                        <span className="text-[10px] font-black uppercase text-white/40">
                          Tech
                        </span>
                        <span className="text-sm font-black text-emerald-300">
                          {q.technicalScore ?? 0}%
                        </span>
                      </div>

                      <div className="flex items-center gap-2 rounded-2xl border border-sky-400/15 bg-sky-400/10 px-4 py-2">
                        <span className="text-[10px] font-black uppercase text-white/40">
                          Conf
                        </span>
                        <span className="text-sm font-black text-sky-300">
                          {q.confidenceScore ?? 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="ml-1 block text-[10px] font-black uppercase tracking-[0.2em] text-white/45">
                      Your Submission
                    </label>

                    <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0b1228]/60">
                      {q.userSubmittedCode &&
                        q.userSubmittedCode !== "undefined" && (
                          <div className="border-b border-white/10 p-4 sm:p-6">
                            <span className="mb-2 block text-[10px] font-bold uppercase text-white/40">
                              Code
                            </span>
                            <pre className="overflow-x-auto whitespace-pre-wrap text-[11px] font-mono text-slate-300 sm:text-xs">
                              {q.userSubmittedCode}
                            </pre>
                          </div>
                        )}

                      {q.userAnswerText && (
                        <div className="p-4 sm:p-6">
                          <span className="mb-2 block text-[10px] font-bold uppercase text-white/40">
                            Transcript
                          </span>
                          <p className="text-xs italic leading-relaxed text-slate-300 sm:text-sm">
                            "{q.userAnswerText}"
                          </p>
                        </div>
                      )}

                      {(!q.userSubmittedCode ||
                        q.userSubmittedCode === "undefined") &&
                        !q.userAnswerText && (
                          <div className="p-6 text-center text-xs italic text-white/40">
                            No answer recorded.
                          </div>
                        )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 border-t border-white/10 pt-6 lg:grid-cols-2">
                    <div className="space-y-3">
                      <label className="ml-1 block text-[10px] font-black uppercase tracking-[0.2em] text-white/45">
                        AI Analytical Feedback
                      </label>
                      <div className="rounded-[1.5rem] border border-cyan-400/10 bg-cyan-400/5 p-4 text-xs italic leading-relaxed text-slate-300 sm:p-6 sm:text-sm">
                        "{q.aiFeedback || "Feedback pending."}"
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="ml-1 block text-[10px] font-black uppercase tracking-[0.2em] text-white/45">
                        Ideal Implementation
                      </label>
                      <pre className="overflow-x-auto whitespace-pre-wrap rounded-[1.5rem] bg-slate-900 p-4 font-mono text-[11px] leading-relaxed text-slate-300 sm:p-6 sm:text-[13px]">
                        {formatIdealAnswer(q.idealAnswer)}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SessionReview;