import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { updateProfile, reset } from "../features/auth/authSlice";
import {
  User,
  Mail,
  Briefcase,
  Crown,
  Sparkles,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

const ROLES = [
  "MERN Stack Developer",
  "MEAN Stack Developer",
  "Full Stack Python",
  "Full Stack Java",
  "Frontend Developer",
  "Backend Developer",
  "Data Scientist",
  "Data Analyst",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Cloud Engineer (AWS/Azure/GCP)",
  "Cybersecurity Engineer",
  "Blockchain Developer",
  "Mobile Developer (iOS/Android)",
  "Game Developer",
  "UI/UX Designer",
  "QA Automation Engineer",
  "Product Manager",
];

const inputBase =
  "w-full rounded-2xl border border-white/10 bg-[#0b1228] px-4 py-3.5 text-base font-semibold text-white outline-none transition placeholder:text-white/25 focus:border-cyan-400/35 focus:ring-2 focus:ring-cyan-400/15";

const Profile = () => {
  const dispatch = useDispatch();
  const { user, isSuccess, isError, message, isProfileLoading } = useSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    preferredRole: user?.preferredRole || ROLES[0],
  });

  const planLabel = user?.plan
    ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1)
    : "Free";

  const weeklyUsed = user?.usage?.weeklyInterviewCount ?? 0;
  const weeklyLeft =
    user?.usage?.weeklyInterviewRemaining !== undefined &&
    user?.usage?.weeklyInterviewRemaining !== null
      ? user.usage.weeklyInterviewRemaining
      : 2;

  useEffect(() => {
    if (!isError && !isSuccess) return;

    if (isError) toast.error(message);
    if (isSuccess) toast.success("Profile updated successfully");

    dispatch(reset());
  }, [isError, isSuccess, message, dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        preferredRole: user?.preferredRole || ROLES[0],
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      formData.name === (user?.name || "") &&
      formData.preferredRole === (user?.preferredRole || "")
    ) {
      toast.info("No changes to save.");
      return;
    }

    dispatch(updateProfile(formData));
  };

  return (
    <div className="min-h-screen bg-[#060816] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-28 left-[-120px] h-80 w-80 rounded-full bg-cyan-500/12 blur-3xl" />
        <div className="absolute top-[18%] right-[-100px] h-96 w-96 rounded-full bg-violet-600/12 blur-3xl" />
        <div className="absolute bottom-[-100px] left-[30%] h-80 w-80 rounded-full bg-fuchsia-500/8 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Top Hero */}
        <div className="mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
          <div className="absolute inset-0"></div>

          <div className="relative flex flex-col justify-between gap-8 p-6 sm:p-8 md:p-10 lg:flex-row lg:items-center">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                <Sparkles className="h-4 w-4" />
                Account Settings
              </div>

              <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
                Your{" "}
                <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500 bg-clip-text text-transparent">
                  Profile
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-slate-300 sm:text-lg">
                Manage your account details, preferred interview role, and keep
                your preparation profile up to date.
              </p>
            </div>

            <div className="grid min-w-full gap-4 sm:grid-cols-3 lg:min-w-[430px]">
              <StatCard
                icon={<Crown className="h-5 w-5" />}
                title="Plan"
                value={planLabel}
                tone="violet"
              />
              <StatCard
                icon={<BarChart3 className="h-5 w-5" />}
                title="Used This Week"
                value={String(weeklyUsed)}
                tone="cyan"
              />
              <StatCard
                icon={<ShieldCheck className="h-5 w-5" />}
                title="Interviews Left"
                value={planLabel === "Free" ? String(weeklyLeft) : "∞"}
                tone="emerald"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.35fr]">
          {/* Left Summary */}
          <div className="space-y-8">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500 to-violet-600 shadow-lg shadow-cyan-500/20">
                  <User className="h-8 w-8 text-white" />
                </div>

                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.22em] text-cyan-300">
                    Profile Summary
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-white">
                    {user?.name || "User"}
                  </h2>
                </div>
              </div>

              <div className="space-y-4">
                <InfoRow
                  icon={<Mail className="h-4 w-4" />}
                  label="Email"
                  value={user?.email || "Not available"}
                />
                <InfoRow
                  icon={<Briefcase className="h-4 w-4" />}
                  label="Preferred Role"
                  value={user?.preferredRole || "Not selected"}
                />
                <InfoRow
                  icon={<Crown className="h-4 w-4" />}
                  label="Current Plan"
                  value={planLabel}
                />
              </div>
            </div>

            <div className="rounded-[2rem] border border-violet-400/20 bg-gradient-to-r from-violet-500/10 to-cyan-500/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-violet-300">
                Profile Tips
              </p>
              <h3 className="mt-2 text-2xl font-black text-white">
                Keep your profile optimized
              </h3>
              <p className="mt-3 text-sm leading-7 text-white/65 sm:text-base">
                Your preferred role helps PrepPilot AI generate more relevant
                mock interviews and a better personalized experience.
              </p>

              <div className="mt-6 space-y-3">
                <TipLine text="Choose the role you are actively preparing for." />
                <TipLine text="Keep your name updated for a cleaner account view." />
                <TipLine text="Use your profile as the base for future personalized mocks." />
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl sm:p-8 lg:p-10">
            <header className="mb-8">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.28em] text-cyan-400">
                Edit Details
              </p>
              <h2 className="text-3xl font-black text-white sm:text-4xl">
                Update your profile
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/60 sm:text-base">
                Change your name and preferred role to keep your interview setup
                aligned with your goals.
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
              <FormField label="Full Name">
                <div className="relative">
                  <input
                    type="text"
                    className={`${inputBase} pl-12`}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                  />
                  <FieldIcon>
                    <User className="h-4 w-4" />
                  </FieldIcon>
                </div>
              </FormField>

              <FormField label="Email Address" muted>
                <div className="relative">
                  <input
                    type="email"
                    className="w-full cursor-not-allowed rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 pl-12 text-base font-semibold text-white/50 outline-none"
                    disabled
                    value={formData.email}
                    readOnly
                  />
                  <FieldIcon>
                    <Mail className="h-4 w-4" />
                  </FieldIcon>
                </div>
              </FormField>

              <FormField label="Target Role">
                <div className="relative">
                  <select
                    name="preferredRole"
                    value={formData.preferredRole}
                    onChange={handleChange}
                    className={`${inputBase} appearance-none pl-12 pr-12`}
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role} className="bg-slate-900 text-white">
                        {role}
                      </option>
                    ))}
                  </select>
                  <FieldIcon>
                    <Briefcase className="h-4 w-4" />
                  </FieldIcon>
                  <SelectArrow />
                </div>
              </FormField>

              <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-4">
                <p className="text-sm font-semibold text-cyan-300">
                  Current interview preference
                </p>
                <p className="mt-2 text-sm leading-7 text-white/70">
                  PrepPilot AI will use your selected target role as the default
                  role while creating mock interview sessions.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProfileLoading}
                  className={`flex w-full items-center justify-center gap-3 rounded-2xl py-4 font-bold transition-all active:scale-[0.98] ${
                    isProfileLoading
                      ? "cursor-wait bg-slate-600 text-slate-300"
                      : "bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-lg shadow-cyan-500/20 hover:scale-[1.01]"
                  }`}
                >
                  {isProfileLoading ? <Loader /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

function StatCard({ icon, title, value, tone = "cyan" }) {
  const toneClasses = {
    cyan: "border-cyan-400/15 bg-cyan-400/10 text-cyan-300",
    violet: "border-violet-400/15 bg-violet-400/10 text-violet-300",
    emerald: "border-emerald-400/15 bg-emerald-400/10 text-emerald-300",
  };

  return (
    <div
      className={`rounded-3xl border p-5 backdrop-blur-xl ${
        toneClasses[tone] || toneClasses.cyan
      }`}
    >
      <div className="mb-3 inline-flex rounded-2xl bg-white/10 p-3">
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em]">
        {title}
      </p>
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-2 flex items-center gap-2 text-white/45">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-[0.22em]">
          {label}
        </span>
      </div>
      <p className="text-sm font-semibold leading-6 text-white">{value}</p>
    </div>
  );
}

function TipLine({ text }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-2 h-2 w-2 rounded-full bg-cyan-400"></span>
      <p className="text-sm leading-7 text-white/70">{text}</p>
    </div>
  );
}

function FormField({ label, children, muted }) {
  return (
    <div className={`space-y-2 ${muted ? "opacity-70" : ""}`}>
      <label className="ml-1 text-[10px] font-black uppercase tracking-[0.22em] text-white/45">
        {label}
      </label>
      {children}
    </div>
  );
}

function FieldIcon({ children }) {
  return (
    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35">
      {children}
    </div>
  );
}

function SelectArrow() {
  return (
    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/35">
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>
  );
}

function Loader() {
  return (
    <>
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
      <span>Saving...</span>
    </>
  );
}