import React from 'react';
import { useCase } from '../context/CaseContext';
import { Button } from '../components/common/Button';
import {
  Trash2,
  Eye,
  RefreshCw,
  RotateCcw
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { selectedCase, resetCase, resetAllCasesToDefault, preferences, updatePreferences, clearRecentlyViewed, recentlyViewed } = useCase();

  const handleResetActiveCase = () => {
    if (!selectedCase) return;
    if (window.confirm(`Reset active case #${selectedCase.id} ("${selectedCase.title}") back to initial state?`)) {
      resetCase(selectedCase.id);
    }
  };

  const handleResetAllData = () => {
    if (window.confirm('Reset fictional demo cases, evidence, tasks, interviews, notes, and board data to the original sample set? User-created cases and OTP authentication will be preserved.')) {
      resetAllCasesToDefault();
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
            Configure persistent display and investigation workspace preferences.
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
              checked={preferences.scanlinesEnabled}
              onChange={(e) => updatePreferences({ scanlinesEnabled: e.target.checked })}
              className="accent-cyan-400 w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="space-y-1 text-slate-400">Workspace density
              <select value={preferences.density} onChange={e => updatePreferences({ density: e.target.value as 'comfortable' | 'compact' })} className="w-full rounded-lg bg-[#0a0f1d] border border-white/10 px-3 py-2 text-white">
                <option value="comfortable">Comfortable</option><option value="compact">Compact</option>
              </select>
            </label>
            <label className="space-y-1 text-slate-400">Default case view
              <select value={preferences.defaultCaseView} onChange={e => updatePreferences({ defaultCaseView: e.target.value as 'table' | 'cards' })} className="w-full rounded-lg bg-[#0a0f1d] border border-white/10 px-3 py-2 text-white">
                <option value="cards">Cards</option><option value="table">Table</option>
              </select>
            </label>
            <label className="space-y-1 text-slate-400">Cases per page
              <select value={preferences.pageSize} onChange={e => updatePreferences({ pageSize: Number(e.target.value) })} className="w-full rounded-lg bg-[#0a0f1d] border border-white/10 px-3 py-2 text-white">
                {[6, 10, 20, 50].map(size => <option key={size} value={size}>{size}</option>)}
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4 font-mono text-xs">
        <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">WORKSTATION WIDGETS</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(Object.keys(preferences.showWidgets) as (keyof typeof preferences.showWidgets)[]).map(key => (
            <label key={key} className="flex items-center justify-between gap-3 rounded-lg bg-black/30 border border-white/5 p-3 text-slate-300">
              <span>{String(key).replace(/[A-Z]/g, letter => ` ${letter}`).replace(/^./, letter => letter.toUpperCase())}</span>
              <input type="checkbox" checked={preferences.showWidgets[key]} onChange={event => updatePreferences({ showWidgets: { [key]: event.target.checked } })} className="accent-cyan-400" />
            </label>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4 font-mono text-xs">
        <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">NOTIFICATIONS &amp; DATE DISPLAY</h3>
        <label className="flex items-center justify-between rounded-lg bg-black/30 border border-white/5 p-3 text-slate-300">
          <span>Enable in-app notifications</span>
          <input type="checkbox" checked={preferences.notificationsEnabled} onChange={event => updatePreferences({ notificationsEnabled: event.target.checked })} className="accent-cyan-400" />
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(Object.keys(preferences.notificationCategories) as (keyof typeof preferences.notificationCategories)[]).map(category => <label key={category} className="flex items-center justify-between rounded-lg bg-black/30 border border-white/5 p-3 text-slate-300"><span>{category} notifications</span><input type="checkbox" checked={preferences.notificationCategories[category]} onChange={event => updatePreferences({ notificationCategories: { [category]: event.target.checked } })} className="accent-cyan-400" /></label>)}
        </div>
        <label className="block max-w-sm space-y-1 text-slate-400">Date and time format
          <select value={preferences.dateTimeFormat} onChange={event => updatePreferences({ dateTimeFormat: event.target.value as 'locale' | 'iso' })} className="w-full rounded-lg bg-[#0a0f1d] border border-white/10 px-3 py-2 text-white"><option value="locale">Local display</option><option value="iso">ISO 8601</option></select>
        </label>
      </div>

      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3 font-mono text-xs">
        <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">RECENT RECORDS &amp; ABOUT</h3>
        <p className="text-slate-400">{recentlyViewed.length} recently viewed record(s) are saved on this device.</p>
        <Button variant="secondary" size="sm" onClick={clearRecentlyViewed} disabled={recentlyViewed.length === 0}>CLEAR RECENTLY VIEWED</Button>
        <p className="pt-2 border-t border-white/10 text-slate-400">CaseX 3.0 · Student/demo investigation platform. Sample investigation data is fictional.</p>
      </div>

      {/* Data Management */}
      <div className="p-6 rounded-2xl bg-white/5 border border-rose-500/30 space-y-4 font-mono text-xs">
        <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          DATABASE CACHE & RESET
        </h3>

        <p className="text-slate-300">
          Restore the fictional sample investigation data. User-created cases and their linked records are retained.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          {selectedCase && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleResetActiveCase}
              icon={<RotateCcw className="w-3.5 h-3.5 text-amber-400" />}
              className="border border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
            >
              RESET ACTIVE CASE (#{selectedCase.id})
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetAllData}
            icon={<RefreshCw className="w-3.5 h-3.5 text-rose-400" />}
            className="text-rose-400 border border-rose-500/30 hover:bg-rose-500/10"
          >
              RESET DEMO DATA
          </Button>
        </div>
      </div>
    </div>
  );
};
