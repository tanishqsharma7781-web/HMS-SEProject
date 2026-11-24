import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to their default dashboard
    if (role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (role === 'WARDEN') return <Navigate to="/warden" replace />;
    if (role === 'STUDENT') return <Navigate to="/student" replace />;
    if (role === 'SECURITY') return <Navigate to="/security" replace />;
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
