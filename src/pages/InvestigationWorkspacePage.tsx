import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Layers,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  AlertTriangle,
  FolderOpen,
  Users,
  ShieldCheck,
  Plus,
  ArrowRight,
  Gavel,
  FileText
} from 'lucide-react';
import { useCase } from '../context/CaseContext';
import { Button } from '../components/common/Button';
import { CaseResolutionModal } from '../components/cases/CaseResolutionModal';

export const InvestigationWorkspacePage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const { cases, selectedCaseId, tasks, getCaseChecklist, toggleChecklistItem, addChecklistItem } = useCase();
  const [newChecklistLabel, setNewChecklistLabel] = useState('');
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);

  const activeCaseId = caseId || selectedCaseId || 'NY-2026-0884';
  const c = cases.find(item => item.id === activeCaseId) || cases[0];

  if (!c) {
    return (
      <div className="p-8 text-center text-xs font-mono text-slate-500">
        No case dossier available for this workspace.
      </div>
    );
  }

  const checklist = getCaseChecklist(c.id);
  const completedChecklistCount = checklist.filter(item => item.completed).length;
  const checklistPercent = Math.round((completedChecklistCount / (checklist.length || 1)) * 100);

  const caseTasks = tasks.filter(t => t.caseId === c.id);
  const pendingTasks = caseTasks.filter(t => t.status !== 'COMPLETED');

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistLabel.trim()) return;
    addChecklistItem(c.id, newChecklistLabel.trim(), 'CUSTOM', false);
    setNewChecklistLabel('');
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
            <Layers className="w-4 h-4" />
            <span>INVESTIGATION WORKSPACE &bull; #{c.id}</span>
          </div>
          <h1 className="text-2xl font-bold font-hud text-white tracking-wide">
            {c.title}
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            {c.location} &bull; Lead: {c.leadInvestigator}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to={`/cases/${c.id}`}>
            <Button variant="ghost" size="sm">
              CASE DETAILS
            </Button>
          </Link>
          {c.status !== 'SOLVED' ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsResolutionModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold border-emerald-400"
              icon={<Gavel className="w-4 h-4" />}
            >
              MARK CASE SOLVED
            </Button>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>JUDICIALLY SOLVED</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress & Deadline KPI Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0a0f1d] border border-white/10 space-y-2">
          <div className="text-[10px] font-mono uppercase text-slate-400">
            Dossier Completion
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-hud text-cyan-400">
              {c.progress}%
            </span>
            <span className="text-xs font-mono text-slate-400">of milestones</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-cyan-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${c.progress}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0a0f1d] border border-white/10 space-y-2">
          <div className="text-[10px] font-mono uppercase text-slate-400">
            Checklist Completion
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-hud text-emerald-400">
              {completedChecklistCount}/{checklist.length}
            </span>
            <span className="text-xs font-mono text-slate-400">({checklistPercent}%)</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${checklistPercent}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0a0f1d] border border-white/10 space-y-2">
          <div className="text-[10px] font-mono uppercase text-slate-400">
            Outstanding Tasks
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-hud text-amber-400">
              {pendingTasks.length}
            </span>
            <span className="text-xs font-mono text-slate-400">tasks active</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 truncate">
            {caseTasks.length - pendingTasks.length} completed
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0a0f1d] border border-white/10 space-y-2">
          <div className="text-[10px] font-mono uppercase text-slate-400">
            Incident Timeline
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-hud text-purple-400">
              {c.timeline.length}
            </span>
            <span className="text-xs font-mono text-slate-400">events logged</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 truncate">
            Chronology reconciled
          </div>
        </div>
      </div>

      {/* Main Workspace Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Investigation Checklist */}
        <div className="lg:col-span-2 space-y-6">
          {/* Checklist Panel */}
          <div className="p-5 rounded-2xl bg-[#0a0f1d] border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold font-hud text-white uppercase tracking-wider">
                  INVESTIGATION COMPLETION CHECKLIST
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {checklist.length - completedChecklistCount} remaining
              </span>
            </div>

            <div className="space-y-2">
              {checklist.map(item => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklistItem(c.id, item.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    item.completed
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-300'
                      : 'bg-white/[0.02] border-white/10 text-white hover:border-cyan-400/30'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      className="shrink-0 text-slate-400 hover:text-white"
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                    <span
                      className={`text-xs font-mono truncate ${
                        item.completed ? 'line-through text-slate-400' : 'text-slate-100'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.category && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 uppercase">
                        {item.category}
                      </span>
                    )}
                    {item.required && (
                      <span className="text-[9px] font-mono text-amber-400">
                        *REQ
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add custom checklist item form */}
            <form onSubmit={handleAddChecklist} className="flex gap-2 pt-2">
              <input
                type="text"
                value={newChecklistLabel}
                onChange={e => setNewChecklistLabel(e.target.value)}
                placeholder="Add custom investigative milestone or checklist task..."
                className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
              />
              <Button variant="ghost" size="sm" type="submit" icon={<Plus className="w-3.5 h-3.5" />}>
                ADD
              </Button>
            </form>
          </div>

          {/* Assigned Tasks for this case */}
          <div className="p-5 rounded-2xl bg-[#0a0f1d] border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold font-hud text-white uppercase tracking-wider">
                  ACTIVE CASE TASKS ({caseTasks.length})
                </h3>
              </div>
              <Link to="/tasks" className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1">
                <span>View Full Task Board</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {caseTasks.length === 0 ? (
                <div className="p-6 text-center text-xs font-mono text-slate-500">
                  No tasks assigned to this case yet.
                </div>
              ) : (
                caseTasks.map(t => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-3 text-xs font-mono"
                  >
                    <div>
                      <div className="font-bold text-white">{t.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Due: {t.dueDate} &bull; Assigned: {t.assignedTo}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.status === 'COMPLETED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : t.status === 'IN_PROGRESS'
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                          : 'bg-white/5 text-slate-400 border border-white/10'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Case Summary & Quick Links */}
        <div className="space-y-6">
          {/* Executive Briefing Card */}
          <div className="p-5 rounded-2xl bg-[#0a0f1d] border border-white/10 space-y-3">
            <h3 className="text-xs font-bold font-hud text-white uppercase tracking-wider border-b border-white/5 pb-2">
              EXECUTIVE BRIEFING
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {c.shortDescription}
            </p>
            <div className="pt-2 text-[11px] font-mono text-slate-400 space-y-1">
              <div><strong className="text-slate-300">INCIDENT:</strong> {c.incidentDate}</div>
              <div><strong className="text-slate-300">SCENE:</strong> {c.crimeScene.name}</div>
              <div><strong className="text-slate-300">STATUS:</strong> <span className="text-emerald-400">{c.status}</span></div>
            </div>
          </div>

          {/* Quick Sub-Module Navigation */}
          <div className="p-5 rounded-2xl bg-[#0a0f1d] border border-white/10 space-y-3">
            <h3 className="text-xs font-bold font-hud text-white uppercase tracking-wider border-b border-white/5 pb-2">
              CASE INVESTIGATION MODULES
            </h3>
            <div className="space-y-1.5">
              {[
                { to: `/cases/${c.id}/crime-scene`, label: '3D Crime Scene', count: `${c.crimeScene.hotspots.length} hotspots` },
                { to: `/cases/${c.id}/evidence`, label: 'Evidence Locker', count: `${c.evidenceList.length} exhibits` },
                { to: `/cases/${c.id}/suspects`, label: 'Suspect Matrix', count: `${c.suspects.length} persons` },
                { to: `/cases/${c.id}/witnesses`, label: 'Witness Interviews', count: `${c.witnesses.length} depositions` },
                { to: `/cases/${c.id}/timeline`, label: 'Chronology Timeline', count: `${c.timeline.length} events` },
                { to: `/cases/${c.id}/notes`, label: 'Investigation Notes', count: 'View scratchpad' },
                { to: `/cases/${c.id}/report`, label: 'Printable Case Report', count: 'Export Dossier' }
              ].map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/5 border border-white/5 hover:border-cyan-400/30 text-xs font-mono transition-colors group"
                >
                  <span className="text-slate-200 group-hover:text-cyan-300 font-bold">{item.label}</span>
                  <span className="text-[10px] text-slate-500 group-hover:text-slate-400">{item.count}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Case Resolution Modal */}
      <CaseResolutionModal
        caseId={c.id}
        caseTitle={c.title}
        isOpen={isResolutionModalOpen}
        onClose={() => setIsResolutionModalOpen(false)}
      />
    </div>
  );
};
