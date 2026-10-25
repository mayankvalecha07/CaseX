import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label = 'DECRYPTING RECORD STREAM...',
  size = 'md',
  className = ''
}) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10'
  };

  return (
    <div className={`flex flex-col items-center justify-center py-8 gap-3 text-cyan-400 ${className}`}>
      <Loader2 className={`${sizeMap[size]} animate-spin text-cyan-400`} />
      {label && (
        <span className="font-mono text-xs tracking-widest text-slate-400 animate-pulse uppercase">
          {label}
        </span>
      )}
    </div>
  );
};
