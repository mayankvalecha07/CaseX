import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 max-w-md bg-[#090d16] border border-cyan-500/50 rounded-xl p-4 shadow-[0_0_30px_rgba(6,182,212,0.25)] flex items-center gap-3 backdrop-blur-xl"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center shrink-0 text-cyan-400 animate-pulse">
            <Terminal className="w-4 h-4" />
          </div>
          <div className="flex-1 text-xs font-mono text-cyan-100 leading-relaxed pr-2">
            <span className="text-cyan-400 font-bold mr-1.5">[CASEX TERMINAL]:</span>
            {message}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
