import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

function PlanCard({
  icon: Icon,
  title,
  subtitle,
  price,
  priceSuffix,
  features = [],
  buttonText,
  buttonTo = "/login",
  theme = "free",
  badge,
}) {
  const isPremium = theme === "premium";

  return (
    <div
      className={`group relative flex h-full min-h-[760px] flex-col overflow-hidden rounded-[32px] p-8 backdrop-blur-xl transition-all duration-300 ${
        isPremium
          ? "border border-amber-300/25 bg-gradient-to-br from-[#16120a] via-[#0d1120] to-[#1b160a] shadow-[0_20px_80px_rgba(251,191,36,0.08)] hover:-translate-y-1 hover:shadow-[0_25px_90px_rgba(251,191,36,0.14)]"
          : "border border-white/10 bg-white/[0.04] shadow-[0_20px_60px_rgba(0,0,0,0.22)] hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-white/[0.05]"
      }`}
    >
      {isPremium && (
        <>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.12),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.08),transparent_28%)]" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-amber-300/10 blur-3xl transition-opacity duration-300 group-hover:opacity-100" />
        </>
      )}

      {badge && (
        <div
          className={`absolute right-5 top-5 z-20 inline-flex items-center rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] ${
            isPremium
              ? "border border-amber-200/20 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-black shadow-lg shadow-amber-400/20"
              : "bg-gradient-to-r from-cyan-500 to-violet-600 text-white"
          }`}
        >
          {badge}
        </div>
      )}

      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-6 flex items-start gap-4 pr-20">
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${
              isPremium
                ? "bg-amber-400/12 text-amber-300 ring-1 ring-amber-300/10"
                : "bg-cyan-500/12 text-cyan-300 ring-1 ring-cyan-400/10"
            }`}
          >
            <Icon className="h-7 w-7" />
          </div>

          <div className="min-w-0">
            <h4 className="text-3xl font-extrabold tracking-tight text-white">
              {title}
            </h4>
            <p
              className={`mt-1 text-base ${
                isPremium ? "text-amber-100/65" : "text-white/55"
              }`}
            >
              {subtitle}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex flex-wrap items-end gap-2">
            <span
              className={`text-5xl font-black leading-none ${
                isPremium
                  ? "bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent"
                  : "text-white"
              }`}
            >
              {price}
            </span>

            {priceSuffix && (
              <span className="pb-1 text-lg text-white/45">{priceSuffix}</span>
            )}
          </div>

          {isPremium && (
            <p className="mt-3 text-sm leading-6 text-amber-100/60">
              Unlock advanced AI guidance, premium reports, and multilingual text analysis.
            </p>
          )}
        </div>

        <div
          className={`mb-7 h-px w-full ${
            isPremium
              ? "bg-gradient-to-r from-transparent via-amber-300/20 to-transparent"
              : "bg-gradient-to-r from-transparent via-white/10 to-transparent"
          }`}
        />

        <div className="flex-1 space-y-4">
          {features.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3.5">
              <CheckCircle2
                className={`mt-0.5 h-5 w-5 shrink-0 ${
                  isPremium ? "text-amber-300" : "text-emerald-400"
                }`}
              />
              <span
                className={`text-[1.05rem] leading-7 ${
                  isPremium ? "text-white/88" : "text-white/80"
                }`}
              >
                {item}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-2">
          <Link
            to={buttonTo}
            className={`inline-flex w-full items-center justify-center rounded-2xl px-5 py-4 text-base font-bold transition-all duration-300 ${
              isPremium
                ? "bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-black shadow-lg shadow-amber-400/20 hover:scale-[1.015] hover:shadow-amber-300/30"
                : "border border-white/15 bg-white/[0.05] text-white hover:bg-white/[0.09]"
            }`}
          >
            {buttonText}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PlanCard;