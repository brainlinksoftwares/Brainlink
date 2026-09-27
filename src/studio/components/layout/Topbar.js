import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Menu,
  Search,
  Plus,
  Bell,
  LogOut,
  Shield,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../context/rbac';
import { getNotifications, markNotificationAsRead } from '../../services/notificationService';

export default function Topbar({ onMenuClick, onOpenCommandPalette, onOpenQuickAction }) {
  const { userProfile, role, isSuperAdmin, simulatedRole, setSimulatedRole, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();

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

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = async (id) => {
    await markNotificationAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  // Generate breadcrumbs from route path
  const pathSegments = location.pathname.split('/').filter(Boolean).filter((s) => s !== 'studio');

  const initials = userProfile?.displayName
    ? userProfile.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'AV';

  return (
    <header className="h-14 bg-white dark:bg-[#10131A] border-b border-[#E7E9EE] dark:border-[#222733] sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-slate-500 hover:text-slate-800 dark:hover:text-white p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Clean Breadcrumb */}
        <nav className="flex items-center space-x-1.5 text-xs text-[#626A78] dark:text-[#9AA3B2] truncate">
          <Link
            to="/dashboard"
            className="hover:text-[#111318] dark:hover:text-white transition-colors font-medium"
          >
            Studio
          </Link>
          {pathSegments.length === 0 ? (
            <>
              <ChevronRight className="w-3 h-3 text-[#9299A6] shrink-0" />
              <span className="font-semibold text-[#111318] dark:text-white">Dashboard</span>
            </>
          ) : (
            pathSegments.map((seg, idx) => {
              const url = '/' + pathSegments.slice(0, idx + 1).join('/');
              const isLast = idx === pathSegments.length - 1;
              const formattedName = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');

              return (
                <React.Fragment key={url}>
                  <ChevronRight className="w-3 h-3 text-[#9299A6] shrink-0" />
                  {isLast ? (
                    <span className="font-semibold text-[#111318] dark:text-white truncate">
                      {formattedName}
                    </span>
                  ) : (
                    <Link
                      to={url}
                      className="hover:text-[#111318] dark:hover:text-white transition-colors truncate"
                    >
                      {formattedName}
                    </Link>
                  )}
                </React.Fragment>
              );
            })
          )}
        </nav>
      </div>

      {/* Center-Right: Search Command Bar & Actions */}
      <div className="flex items-center gap-2.5">
        {/* Command Search Bar Trigger (Width 280-340px) */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-[#626A78] dark:text-[#9AA3B2] bg-[#F6F7F9] dark:bg-[#151923] hover:bg-[#EEF0F4] dark:hover:bg-[#1A202C] border border-[#E7E9EE] dark:border-[#222733] rounded-md transition-colors w-40 sm:w-72"
        >
          <Search className="w-3.5 h-3.5 text-[#9299A6] shrink-0" />
          <span className="truncate text-left font-normal">Search anything...</span>
          <kbd className="hidden sm:inline-flex ml-auto items-center text-[10px] font-sans font-medium text-[#9299A6] dark:text-slate-400 bg-white dark:bg-[#10131A] border border-[#E7E9EE] dark:border-[#222733] rounded px-1.5 py-0.5 shadow-xs">
            ⌘ K
          </kbd>
        </button>

        {/* Super Admin Role Switcher */}
        {isSuperAdmin && (
          <div className="hidden xl:flex items-center gap-1.5 bg-[#F6F7F9] dark:bg-[#151923] border border-[#E7E9EE] dark:border-[#222733] rounded-md px-2 py-1 text-xs">
            <Shield className="w-3 h-3 text-[#315CFF]" />
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#9299A6]">
              View:
            </span>
            <select
              value={simulatedRole || ROLES.SUPER_ADMIN}
              onChange={(e) => {
                const val = e.target.value;
                setSimulatedRole(val === ROLES.SUPER_ADMIN ? null : val);
              }}
              className="bg-transparent text-xs font-medium text-[#111318] dark:text-white focus:outline-none cursor-pointer border-none"
            >
              <option value={ROLES.SUPER_ADMIN}>Super Admin</option>
              <option value={ROLES.SALES_MANAGER}>Sales Manager</option>
              <option value={ROLES.PROJECT_MANAGER}>Project Manager</option>
              <option value={ROLES.FINANCE}>Finance Executive</option>
              <option value={ROLES.DEVELOPER}>Developer</option>
              <option value={ROLES.CLIENT}>Client Portal</option>
            </select>
          </div>
        )}

        {/* Quick Add Button */}
        {role !== ROLES.CLIENT && (
          <button
            onClick={onOpenQuickAction}
            className="st-btn-primary st-btn-sm"
            title="Quick Action (+ New)"
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
            className="relative p-1.5 rounded-md text-[#626A78] hover:text-[#111318] dark:text-[#9AA3B2] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#151923] transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#315CFF] ring-2 ring-white dark:ring-[#10131A]" />
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#10131A] border border-[#E7E9EE] dark:border-[#222733] rounded-lg shadow-lg py-2 z-50 animate-fadeIn">
              <div className="px-4 py-2 border-b border-[#E7E9EE] dark:border-[#222733] flex items-center justify-between">
                <span className="text-xs font-semibold text-[#111318] dark:text-white">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-[#315CFF] font-semibold border border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto studio-scrollbar divide-y divide-[#F0F2F5] dark:divide-[#191E2A]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#9299A6]">
                    No recent notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkRead(n.id)}
                      className={`p-3 text-xs hover:bg-slate-50 dark:hover:bg-[#151923] cursor-pointer transition-colors ${
                        !n.read ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-medium text-[#111318] dark:text-white">{n.title}</div>
                        {!n.read && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#315CFF] shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-[#626A78] dark:text-[#9AA3B2] text-[11px] mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifMenu(false);
            }}
            className="flex items-center gap-2 p-0.5 rounded-md hover:ring-2 hover:ring-[#315CFF]/20 transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-[#315CFF]/15 border border-[#315CFF]/25 text-[#315CFF] dark:text-[#5D80FF] font-semibold text-xs flex items-center justify-center">
              {initials}
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#10131A] border border-[#E7E9EE] dark:border-[#222733] rounded-lg shadow-lg py-1.5 z-50">
              <div className="px-3.5 py-2 border-b border-[#E7E9EE] dark:border-[#222733]">
                <div className="text-xs font-semibold text-[#111318] dark:text-white truncate">
                  {userProfile?.displayName || 'Aaditya Vishnoi'}
                </div>
                <div className="text-[11px] text-[#626A78] dark:text-[#9AA3B2] truncate">
                  {userProfile?.email || 'vishnoiaaditya29@gmail.com'}
                </div>
                <div className="mt-1 text-[10px] font-medium text-[#315CFF] uppercase tracking-wider">
                  {role || 'Super Admin'}
                </div>
              </div>

              <div className="py-1">
                <a
                  href="https://brainlink.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-3.5 py-1.5 text-xs text-[#626A78] dark:text-[#9AA3B2] hover:bg-slate-50 dark:hover:bg-[#151923]"
                >
                  <span>Main Website</span>
                  <ExternalLink className="w-3 h-3 text-[#9299A6]" />
                </a>
              </div>

              <div className="border-t border-[#E7E9EE] dark:border-[#222733] pt-1">
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
