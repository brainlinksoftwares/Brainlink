import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserRound,
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
  PieChart,
  Receipt,
  FileBox,
  Settings,
  ScrollText,
  TrendingUp,
  UsersRound,
  X,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../context/rbac';
import { useStudioPath } from '../../context/StudioBaseContext';

const CLIENT_NAV = [
  {
    label: 'Client Workspace',
    items: [
      { to: '/portal', label: 'My Dashboard', icon: LayoutDashboard },
      { to: '/finance/invoices', label: 'Invoices & Payments', icon: FileText },
      { to: '/documents', label: 'Project Vault', icon: FolderGit2 },
    ],
  },
];

const INTERNAL_NAV = [
  {
    label: 'Workspace',
    items: [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Customer',
    items: [
      { to: '/crm/leads', label: 'Leads', icon: Users },
      { to: '/crm/contacts', label: 'Contacts', icon: UserRound },
      { to: '/crm/companies', label: 'Companies', icon: Building2 },
      { to: '/crm/activities', label: 'Activities', icon: Clock },
    ],
  },
  {
    label: 'Revenue',
    items: [
      { to: '/sales/pipeline', label: 'Pipeline', icon: Layers },
      { to: '/sales/deals', label: 'Deals', icon: TrendingUp },
      { to: '/sales/proposals', label: 'Proposals', icon: FileCheck2 },
      { to: '/sales/quotations', label: 'Quotations', icon: FileText },
    ],
  },
  {
    label: 'Delivery',
    items: [
      { to: '/clients', label: 'Clients', icon: Building2 },
      { to: '/projects', label: 'Projects', icon: FolderGit2, end: true },
      { to: '/projects/tasks', label: 'Tasks', icon: CheckSquare },
      { to: '/sales/meetings', label: 'Calendar', icon: Calendar },
    ],
  },
  {
    label: 'Finance',
    items: [
      { to: '/finance', label: 'Overview', icon: PieChart, end: true },
      { to: '/finance/invoices', label: 'Invoices', icon: FileText },
      { to: '/finance/payments', label: 'Payments', icon: CreditCard },
      { to: '/finance/expenses', label: 'Expenses', icon: Receipt },
      { to: '/finance/transactions', label: 'Ledger', icon: ScrollText },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: '/reports', label: 'Analytics', icon: BarChart3 },
      { to: '/documents', label: 'Documents', icon: FileBox },
    ],
  },
  {
    label: 'Admin',
    items: [
      { to: '/team', label: 'Team', icon: UsersRound },
      { to: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
];

function getInitials(name) {
  if (!name) return 'AV';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function Sidebar({ isOpen, collapsed, onToggleCollapsed, onClose }) {
  const { userProfile, role, logout } = useAuth();
  const toPath = useStudioPath();
  const sections = role === ROLES.CLIENT ? CLIENT_NAV : INTERNAL_NAV;

  const [tooltip, setTooltip] = useState(null);

  // Collapsed rail shows labels as fixed tooltips (the scrolling nav would clip CSS ones).
  const showTooltip = (e, label) => {
    if (!collapsed || window.innerWidth < 1024) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ label, top: rect.top + rect.height / 2, left: rect.right + 12 });
  };
  const hideTooltip = () => setTooltip(null);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          style={{ animation: 'stFadeIn 180ms ease-out' }}
          onClick={onClose}
        />
      )}

      <aside
        className={`st-sidebar fixed top-0 bottom-0 left-0 z-50 w-[264px] ${collapsed ? 'lg:w-[76px]' : 'lg:w-[264px]'} flex flex-col text-slate-300 transition-[transform,width] duration-300 ease-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        data-collapsed={collapsed ? 'true' : 'false'}
      >
        {/* Brand */}
        <div className="h-16 px-4 flex items-center justify-between shrink-0">
          <NavLink to={toPath('/dashboard')} className="flex items-center gap-3 min-w-0 no-underline">
            <div className="relative w-9 h-9 shrink-0 rounded-[11px] bg-gradient-to-br from-[#3B5BFF] via-[#6A5CFF] to-[#9A5CFF] flex items-center justify-center shadow-[0_6px_20px_-4px_rgba(99,102,255,0.7)]">
              <span className="font-bold text-white text-[13px] tracking-tight">BL</span>
              <span className="absolute inset-0 rounded-[11px] ring-1 ring-inset ring-white/20" />
            </div>
            <div className="st-brand-text min-w-0">
              <div className="font-bold text-[15px] leading-tight tracking-tight text-white">Brainlink</div>
              <div className="text-[10.5px] font-semibold tracking-[0.16em] uppercase text-[#7F8DFF]">
                Studio
              </div>
            </div>
          </NavLink>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 pt-2 pb-4 space-y-5 studio-scrollbar">
          {sections.map((section) => (
            <div key={section.label}>
              <div className="st-nav-section st-brand-text">{section.label}</div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={toPath(item.to)}
                      end={item.end}
                      onClick={onClose}
                      onMouseEnter={(e) => showTooltip(e, item.label)}
                      onMouseLeave={hideTooltip}
                      aria-label={item.label}
                      className={({ isActive }) => `st-nav-link${isActive ? ' active' : ''}`}
                    >
                      <Icon />
                      <span className="st-nav-label truncate">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse toggle (desktop) */}
        <div className="hidden lg:block px-3 pb-2">
          <button
            onClick={() => {
              hideTooltip();
              onToggleCollapsed();
            }}
            onMouseEnter={(e) => showTooltip(e, 'Expand sidebar')}
            onMouseLeave={hideTooltip}
            className="st-nav-link w-full bg-transparent border-0 cursor-pointer"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            <span className="st-nav-label">Collapse</span>
            <span className="st-nav-label ml-auto text-[10px] font-semibold text-slate-500 border border-white/10 rounded px-1.5 py-px">
              [
            </span>
          </button>
        </div>

        {/* User card */}
        <div className="p-3 border-t border-white/[0.06]">
          <div className="st-user-card flex items-center gap-3 p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3B5BFF] to-[#9A5CFF] text-white font-semibold text-[11px] flex items-center justify-center">
                {getInitials(userProfile?.displayName)}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0B0E16]" />
            </div>
            <div className="st-brand-text min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-slate-100 truncate">
                {userProfile?.displayName || 'Aaditya Vishnoi'}
              </div>
              <div className="text-[10.5px] text-slate-500 truncate uppercase tracking-wider font-semibold">
                {(role || 'Super Admin').replace(/_/g, ' ')}
              </div>
            </div>
            <button
              onClick={logout}
              className="st-brand-text p-1.5 text-slate-500 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-colors"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {tooltip && (
        <div className="st-nav-tooltip" style={{ top: tooltip.top, left: tooltip.left }}>
          {tooltip.label}
        </div>
      )}
    </>
  );
}
