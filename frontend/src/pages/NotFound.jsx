import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060816] px-4">
      <div className="text-center py-16 px-8 bg-white/5 rounded-[2rem] border border-white/10 max-w-2xl w-full backdrop-blur-xl">
        <h1 className="text-8xl sm:text-9xl font-black text-cyan-300">404</h1>

        <h2 className="text-2xl sm:text-3xl font-black text-white mt-6 uppercase tracking-tight">
          Page Not Found
        </h2>

        <p className="text-white/60 mt-3 mb-10 text-sm sm:text-base">
          The interview module you're looking for doesn't exist.
        </p>

        <Link
          to="/dashboard"
          className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 px-8 py-3 font-bold text-white transition-all hover:-translate-y-0.5 hover:scale-[1.02]"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;