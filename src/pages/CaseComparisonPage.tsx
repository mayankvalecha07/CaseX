import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  ArrowRight,
  ShieldAlert,
  FolderOpen,
  CheckCircle,
  Clock,
  Users,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { useCase } from '../context/CaseContext';
import { InvestigationCase } from '../types';

export const CaseComparisonPage: React.FC = () => {
  const { cases, tasks } = useCase();
  const [caseAId, setCaseAId] = useState<string>(cases[0]?.id || 'NY-2026-0884');
  const [caseBId, setCaseBId] = useState<string>(cases[1]?.id || cases[0]?.id || 'LA-2026-0317');

  const caseA = cases.find(c => c.id === caseAId) || cases[0];
  const caseB = cases.find(c => c.id === caseBId) || cases[1] || cases[0];

  const getCompletedTasks = (id: string) => tasks.filter(t => t.caseId === id && t.status === 'COMPLETED').length;
  const getPendingTasks = (id: string) => tasks.filter(t => t.caseId === id && t.status !== 'COMPLETED').length;

  const comparisonRows = [
    { label: 'CASE DOSSIER ID', valA: caseA?.id, valB: caseB?.id, highlight: false },
    { label: 'CLASSIFICATION', valA: caseA?.type, valB: caseB?.type, highlight: caseA?.type !== caseB?.type },
    { label: 'INCIDENT STATUS', valA: caseA?.status, valB: caseB?.status, highlight: caseA?.status !== caseB?.status },
    { label: 'PRIORITY LEVEL', valA: caseA?.priority, valB: caseB?.priority, highlight: caseA?.priority !== caseB?.priority },
    { label: 'INVESTIGATION PROGRESS', valA: `${caseA?.progress}%`, valB: `${caseB?.progress}%`, highlight: true },
    { label: 'INCIDENT DATE', valA: caseA?.incidentDate, valB: caseB?.incidentDate, highlight: false },
    { label: 'PRIMARY CRIME SCENE', valA: caseA?.location, valB: caseB?.location, highlight: false },
    { label: 'LEAD INVESTIGATOR', valA: caseA?.leadInvestigator, valB: caseB?.leadInvestigator, highlight: false },
    { label: 'EVIDENCE EXHIBITS', valA: `${caseA?.evidenceList.length} Exhibits`, valB: `${caseB?.evidenceList.length} Exhibits`, highlight: true },
    { label: 'SUSPECT DOSSIERS', valA: `${caseA?.suspects.length} Suspects`, valB: `${caseB?.suspects.length} Suspects`, highlight: true },
    { label: 'WITNESS DEPOSITIONS', valA: `${caseA?.witnesses.length} Witnesses`, valB: `${caseB?.witnesses.length} Witnesses`, highlight: true },
    { label: 'TIMELINE CHRONOLOGY', valA: `${caseA?.timeline.length} Events`, valB: `${caseB?.timeline.length} Events`, highlight: true },
    { label: 'COMPLETED TASKS', valA: `${getCompletedTasks(caseA?.id || '')} Tasks`, valB: `${getCompletedTasks(caseB?.id || '')} Tasks`, highlight: true },
    { label: 'OUTSTANDING TASKS', valA: `${getPendingTasks(caseA?.id || '')} Active`, valB: `${getPendingTasks(caseB?.id || '')} Active`, highlight: true },
    { label: 'JUDICIAL WARRANT STATUS', valA: caseA?.warrantData.warrantIssued ? 'ISSUED / EXECUTED' : 'AFFIDAVIT PENDING', valB: caseB?.warrantData.warrantIssued ? 'ISSUED / EXECUTED' : 'AFFIDAVIT PENDING', highlight: caseA?.warrantData.warrantIssued !== caseB?.warrantData.warrantIssued }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
            <Layers className="w-4 h-4" />
            <span>CROSS-CASE ANALYSIS ENGINE</span>
          </div>
          <h1 className="text-2xl font-bold font-hud text-white tracking-wide">
            CASE COMPARISON
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Side-by-side forensic matrix comparing indicators, timelines, exhibit counts, and progress.
          </p>
        </div>
      </div>

      {/* Case Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 rounded-xl bg-[#0a0f1d] border border-cyan-500/30 space-y-2">
          <label className="block text-xs font-mono uppercase text-cyan-400 font-bold">
            CASE DOSSIER A
          </label>
          <select
            value={caseAId}
            onChange={e => setCaseAId(e.target.value)}
            className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400 font-bold"
          >
            {cases.map(c => (
              <option key={c.id} value={c.id}>
                {c.id} - {c.title}
              </option>
            ))}
          </select>
          <div className="text-[11px] font-mono text-slate-400 pt-1">
            {caseA?.shortDescription}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0a0f1d] border border-purple-500/30 space-y-2">
          <label className="block text-xs font-mono uppercase text-purple-400 font-bold">
            CASE DOSSIER B
          </label>
          <select
            value={caseBId}
            onChange={e => setCaseBId(e.target.value)}
            className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-400 font-bold"
          >
            {cases.map(c => (
              <option key={c.id} value={c.id}>
                {c.id} - {c.title}
              </option>
            ))}
          </select>
          <div className="text-[11px] font-mono text-slate-400 pt-1">
            {caseB?.shortDescription}
          </div>
        </div>
      </div>

      {/* Side-by-side comparison table */}
      <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#0a0f1d]">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-white/5 border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-400">
            <tr>
              <th className="p-4 w-1/3">INVESTIGATION METRIC</th>
              <th className="p-4 w-1/3 text-cyan-300 font-hud">
                <span className="flex items-center gap-1.5">
                  <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
                  {caseA?.title} (#{caseA?.id})
                </span>
              </th>
              <th className="p-4 w-1/3 text-purple-300 font-hud">
                <span className="flex items-center gap-1.5">
                  <FolderOpen className="w-3.5 h-3.5 text-purple-400" />
                  {caseB?.title} (#{caseB?.id})
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {comparisonRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4 font-bold text-slate-400 text-[11px]">
                  {row.label}
                </td>
                <td className="p-4 text-white font-medium">
                  {row.valA || <span className="text-slate-600 italic">Not recorded</span>}
                </td>
                <td className="p-4 text-white font-medium">
                  {row.valB || <span className="text-slate-600 italic">Not recorded</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action footer */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs font-mono">
        <Link to={`/cases/${caseA?.id}`} className="text-cyan-400 hover:underline flex items-center gap-1">
          <span>Open Full Dossier for #{caseA?.id}</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
        <Link to={`/cases/${caseB?.id}`} className="text-purple-400 hover:underline flex items-center gap-1">
          <span>Open Full Dossier for #{caseB?.id}</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};
