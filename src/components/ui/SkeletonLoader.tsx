import React from 'react';

interface SkeletonLoaderProps {
  count?: number;
  type?: 'card' | 'row' | 'text' | 'stat';
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  count = 3,
  type = 'card',
  className = ''
}) => {
  const items = Array.from({ length: count }, (_, i) => i);

  if (type === 'row') {
    return (
      <div className={`space-y-3 ${className}`}>
        {items.map(i => (
          <div
            key={i}
            className="h-12 w-full rounded-xl bg-white/5 border border-white/5 animate-pulse flex items-center px-4 gap-4"
          >
            <div className="w-8 h-8 rounded-lg bg-white/10" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-1/3 bg-white/10 rounded" />
              <div className="h-2 w-1/2 bg-white/5 rounded" />
            </div>
            <div className="w-16 h-4 bg-white/10 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'stat') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {items.map(i => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-white/5 border border-white/5 p-4 flex flex-col justify-between animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 bg-white/10 rounded" />
              <div className="w-7 h-7 rounded-lg bg-white/10" />
            </div>
            <div className="h-7 w-24 bg-white/15 rounded" />
            <div className="h-2 w-32 bg-white/10 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {items.map(i => (
        <div
          key={i}
          className="rounded-2xl bg-white/5 border border-white/5 p-5 space-y-4 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 bg-white/15 rounded" />
            <div className="h-5 w-16 bg-white/10 rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full bg-white/10 rounded" />
            <div className="h-3 w-4/5 bg-white/10 rounded" />
            <div className="h-3 w-2/3 bg-white/10 rounded" />
          </div>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
            <div className="h-3 w-20 bg-white/10 rounded" />
            <div className="h-3 w-16 bg-white/10 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};
