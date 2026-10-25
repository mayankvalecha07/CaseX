import React from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  icon?: React.ReactNode;
}

export const TextInput: React.FC<TextInputProps> = ({
  error,
  icon,
  className = '',
  ...props
}) => {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          {icon}
        </div>
      )}
      <input
        className={`w-full bg-slate-900/90 text-white font-mono text-xs rounded-xl px-3 py-2.5 transition-all placeholder:text-slate-500 border ${
          icon ? 'pl-9' : ''
        } ${
          error
            ? 'border-rose-500/80 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/30'
            : 'border-white/10 hover:border-white/20 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30'
        } outline-none disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
    </div>
  );
};
