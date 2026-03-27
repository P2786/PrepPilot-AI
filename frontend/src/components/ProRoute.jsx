import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ProRoute = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isProActive =
    user.isPro &&
    (!user.proExpiresAt || new Date(user.proExpiresAt) > new Date());

  if (!isProActive) {
    return <Navigate to="/upgrade" replace />;
  }

  return <Outlet />;
};

export default ProRoute;