'use client';

import React, { useState, useMemo } from 'react';

// ============================================
// Types
// ============================================

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyField: keyof T;
  sortable?: boolean;
  paginated?: boolean;
  pageSize?: number;
  selectable?: boolean;
  onSelectionChange?: (selectedItems: T[]) => void;
  actions?: (item: T) => React.ReactNode;
  emptyMessage?: string;
  loading?: boolean;
}

type SortDirection = 'asc' | 'desc' | null;

// ============================================
// Icons
// ============================================

const SortAscIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
  </svg>
);

const SortDescIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

// ============================================
// Component
// ============================================

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField,
  sortable = true,
  paginated = true,
  pageSize = 10,
  selectable = false,
  onSelectionChange,
  actions,
  emptyMessage = 'No data available',
  loading = false,
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<Set<unknown>>(new Set());

  // Handle sorting
  const handleSort = (columnKey: string) => {
    if (!sortable) return;

    if (sortColumn === columnKey) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  // Sort and paginate data
  const processedData = useMemo(() => {
    let result = [...data];

    // Sort
    if (sortColumn && sortDirection) {
      result.sort((a, b) => {
        const aValue = a[sortColumn as keyof T];
        const bValue = b[sortColumn as keyof T];

        if (aValue === bValue) return 0;

        const comparison = aValue < bValue ? -1 : 1;
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize);
  const paginatedData = paginated
    ? processedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : processedData;

  // Selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allKeys = new Set(processedData.map((item) => item[keyField as keyof T]));
      setSelectedItems(allKeys);
      onSelectionChange?.(processedData);
    } else {
      setSelectedItems(new Set());
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (key: unknown, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(key);
    } else {
      newSelected.delete(key);
    }
    setSelectedItems(newSelected);
    const selectedData = processedData.filter((item) => newSelected.has(item[keyField as keyof T]));
    onSelectionChange?.(selectedData);
  };

  const allSelected = processedData.length > 0 && selectedItems.size === processedData.length;
  const someSelected = selectedItems.size > 0 && selectedItems.size < processedData.length;

  return (
    <div className="w-full">
      {/* Table Container */}
      <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
        <table className="w-full divide-y divide-neutral-200 dark:divide-neutral-700">
          <thead className="bg-neutral-50 dark:bg-neutral-800">
            <tr>
              {/* Checkbox column */}
              {selectable && (
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded border-neutral-300 focus:ring-primary-500"
                    aria-label="Select all"
                  />
                </th>
              )}

              {/* Header columns */}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`
                    px-4 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400
                    uppercase tracking-wider
                    ${column.sortable && sortable ? 'cursor-pointer hover:text-neutral-900 dark:hover:text-neutral-200' : ''}
                    ${column.className || ''}
                  `}
                  onClick={() => column.sortable && sortable && handleSort(String(column.key))}
                  role={column.sortable && sortable ? 'button' : undefined}
                  tabIndex={column.sortable && sortable ? 0 : undefined}
                >
                  <div className="flex items-center gap-1">
                    {column.header}
                    {column.sortable && sortable && (
                      <span className="text-neutral-400">
                        {sortColumn === column.key && sortDirection === 'asc' ? (
                          <SortAscIcon />
                        ) : sortColumn === column.key && sortDirection === 'desc' ? (
                          <SortDescIcon />
                        ) : (
                          <SortAscIcon />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}

              {/* Actions column */}
              {actions && (
                <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-700">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {selectable && <td className="px-4 py-4"><div className="w-4 h-4 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" /></td>}
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-4 py-4">
                      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                    </td>
                  ))}
                  {actions && <td className="px-4 py-4"><div className="h-8 w-20 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse ml-auto" /></td>}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              // Empty state
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                  className="px-4 py-12 text-center text-neutral-500 dark:text-neutral-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              // Data rows
              paginatedData.map((item, index) => (
                <tr
                  key={String(item[keyField])}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  {selectable && (
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item[keyField as keyof T])}
                        onChange={(e) => handleSelectRow(item[keyField as keyof T], e.target.checked)}
                        className="w-4 h-4 text-primary-600 rounded border-neutral-300 focus:ring-primary-500"
                        aria-label={`Select ${item[keyField]}`}
                      />
                    </td>
                  )}

                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={`
                        px-4 py-4 text-sm text-neutral-700 dark:text-neutral-300
                        ${column.className || ''}
                      `}
                    >
                      {column.render
                        ? column.render(item, index)
                        : String(item[column.key as keyof T] ?? '')}
                    </td>
                  ))}

                  {actions && (
                    <td className="px-4 py-4 text-right">
                      {actions(item)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {paginated && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, processedData.length)} of{' '}
            {processedData.length} results
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeftIcon />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`
                    w-10 h-10 rounded-lg text-sm font-medium transition-colors
                    ${currentPage === pageNum
                      ? 'bg-primary-500 text-white'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }
                  `}
                  aria-label={`Page ${pageNum}`}
                  aria-current={currentPage === pageNum ? 'page' : undefined}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

DataTable.displayName = 'DataTable';

// ============================================
// Storybook/Usage Examples
// ============================================

/**
 * DataTable Component Usage:
 * 
 * interface Voter {
 *   id: string;
 *   name: string;
 *   county: string;
 *   status: string;
 * }
 * 
 * const columns: TableColumn<Voter>[] = [
 *   { key: 'name', header: 'Name', sortable: true },
 *   { key: 'county', header: 'County', sortable: true },
 *   { 
 *     key: 'status', 
 *     header: 'Status',
 *     render: (voter) => <Badge variant={voter.status === 'Active' ? 'success' : 'warning'}>{voter.status}</Badge>
 *   },
 * ];
 * 
 * // Basic usage
 * <DataTable columns={columns} data={voters} keyField="id" />
 * 
 * // With pagination
 * <DataTable columns={columns} data={voters} keyField="id" paginated pageSize={10} />
 * 
 * // With sorting
 * <DataTable columns={columns} data={voters} keyField="id" sortable />
 * 
 * // With row selection
 * <DataTable 
 *   columns={columns} 
 *   data={voters} 
 *   keyField="id" 
 *   selectable 
 *   onSelectionChange={(selected) => console.log(selected)}
 * />
 * 
 * // With actions
 * <DataTable 
 *   columns={columns} 
 *   data={voters} 
 *   keyField="id" 
 *   actions={(voter) => (
 *     <Button size="sm" variant="ghost">View</Button>
 *   )}
 * />
 */
