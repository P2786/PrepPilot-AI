import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  getSessionById,
  submitAnswer,
  endSession,
} from "../features/sessions/sessionSlice";
import MonacoEditor from "@monaco-editor/react";
import { toast } from "react-toastify";
import useFaviconStatus from "../hooks/useFaviconStatus";
import {
  Code2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Brain,
  FileText,
} from "lucide-react";

const SUPPORTED_LANGUAGES = [
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "Python", value: "python" },
  { label: "Java", value: "java" },
  { label: "C++", value: "cpp" },
  { label: "C#", value: "csharp" },
  { label: "Go", value: "go" },
  { label: "Swift", value: "swift" },
  { label: "Kotlin", value: "kotlin" },
  { label: "R Language", value: "r" },
  { label: "SQL", value: "sql" },
  { label: "HTML", value: "html" },
  { label: "CSS", value: "css" },
  { label: "Solidity", value: "solidity" },
  { label: "Shell", value: "shell" },
  { label: "YAML", value: "yaml" },
  { label: "Markdown", value: "markdown" },
  { label: "Plain Text", value: "plaintext" },
];

const ROLE_LANGUAGE_MAP = {
  "MERN Stack Developer": "javascript",
  "MEAN Stack Developer": "typescript",
  "Full Stack Python": "python",
  "Full Stack Java": "java",
  "Frontend Developer": "javascript",
  "Backend Developer": "javascript",
  "Data Scientist": "python",
  "Data Analyst": "python",
  "Machine Learning Engineer": "python",
  "DevOps Engineer": "shell",
  "Cloud Engineer (AWS/Azure/GCP)": "yaml",
  "Cybersecurity Engineer": "python",
  "Blockchain Developer": "solidity",
  "Mobile Developer (iOS/Android)": "swift",
  "Game Developer": "csharp",
  "QA Automation Engineer": "python",
  "UI/UX Designer": "css",
  "Product Manager": "markdown",
};

