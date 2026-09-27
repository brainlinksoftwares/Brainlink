import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { exportToCSV } from '../../utils/formatters';

export default function DataTable({
  columns = [],
  data = [],
  searchKey = 'name',
  searchPlaceholder = 'Search records...',
  filterOptions = [],
  filterKey = 'status',
  onRowClick,
  actions,
  bulkActions,
  exportFileName = 'export',
  loading = false,
  emptyMessage = 'No records found.',
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('ALL');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);

  // Filtering & Search
  const filteredData = useMemo(() => {
    let result = [...data];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(item => {
        if (typeof searchKey === 'string') {
          return String(item[searchKey] || '').toLowerCase().includes(q);
        } else if (Array.isArray(searchKey)) {
          return searchKey.some(k => String(item[k] || '').toLowerCase().includes(q));
        }
        return false;
      });
    }

    if (filterValue !== 'ALL') {
      result = result.filter(item => String(item[filterKey]) === filterValue);
    }

    if (sortColumn) {
      result.sort((a, b) => {
        let valA = a[sortColumn];
        let valB = b[sortColumn];

        if (valA === undefined || valA === null) valA = '';
        if (valB === undefined || valB === null) valB = '';

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }

        return sortDirection === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return result;
  }, [data, searchTerm, filterValue, filterKey, sortColumn, sortDirection, searchKey]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleSort = (key) => {
    if (sortColumn === key) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(key);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(paginatedData.map(d => d.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleExportCSV = () => {
    exportToCSV(exportFileName, filteredData);
  };

  return (
    <div className="st-card overflow-hidden flex flex-col">
      {/* Controls Bar */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="st-input pl-9"
            />
          </div>

          {filterOptions.length > 0 && (
            <div className="relative shrink-0">
              <select
                value={filterValue}
                onChange={(e) => {
                  setFilterValue(e.target.value);
                  setCurrentPage(1);
                }}
                className="st-select"
              >
                <option value="ALL">All Statuses</option>
                {filterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {actions}
          <button
            onClick={handleExportCSV}
            className="st-btn-secondary"
            title="Export filtered records to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Bulk Action Bar (Visible when rows selected) */}
      {selectedIds.length > 0 && bulkActions && (
        <div className="bg-blue-50 dark:bg-blue-950/40 px-4 py-2 border-b border-blue-100 dark:border-blue-900/60 flex items-center justify-between text-xs text-blue-900 dark:text-blue-200">
          <span className="font-medium">{selectedIds.length} row(s) selected</span>
          <div className="flex items-center gap-2">
            {bulkActions(selectedIds, () => setSelectedIds([]))}
          </div>
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto min-h-[260px]">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-9 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
            ))}
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{emptyMessage}</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <table className="st-table">
            <thead>
              <tr>
                <th className="w-10">
                  <input
                    type="checkbox"
                    checked={paginatedData.length > 0 && selectedIds.length === paginatedData.length}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={`${col.sortable ? 'cursor-pointer select-none hover:text-slate-900 dark:hover:text-white' : ''} ${
                      col.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div className={`inline-flex items-center gap-1.5 ${col.align === 'right' ? 'justify-end' : ''}`}>
                      <span>{col.label}</span>
                      {col.sortable && sortColumn === col.key && (
                        <span>
                          {sortDirection === 'asc' ? (
                            <ChevronUp className="w-3.5 h-3.5 text-blue-600" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row) => {
                const isSelected = selectedIds.includes(row.id);
                return (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`${onRowClick ? 'cursor-pointer' : ''} ${
                      isSelected ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                    }`}
                  >
                    <td onClick={(e) => e.stopPropagation()} className="w-10">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectOne(row.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`${col.align === 'right' ? 'text-right' : 'text-left'} ${col.className || ''}`}
                      >
                        {col.render ? col.render(row[col.key], row) : row[col.key] || '—'}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      {!loading && filteredData.length > 0 && (
        <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="font-semibold text-slate-700 dark:text-slate-200">{filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to{' '}
              <strong className="font-semibold text-slate-700 dark:text-slate-200">{Math.min(currentPage * pageSize, filteredData.length)}</strong> of{' '}
              <strong className="font-semibold text-slate-700 dark:text-slate-200">{filteredData.length}</strong> records
            </span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="ml-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded px-1.5 py-0.5 text-xs text-slate-700 dark:text-slate-300 outline-none"
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="st-btn-ghost st-btn-sm disabled:opacity-40"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-0.5" /> Prev
            </button>
            <span className="px-2 py-0.5 font-medium text-slate-700 dark:text-slate-300">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="st-btn-ghost st-btn-sm disabled:opacity-40"
              title="Next Page"
            >
              Next <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
