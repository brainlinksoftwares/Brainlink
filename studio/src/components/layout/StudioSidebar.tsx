import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users2,
  KanbanSquare,
  CalendarClock,
  CheckSquare2,
  Building2,
  Briefcase,
  UserCog,
  BarChart3,
  Settings,
  X,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface StudioSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const StudioSidebar: React.FC<StudioSidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed,
}) => {
  const location = useLocation();
  const { role } = useAuth();

  const navItems = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Leads', to: '/leads', icon: Users2 },
    { name: 'Pipeline', to: '/pipeline', icon: KanbanSquare },
    { name: 'Follow-ups', to: '/follow-ups', icon: CalendarClock },
    { name: 'Tasks', to: '/tasks', icon: CheckSquare2 },
    { name: 'Clients', to: '/clients', icon: Building2 },
    { name: 'Projects', to: '/projects', icon: Briefcase },
    ...(role === 'admin'
      ? [{ name: 'Team', to: '/team', icon: UserCog }]
      : []),
    { name: 'Analytics', to: '/analytics', icon: BarChart3 },
    { name: 'Settings', to: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} w-72`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-white text-base tracking-tight leading-none">
                  Brainlink
                </span>
                <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider mt-1">
                  Studio CRM
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {!isCollapsed && <span>{item.name}</span>}
              </NavLink>
            );
          })}
        </div>

        {/* Public Apply Form Link & Info */}
        <div className="p-3 border-t border-slate-800 shrink-0">
          {!isCollapsed ? (
            <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="font-medium text-slate-300">Public Apply Form</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">Active</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                Embeddable form ready for marketing pages.
              </p>
              <a
                href="/apply"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 px-2.5 text-xs font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors"
              >
                View /apply form
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ) : (
            <a
              href="/apply"
              target="_blank"
              rel="noreferrer"
              title="Public Form (/apply)"
              className="flex items-center justify-center p-2.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          )}
        </div>
      </aside>
    </>
  );
};
