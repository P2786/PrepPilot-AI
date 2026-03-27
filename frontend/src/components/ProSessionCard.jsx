import {
  Code2,
  Database,
  BarChart3,
  Cloud,
  Shield,
  Link2,
  Smartphone,
  Gamepad2,
  Palette,
  FlaskConical,
  ClipboardList,
  Coffee,
  MonitorSmartphone,
  BrainCircuit,
  ArrowRight,
  Trash2,
} from "lucide-react";

const ProSessionCard = ({ session, onClick, onDelete }) => {
  const isDeletable = session.status !== "pending";

  const getIcon = () => {
    const r = session.role || "";

    if (r.includes("Python")) return <BrainCircuit className="h-6 w-6" />;
    if (
      r.includes("MERN") ||
      r.includes("MEAN") ||
      r.includes("React") ||
      r.includes("Frontend")
    ) {
      return <Code2 className="h-6 w-6" />;
    }
    if (r.includes("Data") || r.includes("Machine") || r.includes("AI")) {
      return <BarChart3 className="h-6 w-6" />;
    }
    if (r.includes("DevOps") || r.includes("Cloud") || r.includes("SRE")) {
      return <Cloud className="h-6 w-6" />;
    }
    if (r.includes("Security") || r.includes("Cyber")) {
      return <Shield className="h-6 w-6" />;
    }
    if (r.includes("Blockchain") || r.includes("Web3")) {
      return <Link2 className="h-6 w-6" />;
    }
    if (r.includes("Mobile") || r.includes("iOS") || r.includes("Android")) {
      return <Smartphone className="h-6 w-6" />;
    }
    if (r.includes("Game")) {
      return <Gamepad2 className="h-6 w-6" />;
    }
    if (r.includes("UI") || r.includes("UX") || r.includes("Designer")) {
      return <Palette className="h-6 w-6" />;
    }
    if (r.includes("QA") || r.includes("Test")) {
      return <FlaskConical className="h-6 w-6" />;
    }
    if (r.includes("Product") || r.includes("Manager")) {
      return <ClipboardList className="h-6 w-6" />;
    }
    if (r.includes("Java") || r.includes("Backend")) {
      return <Coffee className="h-6 w-6" />;
    }

    return <MonitorSmartphone className="h-6 w-6" />;
  };

  const getStatusClasses = () => {
    if (session.status === "completed") {
      return "bg-emerald-400/15 text-emerald-300 border border-emerald-400/20";
    }
    if (session.status === "in-progress") {
      return "bg-amber-400/15 text-amber-300 border border-amber-400/20";
    }
    if (session.status === "processing" || session.status === "evaluating") {
      return "bg-yellow-400/15 text-yellow-300 border border-yellow-400/20";
    }
    return "bg-orange-400/15 text-orange-300 border border-orange-400/20";
  };

  const getIconClasses = () => {
    if (session.status === "completed") {
      return "bg-emerald-400/10 text-emerald-300 border border-emerald-400/20";
    }
    if (session.status === "in-progress") {
      return "bg-amber-400/10 text-amber-300 border border-amber-400/20";
    }
    return "bg-yellow-400/10 text-yellow-300 border border-yellow-400/20";
  };

  const getScoreColor = () => {
    if (session.status !== "completed") return "text-white/35";
    return session.overallScore > 75 ? "text-amber-300" : "text-orange-300";
  };

  return (
    <div
      onClick={() => onClick(session)}
      className="group cursor-pointer rounded-[2rem] border border-amber-300/10 bg-white/5 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.07] sm:p-6"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex min-w-0 flex-grow items-center gap-4 sm:gap-6">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm sm:h-14 sm:w-14 ${getIconClasses()}`}
          >
            {getIcon()}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-white transition group-hover:text-amber-300 sm:text-lg">
              {session.role}
            </h3>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
              <span>{new Date(session.createdAt).toLocaleDateString()}</span>
              <span className="hidden sm:inline">•</span>
              <span className="rounded-md bg-white/10 px-2 py-1 text-white/60">
                {session.level}
              </span>
            </div>
          </div>
        </div>

        <div className="flex w-full items-center justify-between border-t border-white/10 pt-4 md:w-auto md:justify-end md:gap-6 md:border-t-0 md:pt-0">
          <div className="text-left md:text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/30">
              Global Score
            </p>
            <p className={`mt-1 text-xl font-black sm:text-2xl ${getScoreColor()}`}>
              {session.status === "completed" ? session.overallScore : "--"}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span
              className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] ${getStatusClasses()}`}
            >
              {session.status}
            </span>

            <span className="flex items-center text-xs font-bold text-amber-300">
              {session.status === "completed" ? "Results" : "Resume"}
              <ArrowRight className="ml-1 h-3 w-3" />
            </span>
          </div>
        </div>

        <div className="mx-2 hidden h-10 w-px bg-white/10 md:block"></div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (isDeletable) onDelete(e, session._id);
          }}
          className="self-end rounded-xl p-3 text-white/30 transition-all hover:bg-rose-500/10 hover:text-rose-300 md:self-auto"
          title="Delete Session"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default ProSessionCard;