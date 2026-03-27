import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout, reset } from "../features/auth/authSlice";
import { Brain } from "lucide-react";

const Header = () => {
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
      isActive(path) ? "text-cyan-400" : "text-white/70 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#060816]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to={user ? "/dashboard" : "/"}
          className="flex items-center gap-3"
          onClick={() => setIsMenuOpen(false)}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 shadow-lg shadow-cyan-500/20">
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

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {user ? (
            <>
              <Link to="/dashboard" className={navLinkClass("/dashboard")}>
                Dashboard
              </Link>

              <Link to="/profile" className={navLinkClass("/profile")}>
                Profile
              </Link>

              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400"></div>
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
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.02]"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/70 transition hover:text-cyan-300 md:hidden"
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

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="border-t border-white/10 bg-[#060816]/95 backdrop-blur-xl md:hidden">
          <div className="space-y-4 px-6 py-6">
            {user ? (
              <>
                <div className="mb-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="h-3 w-3 rounded-full bg-emerald-400"></div>
                  <span className="text-lg font-bold text-white">
                    {user?.name}
                  </span>
                </div>

                <Link
                  to="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block py-3 text-base font-semibold ${
                    isActive("/dashboard") ? "text-cyan-400" : "text-white/70"
                  }`}
                >
                  Dashboard
                </Link>

                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block py-3 text-base font-semibold ${
                    isActive("/profile") ? "text-cyan-400" : "text-white/70"
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
                    isActive("/") ? "text-cyan-400" : "text-white/70"
                  }`}
                >
                  Home
                </Link>

                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block py-3 text-base font-semibold ${
                    isActive("/login") ? "text-cyan-400" : "text-white/70"
                  }`}
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="block rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 py-3 text-center text-sm font-bold text-white"
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

export default Header;