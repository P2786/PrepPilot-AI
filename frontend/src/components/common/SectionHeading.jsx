import React from "react";

function SectionHeading({ badge, title, description, badgeColor = "cyan", center = true }) {
  const badgeStyles = {
    cyan: "text-cyan-400",
    violet: "text-violet-400",
    gold: "text-amber-300",
    emerald: "text-emerald-300",
  };

  return (
    <div className={`${center ? "mx-auto max-w-3xl text-center" : ""} mb-14`}>
      {badge && (
        <p
          className={`mb-3 text-sm font-semibold uppercase tracking-[0.3em] ${badgeStyles[badgeColor]}`}
        >
          {badge}
        </p>
      )}

      <h3 className="text-3xl font-bold md:text-4xl">{title}</h3>

      {description && (
        <p className="mt-4 text-white/65">
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionHeading;