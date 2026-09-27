import React, { useState } from 'react';
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
  PieChart,
  ShieldAlert,
  Settings,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Receipt,
  X,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../context/rbac';

export default function Sidebar({ isOpen, onClose }) {
  const { userProfile, role, logout } = useAuth();
  const [openGroups, setOpenGroups] = useState({
    crm: true,
    sales: true,
    clients: true,
    projects: true,
    finance: true,
    system: true,
  });

  const toggleGroup = (group) => {
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const isClient = role === ROLES.CLIENT;

  const navLinkClass = ({ isActive }) =>
    `group flex items-center justify-between px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-140 ${
      isActive
        ? 'bg-blue-600/10 text-blue-400 font-semibold'
        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
    }`;

  const iconClass = (isActive) =>
    `w-4 h-4 transition-colors shrink-0 ${
      isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-300'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-60 bg-[#0B0F19] text-slate-300 flex flex-col border-r border-slate-800/80 transition-transform duration-250 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="h-14 px-4 border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <NavLink to="/" className="flex items-center gap-2.5 text-decoration-none">
            <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-xs">
              BS
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm tracking-tight text-white font-sans">
                Brainlink
              </span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-blue-500/15 text-blue-400 font-semibold border border-blue-500/20">
                STUDIO
              </span>
            </div>
          </NavLink>

          <button
            onClick={onClose}
            className="lg:hidden p-1 text-slate-400 hover:text-white rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Navigation Tree */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 studio-scrollbar text-xs">
          {/* CLIENT ISOLATED PORTAL MENU */}
          {isClient ? (
            <div className="space-y-1">
              <div className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Client Workspace
              </div>
              <NavLink to="/portal" className={navLinkClass} onClick={onClose}>
                {({ isActive }) => (
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard className={iconClass(isActive)} />
                    <span>My Dashboard</span>
                  </div>
                )}
              </NavLink>
              <NavLink to="/invoices" className={navLinkClass} onClick={onClose}>
                {({ isActive }) => (
                  <div className="flex items-center gap-2.5">
                    <FileText className={iconClass(isActive)} />
                    <span>Invoices & Payments</span>
                  </div>
                )}
              </NavLink>
              <NavLink to="/documents" className={navLinkClass} onClick={onClose}>
                {({ isActive }) => (
                  <div className="flex items-center gap-2.5">
                    <FolderGit2 className={iconClass(isActive)} />
                    <span>Project Vault</span>
                  </div>
                )}
              </NavLink>
            </div>
          ) : (
            <>
              {/* WORKSPACE */}
              <div className="space-y-0.5">
                <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Workspace
                </div>
                <NavLink to="/dashboard" className={navLinkClass} onClick={onClose}>
                  {({ isActive }) => (
                    <div className="flex items-center gap-2.5">
                      <LayoutDashboard className={iconClass(isActive)} />
                      <span>Executive Dashboard</span>
                    </div>
                  )}
                </NavLink>
              </div>

              {/* CRM */}
              <div className="space-y-0.5">
                <button
                  onClick={() => toggleGroup('crm')}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-300 transition-colors"
                >
                  <span>CRM</span>
                  {openGroups.crm ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                {openGroups.crm && (
                  <div className="space-y-0.5 pl-1">
                    <NavLink to="/crm/leads" className={navLinkClass} onClick={onClose}>
                      {({ isActive }) => (
                        <div className="flex items-center gap-2.5">
                          <Users className={iconClass(isActive)} />
                          <span>Leads</span>
                        </div>
                      )}
                    </NavLink>
                    <NavLink to="/crm/contacts" className={navLinkClass} onClick={onClose}>
                      {({ isActive }) => (
                        <div className="flex items-center gap-2.5">
                          <Users className={iconClass(isActive)} />
                          <span>Contacts</span>
                        </div>
                      )}
                    </NavLink>
                    <NavLink to="/crm/companies" className={navLinkClass} onClick={onClose}>
                      {({ isActive }) => (
                        <div className="flex items-center gap-2.5">
                          <Building2 className={iconClass(isActive)} />
                          <span>Companies</span>
                        </div>
                      )}
                    </NavLink>
                    <NavLink to="/crm/activities" className={navLinkClass} onClick={onClose}>
                      {({ isActive }) => (
                        <div className="flex items-center gap-2.5">
                          <Clock className={iconClass(isActive)} />
                          <span>Activities</span>
                        </div>
                      )}
                    </NavLink>
                  </div>
                )}
              </div>

              {/* SALES */}
              <div className="space-y-0.5">
                <button
                  onClick={() => toggleGroup('sales')}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-300 transition-colors"
                >
                  <span>Sales</span>
                  {openGroups.sales ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                {openGroups.sales && (
                  <div className="space-y-0.5 pl-1">
                    <NavLink to="/sales/pipeline" className={navLinkClass} onClick={onClose}>
                      {({ isActive }) => (
                        <div className="flex items-center gap-2.5">
                          <Layers className={iconClass(isActive)} />
                          <span>Pipeline Kanban</span>
                        </div>
                      )}
                    </NavLink>
                    <NavLink to="/sales/deals" className={navLinkClass} onClick={onClose}>
                      {({ isActive }) => (
                        <div className="flex items-center gap-2.5">
                          <TrendingUp className={iconClass(isActive)} />
                          <span>Deals</span>
                        </div>
                      )}
                    </NavLink>
                    <NavLink to="/sales/meetings" className={navLinkClass} onClick={onClose}>
                      {({ isActive }) => (
                        <div className="flex items-center gap-2.5">
                          <Calendar className={iconClass(isActive)} />
                          <span>Meetings</span>
                        </div>
                      )}
                    </NavLink>
                    <NavLink to="/sales/proposals" className={navLinkClass} onClick={onClose}>
                      {({ isActive }) => (
                        <div className="flex items-center gap-2.5">
                          <FileCheck2 className={iconClass(isActive)} />
                          <span>Proposals</span>
                        </div>
                      )}
                    </NavLink>
                    <NavLink to="/sales/quotations" className={navLinkClass} onClick={onClose}>
                      {({ isActive }) => (
                        <div className="flex items-center gap-2.5">
                          <FileText className={iconClass(isActive)} />
                          <span>Quotations</span>
                        </div>
                      )}
                    </NavLink>
                  </div>
                )}
              </div>

              {/* CLIENTS */}
              <div className="space-y-0.5">
                <button
                  onClick={() => toggleGroup('clients')}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-300 transition-colors"
                >
                  <span>Clients</span>
                  {openGroups.clients ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                {openGroups.clients && (
                  <div className="space-y-0.5 pl-1">
                    <NavLink to="/clients" className={navLinkClass} onClick={onClose}>
                      {({ isActive }) => (
                        <div className="flex items-center gap-2.5">
                          <Building2 className={iconClass(isActive)} />
                          <span>Directory</span>
                        </div>
                      )}
                    </NavLink>
                    <NavLink to="/clients/onboarding" className={navLinkClass} onClick={onClose}>
                      {({ isActive }) => (
                        <div className="flex items-center gap-2.5">
                          <CheckSquare className={iconClass(isActive)} />
                          <span>Onboarding</span>
                        </div>
                      )}
                    </NavLink>
                  </div>
                )}
              </div>

              {/* PROJECTS */}
              <div className="space-y-0.5">
                <button
                  onClick={() => toggleGroup('projects')}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-300 transition-colors"
                >
                  <span>Projects</span>
                  {openGroups.projects ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                {openGroups.projects && (
                  <div className="space-y-0.5 pl-1">
                    <NavLink to="/projects" className={navLinkClass} onClick={onClose}>
                      {({ isActive }) => (
                        <div className="flex items-center gap-2.5">
                          <FolderGit2 className={iconClass(isActive)} />
                          <span>Deliveries</span>
                        </div>
                      )}
                    </NavLink>
                    <NavLink to="/projects/milestones" className={navLinkClass} onClick={onClose}>
                      {({ isActive }) => (
                        <div className="flex items-center gap-2.5">
                          <Layers className={iconClass(isActive)} />
                          <span>Milestones</span>
                        </div>
                      )}
                    </NavLink>
                    <NavLink to="/projects/tasks" className={navLinkClass} onClick={onClose}>
                      {({ isActive }) => (
                        <div className="flex items-center gap-2.5">
                          <CheckSquare className={iconClass(isActive)} />
                          <span>Sprint Tasks</span>
                        </div>
                      )}
                    </NavLink>
                    <NavLink to="/projects/time" className={navLinkClass} onClick={onClose}>
                      {({ isActive }) => (
                        <div className="flex items-center gap-2.5">
                          <Clock className={iconClass(isActive)} />
                          <span>Time Tracking</span>
                        </div>
                      )}
                    </NavLink>
                  </div>
                )}
              </div>

              {/* FINANCE */}
              <div className="space-y-0.5">
                <button
                  onClick={() => toggleGroup('finance')}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-300 transition-colors"
                >
                  <span>Finance</span>
                  {openGroups.finance ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                {openGroups.finance && (
                  <div className="space-y-0.5 pl-1">
                    <NavLink to="/finance" className={navLinkClass} onClick={onClose}>
                      {({ isActive }) => (
                        <div className="flex items-center gap-2.5">
                          <PieChart className={iconClass(isActive)} />
                          <span>Overview</span>
                        </div>
                      )}
                    </NavLink>
                    <NavLink to="/finance/invoices" className={navLinkClass} onClick={onClose}>
                      {({ isActive }) => (
                        <div className="flex items-center gap-2.5">
                          <FileText className={iconClass(isActive)} />
                          <span>GST Invoices</span>
                        </div>
                      )}
                    </NavLink>
                    <NavLink to="/finance/payments" className={navLinkClass} onClick={onClose}>
                      {({ isActive }) => (
                        <div className="flex items-center gap-2.5">
                          <CreditCard className={iconClass(isActive)} />
                          <span>Payments</span>
                        </div>
                      )}
                    </NavLink>
                    <NavLink to="/finance/expenses" className={navLinkClass} onClick={onClose}>
                      {({ isActive }) => (
                        <div className="flex items-center gap-2.5">
                          <Receipt className={iconClass(isActive)} />
                          <span>Expenses</span>
                        </div>
                      )}
                    </NavLink>
                    <NavLink to="/finance/transactions" className={navLinkClass} onClick={onClose}>
                      {({ isActive }) => (
                        <div className="flex items-center gap-2.5">
                          <ShieldAlert className={iconClass(isActive)} />
                          <span>Auditable Ledger</span>
                        </div>
                      )}
                    </NavLink>
                  </div>
                )}
              </div>

              {/* REPORTS & SYSTEM */}
              <div className="space-y-0.5">
                <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Analytics & Admin
                </div>
                <NavLink to="/reports" className={navLinkClass} onClick={onClose}>
                  {({ isActive }) => (
                    <div className="flex items-center gap-2.5">
                      <PieChart className={iconClass(isActive)} />
                      <span>Analytics</span>
                    </div>
                  )}
                </NavLink>
                <NavLink to="/documents" className={navLinkClass} onClick={onClose}>
                  {({ isActive }) => (
                    <div className="flex items-center gap-2.5">
                      <FolderGit2 className={iconClass(isActive)} />
                      <span>Document Vault</span>
                    </div>
                  )}
                </NavLink>
                <NavLink to="/team" className={navLinkClass} onClick={onClose}>
                  {({ isActive }) => (
                    <div className="flex items-center gap-2.5">
                      <Users className={iconClass(isActive)} />
                      <span>Team & RBAC</span>
                    </div>
                  )}
                </NavLink>
                <NavLink to="/admin/settings" className={navLinkClass} onClick={onClose}>
                  {({ isActive }) => (
                    <div className="flex items-center gap-2.5">
                      <Settings className={iconClass(isActive)} />
                      <span>Settings</span>
                    </div>
                  )}
                </NavLink>
              </div>
            </>
          )}
        </div>

        {/* User Mini Card & Logout */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-300 font-semibold text-xs flex items-center justify-center shrink-0">
              {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-slate-200 truncate">
                {userProfile?.displayName || 'User'}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {role || 'MEMBER'}
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
