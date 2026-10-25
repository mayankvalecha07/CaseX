import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  error?: boolean;
}

export const SelectInput: React.FC<SelectInputProps> = ({
  options,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="relative">
      <select
        className={`w-full bg-slate-900/90 text-white font-mono text-xs rounded-xl px-3 py-2.5 transition-all border appearance-none pr-9 ${
          error
            ? 'border-rose-500/80 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/30'
            : 'border-white/10 hover:border-white/20 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30'
        } outline-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${className}`}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-slate-900 text-white py-1">
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
        <ChevronDown className="w-4 h-4" />
      </div>
    </div>
  );
};
