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
      result = result.filter((item) => {
        if (typeof searchKey === 'string') {
          return String(item[searchKey] || '').toLowerCase().includes(q);
        } else if (Array.isArray(searchKey)) {
          return searchKey.some((k) => String(item[k] || '').toLowerCase().includes(q));
        }
        return false;
      });
    }

    if (filterValue !== 'ALL') {
      result = result.filter((item) => String(item[filterKey]) === filterValue);
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
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(key);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(paginatedData.map((d) => d.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleExportCSV = () => {
    exportToCSV(exportFileName, filteredData);
  };

  return (
    <div className="st-card overflow-hidden flex flex-col">
      {/* Compact Controls Toolbar */}
      <div className="px-4 py-3 border-b border-[#E7E9EE] dark:border-[#222733] bg-[var(--st-surface)] flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-[#9299A6] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="st-input st-input-sm pl-8 text-xs font-normal"
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
                className="st-select h-8 py-0 pl-2.5 pr-7 text-xs font-medium bg-[#F6F7F9] dark:bg-[#151923] border-[#E7E9EE] dark:border-[#222733]"
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

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {actions}
          <button
            onClick={handleExportCSV}
            className="st-btn-secondary st-btn-sm"
            title="Export filtered records to CSV"
          >
            <Download className="w-3 h-3 text-[#626A78] dark:text-[#9AA3B2]" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Bulk Action Bar (Visible when rows selected) */}
      {selectedIds.length > 0 && bulkActions && (
        <div className="bg-[#315CFF]/10 px-4 py-2 border-b border-[#315CFF]/20 flex items-center justify-between text-xs text-[#315CFF] font-medium">
          <span>{selectedIds.length} row(s) selected</span>
          <div className="flex items-center gap-2">
            {bulkActions(selectedIds, () => setSelectedIds([]))}
          </div>
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto min-h-[220px]">
        {loading ? (
          <div className="p-5 space-y-2.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="st-skeleton h-10" style={{ opacity: 1 - i * 0.14 }} />
            ))}
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <span className="st-icon-chip st-tone-slate w-11 h-11 rounded-xl mb-3">
              <Search className="w-5 h-5" />
            </span>
            <p className="text-[14px] font-semibold text-[var(--st-text-primary)]">{emptyMessage}</p>
            <p className="text-[12.5px] text-[var(--st-text-muted)] mt-1">
              {searchTerm || filterValue !== 'ALL'
                ? 'Try adjusting your search query or filter settings.'
                : 'Records will appear here as soon as they are created.'}
            </p>
          </div>
        ) : (
          <table className="st-table">
            <thead>
              <tr>
                <th className="w-10">
                  <input
                    type="checkbox"
                    checked={
                      paginatedData.length > 0 && selectedIds.length === paginatedData.length
                    }
                    onChange={handleSelectAll}
                    className="rounded border-[#E7E9EE] text-[#315CFF] focus:ring-[#315CFF] cursor-pointer"
                  />
                </th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={`${
                      col.sortable
                        ? 'cursor-pointer select-none hover:text-[#111318] dark:hover:text-white'
                        : ''
                    } ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === 'right' ? 'justify-end' : ''
                      }`}
                    >
                      <span>{col.label}</span>
                      {col.sortable && sortColumn === col.key && (
                        <span>
                          {sortDirection === 'asc' ? (
                            <ChevronUp className="w-3.5 h-3.5 text-[#315CFF]" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-[#315CFF]" />
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
                      isSelected ? 'bg-[#315CFF]/[0.06] dark:bg-[#315CFF]/[0.12]' : ''
                    }`}
                  >
                    <td onClick={(e) => e.stopPropagation()} className="w-10">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectOne(row.id)}
                        className="rounded border-[#E7E9EE] text-[#315CFF] focus:ring-[#315CFF] cursor-pointer"
                      />
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`${col.align === 'right' ? 'text-right' : 'text-left'}`}
                      >
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
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
      {totalPages > 1 && (
        <div className="px-4 py-2.5 border-t border-[#E7E9EE] dark:border-[#222733] bg-[var(--st-surface-subtle)] flex items-center justify-between text-xs text-[#626A78] dark:text-[#9AA3B2]">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} records
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded border border-[#E7E9EE] dark:border-[#222733] bg-white dark:bg-[#151923] disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-medium">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded border border-[#E7E9EE] dark:border-[#222733] bg-white dark:bg-[#151923] disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
