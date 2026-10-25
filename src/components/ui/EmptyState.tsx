import React from 'react';
import { FolderSearch, Plus } from 'lucide-react';
import { Button } from '../common/Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div
      className={`rounded-2xl bg-white/[0.02] border border-dashed border-white/10 p-8 sm:p-12 flex flex-col items-center justify-center text-center ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mb-4">
        {icon || <FolderSearch className="w-6 h-6 text-slate-400" />}
      </div>

      <h3 className="font-hud font-bold text-sm text-white tracking-wider uppercase mb-1">
        {title}
      </h3>

      <p className="font-mono text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onAction}
          icon={<Plus className="w-3.5 h-3.5 text-cyan-400" />}
          className="border-white/10 hover:border-cyan-500/40 text-xs"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
