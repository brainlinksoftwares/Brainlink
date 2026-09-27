import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import CommandPalette from './CommandPalette';
import QuickActionModal from './QuickActionModal';
import { ChevronRight } from 'lucide-react';

export default function StudioLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const location = useLocation();

  // Listen for global keyboard shortcuts (Cmd+K / Ctrl+K and 'N')
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is currently typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setQuickActionOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Generate clean breadcrumbs
  const pathSegments = location.pathname.split('/').filter(Boolean);
  // Filter out 'studio' if present to make breadcrumbs clean
  const cleanSegments = pathSegments.filter((seg) => seg !== 'studio');

  return (
    <div className="studio-shell min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Sidebar */}
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-60 flex flex-col min-w-0">
        {/* Topbar */}
        <Topbar
          onMenuClick={() => setMobileMenuOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenQuickAction={() => setQuickActionOpen(true)}
        />

        {/* Compact Breadcrumb Bar */}
        <div className="px-4 sm:px-6 lg:px-8 py-2 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <nav className="flex items-center space-x-1.5">
            <Link to="/" className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors font-medium">
              Studio
            </Link>
            {cleanSegments.map((seg, idx) => {
              const url = '/' + cleanSegments.slice(0, idx + 1).join('/');
              const isLast = idx === cleanSegments.length - 1;
              const formattedName = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');

              return (
                <React.Fragment key={url}>
                  <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600 shrink-0" />
                  {isLast ? (
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{formattedName}</span>
                  ) : (
                    <Link to={url} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                      {formattedName}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
            <span>Press <kbd className="font-mono px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">N</kbd> for quick add</span>
          </div>
        </div>

        {/* Page Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Modals */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
      <QuickActionModal
        isOpen={quickActionOpen}
        onClose={() => setQuickActionOpen(false)}
      />
    </div>
  );
}
