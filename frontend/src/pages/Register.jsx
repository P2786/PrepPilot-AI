import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { register, reset } from "../features/auth/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Brain,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BarChart3,
} from "lucide-react";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password2: "",
  });

  const { name, email, password, password2 } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

useEffect(() => {
  if (isError) {
    toast.error(message);
    dispatch(reset());
  }

  if (isSuccess) {
    toast.success("User Registered Successfully");
    navigate(user?.isPro ? "/pro-dashboard" : "/dashboard");
    dispatch(reset());
  }

  if (user && !isSuccess) {
    navigate("/dashboard");
  }
}, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (password !== password2) {
      toast.error("Passwords do not match");
      return;
    }

    dispatch(
      register({
        name,
        email,
        password,
      })
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#060816]">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060816] px-4 py-6 text-white sm:py-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 left-[-120px] h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute right-[-120px] top-[20%] h-96 w-96 rounded-full bg-violet-600/15 blur-3xl" />
        <div className="absolute bottom-[-100px] left-[35%] h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl lg:grid-cols-2">
          {/* Left form */}
          <div className="bg-[#081126]/80 p-6 sm:p-10 lg:p-12">
            <div className="mx-auto max-w-xl">
              <Link to="/" className="mb-8 flex items-center gap-3 lg:hidden">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 shadow-lg shadow-cyan-500/20">
                  <Brain className="h-6 w-6 text-white" />
                </div>

                <h1 className="text-2xl font-black tracking-wide">
                  <span className="text-cyan-400">Prep</span>
                  <span className="text-violet-400">Pilot</span> AI
                </h1>
              </Link>

              <div className="mb-8">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.28em] text-cyan-400">
                  Sign Up
                </p>
                <h2 className="text-4xl font-black leading-tight text-white sm:text-5xl">
                  Get <span className="text-violet-400">Started</span>
                </h2>
                <p className="mt-4 max-w-lg text-base leading-7 text-white/60">
                  Create your account and start practicing with AI-powered mock
                  interviews and smart feedback.
                </p>
              </div>

              <form onSubmit={onSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-[0.25em] text-white/45">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={name}
                    onChange={onChange}
                    placeholder="Your name"
                    className="w-full rounded-2xl border border-white/10 bg-[#050b1d] px-5 py-4 text-base text-white outline-none transition placeholder:text-white/25 focus:border-cyan-400/35 focus:ring-2 focus:ring-cyan-400/15"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-[0.25em] text-white/45">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    placeholder="you@example.com"
                    className="w-full rounded-2xl border border-white/10 bg-[#050b1d] px-5 py-4 text-base text-white outline-none transition placeholder:text-white/25 focus:border-cyan-400/35 focus:ring-2 focus:ring-cyan-400/15"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="ml-1 text-[10px] font-black uppercase tracking-[0.25em] text-white/45">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={password}
                      onChange={onChange}
                      placeholder="********"
                      className="w-full rounded-2xl border border-white/10 bg-[#050b1d] px-5 py-4 text-base text-white outline-none transition placeholder:text-white/25 focus:border-cyan-400/35 focus:ring-2 focus:ring-cyan-400/15"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="ml-1 text-[10px] font-black uppercase tracking-[0.25em] text-white/45">
                      Confirm
                    </label>
                    <input
                      type="password"
                      name="password2"
                      value={password2}
                      onChange={onChange}
                      placeholder="********"
                      className="w-full rounded-2xl border border-white/10 bg-[#050b1d] px-5 py-4 text-base text-white outline-none transition placeholder:text-white/25 focus:border-cyan-400/35 focus:ring-2 focus:ring-cyan-400/15"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-4 text-lg font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01] active:scale-[0.98]"
                >
                  Create My Account <ArrowRight className="h-5 w-5" />
                </button>
              </form>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-white/60">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-bold text-cyan-400 transition hover:underline"
                  >
                    Sign In
                  </Link>
                </p>

                <Link
                  to="/"
                  className="text-sm font-semibold text-white/55 transition hover:text-white"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>

          {/* Right branding */}
          <div className="relative hidden border-l border-white/10 bg-gradient-to-br from-cyan-500/10 via-transparent to-violet-500/10 p-10 lg:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.12),transparent_30%)]"></div>

            <div className="relative flex h-full flex-col justify-start">
              <div className="mb-12 flex items-center gap-5">
                <Link to="/" className="inline-flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 shadow-lg shadow-cyan-500/20">
                    <Brain className="h-7 w-7 text-white" />
                  </div>

                  <h1 className="text-3xl font-black tracking-wide">
                    <span className="text-cyan-400">Prep</span>
                    <span className="text-violet-400">Pilot</span> AI
                  </h1>
                </Link>

                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
                  <Sparkles className="h-4 w-4" />
                  Join Now
                </div>
              </div>

              <h2 className="max-w-xl text-6xl font-black leading-[1.02] text-white">
                Start your
                <br />
                journey with
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500 bg-clip-text text-transparent">
                  AI interview prep
                </span>
              </h2>

              <p className="mt-10 max-w-xl text-lg leading-8 text-white/65">
                Build confidence, practice smarter, and prepare for real
                interviews with a clean AI-powered experience.
              </p>

              <div className="mt-14 grid max-w-xl grid-cols-3 gap-5">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                  <div className="mb-4 inline-flex rounded-2xl bg-cyan-500/15 p-3 text-cyan-300">
                    <Brain className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
                    AI Mock
                  </p>
                  <p className="mt-3 text-sm font-semibold leading-6 text-white">
                    Role-based prep
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                  <div className="mb-4 inline-flex rounded-2xl bg-violet-500/15 p-3 text-violet-300">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
                    Insights
                  </p>
                  <p className="mt-3 text-sm font-semibold leading-6 text-white">
                    Clear progress
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                  <div className="mb-4 inline-flex rounded-2xl bg-emerald-500/15 p-3 text-emerald-300">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
                    Secure
                  </p>
                  <p className="mt-3 text-sm font-semibold leading-6 text-white">
                    Safe onboarding
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;