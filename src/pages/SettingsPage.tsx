import React, { useState } from 'react';
import { useCase } from '../context/CaseContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  Settings as SettingsIcon,
  Sliders,
  Shield,
  Trash2,
  Volume2,
  Eye,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { resetAllCasesToDefault, showToast } = useCase();

  const [scanlinesEnabled, setScanlinesEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hudColor, setHudColor] = useState<'cyan' | 'emerald' | 'amber'>('cyan');

  const handleResetData = () => {
    if (window.confirm('Reset all case evidence, hotspots, and notes back to initial defaults?')) {
      resetAllCasesToDefault();
      showToast('Case data reset to factory default state.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">
              TERMINAL CONFIGURATION
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-hud text-white">
            SETTINGS & PREFERENCES
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Configure visual HUD telemetry, audio cues, and database cache controls.
          </p>
        </div>
      </div>

      {/* Visual Preferences */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4 font-mono text-xs">
        <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
          <Eye className="w-4 h-4" />
          FORENSIC DISPLAY HUD
        </h3>

        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/10">
            <div>
              <span className="text-white font-bold block">HUD Scanlines & CRT Filter</span>
              <span className="text-slate-400 text-[11px]">
                Simulate cathode ray tube scanning artifacts on optical monitors.
              </span>
            </div>
            <input
              type="checkbox"
              checked={scanlinesEnabled}
              onChange={(e) => setScanlinesEnabled(e.target.checked)}
              className="accent-cyan-400 w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/10">
            <div>
              <span className="text-white font-bold block">Audio Feedback & Telemetry</span>
              <span className="text-slate-400 text-[11px]">
                Sound clicks and alert chimes on hotspot inspection.
              </span>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="accent-cyan-400 w-4 h-4 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="p-6 rounded-2xl bg-white/5 border border-rose-500/30 space-y-4 font-mono text-xs">
        <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          DATABASE CACHE & RESET
        </h3>

        <p className="text-slate-300">
          Reset all collected evidence, timeline modifications, witness testimonies, and detective board threads back to initial case state.
        </p>

        <div className="pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetData}
            icon={<RefreshCw className="w-3.5 h-3.5 text-rose-400" />}
            className="text-rose-400 border border-rose-500/30 hover:bg-rose-500/10"
          >
            RESET ALL CASES TO DEFAULTS
          </Button>
        </div>
      </div>
    </div>
  );
};
