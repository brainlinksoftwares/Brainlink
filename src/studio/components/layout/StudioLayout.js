import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import CommandPalette from './CommandPalette';
import QuickActionModal from './QuickActionModal';
import { ChevronRight, Home } from 'lucide-react';

export default function StudioLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const location = useLocation();

  // Generate breadcrumbs from pathname
  const pathSegments = location.pathname.split('/').filter(Boolean);
  // e.g. ['studio', 'crm', 'leads']

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar */}
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Topbar */}
        <Topbar
          onMenuClick={() => setMobileMenuOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenQuickAction={() => setQuickActionOpen(true)}
        />

        {/* Breadcrumb Header */}
        <div className="px-4 sm:px-8 py-3 bg-white/70 border-b border-slate-200/60 backdrop-blur-xs flex items-center justify-between">
          <nav className="flex items-center space-x-1.5 text-xs text-slate-500">
            <Link to="/studio/dashboard" className="hover:text-blue-600 flex items-center gap-1 transition-colors">
              <Home className="w-3.5 h-3.5 text-slate-400" />
              <span>Studio</span>
            </Link>
            {pathSegments.slice(1).map((seg, idx) => {
              const url = '/' + pathSegments.slice(0, idx + 2).join('/');
              const isLast = idx === pathSegments.length - 2;
              const formattedName = seg.charAt(0).toUpperCase() + seg.slice(1).replace('-', ' ');

              return (
                <React.Fragment key={url}>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  {isLast ? (
                    <span className="font-semibold text-slate-800">{formattedName}</span>
                  ) : (
                    <Link to={url} className="hover:text-blue-600 transition-colors">
                      {formattedName}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        </div>

        {/* Page Outlet */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
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
