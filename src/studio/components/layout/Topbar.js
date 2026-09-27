import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Menu,
  Search,
  Plus,
  Bell,
  BellOff,
  LogOut,
  Shield,
  ExternalLink,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  Check,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ROLES } from '../../context/rbac';
import { useStudioBase, useStudioPath } from '../../context/StudioBaseContext';
import { getNotifications, markNotificationAsRead } from '../../services/notificationService';
import { formatDateTime } from '../../utils/formatters';

const THEME_OPTIONS = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Monitor },
];

const SEGMENT_LABELS = {
  crm: 'CRM',
  'time-tracking': 'Time Tracking',
  'audit-logs': 'Audit Logs',
  transactions: 'Ledger',
};

function useDismiss(ref, open, onDismiss) {
  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onDismiss();
    };
    const onKey = (e) => e.key === 'Escape' && onDismiss();
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [ref, open, onDismiss]);
}

export default function Topbar({ onMenuClick, onOpenCommandPalette, onOpenQuickAction }) {
  const { userProfile, role, isSuperAdmin, simulatedRole, setSimulatedRole, logout } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { basePath } = useStudioBase();
  const toPath = useStudioPath();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [openMenu, setOpenMenu] = useState(null); // 'notif' | 'user' | 'theme' | null

  const notifRef = useRef(null);
  const userRef = useRef(null);
  const themeRef = useRef(null);
  const closeMenu = () => setOpenMenu(null);
  useDismiss(notifRef, openMenu === 'notif', closeMenu);
  useDismiss(userRef, openMenu === 'user', closeMenu);
  useDismiss(themeRef, openMenu === 'theme', closeMenu);

  const toggle = (name) => setOpenMenu((cur) => (cur === name ? null : name));

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

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    await Promise.all(unread.map((n) => markNotificationAsRead(n.id)));
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Breadcrumbs relative to the studio mount point
  const relativePath =
    basePath && location.pathname.startsWith(basePath)
      ? location.pathname.slice(basePath.length)
      : location.pathname;
  const pathSegments = relativePath.split('/').filter(Boolean);
  const formatSegment = (seg) =>
    SEGMENT_LABELS[seg] || seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');

  const initials = userProfile?.displayName
    ? userProfile.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'AV';

  const ThemeIcon = resolvedTheme === 'dark' ? Moon : Sun;
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

  return (
    <header className="st-topbar h-16 sticky top-0 z-30 flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
      {/* Left: mobile toggle + breadcrumbs */}
      <div className="flex items-center gap-2 min-w-0">
        <button onClick={onMenuClick} className="st-icon-btn lg:hidden" aria-label="Open navigation menu">
          <Menu className="w-[18px] h-[18px]" />
        </button>

        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-[13px] min-w-0">
          <Link
            to={toPath('/dashboard')}
            className="text-[var(--st-text-muted)] hover:text-[var(--st-text-primary)] transition-colors font-medium no-underline"
          >
            Studio
          </Link>
          {(pathSegments.length === 0 ? ['dashboard'] : pathSegments).map((seg, idx, all) => {
            const url = '/' + all.slice(0, idx + 1).join('/');
            const isLast = idx === all.length - 1;
            return (
              <React.Fragment key={url}>
                <ChevronRight className="w-3.5 h-3.5 text-[var(--st-text-disabled)] shrink-0" />
                {isLast ? (
                  <span className="font-semibold text-[var(--st-text-primary)] truncate">
                    {formatSegment(seg)}
                  </span>
                ) : (
                  <Link
                    to={toPath(url)}
                    className="text-[var(--st-text-muted)] hover:text-[var(--st-text-primary)] transition-colors truncate no-underline"
                  >
                    {formatSegment(seg)}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right: search + actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={onOpenCommandPalette}
          className="group flex items-center gap-2.5 h-9 pl-3 pr-1.5 text-[13px] text-[var(--st-text-muted)] bg-[var(--st-surface)] hover:border-[var(--st-border-strong)] border border-[var(--st-border)] rounded-[10px] transition-colors w-9 sm:w-64 lg:w-80 shadow-[var(--st-shadow-xs)]"
          aria-label="Search"
        >
          <Search className="w-4 h-4 shrink-0 group-hover:text-[var(--st-text-secondary)]" />
          <span className="hidden sm:inline truncate text-left">Search or jump to…</span>
          <span className="hidden sm:inline-flex ml-auto gap-1">
            <kbd className="st-kbd">{isMac ? '⌘' : 'Ctrl'}</kbd>
            <kbd className="st-kbd">K</kbd>
          </span>
        </button>

        {isSuperAdmin && (
          <label className="hidden xl:flex items-center gap-2 h-9 pl-2.5 pr-1 bg-[var(--st-surface)] border border-[var(--st-border)] rounded-[10px] text-xs shadow-[var(--st-shadow-xs)]">
            <Shield className="w-3.5 h-3.5 text-[var(--st-accent-text)]" />
            <span className="text-[10.5px] uppercase tracking-wider font-semibold text-[var(--st-text-muted)]">
              View as
            </span>
            <select
              value={simulatedRole || ROLES.SUPER_ADMIN}
              onChange={(e) => {
                const val = e.target.value;
                setSimulatedRole(val === ROLES.SUPER_ADMIN ? null : val);
              }}
              className="bg-transparent text-[12.5px] font-semibold text-[var(--st-text-primary)] focus:outline-none cursor-pointer border-none pr-1"
            >
              <option value={ROLES.SUPER_ADMIN}>Super Admin</option>
              <option value={ROLES.SALES_MANAGER}>Sales Manager</option>
              <option value={ROLES.PROJECT_MANAGER}>Project Manager</option>
              <option value={ROLES.FINANCE}>Finance Executive</option>
              <option value={ROLES.DEVELOPER}>Developer</option>
              <option value={ROLES.CLIENT}>Client Portal</option>
            </select>
          </label>
        )}

        {/* Theme */}
        <div className="relative" ref={themeRef}>
          <button
            onClick={() => toggle('theme')}
            className="st-icon-btn"
            aria-label="Change theme"
            aria-expanded={openMenu === 'theme'}
            title="Theme"
          >
            <ThemeIcon className="w-[18px] h-[18px]" />
          </button>
          {openMenu === 'theme' && (
            <div className="st-menu w-40 p-1.5" role="menu">
              {THEME_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    role="menuitemradio"
                    aria-checked={theme === opt.id}
                    onClick={() => {
                      setTheme(opt.id);
                      closeMenu();
                    }}
                    className="st-menu-item"
                  >
                    <Icon />
                    <span className="flex-1">{opt.label}</span>
                    {theme === opt.id && <Check className="text-[var(--st-accent-text)]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => toggle('notif')}
            className="st-icon-btn"
            aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ''}`}
            aria-expanded={openMenu === 'notif'}
          >
            <Bell className="w-[18px] h-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-gradient-to-br from-[#3B5BFF] to-[#9A5CFF] text-white text-[9.5px] font-bold flex items-center justify-center ring-2 ring-[var(--st-bg)]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {openMenu === 'notif' && (
            <div className="st-menu w-[340px] max-w-[calc(100vw-2rem)]">
              <div className="px-4 py-3 border-b border-[var(--st-border)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--st-text-primary)]">Notifications</span>
                  {unreadCount > 0 && <span className="st-pill-accent">{unreadCount} new</span>}
                </div>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="st-link text-[11.5px]">
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-[360px] overflow-y-auto studio-scrollbar p-1.5">
                {notifications.length === 0 ? (
                  <div className="py-10 px-6 text-center">
                    <div className="st-icon-chip st-tone-slate mx-auto mb-3">
                      <BellOff className="w-4 h-4" />
                    </div>
                    <div className="text-[13px] font-semibold text-[var(--st-text-primary)]">You're all caught up</div>
                    <div className="text-xs text-[var(--st-text-muted)] mt-0.5">New alerts will show up here.</div>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => handleMarkRead(n.id)}
                      className={`w-full text-left flex gap-3 p-2.5 rounded-lg border-0 cursor-pointer transition-colors hover:bg-[var(--st-surface-hover)] ${
                        !n.read ? 'bg-[var(--st-accent-subtle)]' : 'bg-transparent'
                      }`}
                    >
                      <span
                        className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                          !n.read ? 'bg-[var(--st-accent)]' : 'bg-[var(--st-border-strong)]'
                        }`}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-semibold text-[var(--st-text-primary)]">{n.title}</span>
                        <span className="block text-xs text-[var(--st-text-secondary)] mt-0.5 line-clamp-2">
                          {n.message}
                        </span>
                        {n.createdAt && (
                          <span className="block text-[11px] text-[var(--st-text-muted)] mt-1">
                            {formatDateTime(n.createdAt)}
                          </span>
                        )}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {role !== ROLES.CLIENT && (
          <button onClick={onOpenQuickAction} className="st-btn-primary h-9 px-3 sm:px-3.5" title="Quick create (N)">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New</span>
          </button>
        )}

        {/* User */}
        <div className="relative ml-0.5" ref={userRef}>
          <button
            onClick={() => toggle('user')}
            className="flex items-center rounded-full p-0.5 border-0 bg-transparent cursor-pointer ring-offset-2 ring-offset-[var(--st-bg)] hover:ring-2 hover:ring-[var(--st-accent-border)] transition-shadow"
            aria-label="Account menu"
            aria-expanded={openMenu === 'user'}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3B5BFF] to-[#9A5CFF] text-white font-semibold text-[11px] flex items-center justify-center">
              {initials}
            </div>
          </button>

          {openMenu === 'user' && (
            <div className="st-menu w-64">
              <div className="p-4 flex items-center gap-3 border-b border-[var(--st-border)] bg-[var(--st-gradient-soft)]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3B5BFF] to-[#9A5CFF] text-white font-semibold text-sm flex items-center justify-center shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[var(--st-text-primary)] truncate">
                    {userProfile?.displayName || 'Aaditya Vishnoi'}
                  </div>
                  <div className="text-xs text-[var(--st-text-secondary)] truncate">{userProfile?.email}</div>
                  <div className="mt-1 text-[10.5px] font-semibold text-[var(--st-accent-text)] uppercase tracking-wider">
                    {(role || 'Super Admin').replace(/_/g, ' ')}
                  </div>
                </div>
              </div>

              <div className="p-1.5">
                {role !== ROLES.CLIENT && (
                  <Link to={toPath('/admin/settings')} onClick={closeMenu} className="st-menu-item">
                    <Settings />
                    <span>Settings</span>
                  </Link>
                )}
                <a href="https://brainlink.in" target="_blank" rel="noopener noreferrer" className="st-menu-item">
                  <ExternalLink />
                  <span className="flex-1">Main website</span>
                </a>
              </div>

              <div className="p-1.5 border-t border-[var(--st-border)]">
                <button
                  onClick={logout}
                  className="st-menu-item st-menu-item-danger"
                >
                  <LogOut />
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
