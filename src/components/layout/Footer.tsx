import React from 'react';
import { Shield, Terminal, Lock, Activity } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#050505] border-t border-white/10 py-6 px-4 sm:px-6 mt-auto text-slate-500 font-mono text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Side Branding */}
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-300 font-hud tracking-wider">
            CASEX // DIGITAL CRIME SCENE INVESTIGATION PLATFORM
          </span>
          <span className="text-[10px] text-cyan-400/80 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-400/30">
            CONFIDENTIAL
          </span>
        </div>

        {/* Center Tagline */}
        <div className="text-center italic text-slate-400">
          "Every Detail Matters."
        </div>

        {/* Right Status */}
        <div className="flex items-center gap-4 text-[10px]">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Activity className="w-3.5 h-3.5" />
            <span>256-BIT ENCRYPTED</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Terminal className="w-3.5 h-3.5" />
            <span>TERMINAL ONLINE</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
