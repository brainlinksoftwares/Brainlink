import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  Layers,
  FolderGit2,
  CheckSquare,
  Clock,
  CreditCard,
  FileText,
  FileCheck2,
  BarChart3,
  Receipt,
  FileBox,
  Settings,
  ShieldAlert,
  TrendingUp,
  X,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../context/rbac';
import { useStudioBase } from '../../context/StudioBaseContext';

function StudioNavLink({ to, children, onClick }) {
  const { basePath } = useStudioBase();
  const target = basePath ? `${basePath}${to.startsWith('/') ? to : `/${to}`}` : to;

  return (
    <NavLink
      to={target}
      onClick={onClick}
      className={({ isActive }) =>
        `relative group flex items-center justify-between px-3 py-1.5 rounded-md text-[13px] font-medium transition-all duration-140 ${
          isActive
            ? 'bg-blue-600/[0.12] text-white font-semibold'
            : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-[#315CFF]" />
          )}
          {typeof children === 'function' ? children({ isActive }) : children}
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  const { userProfile, role, logout } = useAuth();
  const isClient = role === ROLES.CLIENT;

  const iconClass = (isActive) =>
    `w-4 h-4 transition-colors shrink-0 ${
      isActive ? 'text-[#315CFF]' : 'text-slate-400 group-hover:text-slate-200'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0A0D14] text-slate-300 flex flex-col border-r border-[#191F2C] transition-transform duration-200 ease-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Brand Mark */}
        <div className="h-14 px-4 border-b border-[#191F2C] flex items-center justify-between shrink-0">
          <StudioNavLink to="/dashboard" onClick={onClose}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-[#315CFF] flex items-center justify-center font-bold text-white text-xs tracking-wider shadow-sm">
                BS
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[14px] tracking-tight text-white font-sans">
                    Brainlink
                  </span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-[#315CFF]/15 text-[#5D80FF] font-bold border border-[#315CFF]/25 tracking-wider">
                    STUDIO
                  </span>
                </div>
              </div>
            </div>
          </StudioNavLink>

          <button
            onClick={onClose}
            className="lg:hidden p-1 text-slate-400 hover:text-white rounded"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Navigation Tree */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 studio-scrollbar">
          {/* CLIENT ISOLATED PORTAL MENU */}
          {isClient ? (
            <div className="space-y-1">
              <div className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Client Workspace
              </div>
              <StudioNavLink to="/portal" onClick={onClose}>
                {({ isActive }) => (
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard className={iconClass(isActive)} />
                    <span>My Dashboard</span>
                  </div>
                )}
              </StudioNavLink>
              <StudioNavLink to="/invoices" onClick={onClose}>
                {({ isActive }) => (
                  <div className="flex items-center gap-2.5">
                    <FileText className={iconClass(isActive)} />
                    <span>Invoices & Payments</span>
                  </div>
                )}
              </StudioNavLink>
              <StudioNavLink to="/documents" onClick={onClose}>
                {({ isActive }) => (
                  <div className="flex items-center gap-2.5">
                    <FolderGit2 className={iconClass(isActive)} />
                    <span>Project Vault</span>
                  </div>
                )}
              </StudioNavLink>
            </div>
          ) : (
            <>
              {/* WORKSPACE */}
              <div className="space-y-1">
                <div className="px-2.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Workspace
                </div>
                <StudioNavLink to="/dashboard" onClick={onClose}>
                  {({ isActive }) => (
                    <div className="flex items-center gap-2.5">
                      <LayoutDashboard className={iconClass(isActive)} />
                      <span>Dashboard</span>
                    </div>
                  )}
                </StudioNavLink>
              </div>

              {/* CUSTOMER */}
              <div className="space-y-1">
                <div className="px-2.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Customer
                </div>
                <StudioNavLink to="/crm/leads" onClick={onClose}>
                  {({ isActive }) => (
                    <div className="flex items-center gap-2.5">
                      <Users className={iconClass(isActive)} />
                      <span>Leads</span>
                    </div>
                  )}
                </StudioNavLink>
                <StudioNavLink to="/crm/contacts" onClick={onClose}>
                  {({ isActive }) => (
                    <div className="flex items-center gap-2.5">
                      <Users className={iconClass(isActive)} />
                      <span>Contacts</span>
                    </div>
                  )}
                </StudioNavLink>
                <StudioNavLink to="/crm/companies" onClick={onClose}>
                  {({ isActive }) => (
                    <div className="flex items-center gap-2.5">
                      <Building2 className={iconClass(isActive)} />
                      <span>Companies</span>
                    </div>
                  )}
                </StudioNavLink>
                <StudioNavLink to="/crm/activities" onClick={onClose}>
                  {({ isActive }) => (
                    <div className="flex items-center gap-2.5">
                      <Clock className={iconClass(isActive)} />
                      <span>Activities</span>
                    </div>
                  )}
                </StudioNavLink>
              </div>

              {/* REVENUE */}
              <div className="space-y-1">
                <div className="px-2.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Revenue
                </div>
                <StudioNavLink to="/sales/pipeline" onClick={onClose}>
                  {({ isActive }) => (
                    <div className="flex items-center gap-2.5">
                      <Layers className={iconClass(isActive)} />
                      <span>Pipeline</span>
                    </div>
                  )}
                </StudioNavLink>
                <StudioNavLink to="/sales/deals" onClick={onClose}>
                  {({ isActive }) => (
                    <div className="flex items-center gap-2.5">
                      <TrendingUp className={iconClass(isActive)} />
                      <span>Deals</span>
                    </div>
                  )}
                </StudioNavLink>
                <StudioNavLink to="/sales/proposals" onClick={onClose}>
                  {({ isActive }) => (
                    <div className="flex items-center gap-2.5">
                      <FileCheck2 className={iconClass(isActive)} />
                      <span>Proposals</span>
                    </div>
                  )}
                </StudioNavLink>
                <StudioNavLink to="/sales/quotations" onClick={onClose}>
                  {({ isActive }) => (
                    <div className="flex items-center gap-2.5">
                      <FileText className={iconClass(isActive)} />
                      <span>Quotations</span>
                    </div>
                  )}
                </StudioNavLink>
              </div>

              {/* DELIVERY */}
              <div className="space-y-1">
                <div className="px-2.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Delivery
                </div>
                <StudioNavLink to="/clients" onClick={onClose}>
                  {({ isActive }) => (
                    <div className="flex items-center gap-2.5">
                      <Building2 className={iconClass(isActive)} />
                      <span>Clients</span>
                    </div>
                  )}
                </StudioNavLink>
                <StudioNavLink to="/projects" onClick={onClose}>
                  {({ isActive }) => (
                    <div className="flex items-center gap-2.5">
                      <FolderGit2 className={iconClass(isActive)} />
                      <span>Projects</span>
                    </div>
                  )}
                </StudioNavLink>
                <StudioNavLink to="/projects/tasks" onClick={onClose}>
                  {({ isActive }) => (
                    <div className="flex items-center gap-2.5">
                      <CheckSquare className={iconClass(isActive)} />
                      <span>Tasks</span>
                    </div>
                  )}
                </StudioNavLink>
                <StudioNavLink to="/sales/meetings" onClick={onClose}>
                  {({ isActive }) => (
                    <div className="flex items-center gap-2.5">
                      <Calendar className={iconClass(isActive)} />
                      <span>Calendar</span>
                    </div>
                  )}
                </StudioNavLink>
              </div>

              {/* FINANCE */}
              <div className="space-y-1">
                <div className="px-2.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Finance
                </div>
                <StudioNavLink to="/finance" onClick={onClose}>
                  {({ isActive }) => (
                    <div className="flex items-center gap-2.5">
                      <BarChart3 className={iconClass(isActive)} />
                      <span>Overview</span>
                    </div>
                  )}
                </StudioNavLink>
                <StudioNavLink to="/finance/invoices" onClick={onClose}>
                  {({ isActive }) => (
                    <div className="flex items-center gap-2.5">
                      <FileText className={iconClass(isActive)} />
                      <span>Invoices</span>
                    </div>
                  )}
                </StudioNavLink>
                <StudioNavLink to="/finance/payments" onClick={onClose}>
                  {({ isActive }) => (
                    <div className="flex items-center gap-2.5">
                      <CreditCard className={iconClass(isActive)} />
                      <span>Payments</span>
                    </div>
                  )}
                </StudioNavLink>
                <StudioNavLink to="/finance/expenses" onClick={onClose}>
                  {({ isActive }) => (
                    <div className="flex items-center gap-2.5">
                      <Receipt className={iconClass(isActive)} />
                      <span>Expenses</span>
                    </div>
                  )}
                </StudioNavLink>
                <StudioNavLink to="/finance/transactions" onClick={onClose}>
                  {({ isActive }) => (
                    <div className="flex items-center gap-2.5">
                      <ShieldAlert className={iconClass(isActive)} />
                      <span>Ledger</span>
                    </div>
                  )}
                </StudioNavLink>
              </div>

              {/* INSIGHTS */}
              <div className="space-y-1">
                <div className="px-2.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Insights
                </div>
                <StudioNavLink to="/reports" onClick={onClose}>
                  {({ isActive }) => (
                    <div className="flex items-center gap-2.5">
                      <BarChart3 className={iconClass(isActive)} />
                      <span>Analytics</span>
                    </div>
                  )}
                </StudioNavLink>
                <StudioNavLink to="/documents" onClick={onClose}>
                  {({ isActive }) => (
                    <div className="flex items-center gap-2.5">
                      <FileBox className={iconClass(isActive)} />
                      <span>Documents</span>
                    </div>
                  )}
                </StudioNavLink>
              </div>

              {/* ADMIN */}
              <div className="space-y-1">
                <div className="px-2.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Admin
                </div>
                <StudioNavLink to="/team" onClick={onClose}>
                  {({ isActive }) => (
                    <div className="flex items-center gap-2.5">
                      <Users className={iconClass(isActive)} />
                      <span>Team</span>
                    </div>
                  )}
                </StudioNavLink>
                <StudioNavLink to="/admin/settings" onClick={onClose}>
                  {({ isActive }) => (
                    <div className="flex items-center gap-2.5">
                      <Settings className={iconClass(isActive)} />
                      <span>Settings</span>
                    </div>
                  )}
                </StudioNavLink>
              </div>
            </>
          )}
        </div>

        {/* User Mini Card & Logout */}
        <div className="p-3 border-t border-[#191F2C] bg-[#080A10] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#315CFF]/20 border border-[#315CFF]/35 text-[#5D80FF] font-semibold text-xs flex items-center justify-center shrink-0">
              {userProfile?.displayName
                ? userProfile.displayName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                : 'AV'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium text-slate-100 truncate">
                {userProfile?.displayName || 'Aaditya Vishnoi'}
              </div>
              <div className="text-[10px] text-slate-500 truncate uppercase tracking-wider font-semibold">
                {role || 'Super Admin'}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/[0.04] rounded transition-colors"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>
    </>
  );
}