function InterviewRunner() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { activeSession, isLoading, message } = useSelector(
    (state) => state.sessions
  );

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [faviconStatus, setFaviconStatus] = useState("live");
  useFaviconStatus(faviconStatus);

  const [submittedLocal, setSubmittedLocal] = useState({});
  const [drafts, setDrafts] = useState(() => {
    const saved = localStorage.getItem(`drafts_${sessionId}`);
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    setFaviconStatus("live");
  }, [sessionId]);

  useEffect(() => {
    if (activeSession?.role) {
      const detectedLang = ROLE_LANGUAGE_MAP[activeSession.role] || "plaintext";
      setSelectedLanguage(detectedLang);
    }
  }, [activeSession?.role]);

  useEffect(() => {
    localStorage.setItem(`drafts_${sessionId}`, JSON.stringify(drafts));
  }, [drafts, sessionId]);

  useEffect(() => {
    dispatch(getSessionById(sessionId));
  }, [dispatch, sessionId]);

  const currentQuestion = activeSession?.questions?.[currentQuestionIndex];

  const isReduxSubmitted = currentQuestion?.isSubmitted === true;
  const isLocallySubmitted = submittedLocal[currentQuestionIndex] === true;
  const isQuestionLocked = isReduxSubmitted || isLocallySubmitted;
  const isProcessing = isQuestionLocked && !currentQuestion?.isEvaluated;

  useEffect(() => {
    if (currentQuestion?.isEvaluated) {
      setFaviconStatus("live");
    }
  }, [currentQuestion?.isEvaluated]);

  const handleNavigation = (index) => {
    if (index >= 0 && index < activeSession?.questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const updateDraftCode = (newCode) => {
    if (isQuestionLocked) return;
    setDrafts((prev) => ({
      ...prev,
      [currentQuestionIndex]: { ...prev[currentQuestionIndex], code: newCode || "" },
    }));
  };

  const updateTheoryAnswer = (e) => {
    if (isQuestionLocked) return;
    const value = e.target.value;
    setDrafts((prev) => ({
      ...prev,
      [currentQuestionIndex]: {
        ...prev[currentQuestionIndex],
        theoryAnswer: value,
      },
    }));
  };

  const handleSubmitAnswer = async () => {
    if (isQuestionLocked) return;

    const draft = drafts[currentQuestionIndex] || {};
    const code = draft?.code || "";
    const theoryAnswer = draft?.theoryAnswer || "";

    if (!code.trim() && !theoryAnswer.trim()) {
      toast.warning("Please provide code or theory answer.");
      return;
    }

    setSubmittedLocal((prev) => ({ ...prev, [currentQuestionIndex]: true }));
    setFaviconStatus("processing");

    const formData = new FormData();
    formData.append("questionIndex", currentQuestionIndex);
    if (code.trim()) formData.append("code", code);
    if (theoryAnswer.trim()) formData.append("theoryAnswer", theoryAnswer);

    dispatch(submitAnswer({ sessionId, formData }))
      .unwrap()
      .then(() => {
        setFaviconStatus("live");
      })
      .catch(() => {
        setSubmittedLocal((prev) => ({
          ...prev,
          [currentQuestionIndex]: false,
        }));
        setFaviconStatus("live");
        toast.error("Submission failed. Please try again.");
      });
  };

  const handleFinishInterview = () => {
    if (!window.confirm("Are you sure you want to finish the interview?")) {
      return;
    }

    dispatch(endSession(sessionId))
      .unwrap()
      .then(() => {
        setFaviconStatus("idle");
        localStorage.removeItem(`drafts_${sessionId}`);
        navigate(`/review/${sessionId}`);
      })
      .catch(() => {
        setFaviconStatus("live");
        toast.error("Could not finish session. AI is still working.");
      });
  };

  if (!activeSession) {
    return (
      <div className="min-h-screen bg-[#060816] text-white">
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 px-8 py-6 text-center backdrop-blur-xl">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
              Loading Session...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentDraft = drafts[currentQuestionIndex] || {};
  const totalQuestions = activeSession?.questions?.length || 0;
  const completedQuestions =
    activeSession?.questions?.filter((q) => q?.isEvaluated)?.length || 0;
  const progressPercent =
    totalQuestions > 0
      ? Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-[#060816] text-white">
      <style>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-10px) translateX(5px); }
        }
        @keyframes floatMedium {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(8px) translateX(-6px); }
        }
        .animate-float-slow {
          animation: floatSlow 7s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: floatMedium 9s ease-in-out infinite;
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-28 left-[-120px] h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl animate-float-slow" />
        <div className="absolute top-[18%] right-[-100px] h-96 w-96 rounded-full bg-violet-600/10 blur-3xl animate-float-medium" />
        <div className="absolute bottom-[-100px] left-[30%] h-80 w-80 rounded-full bg-fuchsia-500/8 blur-3xl animate-float-slow" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-6 pb-32 sm:px-6 sm:py-8 sm:pb-36">
        {/* Top Header */}
        <div className="mb-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                <Sparkles className="h-4 w-4" />
                Live Interview Session
              </div>

              <h1 className="truncate text-2xl font-black tracking-tight text-white sm:text-4xl">
                {activeSession.role}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/60">
                  {activeSession.level}
                </div>

                <div className="rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-300">
                  Q {currentQuestionIndex + 1} / {totalQuestions}
                </div>

                <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                  Done {completedQuestions}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:min-w-[320px]">
              <div>
                <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.18em] text-white/45">
                  <span>Session Progress</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <button
                onClick={handleFinishInterview}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-5 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-rose-600 disabled:opacity-50"
              >
                {isLoading ? "Finalizing..." : "Finish Interview"}
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {activeSession?.questions?.map((q, i) => (
              <button
                key={i}
                onClick={() => handleNavigation(i)}
                className={`h-3.5 w-3.5 rounded-full transition-all ${
                  i === currentQuestionIndex
                    ? "scale-125 bg-cyan-400 ring-2 ring-cyan-300/30"
                    : q.isEvaluated
                    ? "bg-emerald-400"
                    : q.isSubmitted || submittedLocal[i]
                    ? "bg-amber-400 animate-pulse"
                    : "bg-white/15"
                }`}
                title={`Question ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Question Card */}
        <div className="mb-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
          <span className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
            Question {currentQuestionIndex + 1}
          </span>
          <h2 className="mt-3 text-xl font-semibold leading-relaxed text-white sm:text-3xl">
            {currentQuestion?.questionText}
          </h2>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 items-stretch gap-6 xl:grid-cols-2">
          {/* Theory Answer */}
          <div className="flex min-h-[560px] flex-col rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Theory Answer</h3>
                <p className="text-sm text-white/50">
                  Type your explanation or verbal-style answer
                </p>
              </div>
            </div>

            <div className="flex-1 rounded-[1.75rem] border border-white/10 bg-[#0b1228]/60 p-4">
              <textarea
                value={currentDraft.theoryAnswer || ""}
                onChange={updateTheoryAnswer}
                disabled={isQuestionLocked}
                placeholder="Write your theory answer here..."
                className="h-full min-h-[420px] w-full resize-none rounded-[1.25rem] border border-white/10 bg-[#060d1f] p-4 text-sm leading-7 text-white outline-none placeholder:text-white/30 focus:border-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex min-h-[560px] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl">
            <div className="flex flex-col gap-3 border-b border-white/10 bg-[#0b1228]/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-violet-500/10 p-3 text-violet-300">
                  <Code2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Code Editor</h3>
                  <p className="text-sm text-white/50">
                    Write your implementation
                  </p>
                </div>
              </div>

              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                disabled={isQuestionLocked}
                className="rounded-xl border border-white/10 bg-[#060d1f] px-3 py-2 text-sm font-semibold text-white outline-none disabled:opacity-50"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 p-4">
              <div className="h-[420px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#060d1f]">
                <MonacoEditor
                  height="100%"
                  language={selectedLanguage}
                  theme="vs-dark"
                  value={currentDraft.code || ""}
                  onChange={updateDraftCode}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    readOnly: isQuestionLocked,
                    domReadOnly: isQuestionLocked,
                    padding: { top: 14 },
                    wordWrap: "on",
                    lineNumbersMinChars: 3,
                    automaticLayout: true,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* AI Feedback */}
        {currentQuestion?.isEvaluated && (
          <div className="mt-6 rounded-[2rem] border border-emerald-400/15 bg-emerald-500/10 p-6 backdrop-blur-xl sm:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-500/15 p-3 text-emerald-300">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-emerald-300">
                  AI Feedback
                </h3>
                <p className="text-sm text-emerald-200/70">
                  Analysis generated for your answer
                </p>
              </div>
            </div>

            <p className="text-sm leading-7 text-white/80 sm:text-base">
              {currentQuestion.aiFeedback}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <span className="rounded-xl border border-emerald-400/20 bg-white/5 px-4 py-2 text-sm font-bold text-emerald-300">
                Technical Score: {currentQuestion.technicalScore}/100
              </span>
              <span className="rounded-xl border border-sky-400/20 bg-white/5 px-4 py-2 text-sm font-bold text-sky-300">
                Confidence: {currentQuestion.confidenceScore ?? 0}/100
              </span>
            </div>
          </div>
        )}

        {/* Sticky Bottom Controls */}
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#060816]/92 px-4 py-4 backdrop-blur-xl sm:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <button
              onClick={() => handleNavigation(currentQuestionIndex - 1)}
              disabled={currentQuestionIndex === 0}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10 disabled:opacity-30"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </button>

            <div className="flex flex-col items-center">
              {isProcessing && message && (
                <div className="mb-2 animate-pulse rounded-full border border-cyan-400/15 bg-cyan-400/10 px-4 py-1 text-xs font-mono text-cyan-300">
                  🤖 {message}...
                </div>
              )}

              <button
                onClick={handleSubmitAnswer}
                disabled={isQuestionLocked}
                className={`rounded-2xl px-8 py-3 font-bold text-white transition-all ${
                  isProcessing
                    ? "cursor-wait bg-slate-600"
                    : currentQuestion?.isEvaluated
                    ? "bg-emerald-500"
                    : isQuestionLocked
                    ? "bg-slate-600"
                    : "bg-gradient-to-r from-cyan-500 to-violet-600 hover:-translate-y-0.5"
                }`}
              >
                {isProcessing
                  ? "Analyzing..."
                  : currentQuestion?.isEvaluated
                  ? "Answer Submitted"
                  : isQuestionLocked
                  ? "Submitted"
                  : "Submit Answer"}
              </button>
            </div>

            <button
              onClick={() => handleNavigation(currentQuestionIndex + 1)}
              disabled={currentQuestionIndex === activeSession.questions.length - 1}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10 disabled:opacity-30"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewRunner;