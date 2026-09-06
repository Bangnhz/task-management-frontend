import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import { RequireAuth, RedirectIfAuth } from './components/layout/auth-guard';
import DashboardLayout from './components/layout/dashboard-layout';

import LoginPage    from './pages/auth/login-page';
import RegisterPage from './pages/auth/register-page';
import HomePage     from './pages/home';
import MyTasksPage  from './pages/my-tasks';
import CalendarPage from './pages/calendar';
import WorkspacesPage from './pages/workspaces';
import ProjectsPage from './pages/projects';
import ProjectDetailPage from './pages/project-detail';
import AccountPage from './pages/account';
import InvitePreviewPage from './pages/invite-preview';
import { ProjectRouteGuard } from './route/ProtectedRoute';
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public ── */}
        <Route element={<RedirectIfAuth />}>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Public invite preview page */}
        <Route path="/invite/:token" element={<InvitePreviewPage />} />

        {/* ── Protected ── */}
        <Route element={<RequireAuth />}>
          {/* Pages dùng DashboardLayout */}
          <Route element={<DashboardLayout />}>
            <Route path="/"          element={<HomePage />} />
            <Route path="/my-tasks"  element={<MyTasksPage />} />
            <Route path="/calendar"  element={<CalendarPage />} />
            <Route path="/workspaces"        element={<WorkspacesPage />} />
            <Route path="/projects"        element={<ProjectsPage />} />
            <Route element={<ProjectRouteGuard />}>
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
            </Route>
          </Route>
          

          {/* Standalone pages */}
          <Route path="/account" element={<AccountPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
