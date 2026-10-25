import React, { useEffect, useState } from 'react';
import { RotateCcw, X } from 'lucide-react';
import { useCase } from '../../context/CaseContext';

export const UndoToast: React.FC = () => {
  const { currentUndo, triggerUndo, dismissUndo } = useCase();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!currentUndo) {
      setProgress(100);
      return;
    }

    setProgress(100);
    const interval = 50; // ms
    const totalTime = 6000; // 6s
    const decrement = (interval / totalTime) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - decrement;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentUndo]);

  if (!currentUndo) return null;

  return (
    <aside
      aria-label="Undo action prompt"
      className="fixed bottom-6 left-6 z-50 animate-slideUp flex flex-col overflow-hidden rounded-xl border border-cyan-500/40 bg-[#0a0f1d] shadow-2xl shadow-cyan-950/60 max-w-sm w-full"
    >
      <div className="flex items-center justify-between p-3.5 gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div className="truncate text-xs font-mono text-slate-200">
            {currentUndo.description}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={triggerUndo}
            className="px-2.5 py-1 text-xs font-mono font-bold uppercase rounded bg-cyan-500 text-black hover:bg-cyan-400 transition-colors shadow-[0_0_10px_rgba(6,182,212,0.4)]"
          >
            UNDO
          </button>
          <button
            onClick={dismissUndo}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Countdown progress bar */}
      <div className="h-0.5 w-full bg-slate-800">
        <div
          className="h-full bg-cyan-400 transition-all duration-75"
          style={{ width: `${progress}%` }}
        />
      </div>
    </aside>
  );
};
