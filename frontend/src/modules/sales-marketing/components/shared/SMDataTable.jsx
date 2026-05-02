import React, { useState } from 'react';
import { AiOutlineLeft, AiOutlineRight, AiOutlineDown, AiOutlineUp, AiOutlineEye, AiOutlineEdit, AiOutlineMore } from 'react-icons/ai';

function SMDataTable({
  columns = [],
  data = [],
  loading = false,
  pagination = true,
  pageSize = 10,
  onRowClick,
  emptyMessage = 'No data available',
  selectable = false,
  onSelectionChange,
  actions,
  renderRow,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [selected, setSelected] = useState(new Set());
  const [hoveredRow, setHoveredRow] = useState(null);

  // Sorting
  const sortedData = sortField
    ? [...data].sort((a, b) => {
        const aVal = a[sortField] || '';
        const bVal = b[sortField] || '';
        return sortDir === 'asc'
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      })
    : data;

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = pagination
    ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedData;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const all = new Set(paginatedData.map((_, i) => (currentPage - 1) * pageSize + i));
      setSelected(all);
      onSelectionChange?.(all);
    } else {
      setSelected(new Set());
      onSelectionChange?.(new Set());
    }
  };

  const handleSelectRow = (idx) => {
    const next = new Set(selected);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setSelected(next);
    onSelectionChange?.(next);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading contacts...</span>
        </div>
      </div>
    );
  }

  // If a custom row renderer is provided, use it (card-style)
  if (renderRow) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Bulk actions bar */}
        {selectable && selected.size > 0 && actions && (
          <div className="px-5 py-3 bg-primary/5 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm text-primary font-medium">{selected.size} selected</span>
            <div className="flex items-center gap-2">{actions}</div>
          </div>
        )}

        {/* Table header (compact) — hidden on mobile since rows show all info */}
        <div className="hidden sm:flex px-3 sm:px-5 py-3 bg-gray-50/50 border-b border-gray-100 items-center gap-2 sm:gap-4">
          {selectable && (
            <input
              type="checkbox"
              checked={selected.size === paginatedData.length && paginatedData.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
          )}
          <div className="flex items-center gap-2 ml-5 sm:ml-6 flex-1 min-w-0">
            {columns.filter(c => c.key !== 'actions').slice(0, 4).map((col) => (
              <span
                key={col.key}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
                className={`text-xs font-semibold text-gray-500 uppercase tracking-wider ${
                  col.sortable ? 'cursor-pointer hover:text-gray-700 select-none' : ''
                } ${col.className || ''}`}
              >
                {col.label}
                {col.sortable && sortField === col.key && (
                  <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Card-style rows */}
        <div className="divide-y divide-gray-50">
          {paginatedData.length === 0 ? (
            <div className="px-5 py-16 text-center text-gray-400">
              <p className="text-sm">{emptyMessage}</p>
            </div>
          ) : (
            paginatedData.map((row, idx) => {
              const globalIdx = (currentPage - 1) * pageSize + idx;
              const isSelected = selected.has(globalIdx);
              return (
                <div
                  key={globalIdx}
                  onMouseEnter={() => setHoveredRow(globalIdx)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className={`group px-3 sm:px-5 py-3 sm:py-4 transition-all duration-200 ${
                    isSelected ? 'bg-primary/5' : hoveredRow === globalIdx ? 'bg-gray-50/80' : ''
                  } ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={onRowClick ? () => onRowClick(row, idx) : undefined}
                >
                  {renderRow(row, globalIdx, isSelected, handleSelectRow)}
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {pagination && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/30">
            <span className="text-xs text-gray-400">
              Page {currentPage} of {totalPages} ({sortedData.length} items)
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <AiOutlineLeft size={14} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page;
                if (totalPages <= 5) page = i + 1;
                else if (currentPage <= 3) page = i + 1;
                else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                else page = currentPage - 2 + i;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 text-xs rounded-lg font-medium transition-all duration-200 ${
                      currentPage === page
                        ? 'bg-primary text-white shadow-sm'
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <AiOutlineRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default: table-style rendering (fallback)
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Bulk actions */}
      {selectable && selected.size > 0 && actions && (
        <div className="px-5 py-3 bg-primary/5 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm text-primary font-medium">{selected.size} selected</span>
          <div className="flex items-center gap-2">{actions}</div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {selectable && (
                <th className="px-5 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selected.size === paginatedData.length && paginatedData.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  className={`px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${
                    col.sortable ? 'cursor-pointer hover:text-gray-700 select-none' : ''
                  } ${col.className || ''}`}
                  style={col.width ? { width: col.width, minWidth: col.width } : {}}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      sortField === col.key ? (
                        sortDir === 'asc' ? <AiOutlineUp size={12} /> : <AiOutlineDown size={12} />
                      ) : (
                        <div className="w-3" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-5 py-12 text-center text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => {
                const globalIdx = (currentPage - 1) * pageSize + idx;
                return (
                  <tr
                    key={globalIdx}
                    onClick={onRowClick ? () => onRowClick(row, idx) : undefined}
                    className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${
                      onRowClick ? 'cursor-pointer' : ''
                    } ${selected.has(globalIdx) ? 'bg-primary/5' : ''}`}
                  >
                    {selectable && (
                      <td className="px-5 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(globalIdx)}
                          onChange={() => handleSelectRow(globalIdx)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className={`px-5 py-3 ${col.className || ''}`}>
                        {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/30">
          <span className="text-xs text-gray-400">
            Page {currentPage} of {totalPages} ({sortedData.length} items)
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <AiOutlineLeft size={14} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let page;
              if (totalPages <= 5) page = i + 1;
              else if (currentPage <= 3) page = i + 1;
              else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
              else page = currentPage - 2 + i;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 text-xs rounded-lg font-medium transition-all duration-200 ${
                    currentPage === page
                      ? 'bg-primary text-white shadow-sm'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <AiOutlineRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SMDataTable;
