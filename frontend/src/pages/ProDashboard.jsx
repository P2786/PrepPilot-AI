import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  createProSession,
  getProSessions,
  resetProSession,
  deleteProSession,
} from "../features/sessions/prosessionSlice";
import { toast } from "react-toastify";
import ProSessionCard from "../components/ProSessionCard";
import useFaviconStatus from "../hooks/useFaviconStatus";
import {
  Brain,
  BarChart3,
  Zap,
  ShieldCheck,
  Gem,
  ArrowRight,
  FolderKanban,
  Flame,
  BrainCircuit,
  Layers3,
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

const ProDashboard = () => {
  useFaviconStatus("idle");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
 const sessionState = useSelector((state) => state.proSessions);

const {
  proSessions = [],
  isLoading = false,
  isGenerating = false,
  isError = false,
  isSuccess = false,
  message = "",
} = sessionState || {};

  const isProcessing = isLoading || isGenerating;

  const [formData, setFormData] = useState({
    role: user?.preferredRole || ROLES[0],
    level: LEVELS[0],
    interviewType: TYPES[1].value,
    count: COUNTS[0],
  });

  useEffect(() => {
    dispatch(getProSessions());
  }, [dispatch]);

  useEffect(() => {
    if (isError && message) {
      toast.error(message);
      dispatch(resetProSession());
    }
  }, [isError, message, dispatch]);


  const onChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(createProSession(formData));
  };

  const viewSession = (session) => {
    if (session.status === "completed") {
      navigate(`/pro-review/${session._id}`);
    } else if (
      session.status === "in-progress" ||
      session.status === "processing" ||
      session.status === "evaluating" ||
      session.status === "pending"
    ) {
      navigate(`/pro-interview/${session._id}`);
    } else {
      toast.info("Session not ready yet");
    }
  };

  const handleDelete = async (e, sessionId) => {
    e.stopPropagation();

    if (window.confirm("Are you sure you want to delete this session?")) {
      const resultAction = await dispatch(deleteProSession(sessionId));

      if (deleteProSession.fulfilled.match(resultAction)) {
        toast.success("Session deleted");
        dispatch(getProSessions());
      } else {
        toast.error(resultAction.payload || "Delete failed");
      }
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#07040a] text-white">
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
        <div className="absolute -top-28 left-[-120px] h-80 w-80 rounded-full bg-amber-400/10 blur-3xl animate-float-slow" />
        <div className="absolute top-[18%] right-[-100px] h-96 w-96 rounded-full bg-yellow-500/10 blur-3xl animate-float-medium" />
        <div className="absolute bottom-[-100px] left-[30%] h-80 w-80 rounded-full bg-orange-400/10 blur-3xl animate-soft-pulse" />
        <div className="absolute top-[52%] left-[8%] h-52 w-52 rounded-full bg-amber-300/10 blur-3xl animate-float-medium" />
      </div>

      <div className="relative mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 sm:py-10">
        <div className="relative overflow-hidden rounded-[2rem] border border-amber-300/15 bg-white/[0.04] backdrop-blur-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.14),transparent_32%)]"></div>

          <div className="relative flex flex-col justify-between gap-8 p-6 sm:p-8 md:p-10 lg:flex-row lg:items-center">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
                <Brain className="h-6 w-6 text-golden" />
                PrepPilot AI Pro
              </div>

              <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
                Premium interview prep for{" "}
                <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-orange-400 bg-clip-text text-transparent">
                  serious candidates
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-amber-50/75 sm:text-lg">
                Welcome back,{" "}
                <span className="font-bold text-white">
                  {user?.name?.split(" ")[0] || "User"}
                </span>
                . Run unlimited mock interviews, practice coding + theory rounds,
                and review your results in a premium environment built for focus.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-2 rounded-2xl border border-amber-200/15 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/[0.06]"
                >
                  View Profile
                </Link>

                <div className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400 px-5 py-3 text-sm font-bold text-black shadow-lg shadow-amber-500/20">
                  <ShieldCheck className="h-4 w-4" />
                  Premium Access Active
                </div>
              </div>
            </div>

            <div className="grid min-w-full gap-4 sm:grid-cols-3 lg:min-w-[430px]">
              <div className="rounded-3xl border border-amber-300/15 bg-amber-400/10 p-5 backdrop-blur-xl animate-card-float transition hover:-translate-y-1">
                <div className="mb-3 inline-flex rounded-2xl bg-amber-500/20 p-3 text-amber-200">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-200">
                  Total Sessions
                </p>
                <p className="mt-2 text-3xl font-black text-white">
                  {proSessions.length}
                </p>
              </div>

              <div className="rounded-3xl border border-yellow-300/15 bg-yellow-400/10 p-5 backdrop-blur-xl animate-card-float transition hover:-translate-y-1">
                <div className="mb-3 inline-flex rounded-2xl bg-yellow-500/20 p-3 text-yellow-200">
                  <Brain className="h-6 w-6 text-gold" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-200">
                  Current Plan
                </p>
                <p className="mt-2 text-2xl font-black text-white">Pro</p>
              </div>

              <div className="rounded-3xl border border-orange-300/15 bg-orange-400/10 p-5 backdrop-blur-xl animate-card-float transition hover:-translate-y-1">
                <div className="mb-3 inline-flex rounded-2xl bg-orange-500/20 p-3 text-orange-200">
                  <Zap className="h-5 w-5" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-200">
                  Interview Access
                </p>
                <p className="mt-2 text-3xl font-black text-white">∞</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.75rem] border border-amber-300/15 bg-white/[0.04] p-5 backdrop-blur-xl">
            <div className="mb-3 inline-flex rounded-2xl bg-amber-400/10 p-3 text-amber-300">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-200/70">
              AI-Powered Flow
            </p>
            <p className="mt-2 text-sm leading-7 text-white/70">
              Practice oral and coding rounds with the same intelligent feedback
              engine powering your premium sessions.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-amber-300/15 bg-white/[0.04] p-5 backdrop-blur-xl">
            <div className="mb-3 inline-flex rounded-2xl bg-yellow-400/10 p-3 text-yellow-300">
              <Flame className="h-5 w-5" />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-200/70">
              Unlimited Practice
            </p>
            <p className="mt-2 text-sm leading-7 text-white/70">
              No weekly cap. Start as many mock interviews as you want and keep
              building consistency.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-amber-300/15 bg-white/[0.04] p-5 backdrop-blur-xl">
            <div className="mb-3 inline-flex rounded-2xl bg-orange-400/10 p-3 text-orange-300">
              <Layers3 className="h-5 w-5" />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-200/70">
              Premium Workflow
            </p>
            <p className="mt-2 text-sm leading-7 text-white/70">
              Create, continue, review, and refine — all from one premium
              dashboard experience.
            </p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-amber-300/20 bg-gradient-to-r from-amber-500/10 via-yellow-400/10 to-orange-500/10 p-6 backdrop-blur-xl transition hover:-translate-y-0.5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-200">
                Pro Membership
              </p>
              <h2 className="mt-2 text-2xl font-black text-white">
                Unlimited mock interviews unlocked
              </h2>
              <p className="mt-2 text-sm text-white/65 sm:text-base">
                You are on the premium experience. Practice freely with coding-mix,
                oral rounds, and a more focused interview workflow.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-2xl border border-amber-300/20 bg-amber-400/10 px-6 py-3 font-semibold text-amber-100">
              <Gem className="h-5 w-5" />
              Gold Crown Access
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-amber-200/10 bg-white/[0.04] backdrop-blur-xl">
          <div className="border-b border-amber-200/10 px-6 py-5 sm:px-8 sm:py-6">
            <h2 className="flex items-center text-xl font-black text-white sm:text-2xl">
              <span className="mr-3 h-7 w-1.5 rounded-full bg-gradient-to-b from-amber-300 to-yellow-500"></span>
              Create New Pro Interview
            </h2>
            <p className="mt-2 text-sm text-amber-50/55 sm:text-base">
              Choose your role, level, type, and question count to begin a new
              PrepPilot AI Pro interview session.
            </p>
          </div>

          <form
            onSubmit={onSubmit}
            className="grid grid-cols-1 items-end gap-4 px-6 py-6 sm:gap-6 sm:px-8 sm:py-8 md:grid-cols-2 lg:grid-cols-5"
          >
            <div className="space-y-2">
              <label className="ml-1 text-[10px] font-black uppercase tracking-[0.22em] text-amber-100/55">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={onChange}
                className="w-full rounded-2xl border border-amber-100/10 bg-[#120d08] px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-amber-300/40 focus:ring-2 focus:ring-amber-300/20 hover:-translate-y-0.5"
              >
                {ROLES.map((role) => (
                  <option key={role} value={role} className="bg-[#120d08] text-white">
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="ml-1 text-[10px] font-black uppercase tracking-[0.22em] text-amber-100/55">
                Level
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={onChange}
                className="w-full rounded-2xl border border-amber-100/10 bg-[#120d08] px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-amber-300/40 focus:ring-2 focus:ring-amber-300/20 hover:-translate-y-0.5"
              >
                {LEVELS.map((level) => (
                  <option key={level} value={level} className="bg-[#120d08] text-white">
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="ml-1 text-[10px] font-black uppercase tracking-[0.22em] text-amber-100/55">
                Length
              </label>
              <select
                name="count"
                value={formData.count}
                onChange={onChange}
                className="w-full rounded-2xl border border-amber-100/10 bg-[#120d08] px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-amber-300/40 focus:ring-2 focus:ring-amber-300/20 hover:-translate-y-0.5"
              >
                {COUNTS.map((count) => (
                  <option key={count} value={count} className="bg-[#120d08] text-white">
                    {count} Qs
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="ml-1 text-[10px] font-black uppercase tracking-[0.22em] text-amber-100/55">
                Type
              </label>
              <select
                name="interviewType"
                value={formData.interviewType}
                onChange={onChange}
                className="w-full rounded-2xl border border-amber-100/10 bg-[#120d08] px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-amber-300/40 focus:ring-2 focus:ring-amber-300/20 hover:-translate-y-0.5"
              >
                {TYPES.map((type) => (
                  <option
                    key={type.value}
                    value={type.value}
                    className="bg-[#120d08] text-white"
                  >
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className={`h-[52px] w-full rounded-2xl font-bold text-black transition-all ${
                isProcessing
                  ? "cursor-not-allowed bg-slate-500 text-white"
                  : "bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400 hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[0.98]"
              }`}
            >
              {isProcessing ? (
                <span className="inline-flex items-center gap-2 text-white">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Generating...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  Start Pro Interview
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </button>
          </form>
        </div>

        <div className="space-y-5 pb-16">
          <h2 className="flex items-center px-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
            <span className="mr-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-300/15 bg-amber-400/10 text-amber-300">
              <FolderKanban className="h-5 w-5" />
            </span>
            Pro Interview History
          </h2>

          {isLoading && proSessions.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-amber-300"></div>
            </div>
          ) : proSessions.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-amber-200/10 bg-white/[0.03] py-20 text-center">
              <p className="text-base font-bold text-amber-50/45 sm:text-lg">
                No pro sessions yet.
              </p>
              <p className="mt-2 text-sm text-white/45">
                Start your first PrepPilot AI Pro interview to see it here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {proSessions.map((session) => (
                <ProSessionCard
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

export default ProDashboard;