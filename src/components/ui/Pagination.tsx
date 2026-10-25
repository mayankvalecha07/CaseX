import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  totalItems?: number;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [6, 12, 24],
  totalItems,
  className = ''
}) => {
  if (totalPages <= 1 && (!pageSize || !onPageSizeChange)) {
    return null;
  }

  // Generate page numbers window
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 rounded-xl bg-white/[0.02] border border-white/5 font-mono text-xs ${className}`}
    >
      {/* Total Items Info */}
      <div className="text-slate-400 text-[11px]">
        {totalItems !== undefined ? (
          <span>
            SHOWING PAGE <span className="text-white font-bold">{currentPage}</span> OF{' '}
            <span className="text-white font-bold">{Math.max(1, totalPages)}</span> ({totalItems} TOTAL ENTRIES)
          </span>
        ) : (
          <span>
            PAGE <span className="text-white font-bold">{currentPage}</span> OF{' '}
            <span className="text-white font-bold">{Math.max(1, totalPages)}</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Page Size Selector */}
        {pageSize && onPageSizeChange && (
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <span>ROWS:</span>
            <select
              value={pageSize}
              onChange={e => onPageSizeChange(Number(e.target.value))}
              className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-white text-[11px] focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {pageSizeOptions.map(sz => (
                <option key={sz} value={sz}>
                  {sz}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Page Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg border border-white/10 hover:border-cyan-400/40 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {getPageNumbers().map((page, idx) => (
            <React.Fragment key={idx}>
              {typeof page === 'string' ? (
                <span className="px-2 py-1 text-slate-500">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page)}
                  className={`min-w-7 h-7 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    currentPage === page
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                      : 'border border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-lg border border-white/10 hover:border-cyan-400/40 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
            aria-label="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
