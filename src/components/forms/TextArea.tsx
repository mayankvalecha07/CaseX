import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  maxLength?: number;
}

export const TextArea: React.FC<TextAreaProps> = ({
  error,
  maxLength,
  value,
  className = '',
  ...props
}) => {
  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <div className="relative">
      <textarea
        value={value}
        maxLength={maxLength}
        rows={4}
        className={`w-full bg-slate-900/90 text-white font-mono text-xs rounded-xl p-3 transition-all placeholder:text-slate-500 border resize-y ${
          error
            ? 'border-rose-500/80 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/30'
            : 'border-white/10 hover:border-white/20 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30'
        } outline-none disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
      {maxLength && (
        <div className="text-right text-[10px] font-mono text-slate-500 mt-1">
          {currentLength} / {maxLength}
        </div>
      )}
    </div>
  );
};
