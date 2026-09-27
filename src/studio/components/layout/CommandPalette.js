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
  PlusCircle,
  Clock,
} from 'lucide-react';
import { useStudioBase } from '../../context/StudioBaseContext';
import { getLeads } from '../../services/crmService';
import { getProjects } from '../../services/projectService';
import { getInvoices } from '../../services/financeService';
import { getClients } from '../../services/clientService';
import { getDeals } from '../../services/salesService';

export default function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { basePath } = useStudioBase();
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
          .filter(
            (l) =>
              (l.name || '').toLowerCase().includes(q) ||
              (l.company || '').toLowerCase().includes(q)
          )
          .slice(0, 3)
          .map((l) => ({
            id: l.id,
            title: l.name,
            subtitle: `Lead • ${l.company || 'Direct'} • ${l.status}`,
            icon: Users,
            url: '/crm/leads',
          }));

        const projectMatches = projects
          .filter(
            (p) =>
              (p.name || '').toLowerCase().includes(q) ||
              (p.clientName || '').toLowerCase().includes(q)
          )
          .slice(0, 3)
          .map((p) => ({
            id: p.id,
            title: p.name,
            subtitle: `Project • ${p.clientName} • ${p.status}`,
            icon: FolderGit2,
            url: '/projects',
          }));

        const invoiceMatches = invoices
          .filter(
            (i) =>
              (i.invoiceNumber || '').toLowerCase().includes(q) ||
              (i.clientName || '').toLowerCase().includes(q)
          )
          .slice(0, 3)
          .map((i) => ({
            id: i.id,
            title: i.invoiceNumber,
            subtitle: `Invoice • ₹${i.total || 0} • ${i.clientName}`,
            icon: Receipt,
            url: '/finance/invoices',
          }));

        const clientMatches = clients
          .filter(
            (c) =>
              (c.companyName || '').toLowerCase().includes(q) ||
              (c.primaryContact || '').toLowerCase().includes(q)
          )
          .slice(0, 3)
          .map((c) => ({
            id: c.id,
            title: c.companyName,
            subtitle: `Client • ${c.primaryContact || ''}`,
            icon: Building2,
            url: '/clients',
          }));

        const dealMatches = deals
          .filter(
            (d) =>
              (d.name || '').toLowerCase().includes(q) ||
              (d.company || '').toLowerCase().includes(q)
          )
          .slice(0, 3)
          .map((d) => ({
            id: d.id,
            title: d.name,
            subtitle: `Deal • ₹${d.value || 0} • ${d.stage}`,
            icon: TrendingUp,
            url: '/sales/pipeline',
          }));

        setResults([
          ...leadMatches,
          ...projectMatches,
          ...invoiceMatches,
          ...clientMatches,
          ...dealMatches,
        ]);
        setSelectedIndex(0);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  const quickActions = [
    { title: 'Create Lead', icon: PlusCircle, url: '/crm/leads', category: 'ACTION' },
    { title: 'Create Client', icon: PlusCircle, url: '/clients', category: 'ACTION' },
    { title: 'Create Deal', icon: PlusCircle, url: '/sales/pipeline', category: 'ACTION' },
    { title: 'Create Invoice', icon: PlusCircle, url: '/finance/invoices', category: 'ACTION' },
  ];

  const recentNav = [
    { title: 'Acme Technologies', subtitle: 'Enterprise Client Workspace', icon: Building2, url: '/clients' },
    { title: 'Executive Overview', subtitle: 'Business Snapshot & Metrics', icon: TrendingUp, url: '/dashboard' },
    { title: 'Active Deliveries', subtitle: 'Sprints & Milestones', icon: FolderGit2, url: '/projects' },
    { title: 'Financial Invoices', subtitle: 'GST Billing & Collections', icon: Receipt, url: '/finance/invoices' },
  ];

  const displayItems = query.trim() ? results : [...quickActions, ...recentNav];

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
      className="st-themed fixed inset-0 z-50 bg-[#07090E]/55 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-24 px-4"
      style={{ animation: 'stFadeIn 160ms ease-out' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[var(--st-surface-elevated)] rounded-2xl border border-[var(--st-border)] shadow-[var(--st-shadow-modal)] overflow-hidden flex flex-col"
        style={{ animation: 'stScaleUp 220ms var(--st-ease)' }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDownList}
      >
        {/* Search Input Box */}
        <div className="relative flex items-center px-5 py-4 border-b border-[#E7E9EE] dark:border-[#222733]">
          <Search className="w-[18px] h-[18px] text-[#9299A6] absolute left-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search leads, clients, projects, invoices..."
            autoFocus
            className="w-full pl-8 pr-8 text-[15px] font-normal bg-transparent border-0 text-[#111318] dark:text-white placeholder-[#9299A6] outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="text-[#9299A6] hover:text-[#111318] dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="text-[10px] font-sans font-medium text-[#9299A6] bg-[#F6F7F9] dark:bg-[#151923] px-1.5 py-0.5 rounded border border-[#E7E9EE] dark:border-[#222733]">
              ESC
            </kbd>
          )}
        </div>

        {/* Results / Quick Actions Container */}
        <div className="max-h-[420px] overflow-y-auto studio-scrollbar p-2">
          {loading ? (
            <div className="py-8 text-center text-xs text-[#9299A6] flex items-center justify-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-[#315CFF] border-t-transparent rounded-full animate-spin" />
              <span>Searching Brainlink Studio...</span>
            </div>
          ) : displayItems.length === 0 ? (
            <div className="py-10 text-center px-4">
              <p className="text-sm font-medium text-[#111318] dark:text-white">No results found</p>
              <p className="text-xs text-[#9299A6] mt-1">Try keywords like client name, deal title, or invoice.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {!query.trim() && (
                <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#9299A6]">
                  Quick Actions
                </div>
              )}
              {displayItems.map((item, index) => {
                const Icon = item.icon;
                const isSelected = index === selectedIndex;
                const isRecentDivider = !query.trim() && index === quickActions.length;

                return (
                  <React.Fragment key={item.id || item.title + index}>
                    {isRecentDivider && (
                      <div className="px-2.5 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#9299A6] border-t border-[#E7E9EE] dark:border-[#222733] mt-1">
                        Recent & Suggested
                      </div>
                    )}
                    <div
                      onClick={() => handleSelect(item.url)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#315CFF]/10 text-[#315CFF] dark:text-[#5D80FF]'
                          : 'hover:bg-[#F6F7F9] dark:hover:bg-[#151923] text-[#111318] dark:text-[#F5F7FA]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-[#315CFF] text-white'
                              : 'bg-[#F6F7F9] dark:bg-[#151923] text-[#626A78] dark:text-[#9AA3B2]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[13px] font-semibold truncate">{item.title}</div>
                          {item.subtitle && (
                            <div className="text-[11px] text-[#9299A6] truncate">
                              {item.subtitle}
                            </div>
                          )}
                        </div>
                      </div>
                      <ArrowRight
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isSelected
                            ? 'text-[#315CFF] dark:text-[#5D80FF]'
                            : 'text-[#B4B9C4] dark:text-[#414959]'
                        }`}
                      />
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>

        {/* Keyboard Helper Footer */}
        <div className="px-4 py-2 bg-[var(--st-surface-subtle)] border-t border-[#E7E9EE] dark:border-[#222733] flex items-center justify-between text-[11px] text-[#9299A6]">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-sans font-medium bg-white dark:bg-[#10131A] px-1 py-0.5 rounded border border-[#E7E9EE] dark:border-[#222733] mr-1">
                ↑
              </kbd>
              <kbd className="font-sans font-medium bg-white dark:bg-[#10131A] px-1 py-0.5 rounded border border-[#E7E9EE] dark:border-[#222733] mr-1">
                ↓
              </kbd>
              Navigate
            </span>
            <span>
              <kbd className="font-sans font-medium bg-white dark:bg-[#10131A] px-1 py-0.5 rounded border border-[#E7E9EE] dark:border-[#222733] mr-1">
                ↵
              </kbd>
              Select
            </span>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-medium text-[#626A78] dark:text-[#9AA3B2]">
            <Sparkles className="w-3 h-3 text-[#315CFF]" />
            Brainlink Command Center
          </span>
        </div>
      </div>
    </div>
  );
}
