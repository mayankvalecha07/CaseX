import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  required = false,
  error,
  hint,
  children,
  className = ''
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label
          htmlFor={htmlFor}
          className="block font-mono text-[11px] font-semibold text-slate-300 uppercase tracking-wider"
        >
          {label} {required && <span className="text-cyan-400">*</span>}
        </label>
        {hint && <span className="text-[10px] font-mono text-slate-500">{hint}</span>}
      </div>

      {children}

      {error && (
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-rose-400 mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
