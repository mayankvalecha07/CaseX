import React from 'react';
import { Button } from '../common/Button';
import { Loader2 } from 'lucide-react';

interface FormActionsProps {
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  isSubmitting?: boolean;
  disabled?: boolean;
  className?: string;
}

export const FormActions: React.FC<FormActionsProps> = ({
  submitLabel = 'SAVE RECORD',
  cancelLabel = 'CANCEL',
  onCancel,
  isSubmitting = false,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-end gap-3 pt-4 border-t border-white/10 ${className}`}>
      {onCancel && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {cancelLabel}
        </Button>
      )}

      <Button
        type="submit"
        variant="primary"
        size="sm"
        disabled={disabled || isSubmitting}
        icon={isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : undefined}
        className="shadow-[0_0_15px_rgba(6,182,212,0.3)]"
      >
        {isSubmitting ? 'PROCESSING...' : submitLabel}
      </Button>
    </div>
  );
};
