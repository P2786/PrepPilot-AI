import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  createSession,
  getSessions,
  reset,
  deleteSession,
} from "../features/sessions/sessionSlice";
import { toast } from "react-toastify";
import SessionCard from "../components/SessionCard";
import useFaviconStatus from "../hooks/useFaviconStatus";
import {
  Sparkles,
  ArrowRight,
  Crown,
  Zap,
  BarChart3,
} from "lucide-react";

const ROLES = [
  "MERN Stack Developer",
  "MEAN Stack Developer",
  "Full Stack Python",
  "Full Stack Java",
  "Frontend Developer",
  "Backend Developer",
  "Data Scientist",
  "Data Analyst",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Cloud Engineer (AWS/Azure/GCP)",
  "Cybersecurity Engineer",
  "Blockchain Developer",
  "Mobile Developer (iOS/Android)",
  "Game Developer",
  "UI/UX Designer",
  "QA Automation Engineer",
  "Product Manager",
];

const LEVELS = ["Junior", "Mid-Level", "Senior"];
const TYPES = [
  { label: "Oral only", value: "oral-only" },
  { label: "Coding Mix", value: "coding-mix" },
];
const COUNTS = [5, 10, 15];

const Dashboard = () => {
  useFaviconStatus("idle");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { sessions, isLoading, isGenerating, isError, message } = useSelector(
    (state) => state.sessions
  );

  const weeklyRemaining = user?.usage?.weeklyInterviewRemaining;
  const weeklyUsed = user?.usage?.weeklyInterviewCount;
  const isFreePlan = (user?.plan || "free") === "free";
  const isProcessing = isGenerating;

  const [formData, setFormData] = useState({
    role: user?.preferredRole || ROLES[0],
    level: LEVELS[0],
    interviewType: TYPES[1].value,
    count: COUNTS[0],
  });

  useEffect(() => {
    dispatch(getSessions());
  }, [dispatch]);

  useEffect(() => {
    if (isError && message) {
      toast.error(message);
      dispatch(reset());
    }
  }, [isError, message, dispatch]);

  const onChange = (e) => {
    const { name, value } = e.target;

    if (name === "level" && isFreePlan && value === "Senior") {
      toast.info("Senior level is available only on Premium plan.");
      return;
    }

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (isFreePlan && weeklyRemaining === 0) {
      toast.error("Your free weekly interview limit is over. Upgrade to continue.");
      return;
    }

    dispatch(createSession(formData));
  };

  const viewSession = (session) => {
    if (session.status === "completed") {
      navigate(`/review/${session._id}`);
    } else if (
      session.status === "in-progress" ||
      session.status === "processing" ||
      session.status === "evaluating"
    ) {
      navigate(`/interview/${session._id}`);
    } else {
      toast.info("Session not ready yet");
    }
  };

  const handleDelete = (e, sessionId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this session?")) {
      dispatch(deleteSession(sessionId));
      toast.success("Session deleted");
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#060816] text-white">
      <style>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-10px) translateX(6px); }
        }
        @keyframes floatMedium {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(8px) translateX(-6px); }
        }
        @keyframes softPulse {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 0.75; transform: scale(1.06); }
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
        .animate-soft-pulse {
          animation: softPulse 6s ease-in-out infinite;
        }
        .animate-card-float {
          animation: cardFloat 5s ease-in-out infinite;
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-28 left-[-120px] h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl animate-float-slow" />
        <div className="absolute top-[18%] right-[-100px] h-96 w-96 rounded-full bg-violet-600/10 blur-3xl animate-float-medium" />
        <div className="absolute bottom-[-100px] left-[30%] h-80 w-80 rounded-full bg-fuchsia-500/8 blur-3xl animate-soft-pulse" />
        <div className="absolute top-[52%] left-[8%] h-52 w-52 rounded-full bg-sky-500/6 blur-3xl animate-float-medium" />
      </div>

      <div className="relative mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 sm:py-10">
        {/* HERO */}
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.12),transparent_30%)]"></div>

          <div className="relative flex flex-col justify-between gap-8 p-6 sm:p-8 md:p-10 lg:flex-row lg:items-center">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                <Sparkles className="h-4 w-4" />
                PrepPilot AI Dashboard
              </div>

              <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
                Welcome,{" "}
                <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500 bg-clip-text text-transparent">
                  {user?.name?.split(" ")[0] || "User"}
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-slate-300 sm:text-lg">
                Create smart mock interviews, improve your confidence, and track
                your preparation with a premium AI-powered experience.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
                >
                  View Profile
                </Link>

                {isFreePlan && (
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:scale-[1.01]"
                    onClick={() => toast.info("Upgrade page next add karishu")}
                  >
                    Upgrade Plan <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid min-w-full gap-4 sm:grid-cols-3 lg:min-w-[430px]">
              <div className="rounded-3xl border border-cyan-400/15 bg-cyan-400/10 p-5 backdrop-blur-xl animate-card-float transition hover:-translate-y-1">
                <div className="mb-3 inline-flex rounded-2xl bg-cyan-500/20 p-3 text-cyan-300">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">
                  Total Sessions
                </p>
                <p className="mt-2 text-3xl font-black text-white">{sessions.length}</p>
              </div>

              <div className="rounded-3xl border border-violet-400/15 bg-violet-400/10 p-5 backdrop-blur-xl animate-card-float transition hover:-translate-y-1">
                <div className="mb-3 inline-flex rounded-2xl bg-violet-500/20 p-3 text-violet-300">
                  <Crown className="h-5 w-5" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-300">
                  Plan
                </p>
                <p className="mt-2 text-2xl font-black text-white">
                  {user?.plan
                    ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1)
                    : "Free"}
                </p>
              </div>

              <div className="rounded-3xl border border-emerald-400/15 bg-emerald-400/10 p-5 backdrop-blur-xl animate-card-float transition hover:-translate-y-1">
                <div className="mb-3 inline-flex rounded-2xl bg-emerald-500/20 p-3 text-emerald-300">
                  <Zap className="h-5 w-5" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">
                  Free Interviews Left
                </p>
                <p className="mt-2 text-3xl font-black text-white">
                  {isFreePlan ? weeklyRemaining ?? 2 : "∞"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* PLAN NOTICE */}
        {isFreePlan && (
          <div className="rounded-[2rem] border border-violet-400/20 bg-gradient-to-r from-violet-500/10 to-cyan-500/10 p-6 backdrop-blur-xl transition hover:-translate-y-0.5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-300">
                  Free Plan
                </p>
                <h2 className="mt-2 text-2xl font-black text-white">
                  You’ve used {weeklyUsed ?? 0} this week
                </h2>
                <p className="mt-2 text-sm text-white/65 sm:text-base">
                  Free plan includes 2 mock interviews per week, basic feedback,
                  and limited difficulty access.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/upgrade")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:scale-[1.01]"
              >
                Upgrade to Premium <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* CREATE INTERVIEW */}
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="border-b border-white/10 px-6 py-5 sm:px-8 sm:py-6">
            <h2 className="flex items-center text-xl font-black text-white sm:text-2xl">
              <span className="mr-3 h-7 w-1.5 rounded-full bg-gradient-to-b from-cyan-400 to-violet-500"></span>
              Create New Interview
            </h2>
            <p className="mt-2 text-sm text-slate-400 sm:text-base">
              Choose your role, level, type, and question count to begin a new
              mock interview session.
            </p>
          </div>

          <form
            onSubmit={onSubmit}
            className="grid grid-cols-1 items-end gap-4 px-6 py-6 sm:gap-6 sm:px-8 sm:py-8 md:grid-cols-2 lg:grid-cols-5"
          >
            <div className="space-y-2">
              <label className="ml-1 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={onChange}
                className="w-full rounded-2xl border border-white/10 bg-[#0b1228] px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20 hover:-translate-y-0.5"
              >
                {ROLES.map((role) => (
                  <option key={role} value={role} className="bg-slate-900 text-white">
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="ml-1 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                Level
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={onChange}
                className="w-full rounded-2xl border border-white/10 bg-[#0b1228] px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20 hover:-translate-y-0.5"
              >
                {LEVELS.map((level) => (
                  <option key={level} value={level} className="bg-slate-900 text-white">
                    {level === "Senior" ? "Senior ★" : level}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="ml-1 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                Length
              </label>
              <select
                name="count"
                value={formData.count}
                onChange={onChange}
                className="w-full rounded-2xl border border-white/10 bg-[#0b1228] px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20 hover:-translate-y-0.5"
              >
                {COUNTS.map((count) => (
                  <option key={count} value={count} className="bg-slate-900 text-white">
                    {count} Qs
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="ml-1 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                Type
              </label>
              <select
                name="interviewType"
                value={formData.interviewType}
                onChange={onChange}
                className="w-full rounded-2xl border border-white/10 bg-[#0b1228] px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20 hover:-translate-y-0.5"
              >
                {TYPES.map((type) => (
                  <option
                    key={type.value}
                    value={type.value}
                    className="bg-slate-900 text-white"
                  >
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isProcessing || (isFreePlan && weeklyRemaining === 0)}
              className={`h-[52px] w-full rounded-2xl font-bold text-white transition-all ${
                isProcessing || (isFreePlan && weeklyRemaining === 0)
                  ? "cursor-not-allowed bg-slate-500"
                  : "bg-gradient-to-r from-cyan-500 via-sky-500 to-violet-500 hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[0.98]"
              }`}
            >
              {isProcessing ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Generating...
                </span>
              ) : isFreePlan && weeklyRemaining === 0 ? (
                "Limit Reached"
              ) : (
                "Start Interview"
              )}
            </button>
          </form>
        </div>

        {/* HISTORY */}
        <div className="space-y-5 pb-16">
          <h2 className="flex items-center px-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
            <span className="mr-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg">
              📊
            </span>
            Interview History
          </h2>

          {isLoading && sessions.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-cyan-400"></div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.03] py-20 text-center">
              <p className="text-base font-bold text-slate-400 sm:text-lg">
                No sessions yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <SessionCard
                  key={session._id}
                  session={session}
                  onClick={viewSession}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;