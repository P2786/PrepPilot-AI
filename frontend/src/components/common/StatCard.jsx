import React from "react";

function StatCard({ value, label, valueColor = "cyan" }) {
  const valueStyles = {
    cyan: "text-cyan-400",
    violet: "text-violet-400",
    emerald: "text-emerald-400",
    gold: "text-amber-300",
    white: "text-white",
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
      <p className={`text-2xl font-bold ${valueStyles[valueColor]}`}>{value}</p>
      <p className="mt-1 text-sm text-white/60">{label}</p>
    </div>
  );
}

export default StatCard;