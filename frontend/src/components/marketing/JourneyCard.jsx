import React from "react";

function JourneyCard({ label, title, theme = "default" }) {
  const styles = {
    default: "border-white/10 bg-[#0c1227] text-white/50",
    premium: "border-amber-300/20 bg-amber-400/10 text-amber-200/70",
    violet: "border-violet-400/20 bg-violet-500/10 text-violet-200/70",
  };

  const current = styles[theme] || styles.default;

  return (
    <div className={`rounded-3xl border p-5 ${current}`}>
      <p className="text-sm">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{title}</p>
    </div>
  );
}

export default JourneyCard;