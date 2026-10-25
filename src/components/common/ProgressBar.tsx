import React from 'react';

interface ProgressBarProps {
  value: number; // 0 - 100
  label?: string;
  showPercent?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'cyan' | 'emerald' | 'amber' | 'red';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  showPercent = true,
  size = 'md',
  variant = 'cyan',
  className = ''
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  const fillColors = {
    cyan: 'bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.6)]',
    emerald: 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.6)]',
    amber: 'bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.6)]',
    red: 'bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.6)]'
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5 text-xs font-mono">
          {label && <span className="text-slate-400 font-medium tracking-wide uppercase">{label}</span>}
          {showPercent && (
            <span className="text-cyan-300 font-bold font-hud">{clampedValue}%</span>
          )}
        </div>
      )}

      <div
        className={`w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5 ${heightClasses[size]}`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${fillColors[variant]}`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};
