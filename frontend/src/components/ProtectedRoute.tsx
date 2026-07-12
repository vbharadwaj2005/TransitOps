import React, { useContext, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Layout from './Layout';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, token, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#070a13] text-[#f8fafc]">
        <div className="text-sm font-semibold tracking-wider text-indigo-400 animate-pulse">
          Verifying security keys...
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Layout>{children}</Layout>;
};

export default ProtectedRoute;
