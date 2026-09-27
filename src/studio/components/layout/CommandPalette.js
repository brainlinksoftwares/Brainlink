import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Users,
  Building2,
  FolderGit2,
  Receipt,
  CheckSquare,
  TrendingUp,
  FileText,
  X,
  ArrowRight,
} from 'lucide-react';
import { getLeads } from '../../services/crmService';
import { getProjects } from '../../services/projectService';
import { getInvoices } from '../../services/financeService';
import { getClients } from '../../services/clientService';
import { getDeals } from '../../services/salesService';

export default function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Live search across entities
  useEffect(() => {
    if (!isOpen || !query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const q = query.toLowerCase();

      try {
        const [leads, projects, invoices, clients, deals] = await Promise.all([
          getLeads(),
          getProjects(),
          getInvoices(),
          getClients(),
          getDeals(),
        ]);

        const leadMatches = leads
          .filter(l => (l.name || '').toLowerCase().includes(q) || (l.company || '').toLowerCase().includes(q))
          .slice(0, 3)
          .map(l => ({
            id: l.id,
            title: l.name,
            subtitle: `Lead • ${l.company || 'No Company'} • ${l.status}`,
            icon: Users,
            url: '/studio/crm/leads',
          }));

        const projectMatches = projects
          .filter(p => (p.name || '').toLowerCase().includes(q) || (p.clientName || '').toLowerCase().includes(q))
          .slice(0, 3)
          .map(p => ({
            id: p.id,
            title: p.name,
            subtitle: `Project • ${p.clientName} • ${p.status}`,
            icon: FolderGit2,
            url: `/studio/projects`,
          }));

        const invoiceMatches = invoices
          .filter(i => (i.invoiceNumber || '').toLowerCase().includes(q) || (i.clientName || '').toLowerCase().includes(q))
          .slice(0, 3)
          .map(i => ({
            id: i.id,
            title: i.invoiceNumber,
            subtitle: `Invoice • ₹${i.total} • ${i.clientName} • ${i.status}`,
            icon: Receipt,
            url: `/studio/finance/invoices`,
          }));

        const clientMatches = clients
          .filter(c => (c.companyName || '').toLowerCase().includes(q) || (c.primaryContact || '').toLowerCase().includes(q))
          .slice(0, 3)
          .map(c => ({
            id: c.id,
            title: c.companyName,
            subtitle: `Client • ${c.primaryContact || ''} • ${c.status}`,
            icon: Building2,
            url: `/studio/clients`,
          }));

        const dealMatches = deals
          .filter(d => (d.name || '').toLowerCase().includes(q) || (d.company || '').toLowerCase().includes(q))
          .slice(0, 3)
          .map(d => ({
            id: d.id,
            title: d.name,
            subtitle: `Deal • ₹${d.value || 0} • ${d.stage}`,
            icon: TrendingUp,
            url: `/studio/sales/pipeline`,
          }));

        setResults([...leadMatches, ...projectMatches, ...invoiceMatches, ...clientMatches, ...dealMatches]);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  const quickNav = [
    { title: 'Executive Dashboard', subtitle: 'View business health & revenue metrics', icon: TrendingUp, url: '/studio/dashboard' },
    { title: 'Pipeline Kanban', subtitle: 'Drag & drop deal stages', icon: TrendingUp, url: '/studio/sales/pipeline' },
    { title: 'GST Invoices', subtitle: 'Manage invoices, generate PDF', icon: Receipt, url: '/studio/finance/invoices' },
    { title: 'Projects & Tasks', subtitle: 'Active client engineering projects', icon: FolderGit2, url: '/studio/projects' },
    { title: 'Client Onboarding', subtitle: 'Track onboarding checklists', icon: Building2, url: '/studio/clients/onboarding' },
  ];

  const handleSelect = (url) => {
    navigate(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="min-h-full flex items-start justify-center p-4 pt-16 sm:pt-24 text-center">
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-left"
        >
          {/* Search Header */}
          <div className="p-4 border-b border-slate-100 flex items-center gap-3">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search leads, clients, deals, projects, invoices..."
              className="w-full text-sm font-medium text-slate-800 focus:outline-none placeholder-slate-400"
            />
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results List */}
          <div className="max-h-96 overflow-y-auto p-2">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Searching Brainlink Studio...</div>
            ) : query.trim() ? (
              results.length > 0 ? (
                <div className="space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Search Results ({results.length})
                  </div>
                  {results.map((r) => {
                    const Icon = r.icon;
                    return (
                      <div
                        key={r.id + r.title}
                        onClick={() => handleSelect(r.url)}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                              {r.title}
                            </div>
                            <div className="text-[11px] text-slate-400">{r.subtitle}</div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No matching records found for "{query}"
                </div>
              )
            ) : (
              <div className="space-y-1">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Quick Navigation
                </div>
                {quickNav.map((nav) => {
                  const Icon = nav.icon;
                  return (
                    <div
                      key={nav.title}
                      onClick={() => handleSelect(nav.url)}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 flex items-center justify-center shrink-0 transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                            {nav.title}
                          </div>
                          <div className="text-[11px] text-slate-400">{nav.subtitle}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Shortcuts hint */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Navigation Shortcuts</span>
            <div className="flex items-center gap-2">
              <span>ESC to close</span>
              <span>•</span>
              <span>CTRL+K to toggle</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
