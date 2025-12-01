
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext.jsx";

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { user } = useContext(AuthContext);

  // ⏳ WAIT while user is being restored from localStorage on page load
  if (user === undefined || user === null) {
    return <div className="text-center p-5">Loading...</div>;
  }

  // ❌ NOT logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Does not have permission
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // 👍 ALLOWED
  return children;
}
