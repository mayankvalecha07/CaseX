import React from 'react';
import { CheckSquare, Trash2, Archive, X, RefreshCw } from 'lucide-react';
import { CaseStatus } from '../../types';

interface BulkActionToolbarProps {
  selectedCount: number;
  totalCount: number;
  onClearSelection: () => void;
  onSelectAll: () => void;
  onBulkStatusChange?: (status: CaseStatus) => void;
  onBulkArchive?: () => void;
  onBulkDelete?: () => void;
}

export const BulkActionToolbar: React.FC<BulkActionToolbarProps> = ({
  selectedCount,
  totalCount,
  onClearSelection,
  onSelectAll,
  onBulkStatusChange,
  onBulkArchive,
  onBulkDelete
}) => {
  if (selectedCount === 0) return null;

  return (
    <section
      aria-label="Bulk actions toolbar"
      className="sticky top-20 z-30 mb-4 flex flex-wrap items-center justify-between gap-3 p-3 bg-[#0a0f1d]/95 backdrop-blur-md border border-cyan-500/40 rounded-xl shadow-xl shadow-black/60 animate-fadeIn"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-xs font-bold">
          <CheckSquare className="w-3.5 h-3.5" />
          <span>{selectedCount} SELECTED</span>
        </div>

        {selectedCount < totalCount && (
          <button
            onClick={onSelectAll}
            className="text-xs font-mono text-slate-400 hover:text-white underline underline-offset-2 transition-colors"
          >
            Select All ({totalCount})
          </button>
        )}

        <button
          onClick={onClearSelection}
          className="text-xs font-mono text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {onBulkStatusChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-400">STATUS:</span>
            {(['ACTIVE', 'UNDER INVESTIGATION', 'COLD CASE', 'SOLVED'] as CaseStatus[]).map(status => (
              <button
                key={status}
                onClick={() => onBulkStatusChange(status)}
                className="px-2 py-0.5 rounded text-[10px] font-mono border border-white/10 hover:border-cyan-400/40 hover:text-cyan-300 text-slate-300 transition-colors"
              >
                {status}
              </button>
            ))}
          </div>
        )}

        {onBulkArchive && (
          <button
            onClick={onBulkArchive}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-mono transition-colors"
          >
            <Archive className="w-3.5 h-3.5" />
            Archive
          </button>
        )}

        {onBulkDelete && (
          <button
            onClick={onBulkDelete}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 text-xs font-mono transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        )}
      </div>
    </section>
  );
};
