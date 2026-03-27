import { Link } from "react-router-dom";
import SectionBadge from "../components/common/SectionBadge";
import StatCard from "../components/common/StatCard";
import SectionHeading from "../components/common/SectionHeading";
import FeatureCard from "../components/marketing/FeatureCard";
import InfoPoint from "../components/common/InfoPoint";
import JourneyCard from "../components/marketing/JourneyCard";
import {
  ArrowRight,
  CheckCircle2,
  Crown,
  Brain,
  FileText,
  Briefcase,
  Sparkles,
  ShieldCheck,
  BarChart3,
  Users,
  Zap,
  Mail,
  Instagram,
  Linkedin,
  LayoutDashboard,
  Clock3,
} from "lucide-react";

const freeFeatures = [
  "2 Mock Interviews Per week",
  "Basic AI feedback",
  "Limited Question difficulty",
  "Text-based Answer Analysis",
  "Standard Interview Mode",
  "Interview History (limited)",
];

const premiumFeatures = [
  "Unlimited Mock Interviews",
  "Advanced AI Evaluation",
  "Text-based Smart answer Analysis",
  "Priority Faster AI Processing",
  "Unlimited Saved interview History",
  "Premium Golden dashboard UI",
  "Advanced Pro Interview Flow",
];

const futureWorkFeatures = [
  "Company-specific mock interviews",
  "Resume-based personalized mock",
  "Detailed rubric scoring",
  "Ideal answer comparison",
  "Downloadable PDF report",
];

const coreFeatures = [
  {
    icon: Brain,
    title: "AI-Powered Mock Interviews",
    desc: "Practice realistic technical interviews tailored to your role, difficulty, and stack.",
  },
  {
    icon: BarChart3,
    title: "Smart Performance Insights",
    desc: "Track strengths, weak areas, and improvement trends after every interview session.",
  },
  {
    icon: Briefcase,
    title: "Role-Based Preparation",
    desc: "Prepare for MERN, frontend, backend, full-stack, DSA, and more with focused interview sets.",
  },
  {
    icon: FileText,
    title: "Session-Based Review",
    desc: "Review your completed interview sessions and understand how your performance is improving over time.",
  },
  {
    icon: ShieldCheck,
    title: "Professional Experience",
    desc: "A clean and distraction-free platform designed to simulate real interview practice.",
  },
  {
    icon: Users,
    title: "Built for Students & Job Seekers",
    desc: "Perfect for freshers, placement prep, internships, and real-world interview readiness.",
  },
];

const freeDashboardPoints = [
  "Simple interview dashboard",
  "2 mock interviews per week",
  "Basic AI feedback",
  "Limited history view",
  "Clean beginner-friendly interface",
];

