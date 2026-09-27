import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import StudioLayout from './components/layout/StudioLayout';
import './studio.css';

// Pages
const Login = lazy(() => import('./pages/auth/Login'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
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

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400 text-xs">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <span>Verifying Studio credentials...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/studio/login" state={{ from: location }} replace />;
  }

  return children;
}

export default function StudioApp({ basePath = '/studio' }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <Suspense
          fallback={
            <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400 text-xs">
              <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            </div>
          }
        >
          <Routes>
            {/* Auth */}
            <Route path="login" element={<Login />} />
            <Route path="forgot-password" element={<Login />} />

            {/* Protected Studio App Shell */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <StudioLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />

              {/* CRM */}
              <Route path="crm">
                <Route index element={<Navigate to="leads" replace />} />
                <Route path="leads" element={<Leads />} />
                <Route path="contacts" element={<Contacts />} />
                <Route path="companies" element={<Companies />} />
                <Route path="activities" element={<Activities />} />
              </Route>

              {/* Sales */}
              <Route path="sales">
                <Route index element={<Navigate to="pipeline" replace />} />
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
                <Route index element={<Navigate to="settings" replace />} />
                <Route path="users" element={<UsersManagement />} />
                <Route path="audit-logs" element={<AuditLogs />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </ToastProvider>
    </AuthProvider>
  );
}
