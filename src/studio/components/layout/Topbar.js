import React, { useState, useEffect } from 'react';
import {
  Menu,
  Search,
  Plus,
  Bell,
  CheckCircle,
  LogOut,
  User,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../context/rbac';
import { getNotifications, markNotificationAsRead } from '../../services/notificationService';

export default function Topbar({ onMenuClick, onOpenCommandPalette, onOpenQuickAction }) {
  const { userProfile, role, isSuperAdmin, simulatedRole, setSimulatedRole, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    async function loadNotifs() {
      if (userProfile?.uid) {
        const list = await getNotifications(userProfile.uid, role);
        setNotifications(list);
      }
    }
    loadNotifs();
    const interval = setInterval(loadNotifs, 15000);
    return () => clearInterval(interval);
  }, [userProfile, role]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkRead = async (id) => {
    await markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <header className="h-13 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile Toggle & Search trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-slate-500 hover:text-slate-800 dark:hover:text-white p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Global Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-md transition-colors w-44 sm:w-60"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="truncate">Search anything...</span>
          <kbd className="hidden sm:inline-block ml-auto text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.2 shadow-2xs">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right: Actions, Notifications, Role Switcher, Profile */}
      <div className="flex items-center gap-2">
        {/* Super Admin Role Switcher (Simulate other roles) */}
        {isSuperAdmin && (
          <div className="hidden md:flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-md px-2.5 py-1 text-xs">
            <Shield className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">View As:</span>
            <select
              value={simulatedRole || ROLES.SUPER_ADMIN}
              onChange={(e) => {
                const val = e.target.value;
                setSimulatedRole(val === ROLES.SUPER_ADMIN ? null : val);
              }}
              className="bg-transparent text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value={ROLES.SUPER_ADMIN}>Super Admin (All Access)</option>
              <option value={ROLES.SALES_MANAGER}>Sales Manager</option>
              <option value={ROLES.PROJECT_MANAGER}>Project Manager</option>
              <option value={ROLES.FINANCE}>Finance Executive</option>
              <option value={ROLES.DEVELOPER}>Developer / Designer</option>
              <option value={ROLES.CLIENT}>Client Portal View</option>
            </select>
          </div>
        )}

        {/* Quick Add Button */}
        {role !== ROLES.CLIENT && (
          <button
            onClick={onOpenQuickAction}
            className="st-btn-primary st-btn-sm"
            title="Quick Action (Press N)"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New</span>
          </button>
        )}

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              setShowUserMenu(false);
            }}
            className="relative p-1.5 rounded-md text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg py-2 z-50 animate-fadeIn">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 dark:text-white">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-semibold border border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto studio-scrollbar divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No recent notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkRead(n.id)}
                      className={`p-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
                        !n.read ? 'bg-blue-50/30 dark:bg-blue-950/15' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{n.title}</div>
                        {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1" />}
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifMenu(false);
            }}
            className="flex items-center gap-2 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-600 dark:text-blue-400 font-semibold text-xs flex items-center justify-center">
              {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'A'}
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg py-1.5 z-50">
              <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {userProfile?.displayName || 'Aaditya Vishnoi'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {userProfile?.email || 'vishnoiaaditya29@gmail.com'}
                </div>
                <div className="mt-1 text-[10px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  {role}
                </div>
              </div>

              <div className="py-1">
                <a
                  href="https://brainlink.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-3.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <span>Main Website</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