const proDashboardPoints = [
  "Premium golden dashboard UI",
  "Unlimited mock interviews",
  "Advanced AI review experience",
  "Rich session history",
  "Pro interview + Pro review flow",
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#060816] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-28 left-[-120px] h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute top-[20%] right-[-100px] h-96 w-96 rounded-full bg-violet-600/15 blur-3xl" />
        <div className="absolute bottom-[-100px] left-[30%] h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#060816]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-violet-600 to-amber-400 shadow-lg shadow-cyan-500/20">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide">
                <span className="text-cyan-400">Prep</span>
                <span className="text-violet-400">Pilot</span> AI
              </h1>
              <p className="text-xs text-white/50">
                AI Interview Preparation Platform
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-white/70 transition hover:text-white">
              Features
            </a>
            <a href="#plans" className="text-sm text-white/70 transition hover:text-white">
              Plans
            </a>
            <a href="#dashboard-preview" className="text-sm text-white/70 transition hover:text-white">
              Dashboard
            </a>
            <a href="#future-work" className="text-sm text-white/70 transition hover:text-white">
              Future Work
            </a>
            <a href="#footer" className="text-sm text-white/70 transition hover:text-white">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-white/85 transition hover:border-cyan-400/40 hover:bg-white/5 md:inline-flex"
            >
              Login
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.02]"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 md:pt-24">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <div className="mb-5">
              <SectionBadge color="cyan">
                Smarter interview prep for students and developers
              </SectionBadge>
            </div>

            <h2 className="max-w-3xl text-4xl font-extrabold leading-tight text-white md:text-6xl">
              Crack interviews with{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-400 bg-clip-text text-transparent">
                AI-powered
              </span>{" "}
              practice and feedback
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 md:text-lg">
              PrepPilot AI helps you prepare with mock interviews, role-based
              questions, instant evaluation, and premium guidance designed to
              improve your confidence and performance.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.02]"
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>

              <a
                href="#plans"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 font-semibold text-white/90 transition hover:border-white/30 hover:bg-white/10"
              >
                View Plans
              </a>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-4">
              <StatCard value="2x" label="Faster prep flow" valueColor="cyan" />
              <StatCard value="AI" label="Personalized insights" valueColor="violet" />
              <StatCard value="24/7" label="Practice anytime" valueColor="emerald" />
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="absolute inset-0 m-auto hidden h-[420px] w-[420px] rounded-full bg-amber-400/10 blur-3xl lg:block" />

            <div className="relative w-full max-w-[530px] rounded-[30px] border border-white/10 bg-white/[0.05] p-4 shadow-2xl backdrop-blur-xl">
              <div className="overflow-hidden rounded-[26px] border border-white/10 bg-[#0b1020]">
                <img
                  src="/hero-coder-square.png"
                  alt="PrepPilot AI hero visual"
                  className="h-[360px] w-full object-cover sm:h-[430px] lg:h-[500px]"
                />
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-[#0c1227] p-4">
                  <p className="text-sm text-white/50">PrepPilot AI</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    2 mock interviews per week, get AI evaluation
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 shadow-lg shadow-amber-400/10">
                  <p className="text-sm text-amber-200/70">PrepPilot AI Pro</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    Unlimited practice, advanced review, premium dashboard
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeading
          badge="Features"
          badgeColor="cyan"
          title="Everything you need to prepare like a pro"
          description="Built to give you focused practice, smarter analysis, and a polished interview preparation experience."
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {coreFeatures.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              desc={feature.desc}
            />
          ))}
        </div>
      </section>

      <section id="plans" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
            Pricing & Access
          </p>
          <h3 className="text-3xl font-bold md:text-4xl">
            Start free, upgrade when you want more
          </h3>
          <p className="mt-4 text-white/65">
            Free plan is great to begin. Premium is built for serious interview
            preparation.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-8 backdrop-blur-md">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-500/15 p-3 text-cyan-300">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-2xl font-bold">Free Plan</h4>
                <p className="text-white/55">Best for getting started</p>
              </div>
            </div>

            <div className="mb-8">
              <span className="text-4xl font-extrabold">₹0</span>
              <span className="ml-2 text-white/50">/ month</span>
            </div>

            <div className="space-y-4">
              {freeFeatures.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400" />
                  <span className="text-white/80">{item}</span>
                </div>
              ))}
            </div>

            <Link
              to="/login"
              className="mt-8 inline-flex w-full items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-5 py-3.5 font-semibold text-white transition hover:bg-white/10"
            >
              Start for Free
            </Link>
          </div>

          <div className="relative rounded-[30px] border border-amber-300/30 bg-gradient-to-br from-amber-400/10 via-[#0d1120] to-yellow-400/10 p-8 shadow-2xl shadow-amber-400/10 backdrop-blur-md">
            <div className="absolute right-6 top-6 rounded-full border border-amber-300/20 bg-gradient-to-r from-amber-300 to-yellow-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-black shadow-lg shadow-amber-400/20">
              Most Popular
            </div>

            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-amber-400/15 p-3 text-amber-300">
                <Crown className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-2xl font-bold">Premium Plan</h4>
                <p className="text-amber-100/60">For serious preparation</p>
              </div>
            </div>

            <div className="mb-8">
              <span className="text-4xl font-extrabold bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                Upgrade
              </span>
              <span className="ml-2 text-white/50">to unlock full power</span>
            </div>

            <div className="space-y-4">
              {premiumFeatures.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-amber-300" />
                  <span className="text-white/85">{item}</span>
                </div>
              ))}
            </div>

            <Link
              to="/upgrade"
              className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 px-5 py-3.5 font-semibold text-black shadow-lg shadow-amber-400/20 transition hover:scale-[1.01]"
            >
              Upgrade Plan
            </Link>
          </div>
        </div>
      </section>

      <section id="dashboard-preview" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            Dashboard Experience
          </p>
          <h3 className="text-3xl font-bold md:text-4xl">
            Two dashboards, built for different stages
          </h3>
          <p className="mt-4 text-white/65">
            Start with the free dashboard for core practice, then unlock the
            premium Pro dashboard for a more advanced, polished, and unlimited
            preparation experience.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-500/15 p-3 text-cyan-300">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-2xl font-bold">Free Dashboard</h4>
                <p className="text-white/55">Simple, clean, and beginner-friendly</p>
              </div>
            </div>

            <div className="mb-6 overflow-hidden rounded-[24px] border border-white/10 bg-[#0b1020]">
              <img
                src="/free-dashboard-preview.png"
                alt="PrepPilot AI free dashboard preview"
                className="h-[300px] w-full object-cover"
              />
            </div>

            <div className="space-y-4">
              {freeDashboardPoints.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-400" />
                  <span className="text-white/80">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative rounded-[30px] border border-amber-300/25 bg-gradient-to-br from-amber-400/10 via-[#0d1120] to-yellow-400/10 p-8 shadow-2xl shadow-amber-400/10 backdrop-blur-xl">
            <div className="absolute right-6 top-6 rounded-full border border-amber-300/20 bg-gradient-to-r from-amber-300 to-yellow-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-black shadow-lg shadow-amber-400/20">
              Premium UI
            </div>

            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-amber-400/15 p-3 text-amber-300">
                <Crown className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-2xl font-bold">Pro Dashboard</h4>
                <p className="text-amber-100/60">
                  Premium golden interface with advanced flow
                </p>
              </div>
            </div>

            <div className="mb-6 overflow-hidden rounded-[24px] border border-amber-300/20 bg-[#0b1020]">
              <img
                src="/pro-dashboard-preview.png"
                alt="PrepPilot AI Pro dashboard preview"
                className="h-[300px] w-full object-cover"
              />
            </div>

            <div className="space-y-4">
              {proDashboardPoints.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-amber-300" />
                  <span className="text-white/85">{item}</span>
                </div>
              ))}
            </div>

            <Link
              to="/upgrade"
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 px-5 py-3.5 font-semibold text-black shadow-lg shadow-amber-400/20 transition hover:scale-[1.01]"
            >
              Explore Pro Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section id="future-work" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
            Future Work
          </p>
          <h3 className="text-3xl font-bold md:text-4xl">
            More premium capabilities planned ahead
          </h3>
          <p className="mt-4 text-white/65">
            These advanced features are part of the future roadmap and will be
            added in upcoming versions of PrepPilot AI Pro.
          </p>
        </div>

        <div className="rounded-[30px] border border-amber-300/15 bg-gradient-to-br from-amber-400/10 via-[#0d1120] to-yellow-400/10 p-8 shadow-xl shadow-amber-400/10 backdrop-blur-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-amber-400/15 p-3 text-amber-300">
              <Clock3 className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-2xl font-bold">Upcoming Premium Roadmap</h4>
              <p className="text-amber-100/60">
                Planned advanced features for future releases
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {futureWorkFeatures.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-4"
              >
                <Sparkles className="mt-0.5 h-5 w-5 text-amber-300" />
                <span className="text-white/85">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="why-us" className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              badge="Why PrepPilot AI"
              badgeColor="cyan"
              title="More than mock interviews — a complete preparation experience"
              description="Instead of random practice, PrepPilot AI gives you a focused preparation system. Start with free practice, then unlock premium analytics and advanced interview experiences when you are ready."
              center={false}
            />

            <div className="mt-8 space-y-5">
              <InfoPoint
                title="Structured improvement"
                description="Every interview helps you understand what to improve next."
                color="cyan"
              />

              <InfoPoint
                title="Clear free vs premium value"
                description="Free users get real value, and premium users get stronger advanced analysis."
                color="violet"
              />

              <InfoPoint
                title="Professional product feel"
                description="Clean UI, modern design, and focused experience that feels production-ready."
                color="emerald"
              />
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <div className="grid gap-5">
              <JourneyCard
                label="Free user journey"
                title="Practice → Basic feedback → Upgrade trigger"
                theme="default"
              />

              <JourneyCard
                label="Premium user journey"
                title="Unlimited interviews → Advanced review → Better interview confidence"
                theme="premium"
              />

              <JourneyCard
                label="Future roadmap"
                title="More advanced premium capabilities planned for upcoming releases"
                theme="default"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-[34px] border border-white/10 bg-gradient-to-r from-cyan-500/10 via-white/5 to-violet-500/10 p-10 text-center backdrop-blur-xl md:p-14">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            Ready to begin?
          </p>
          <h3 className="text-3xl font-bold md:text-5xl">
            Start your Interview Prep Journey Today
          </h3>
          <p className="mx-auto mt-5 max-w-2xl text-white/65">
            Practice smarter, track your growth, and unlock advanced AI guidance
            when you need more than just mock questions.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.02]"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#plans"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 font-semibold text-white/90 transition hover:bg-white/10"
            >
              Compare Plans
            </a>
          </div>
        </div>
      </section>

      <footer id="footer" className="border-t border-white/10 bg-black/20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-violet-600 to-amber-400">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-bold">
                  <span className="text-cyan-400">Prep</span>
                  <span className="text-violet-400">Pilot</span> AI
                </h4>
                <p className="text-sm text-white/50">
                  Prepare smarter. Perform better.
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-xl leading-7 text-white/60">
              An AI-powered interview preparation platform built to help users
              practice, improve, and gain confidence with structured mock
              interviews and smart feedback.
            </p>
          </div>

          <div>
            <h5 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
              Quick Links
            </h5>
            <div className="space-y-3 text-white/60">
              <a href="#features" className="block transition hover:text-white">
                Features
              </a>
              <a href="#plans" className="block transition hover:text-white">
                Plans
              </a>
              <a href="#dashboard-preview" className="block transition hover:text-white">
                Dashboard
              </a>
              <a href="#future-work" className="block transition hover:text-white">
                Future Work
              </a>
              <Link to="/login" className="block transition hover:text-white">
                Login
              </Link>
            </div>
          </div>

          <div>
            <h5 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
              Contact
            </h5>
            <div className="space-y-3 text-white/60">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> support@preppilotai.com
              </p>
              <p className="flex items-center gap-2">
                <Instagram className="h-4 w-4" /> @preppilotai
              </p>
              <p className="flex items-center gap-2">
                <Linkedin className="h-4 w-4" /> PrepPilot AI
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 px-6 py-5 text-center text-sm text-white/45">
          © 2026 PrepPilot AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}