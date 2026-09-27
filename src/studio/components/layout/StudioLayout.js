import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import CommandPalette from './CommandPalette';
import QuickActionModal from './QuickActionModal';

export default function StudioLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);

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

  return (
    <div className="studio-shell min-h-screen flex bg-[#F6F7F9] dark:bg-[#090B10] text-[#111318] dark:text-[#F5F7FA]">
      {/* Sidebar (Width: 256px / w-64) */}
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 transition-all">
        {/* Topbar */}
        <Topbar
          onMenuClick={() => setMobileMenuOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenQuickAction={() => setQuickActionOpen(true)}
        />

        {/* Page Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-[1400px] w-full mx-auto">
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
