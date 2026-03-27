import React from "react";

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/[0.07]">
      <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-600/20 text-cyan-300">
        <Icon className="h-6 w-6" />
      </div>

      <h4 className="text-xl font-semibold text-white">{title}</h4>
      <p className="mt-3 leading-7 text-white/65">{desc}</p>
    </div>
  );
}

export default FeatureCard;