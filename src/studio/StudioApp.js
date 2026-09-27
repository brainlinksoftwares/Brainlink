import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { StudioBaseProvider, useStudioBase } from './context/StudioBaseContext';
import { ThemeProvider } from './context/ThemeContext';
import StudioLayout from './components/layout/StudioLayout';
import './studio.css';

// Critical entry pages bundled directly to eliminate nested lazy chunk waterfall
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';

// Secondary pages lazily chunked on demand
const Leads = lazy(() => import('./pages/crm/Leads'));
const Contacts = lazy(() => import('./pages/crm/Contacts'));
const Companies = lazy(() => import('./pages/crm/Companies'));
const Activities = lazy(() => import('./pages/crm/Activities'));
const PipelineKanban = lazy(() => import('./pages/sales/PipelineKanban'));
const Deals = lazy(() => import('./pages/sales/Deals'));
const Meetings = lazy(() => import('./pages/sales/Meetings'));
const Proposals = lazy(() => import('./pages/sales/Proposals'));
const Quotations = lazy(() => import('./pages/sales/Quotations'));
const ClientsList = lazy(() => import('./pages/clients/ClientsList'));
const ClientDetail = lazy(() => import('./pages/clients/ClientDetail'));
const ClientOnboarding = lazy(() => import('./pages/clients/ClientOnboarding'));
const ClientPortal = lazy(() => import('./pages/clients/ClientPortal'));
const ProjectsList = lazy(() => import('./pages/projects/ProjectsList'));
const Milestones = lazy(() => import('./pages/projects/Milestones'));
const Tasks = lazy(() => import('./pages/projects/Tasks'));
const TimeTracking = lazy(() => import('./pages/projects/TimeTracking'));
const FinanceDashboard = lazy(() => import('./pages/finance/FinanceDashboard'));
const Invoices = lazy(() => import('./pages/finance/Invoices'));
const Payments = lazy(() => import('./pages/finance/Payments'));
const Expenses = lazy(() => import('./pages/finance/Expenses'));
const Transactions = lazy(() => import('./pages/finance/Transactions'));
const Documents = lazy(() => import('./pages/documents/Documents'));
const Team = lazy(() => import('./pages/team/Team'));
const Reports = lazy(() => import('./pages/reports/Reports'));
const UsersManagement = lazy(() => import('./pages/admin/UsersManagement'));
const AuditLogs = lazy(() => import('./pages/admin/AuditLogs'));
const Settings = lazy(() => import('./pages/admin/Settings'));

function StudioLoader({ label }) {
  return (
    <div className="studio-shell min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-11 h-11">
          <div className="absolute inset-0 rounded-[13px] bg-gradient-to-br from-[#3B5BFF] via-[#6A5CFF] to-[#9A5CFF] animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center font-bold text-white text-sm">BL</div>
        </div>
        {label && <span className="text-[12px] font-medium text-[var(--st-text-muted)]">{label}</span>}
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const { basePath } = useStudioBase();
  const location = useLocation();

  if (loading) {
    return (
      <StudioLoader label="Loading Studio…" />
    );
  }

  if (!currentUser) {
    const loginTarget = basePath ? `${basePath}/login` : '/login';
    return <Navigate to={loginTarget} state={{ from: location }} replace />;
  }

  return children;
}

function StudioRoutes() {
  const { basePath } = useStudioBase();
  const dashboardPath = basePath ? `${basePath}/dashboard` : '/dashboard';

  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="login" element={<Login />} />
      <Route path="forgot-password" element={<Login />} />

      {/* Safety: If /studio prefix is matched inside StudioApp, strip and redirect to absolute dashboard */}
      <Route path="studio/*" element={<Navigate to={dashboardPath} replace />} />

      {/* Protected Studio App Shell */}
      <Route
        element={
          <ProtectedRoute>
            <StudioLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={dashboardPath} replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* CRM */}
        <Route path="crm">
          <Route index element={<Navigate to={basePath ? `${basePath}/crm/leads` : '/crm/leads'} replace />} />
          <Route path="leads" element={<Leads />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="companies" element={<Companies />} />
          <Route path="activities" element={<Activities />} />
        </Route>

        {/* Sales */}
        <Route path="sales">
          <Route index element={<Navigate to={basePath ? `${basePath}/sales/pipeline` : '/sales/pipeline'} replace />} />
          <Route path="pipeline" element={<PipelineKanban />} />
          <Route path="deals" element={<Deals />} />
          <Route path="meetings" element={<Meetings />} />
          <Route path="proposals" element={<Proposals />} />
          <Route path="quotations" element={<Quotations />} />
        </Route>

        {/* Clients */}
        <Route path="clients">
          <Route index element={<ClientsList />} />
          <Route path="onboarding" element={<ClientOnboarding />} />
          <Route path=":id" element={<ClientDetail />} />
        </Route>
        <Route path="portal/*" element={<ClientPortal />} />

        {/* Projects */}
        <Route path="projects">
          <Route index element={<ProjectsList />} />
          <Route path="milestones" element={<Milestones />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="time-tracking" element={<TimeTracking />} />
          <Route path="time" element={<Navigate to={basePath ? `${basePath}/projects/time-tracking` : '/projects/time-tracking'} replace />} />
        </Route>

        {/* Finance */}
        <Route path="finance">
          <Route index element={<FinanceDashboard />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="payments" element={<Payments />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="transactions" element={<Transactions />} />
        </Route>

        {/* Documents */}
        <Route path="documents" element={<Documents />} />

        {/* Team */}
        <Route path="team" element={<Team />} />

        {/* Reports */}
        <Route path="reports" element={<Reports />} />

        {/* Administration */}
        <Route path="admin">
          <Route index element={<Navigate to={basePath ? `${basePath}/admin/settings` : '/admin/settings'} replace />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch-all MUST BE ABSOLUTE PATH, never relative to avoid recursive loops */}
        <Route path="*" element={<Navigate to={dashboardPath} replace />} />
      </Route>
    </Routes>
  );
}

export default function StudioApp({ basePath = '/studio' }) {
  return (
    <StudioBaseProvider basePath={basePath}>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Suspense fallback={<StudioLoader />}>
              <StudioRoutes />
            </Suspense>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </StudioBaseProvider>
  );
}
