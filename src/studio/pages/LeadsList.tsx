import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  ArrowUpDown,
  KanbanSquare,
  Table as TableIcon,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  Phone,
  Mail,
  MoreVertical,
  Building,
  UserCheck,
  Calendar,
  X,
} from 'lucide-react';
import { leadService, LeadFilterOptions } from '../services/leadService';
import { teamService } from '../services/teamService';
import { csvService } from '../services/csvService';
import { Lead, LeadStatus, LeadPriority, User } from '../types';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { DEFAULT_LEAD_STATUSES, DEFAULT_LEAD_SOURCES } from '../config/crmConfig';

export const LeadsList: React.FC = () => {
  const navigate = useNavigate();
  const { user, role, checkPermission } = useAuth();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Sorting state
  const [sortField, setSortField] = useState<keyof Lead>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    company: true,
    email: true,
    phone: true,
    source: true,
    service: true,
    status: true,
    priority: true,
    assignedTo: true,
    createdAt: true,
  });
  const [showColumnToggle, setShowColumnToggle] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [leadData, userData] = await Promise.all([
        leadService.getAllLeads(),
        teamService.getAllUsers(),
      ]);
      setLeads(leadData);
      setUsers(userData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = leadService.subscribe(loadData);
    return () => unsub();
  }, []);

  // Filter leads
  const filteredLeads = useMemo(() => {
    const filters: LeadFilterOptions = {
      search,
      status: statusFilter,
      source: sourceFilter,
      priority: priorityFilter,
      assignedTo: assigneeFilter,
      startDate,
      endDate,
    };

    let result = leadService.filterLeads(leads, filters);

    // If Sales role: only see assigned leads (unless unassigned)
    if (role === 'sales' && user) {
      result = result.filter((l) => !l.assignedTo || l.assignedTo === user.id);
    }

    // Sort
    result.sort((a, b) => {
      let aVal: any = a[sortField] || '';
      let bVal: any = b[sortField] || '';

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [leads, search, statusFilter, sourceFilter, priorityFilter, assigneeFilter, startDate, endDate, sortField, sortDirection, role, user]);

  // Paginated slice
  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / itemsPerPage));
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLeads.slice(start, start + itemsPerPage);
  }, [filteredLeads, currentPage, itemsPerPage]);

  const handleSort = (field: keyof Lead) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExportCsv = () => {
    const csvContent = csvService.exportLeadsToCsv(filteredLeads);
    csvService.downloadCsv(csvContent, `brainlink_leads_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleDeleteLead = async (leadId: string, leadName: string) => {
    if (window.confirm(`Are you sure you want to delete lead "${leadName}"?`)) {
      if (user) {
        await leadService.deleteLead(leadId, { id: user.id, name: user.name });
      }
    }
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setSourceFilter('all');
    setPriorityFilter('all');
    setAssigneeFilter('all');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    search ||
    statusFilter !== 'all' ||
    sourceFilter !== 'all' ||
    priorityFilter !== 'all' ||
    assigneeFilter !== 'all' ||
    startDate ||
    endDate;

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Lead Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            View, filter, qualify and manage incoming sales inquiries
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/pipeline')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-2xs transition-colors"
          >
            <KanbanSquare className="w-3.5 h-3.5 text-slate-500" />
            Pipeline Kanban
          </button>
          <button
            onClick={handleExportCsv}
            disabled={filteredLeads.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-2xs transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export CSV
          </button>
          <button
            onClick={() => navigate('/leads/import')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-2xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            Import
          </button>
          <button
            onClick={() => navigate('/leads/new')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Lead
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by prospect name, company, email, phone, or requirement..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:border-blue-600"
            >
              <option value="all">All Statuses</option>
              {DEFAULT_LEAD_STATUSES.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>

            {/* Source Filter */}
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:border-blue-600"
            >
              <option value="all">All Sources</option>
              {DEFAULT_LEAD_SOURCES.map((src) => (
                <option key={src} value={src}>
                  {src}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:border-blue-600"
            >
              <option value="all">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>

            {/* Assignee Filter */}
            <select
              value={assigneeFilter}
              onChange={(e) => {
                setAssigneeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:border-blue-600"
            >
              <option value="all">All Assignees</option>
              <option value="unassigned">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Date Filter line */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span className="font-medium text-slate-600 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Date Created Range:
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2 py-1 border border-slate-200 rounded-lg text-xs"
          />
          <span>to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2 py-1 border border-slate-200 rounded-lg text-xs"
          />
        </div>
      </div>

      {/* Main Table or Empty State */}
      {leads.length === 0 ? (
        <EmptyState
          title="No leads yet"
          description="Your sales pipeline is currently empty. Add your first inquiry or distribute your /apply public form to start collecting customer leads."
          actionLabel="Create First Lead"
          onAction={() => navigate('/leads/new')}
        />
      ) : filteredLeads.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-2xl border border-slate-200">
          <p className="text-sm font-semibold text-slate-800">No leads match your active filters.</p>
          <p className="text-xs text-slate-500 mt-1">Try resetting the search terms or date boundaries.</p>
          <button
            onClick={clearFilters}
            className="mt-3 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th
                    onClick={() => handleSort('name')}
                    className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Prospect Name</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>

                  {visibleColumns.company && <th className="py-3 px-3">Company</th>}
                  {visibleColumns.email && <th className="py-3 px-3">Contact</th>}
                  {visibleColumns.service && <th className="py-3 px-3">Service</th>}
                  {visibleColumns.source && <th className="py-3 px-3">Source</th>}
                  {visibleColumns.status && (
                    <th
                      onClick={() => handleSort('status')}
                      className="py-3 px-3 cursor-pointer hover:text-slate-900"
                    >
                      <div className="flex items-center gap-1">
                        <span>Status</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                  )}
                  {visibleColumns.priority && <th className="py-3 px-3">Priority</th>}
                  {visibleColumns.assignedTo && <th className="py-3 px-3">Assigned To</th>}
                  {visibleColumns.createdAt && (
                    <th
                      onClick={() => handleSort('createdAt')}
                      className="py-3 px-3 cursor-pointer hover:text-slate-900"
                    >
                      <div className="flex items-center gap-1">
                        <span>Created</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                  )}
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => navigate(`/leads/${lead.id}`)}
                    className="hover:bg-blue-50/30 cursor-pointer transition-colors group"
                  >
                    {/* Name */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {lead.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                        {lead.requirement || 'No notes'}
                      </div>
                    </td>

                    {/* Company */}
                    {visibleColumns.company && (
                      <td className="py-3 px-3 text-slate-700 font-medium">
                        {lead.company || '—'}
                      </td>
                    )}

                    {/* Contact */}
                    {visibleColumns.email && (
                      <td className="py-3 px-3 text-slate-600">
                        <div className="truncate max-w-[170px]">{lead.email || '—'}</div>
                        <div className="text-[11px] text-slate-400">{lead.phone || ''}</div>
                      </td>
                    )}

                    {/* Service */}
                    {visibleColumns.service && (
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {lead.service || 'Custom Development'}
                      </td>
                    )}

                    {/* Source */}
                    {visibleColumns.source && (
                      <td className="py-3 px-3 text-slate-500">
                        <span className="px-2 py-0.5 bg-slate-100 rounded-md font-medium text-[11px]">
                          {lead.source}
                        </span>
                      </td>
                    )}

                    {/* Status */}
                    {visibleColumns.status && (
                      <td className="py-3 px-3">
                        <StatusBadge status={lead.status} size="sm" />
                      </td>
                    )}

                    {/* Priority */}
                    {visibleColumns.priority && (
                      <td className="py-3 px-3">
                        <PriorityBadge priority={lead.priority} size="sm" />
                      </td>
                    )}

                    {/* Assignee */}
                    {visibleColumns.assignedTo && (
                      <td className="py-3 px-3 text-slate-600">
                        {lead.assignedToName ? (
                          <span className="font-medium text-slate-800">{lead.assignedToName}</span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                    )}

                    {/* Created date */}
                    {visibleColumns.createdAt && (
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                    )}

                    {/* Action buttons */}
                    <td
                      className="py-3 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/leads/${lead.id}`)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View lead profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {role === 'admin' && (
                          <button
                            onClick={() => handleDeleteLead(lead.id, lead.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete lead"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
            <div>
              Showing <span className="font-semibold text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-semibold text-slate-700">
                {Math.min(currentPage * itemsPerPage, filteredLeads.length)}
              </span>{' '}
              of <span className="font-semibold text-slate-700">{filteredLeads.length}</span> leads
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-medium text-slate-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
