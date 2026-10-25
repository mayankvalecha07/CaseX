import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  variant?: 'cyan' | 'red' | 'amber' | 'emerald' | 'purple' | 'slate';
  trend?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  icon,
  variant = 'cyan',
  trend,
  className = ''
}) => {
  const accentClasses = {
    cyan: 'border-white/10 hover:border-cyan-400/40 text-cyan-400 bg-white/5',
    red: 'border-white/10 hover:border-rose-500/40 text-rose-400 bg-white/5',
    amber: 'border-white/10 hover:border-amber-500/40 text-amber-400 bg-white/5',
    emerald: 'border-white/10 hover:border-emerald-500/40 text-emerald-400 bg-white/5',
    purple: 'border-white/10 hover:border-purple-500/40 text-purple-400 bg-white/5',
    slate: 'border-white/10 hover:border-white/20 text-slate-400 bg-white/5'
  };

  const iconBgClasses = {
    cyan: 'bg-cyan-500/10 border-cyan-400/20 text-cyan-400',
    red: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    slate: 'bg-white/10 border-white/10 text-slate-300'
  };

  return (
    <div
      className={`relative p-4 rounded-2xl border backdrop-blur-md transition-all duration-200 hover:shadow-lg ${accentClasses[variant]} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-mono tracking-wider text-slate-400 uppercase font-semibold">
            {label}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-hud text-white tracking-tight">
              {value}
            </span>
            {subValue && (
              <span className="text-xs font-mono text-slate-400">{subValue}</span>
            )}
          </div>
          {trend && (
            <p className="mt-1 text-[10px] font-mono text-cyan-400/80 flex items-center gap-1">
              <span>●</span> {trend}
            </p>
          )}
        </div>

        {icon && (
          <div className={`p-2.5 rounded-lg border shrink-0 ${iconBgClasses[variant]}`}>
            {icon}
          </div>
        )}
      </div>

      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500/40 rounded-tr-lg pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500/40 rounded-bl-lg pointer-events-none" />
    </div>
  );
};
