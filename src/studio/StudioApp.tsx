import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { StudioLayout } from './components/layout/StudioLayout';

import { useAuth } from './context/AuthContext';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { LeadsList } from './pages/LeadsList';
import { LeadCreate } from './pages/LeadCreate';
import { LeadDetail } from './pages/LeadDetail';
import { LeadImport } from './pages/LeadImport';
import { LeadHunterPage } from './pages/LeadHunterPage';
import { PipelinePage } from './pages/PipelinePage';
import { FollowUpsPage } from './pages/FollowUpsPage';
import { TasksPage } from './pages/TasksPage';
import { ClientsPage } from './pages/ClientsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { TeamPage } from './pages/TeamPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { PublicApply } from './pages/PublicApply';

const StudioHome: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return <PublicApply />;
};

export const StudioApp: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Routes>
          {/* Public & Root Lead Generation Routes */}
          <Route path="/" element={<StudioHome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/apply" element={<PublicApply />} />

          {/* Protected Studio CRM Routes */}
          <Route
            element={
              <ProtectedRoute>
                <StudioLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leads" element={<LeadsList />} />
            <Route path="/leads/new" element={<LeadCreate />} />
            <Route path="/leads/import" element={<LeadImport />} />
            <Route path="/leads/:id" element={<LeadDetail />} />
            <Route path="/lead-hunter" element={<LeadHunterPage />} />
            <Route path="/pipeline" element={<PipelinePage />} />
            <Route path="/follow-ups" element={<FollowUpsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route
              path="/team"
              element={
                <ProtectedRoute requiredPermission="team:manage">
                  <TeamPage />
                </ProtectedRoute>
              }
            />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Studio Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default StudioApp;
