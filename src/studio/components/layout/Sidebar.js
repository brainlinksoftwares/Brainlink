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
  UserCheck,
  Briefcase,
  HelpCircle,
  Menu,
  X,
  Sparkles,
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
    documents: false,
    team: false,
    reports: false,
    admin: false,
  });

  const toggleGroup = (group) => {
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const isClient = role === ROLES.CLIENT;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20 text-sm">
              BS
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-white font-heading">Brainlink</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">
                  STUDIO
                </span>
              </div>
              <div className="text-[10px] text-slate-400">Enterprise OS v2.4</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items (Scrollable) */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 text-xs">
          {/* CLIENT PORTAL ISOLATED VIEW */}
          {isClient ? (
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Client Workspace
              </div>
              <NavLink
                to="/studio/portal"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                    isActive ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Client Portal</span>
              </NavLink>
              <NavLink
                to="/studio/portal/projects"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                    isActive ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Briefcase className="w-4 h-4" />
                <span>My Projects & Milestones</span>
              </NavLink>
              <NavLink
                to="/studio/portal/invoices"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                    isActive ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Receipt className="w-4 h-4" />
                <span>Invoices & Payments</span>
              </NavLink>
              <NavLink
                to="/studio/portal/documents"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                    isActive ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <FileText className="w-4 h-4" />
                <span>Documents & Contracts</span>
              </NavLink>
            </div>
          ) : (
            <>
              {/* OVERVIEW */}
              <div className="mb-2">
                <NavLink
                  to="/studio/dashboard"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                      isActive ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <LayoutDashboard className="w-4 h-4 text-blue-400" />
                  <span>Executive Dashboard</span>
                </NavLink>
              </div>

              {/* CRM GROUP */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleGroup('crm')}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200"
                >
                  <span>CRM</span>
                  {openGroups.crm ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
                {openGroups.crm && (
                  <div className="space-y-0.5 mt-1">
                    <NavLink
                      to="/studio/crm/leads"
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${
                          isActive ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`
                      }
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Leads</span>
                    </NavLink>
                    <NavLink
                      to="/studio/crm/contacts"
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${
                          isActive ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`
                      }
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Contacts</span>
                    </NavLink>
                    <NavLink
                      to="/studio/crm/companies"
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${
                          isActive ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`
                      }
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Companies</span>
                    </NavLink>
                    <NavLink
                      to="/studio/crm/activities"
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${
                          isActive ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`
                      }
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Activities & Timeline</span>
                    </NavLink>
                  </div>
                )}
              </div>

              {/* SALES GROUP */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => toggleGroup('sales')}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200"
                >
                  <span>Sales & Pipeline</span>
                  {openGroups.sales ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
                {openGroups.sales && (
                  <div className="space-y-0.5 mt-1">
                    <NavLink
                      to="/studio/sales/pipeline"
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${
                          isActive ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`
                      }
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                      <span>Pipeline Kanban</span>
                    </NavLink>
                    <NavLink
                      to="/studio/sales/deals"
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${
                          isActive ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`
                      }
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Deals & Opportunities</span>
                    </NavLink>
                    <NavLink
                      to="/studio/sales/meetings"
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${
                          isActive ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`
                      }
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Meetings</span>
                    </NavLink>
                    <NavLink
                      to="/studio/sales/proposals"
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${
                          isActive ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`
                      }
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>Proposals</span>
                    </NavLink>
                    <NavLink
                      to="/studio/sales/quotations"
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${
                          isActive ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`
                      }
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Quotations</span>
                    </NavLink>
                  </div>
                )}
              </div>

              {/* CLIENTS GROUP */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => toggleGroup('clients')}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200"
                >
                  <span>Clients</span>
                  {openGroups.clients ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
                {openGroups.clients && (
                  <div className="space-y-0.5 mt-1">
                    <NavLink
                      to="/studio/clients"
                      end
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${
                          isActive ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`
                      }
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>All Clients</span>
                    </NavLink>
                    <NavLink
                      to="/studio/clients/onboarding"
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${
                          isActive ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`
                      }
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Client Onboarding</span>
                    </NavLink>
                    <NavLink
                      to="/studio/portal"
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${
                          isActive ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`
                      }
                    >
                      <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Client Portal Preview</span>
                    </NavLink>
                  </div>
                )}
              </div>

              {/* PROJECTS GROUP */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => toggleGroup('projects')}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200"
                >
                  <span>Projects</span>
                  {openGroups.projects ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
                {openGroups.projects && (
                  <div className="space-y-0.5 mt-1">
                    <NavLink
                      to="/studio/projects"
                      end
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${
                          isActive ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`
                      }
                    >
                      <FolderGit2 className="w-3.5 h-3.5" />
                      <span>All Projects</span>
                    </NavLink>
                    <NavLink
                      to="/studio/projects/milestones"
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${
                          isActive ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`
                      }
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Milestones & Billing</span>
                    </NavLink>
                    <NavLink
                      to="/studio/projects/tasks"
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${
                          isActive ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`
                      }
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Tasks (List / Kanban)</span>
                    </NavLink>
                    <NavLink
                      to="/studio/projects/time-tracking"
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${
                          isActive ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`
                      }
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Time Tracking</span>
                    </NavLink>
                  </div>
                )}
              </div>

              {/* FINANCE GROUP */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => toggleGroup('finance')}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200"
                >
                  <span>Finance & Invoicing</span>
                  {openGroups.finance ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
                {openGroups.finance && (
                  <div className="space-y-0.5 mt-1">
                    <NavLink
                      to="/studio/finance"
                      end
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${
                          isActive ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`
                      }
                    >
                      <PieChart className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Finance Dashboard</span>
                    </NavLink>
                    <NavLink
                      to="/studio/finance/invoices"
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${
                          isActive ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`
                      }
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Invoices (GST-ready)</span>
                    </NavLink>
                    <NavLink
                      to="/studio/finance/payments"
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${
                          isActive ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`
                      }
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Payments</span>
                    </NavLink>
                    <NavLink
                      to="/studio/finance/expenses"
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${
                          isActive ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`
                      }
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Expenses</span>
                    </NavLink>
                    <NavLink
                      to="/studio/finance/transactions"
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${
                          isActive ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`
                      }
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Transaction Ledger</span>
                    </NavLink>
                  </div>
                )}
              </div>

              {/* DOCUMENTS */}
              <div className="pt-2">
                <NavLink
                  to="/studio/documents"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                      isActive ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span>Document Vault</span>
                </NavLink>
              </div>

              {/* TEAM */}
              <div>
                <NavLink
                  to="/studio/team"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                      isActive ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span>Team & Departments</span>
                </NavLink>
              </div>

              {/* REPORTS */}
              <div>
                <NavLink
                  to="/studio/reports"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                      isActive ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <PieChart className="w-4 h-4 text-emerald-400" />
                  <span>Business Reports</span>
                </NavLink>
              </div>

              {/* ADMINISTRATION */}
              <div className="pt-2 border-t border-slate-800">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Administration
                </div>
                <NavLink
                  to="/studio/admin/users"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${
                      isActive ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Users & RBAC</span>
                </NavLink>
                <NavLink
                  to="/studio/admin/audit-logs"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${
                      isActive ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Audit Logs</span>
                </NavLink>
                <NavLink
                  to="/studio/admin/settings"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${
                      isActive ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Settings & Configuration</span>
                </NavLink>
              </div>
            </>
          )}
        </nav>

        {/* User Profile & Role Info Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center font-bold text-blue-400 text-xs shrink-0">
              {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                {userProfile?.displayName || userProfile?.email || 'User'}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                  {role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
