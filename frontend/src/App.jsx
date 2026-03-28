import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import useSocket from "./hooks/useSocket";
import { ToastContainer } from "react-toastify";

import Header from "./components/Header";
import ProHeader from "./components/ProHeader";
import PrivateRoute from "./components/PrivateRoute";
import ProRoute from "./components/ProRoute";

import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProDashboard from "./pages/ProDashboard";
import Profile from "./pages/Profile";
import ProProfile from "./pages/ProProfile";
import InterviewRunner from "./pages/InterviewRunner";
import SessionReview from "./pages/SessionReview";
import ProInterview from "./pages/ProInterview";
import ProReview from "./pages/ProReview";
import UpgradePage from "./pages/UpgradePage";
import PaymentPage from "./pages/PaymentPage";
import NotFound from "./pages/NotFound";

const PublicOnlyRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) return children;

  const isProActive =
    user?.isPro &&
    (!user?.proExpiresAt || new Date(user.proExpiresAt) > new Date());

  return <Navigate to={isProActive ? "/pro-dashboard" : "/dashboard"} replace />;
};

const AppLayout = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const hideHeader =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/upgrade";

  const isProActive =
    user?.isPro &&
    (!user?.proExpiresAt || new Date(user.proExpiresAt) > new Date());

  const isProRoute = location.pathname.startsWith("/pro");

  // ✅ Pro navbar only for actual active pro user on pro routes
  const showProHeader = isProRoute && isProActive;

  return (
    <div className="min-h-screen bg-[#060816] text-white">
      {!hideHeader && (showProHeader ? <ProHeader /> : <Header />)}

      <main className={hideHeader ? "" : "container mx-auto p-4"}>
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <Register />
              </PublicOnlyRoute>
            }
          />

          <Route path="/upgrade" element={<UpgradePage />} />
          <Route path="/payment" element={<PaymentPage />} />

          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/interview/:sessionId" element={<InterviewRunner />} />
            <Route path="/review/:sessionId" element={<SessionReview />} />
          </Route>

          <Route element={<ProRoute />}>
            <Route path="/pro-dashboard" element={<ProDashboard />} />
            <Route path="/pro-profile" element={<ProProfile />} />
            <Route path="/pro-interview/:sessionId" element={<ProInterview />} />
            <Route path="/pro-review/:sessionId" element={<ProReview />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

const App = () => {
  useSocket();
  return <AppLayout />;
};

export default App;
