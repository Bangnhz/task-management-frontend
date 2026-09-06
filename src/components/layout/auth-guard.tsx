import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/use-auth-store';

function HydrationLoader() {
  return (
    <div className="min-h-screen flex items-center justify-content-center bg-slate-100">
      <div className="text-center text-slate-500 text-sm">
        <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin mx-auto mb-3" />
        Loading...
      </div>
    </div>
  );
}

export function RequireAuth() {
  const { isAuthenticated, _hydrated } = useAuthStore();
  if (!_hydrated) return <HydrationLoader />;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export function RedirectIfAuth() {
  const { isAuthenticated, _hydrated } = useAuthStore();
  if (!_hydrated) return <HydrationLoader />;
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
}
