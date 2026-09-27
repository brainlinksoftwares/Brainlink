import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import CommandPalette from './CommandPalette';
import QuickActionModal from './QuickActionModal';

const COLLAPSE_KEY = 'brainlink_studio_sidebar_collapsed';

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === '1';
  } catch (e) {
    return false;
  }
}

// Shown inside the content area while a lazily-loaded module chunk downloads,
// so the sidebar and topbar stay put.
function PageSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading page">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="st-skeleton h-7 w-56" />
          <div className="st-skeleton h-4 w-80 max-w-full" />
        </div>
        <div className="st-skeleton h-9 w-28" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="st-skeleton h-[108px] rounded-[13px]" />
        ))}
      </div>
      <div className="st-skeleton h-[380px] rounded-[13px]" />
    </div>
  );
}

export default function StudioLayout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0');
      } catch (e) {}
      return next;
    });
  }, []);

  // Global keyboard shortcuts: Cmd/Ctrl+K (search), N (quick create), [ (toggle sidebar)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const el = document.activeElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(el?.tagName) || el?.isContentEditable) {
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      } else if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setQuickActionOpen(true);
      } else if (e.key === '[') {
        e.preventDefault();
        toggleCollapsed();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCollapsed]);

  // Close the mobile drawer whenever the route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="studio-shell min-h-screen flex">
      <div className="st-ambient" aria-hidden="true" />

      <Sidebar
        isOpen={mobileMenuOpen}
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div
        className={`relative z-[1] flex-1 flex flex-col min-w-0 transition-[padding] duration-300 ease-out ${
          collapsed ? 'lg:pl-[76px]' : 'lg:pl-[264px]'
        }`}
      >
        <Topbar
          onMenuClick={() => setMobileMenuOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenQuickAction={() => setQuickActionOpen(true)}
        />

        <main className="st-main flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7 max-w-[1480px] w-full mx-auto">
          {/* Keyed wrapper replays the entrance animation on every navigation */}
          <div key={location.pathname} className="st-page-enter">
            <Suspense fallback={<PageSkeleton />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>

      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
      <QuickActionModal isOpen={quickActionOpen} onClose={() => setQuickActionOpen(false)} />
    </div>
  );
}
