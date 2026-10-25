import React from 'react';

interface NumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  error,
  className = '',
  ...props
}) => {
  return (
    <input
      type="number"
      className={`w-full bg-slate-900/90 text-white font-mono text-xs rounded-xl px-3 py-2.5 transition-all placeholder:text-slate-500 border ${
        error
          ? 'border-rose-500/80 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/30'
          : 'border-white/10 hover:border-white/20 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30'
      } outline-none disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      {...props}
    />
  );
};
