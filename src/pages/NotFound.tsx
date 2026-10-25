import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, FolderOpen } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full rounded-2xl bg-slate-900/60 border border-white/10 p-8 text-center backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-5 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
          <ShieldAlert className="w-8 h-8 animate-pulse" />
        </div>

        <div className="inline-block text-[11px] font-mono px-2.5 py-1 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 font-bold mb-3 tracking-widest">
          STATUS 404: CLASSIFIED FILE EXPUNGED
        </div>

        <h1 className="font-hud font-bold text-2xl text-white tracking-wider mb-2">
          INVESTIGATION DOSSIER NOT FOUND
        </h1>

        <p className="font-mono text-xs text-slate-400 leading-relaxed mb-8">
          The requested evidence repository, case archive, or intelligence endpoint does not exist or has been relocated under sealed judicial orders.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(-1)}
            icon={<ArrowLeft className="w-3.5 h-3.5" />}
            className="w-full sm:w-auto"
          >
            GO BACK
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/dashboard')}
            icon={<Home className="w-3.5 h-3.5" />}
            className="w-full sm:w-auto shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            COMMAND CENTER
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/cases')}
            icon={<FolderOpen className="w-3.5 h-3.5" />}
            className="w-full sm:w-auto"
          >
            CASE ARCHIVE
          </Button>
        </div>
      </div>
    </div>
  );
};
