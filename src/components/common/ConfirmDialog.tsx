import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  isProcessing?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'CONFIRM',
  cancelLabel = 'CANCEL',
  variant = 'danger',
  isProcessing = false,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const accentColor =
    variant === 'danger'
      ? 'border-rose-500/40 text-rose-400 bg-rose-500/10'
      : variant === 'warning'
      ? 'border-amber-500/40 text-amber-400 bg-amber-500/10'
      : 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10';

  const confirmBtnVariant = variant === 'danger' ? 'danger' : 'primary';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-[#0a0f1d] border border-white/10 rounded-2xl shadow-2xl p-6 relative">
        <button
          onClick={onCancel}
          disabled={isProcessing}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl border ${accentColor} shrink-0`}>
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold font-hud text-white tracking-wide">
              {title}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-white/5">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isProcessing}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={confirmBtnVariant}
            size="sm"
            onClick={onConfirm}
            isLoading={isProcessing}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
