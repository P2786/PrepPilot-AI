import React from "react";
import { Sparkles } from "lucide-react";

function SectionBadge({ children, color = "cyan", icon: Icon = Sparkles }) {
  const styles = {
    cyan: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    violet: "border-violet-400/20 bg-violet-400/10 text-violet-300",
    gold: "border-amber-300/20 bg-amber-400/10 text-amber-300",
    emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${styles[color]}`}
    >
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </div>
  );
}

export default SectionBadge;