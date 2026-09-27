import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Users,
  Building2,
  FolderGit2,
  Receipt,
  TrendingUp,
  X,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useStudioBase } from '../../context/StudioBaseContext';
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
  const [selectedIndex, setSelectedIndex] = useState(0);

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
      setSelectedIndex(0);
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
            url: '/crm/leads',
          }));

        const projectMatches = projects
          .filter(p => (p.name || '').toLowerCase().includes(q) || (p.clientName || '').toLowerCase().includes(q))
          .slice(0, 3)
          .map(p => ({
            id: p.id,
            title: p.name,
            subtitle: `Project • ${p.clientName} • ${p.status}`,
            icon: FolderGit2,
            url: '/projects',
          }));

        const invoiceMatches = invoices
          .filter(i => (i.invoiceNumber || '').toLowerCase().includes(q) || (i.clientName || '').toLowerCase().includes(q))
          .slice(0, 3)
          .map(i => ({
            id: i.id,
            title: i.invoiceNumber,
            subtitle: `Invoice • ₹${i.total || 0} • ${i.clientName} • ${i.status}`,
            icon: Receipt,
            url: '/finance/invoices',
          }));

        const clientMatches = clients
          .filter(c => (c.companyName || '').toLowerCase().includes(q) || (c.primaryContact || '').toLowerCase().includes(q))
          .slice(0, 3)
          .map(c => ({
            id: c.id,
            title: c.companyName,
            subtitle: `Client • ${c.primaryContact || ''} • ${c.status}`,
            icon: Building2,
            url: '/clients',
          }));

        const dealMatches = deals
          .filter(d => (d.name || '').toLowerCase().includes(q) || (d.company || '').toLowerCase().includes(q))
          .slice(0, 3)
          .map(d => ({
            id: d.id,
            title: d.name,
            subtitle: `Deal • ₹${d.value || 0} • ${d.stage}`,
            icon: TrendingUp,
            url: '/sales/pipeline',
          }));

        setResults([...leadMatches, ...projectMatches, ...invoiceMatches, ...clientMatches, ...dealMatches]);
        setSelectedIndex(0);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  const quickNav = [
    { title: 'Executive Dashboard', subtitle: 'View business health & revenue metrics', icon: TrendingUp, url: '/dashboard' },
    { title: 'Pipeline Kanban', subtitle: 'Drag & drop deal stages', icon: TrendingUp, url: '/sales/pipeline' },
    { title: 'GST Invoices', subtitle: 'Manage invoices, generate PDF', icon: Receipt, url: '/finance/invoices' },
    { title: 'Projects & Tasks', subtitle: 'Active client engineering projects', icon: FolderGit2, url: '/projects' },
    { title: 'Client Onboarding', subtitle: 'Track onboarding checklists', icon: Building2, url: '/clients/onboarding' },
  ];

  const displayItems = query.trim() ? results : quickNav;

  const { basePath } = useStudioBase();

  const handleSelect = (url) => {
    const fullUrl = basePath ? `${basePath}${url.startsWith('/') ? url : `/${url}`}` : url;
    navigate(fullUrl);
    onClose();
  };

  const handleKeyDownList = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (displayItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (displayItems.length || 1)) % (displayItems.length || 1));
    } else if (e.key === 'Enter' && displayItems[selectedIndex]) {
      e.preventDefault();
      handleSelect(displayItems[selectedIndex].url);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDownList}
      >
        {/* Search Input Box */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-4 h-4 text-slate-400 absolute left-4" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search leads, projects, invoices, clients..."
            autoFocus
            className="w-full pl-8 pr-8 text-sm bg-transparent text-slate-900 dark:text-white placeholder-slate-400 outline-none"
          />
          {query ? (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              ESC
            </kbd>
          )}
        </div>

        {/* Results / Quick Nav Container */}
        <div className="max-h-80 overflow-y-auto studio-scrollbar p-2">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Searching across Brainlink...</span>
            </div>
          ) : displayItems.length === 0 ? (
            <div className="py-10 text-center px-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No results found</p>
              <p className="text-xs text-slate-400 mt-1">Try searching by client name, project code, or invoice ID.</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {query.trim() ? `Search Results (${results.length})` : 'Quick Navigation'}
              </div>
              {displayItems.map((item, index) => {
                const Icon = item.icon;
                const isSelected = index === selectedIndex;
                return (
                  <div
                    key={item.id || item.title}
                    onClick={() => handleSelect(item.url)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate">{item.title}</div>
                        <div className="text-[11px] text-slate-400 truncate">{item.subtitle}</div>
                      </div>
                    </div>
                    <ArrowRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-300 dark:text-slate-600'}`} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Keyboard Helper Footer */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700 mr-1">↑</kbd>
              <kbd className="font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700 mr-1">↓</kbd>
              Navigate
            </span>
            <span>
              <kbd className="font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700 mr-1">↵</kbd>
              Select
            </span>
          </div>
          <span className="flex items-center gap-1 text-[10px]">
            <Sparkles className="w-3 h-3 text-blue-500" />
            Brainlink Universal Search
          </span>
        </div>
      </div>
    </div>
  );
}
