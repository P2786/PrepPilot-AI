import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout, reset } from "../features/auth/authSlice";
import { Brain } from "lucide-react";

const ProHeader = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const onLogout = async () => {
    await dispatch(logout());
    dispatch(reset());
    setIsMenuOpen(false);
    navigate("/", { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `text-sm font-semibold transition ${
      isActive(path) ? "text-amber-300" : "text-white/70 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-amber-300/10 bg-[#07040a]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          to={user ? "/pro-dashboard" : "/"}
          className="flex items-center gap-3"
          onClick={() => setIsMenuOpen(false)}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-400 shadow-lg shadow-amber-400/20">
            <Brain className="h-6 w-6 text-black" />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-wide text-white">
              <span className="text-amber-300">PrepPilot</span>{" "}
              <span className="text-white">AI</span>{" "}
              <span className="bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
                Pro
              </span>
            </h1>
            <p className="text-xs text-white/50">
              Pro Interview Preparation Platform
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {user ? (
            <>
              <Link
                to="/pro-dashboard"
                className={navLinkClass("/pro-dashboard")}
              >
                Dashboard
              </Link>

              <Link to="/pro-profile" className={navLinkClass("/profile")}>
                Profile
              </Link>

              <div className="flex items-center gap-2 rounded-full border border-amber-300/10 bg-white/5 px-4 py-2">
                <div className="h-2.5 w-2.5 rounded-full bg-amber-400"></div>
                <span className="text-sm font-semibold text-white">
                  {user?.name?.split(" ")[0]}
                </span>
              </div>

              <button
                onClick={onLogout}
                className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/" className={navLinkClass("/")}>
                Home
              </Link>

              <Link to="/login" className={navLinkClass("/login")}>
                Login
              </Link>

              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400 px-5 py-2.5 text-sm font-semibold text-black shadow-lg shadow-amber-400/20 transition hover:scale-[1.02]"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>

        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="rounded-lg border border-amber-300/10 bg-white/5 p-2 text-white/70 transition hover:text-amber-300 md:hidden"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-amber-300/10 bg-[#07040a]/95 backdrop-blur-xl md:hidden">
          <div className="space-y-4 px-6 py-6">
            {user ? (
              <>
                <div className="mb-4 flex items-center gap-3 rounded-2xl border border-amber-300/10 bg-white/5 p-4">
                  <div className="h-3 w-3 rounded-full bg-amber-400"></div>
                  <span className="text-lg font-bold text-white">
                    {user?.name}
                  </span>
                </div>

                <Link
                  to="/pro-dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block py-3 text-base font-semibold ${
                    isActive("/pro-dashboard")
                      ? "text-amber-300"
                      : "text-white/70"
                  }`}
                >
                  Dashboard
                </Link>

                <Link
                  to="/pro-profile"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block py-3 text-base font-semibold ${
                    isActive("/profile") ? "text-amber-300" : "text-white/70"
                  }`}
                >
                  Profile
                </Link>

                <button
                  onClick={onLogout}
                  className="w-full rounded-2xl bg-red-500 py-3 text-sm font-bold text-white transition hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block py-3 text-base font-semibold ${
                    isActive("/") ? "text-amber-300" : "text-white/70"
                  }`}
                >
                  Home
                </Link>

                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block py-3 text-base font-semibold ${
                    isActive("/login") ? "text-amber-300" : "text-white/70"
                  }`}
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="block rounded-2xl bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400 py-3 text-center text-sm font-bold text-black"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default ProHeader;