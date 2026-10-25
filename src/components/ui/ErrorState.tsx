import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../common/Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'DATA TRANSMISSION MALFUNCTION',
  message,
  onRetry,
  isRetrying = false,
  className = ''
}) => {
  return (
    <div
      className={`rounded-2xl bg-rose-950/20 border border-rose-500/30 p-6 sm:p-8 flex flex-col items-center text-center max-w-xl mx-auto backdrop-blur-sm ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
        <AlertTriangle className="w-6 h-6 animate-pulse" />
      </div>

      <h3 className="font-hud font-bold text-base text-white tracking-wider uppercase mb-1">
        {title}
      </h3>

      <p className="font-mono text-xs text-rose-300/80 mb-6 max-w-md leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          disabled={isRetrying}
          icon={<RefreshCw className={`w-3.5 h-3.5 text-rose-400 ${isRetrying ? 'animate-spin' : ''}`} />}
          className="border-rose-500/40 text-rose-200 hover:bg-rose-500/15"
        >
          {isRetrying ? 'RE-ESTABLISHING LINK...' : 'RETRY LINK'}
        </Button>
      )}
    </div>
  );
};
