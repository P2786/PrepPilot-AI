import React from "react";
import { CheckCircle2 } from "lucide-react";

function InfoPoint({
  title,
  description,
  color = "cyan",
  icon: Icon = CheckCircle2,
}) {
  const styles = {
    cyan: "bg-cyan-500/15 text-cyan-300",
    violet: "bg-violet-500/15 text-violet-300",
    emerald: "bg-emerald-500/15 text-emerald-300",
    gold: "bg-amber-400/15 text-amber-300",
  };

  return (
    <div className="flex gap-4">
      <div className={`mt-1 rounded-xl p-2 ${styles[color]}`}>
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <h4 className="font-semibold text-white">{title}</h4>
        <p className="mt-1 text-white/60">{description}</p>
      </div>
    </div>
  );
}

export default InfoPoint;