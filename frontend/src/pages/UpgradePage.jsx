import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { setUser } from "../features/auth/authSlice";

import {
  ArrowRight,
  Crown,
  CheckCircle2,
  Sparkles,
  FileText,
  Brain,
  Briefcase,
  BarChart3,
  Clock3,
} from "lucide-react";

const premiumFeatures = [
  "Unlimited mock interviews",
  "Advanced AI evaluation",
  "Text-based smart answer analysis",
  "Priority faster AI processing",
  "Unlimited saved interview history",
  "Premium golden dashboard UI",
  "Advanced Pro interview and review flow",
];

const futureWorkFeatures = [
  "Company-specific mock interviews",
  "Resume-based personalized mock",
  "Detailed rubric scoring",
  "Ideal answer comparison",
  "Downloadable PDF report",
];

const comparisonRows = [
  { feature: "Mock interviews", free: "2 per week", pro: "Unlimited" },
  { feature: "AI feedback", free: "Basic", pro: "Advanced deep evaluation" },
  { feature: "Answer analysis", free: "English only", pro: "English + Hindi + Gujarati" },
  { feature: "Interview history", free: "Limited", pro: "Unlimited" },
  { feature: "Dashboard experience", free: "Standard", pro: "Premium UI" },
  { feature: "Processing priority", free: "Standard", pro: "Faster priority flow" },
];

const highlightCards = [
  {
    icon: Brain,
    title: "Advanced AI Evaluation",
    desc: "Get deeper insights, stronger answer analysis, and a more polished review experience.",
  },
  {
    icon: FileText,
    title: "Premium Review Flow",
    desc: "Access a richer interview review experience with premium UI and improved session tracking.",
  },
  {
    icon: Briefcase,
    title: "Unlimited Practice",
    desc: "Practice without weekly limits and build stronger confidence with more repetitions.",
  },
  {
    icon: BarChart3,
    title: "Track Real Growth",
    desc: "Save unlimited history and measure your progress across interview sessions.",
  },
];

function UpgradePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const existingScript = document.getElementById("razorpay-script");
      if (existingScript) {
        existingScript.onload = () => resolve(true);
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpaySuccess = async (response, user) => {
    try {
      const { data } = await axios.post(
        `${API_BASE}/payments/verify`,
        {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          amount: 499,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const updatedUser = data.user;

      localStorage.setItem("user", JSON.stringify(updatedUser));
      dispatch(setUser(updatedUser));

      toast.success("Payment successful. Pro activated.");
      navigate("/pro-dashboard");
    } catch (err) {
      console.error("VERIFY ERROR:", err?.response?.data || err.message);
      toast.error(
        err?.response?.data?.message || "Payment verified nahi thayu"
      );
    }
  };

  const handlePayment = async () => {
    try {
      setLoading(true);

      const user = JSON.parse(localStorage.getItem("user"));

      if (!user || !user.token) {
        toast.error("Please login first");
        navigate("/login");
        return;
      }

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        toast.error("Razorpay SDK load nahi thayu");
        return;
      }

      const { data } = await axios.post(
        `${API_BASE}/payments/create-order`,
        { amount: 499 },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const order = data.order || data;

      if (!order?.id || !order?.amount) {
        console.error("INVALID ORDER RESPONSE:", data);
        toast.error("Order create response invalid che");
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "PrepPilot AI Pro",
        description: "Upgrade to Pro",
        order_id: order.id,
        handler: async function (response) {
          await handleRazorpaySuccess(response, user);
        },
        prefill: {
          name: user.name || "",
          email: user.email || "",
        },
        theme: {
          color: "#facc15",
        },
        modal: {
          ondismiss: function () {
            toast.info("Payment popup closed");
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        console.error("RAZORPAY PAYMENT FAILED:", response.error);
        toast.error(response?.error?.description || "Payment Failed");
      });

      rzp.open();
    } catch (err) {
      console.error("PAYMENT START ERROR:", err?.response?.data || err.message);
      toast.error(err?.response?.data?.message || "Payment Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060816] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-120px] top-[-80px] h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute right-[-120px] top-[15%] h-96 w-96 rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="absolute bottom-[-120px] left-[25%] h-80 w-80 rounded-full bg-orange-400/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 border-b border-amber-300/10 bg-[#060816]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 shadow-lg shadow-amber-400/20">
              <Brain className="h-6 w-6 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide">
                <span className="text-white">PrepPilot AI</span>{" "}
                <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                  Pro
                </span>
              </h1>
              <p className="text-xs text-white/45">Upgrade your interview preparation</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/5"
            >
              Back Home
            </Link>
            <button
              onClick={handlePayment}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 px-5 py-2.5 text-sm font-semibold text-black shadow-lg shadow-amber-400/20 transition hover:scale-[1.02] disabled:opacity-60"
            >
              {loading ? "Please wait..." : "Upgrade Now"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-7xl px-6 py-16">
        <section className="mx-auto max-w-7xl px-6 pb-16 pt-6 md:pt-10">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-400/10 px-4 py-2 text-sm text-amber-300">
                <Sparkles className="h-4 w-4" />
                Full premium interview preparation
              </div>

              <h2 className="max-w-3xl text-4xl font-extrabold leading-tight md:text-6xl">
                Unlock the full power of{" "}
                <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                  PrepPilot AI Pro
                </span>
              </h2>

              <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 md:text-lg">
                Practice smarter with unlimited mock interviews, advanced AI evaluation,
                multilingual answer analysis, and serious tools built for serious candidates.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 px-6 py-3.5 font-semibold text-black shadow-lg shadow-amber-400/20 transition hover:scale-[1.02] disabled:opacity-60"
                >
                  {loading ? "Processing..." : "Upgrade to Pro"}
                  <ArrowRight className="h-4 w-4" />
                </button>

                <a
                  href="#comparison"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 font-semibold text-white/90 transition hover:bg-white/10"
                >
                  Compare Plans
                </a>
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <div className="absolute inset-0 m-auto hidden h-[420px] w-[420px] rounded-full bg-amber-400/10 blur-3xl lg:block" />

              <div className="relative w-full max-w-[520px] rounded-[30px] border border-amber-300/20 bg-gradient-to-br from-[#18130b] via-[#0c1020] to-[#1a140b] p-4 shadow-2xl shadow-amber-400/10 backdrop-blur-xl">
                <div className="overflow-hidden rounded-[26px] border border-amber-300/10 bg-[#0b1020]">
                  <img
                    src="/hero-coder-square1.png"
                    alt="PrepPilot AI Pro visual"
                    className="h-[360px] w-full object-cover sm:h-[420px] lg:h-[480px]"
                  />
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-[#0c1227] p-4">
                    <p className="text-sm text-white/50">Free Plan</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      2 interviews/week + basic AI feedback
                    </p>
                  </div>

                  <div className="rounded-2xl border border-amber-300/25 bg-gradient-to-br from-amber-400/15 to-yellow-400/10 p-4 shadow-lg shadow-amber-400/10">
                    <p className="text-sm text-amber-200/70">PrepPilot AI Pro</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      Unlimited practice, premium UI, advanced review
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="relative overflow-hidden rounded-[36px] border border-amber-300/20 bg-gradient-to-br from-[#18130b] via-[#0c1020] to-[#1a140b] p-8 shadow-[0_20px_80px_rgba(251,191,36,0.10)] backdrop-blur-xl md:p-10">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-amber-300/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-yellow-500/10 blur-3xl" />

            <div className="relative z-10 grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
              <div>
                <div className="mb-4 inline-flex rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
                  Most Popular
                </div>

                <h3 className="text-3xl font-black md:text-5xl">
                  PrepPilot AI Pro
                </h3>
                <p className="mt-4 max-w-xl text-white/65">
                  Built for students, freshers, interns, and developers who want stronger
                  interview answers and real improvement.
                </p>

                <div className="mt-8">
                  <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-5xl font-black text-transparent">
                    Upgrade
                  </span>
                  <p className="mt-2 text-lg text-white/50">Unlock full premium access</p>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <div className="rounded-full border border-amber-300/20 bg-amber-400/10 px-4 py-2 text-sm text-amber-300">
                    Unlimited interviews
                  </div>
                  <div className="rounded-full border border-amber-300/20 bg-amber-400/10 px-4 py-2 text-sm text-amber-300">
                    Premium dashboard
                  </div>
                  <div className="rounded-full border border-amber-300/20 bg-amber-400/10 px-4 py-2 text-sm text-amber-300">
                    Multilingual analysis
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 px-6 py-3.5 font-bold text-black shadow-lg shadow-amber-400/20 transition hover:scale-[1.02] disabled:opacity-60"
                >
                  {loading ? "Please wait..." : "Continue to Upgrade"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="rounded-[28px] border border-amber-300/15 bg-black/20 p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300/25 via-yellow-400/20 to-amber-500/20 text-amber-300 ring-1 ring-amber-300/20 shadow-lg shadow-amber-400/10">
                    <Brain className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-white">Everything included</h4>
                    <p className="text-white/45">Premium features unlocked</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {premiumFeatures.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                      <span className="text-white/85">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
              Why Upgrade
            </p>
            <h3 className="text-3xl font-bold md:text-4xl">
              Premium tools for real interview growth
            </h3>
            <p className="mt-4 text-white/65">
              PrepPilot AI Pro is designed for users who want more than basic practice.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {highlightCards.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="rounded-3xl border border-amber-300/10 bg-gradient-to-br from-white/[0.04] to-amber-400/[0.04] p-6 backdrop-blur-md transition hover:-translate-y-1 hover:border-amber-300/25"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300/25 via-yellow-400/20 to-amber-500/20 text-amber-300 ring-1 ring-amber-300/20 shadow-lg shadow-amber-400/10">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="text-xl font-semibold">{item.title}</h4>
                  <p className="mt-3 leading-7 text-white/65">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section id="comparison" className="mt-20">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
              Free vs Pro
            </p>
            <h3 className="text-3xl font-bold md:text-4xl">
              See what changes when you upgrade
            </h3>
          </div>

          <div className="overflow-hidden rounded-[30px] border border-white/10 bg-white/5 backdrop-blur-xl">
            <div className="grid grid-cols-3 border-b border-white/10 bg-white/[0.03]">
              <div className="p-5 font-bold text-white">Feature</div>
              <div className="p-5 font-bold text-cyan-300">Free</div>
              <div className="bg-amber-400/10 p-5 font-bold text-amber-300">Pro</div>
            </div>

            {comparisonRows.map((row, index) => (
              <div
                key={index}
                className="grid grid-cols-3 border-b border-white/10 last:border-b-0"
              >
                <div className="p-5 text-white/85">{row.feature}</div>
                <div className="p-5 text-white/60">{row.free}</div>
                <div className="bg-amber-400/[0.04] p-5 text-amber-100/90">{row.pro}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <div className="rounded-[32px] border border-amber-300/15 bg-gradient-to-br from-amber-400/10 via-[#0d1120] to-yellow-400/10 p-8 shadow-xl shadow-amber-400/10 backdrop-blur-xl md:p-10">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-amber-400/15 p-3 text-amber-300">
                <Clock3 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Future Work</h3>
                <p className="text-amber-100/60">
                  Advanced premium features planned for future versions
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

        <section className="mt-20">
          <div className="rounded-[34px] border border-amber-300/15 bg-gradient-to-r from-amber-400/10 via-white/[0.03] to-yellow-400/10 p-10 text-center backdrop-blur-xl md:p-14">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
              Ready to unlock more?
            </p>
            <h3 className="text-3xl font-bold md:text-5xl">
              Upgrade and prepare like a serious candidate
            </h3>
            <p className="mx-auto mt-5 max-w-2xl text-white/65">
              Get unlimited practice, better analysis, and a premium experience that helps you
              improve faster.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                onClick={handlePayment}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 px-6 py-3.5 font-bold text-black shadow-lg shadow-amber-400/20 transition hover:scale-[1.02] disabled:opacity-60"
              >
                {loading ? "Please wait..." : "Upgrade to Pro"}
                <ArrowRight className="h-4 w-4" />
              </button>

              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 font-semibold text-white/90 transition hover:bg-white/10"
              >
                Maybe Later
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default UpgradePage;