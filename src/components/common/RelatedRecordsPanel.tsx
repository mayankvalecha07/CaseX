import React from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Users, Clock, ShieldAlert, ArrowRight, FileText } from 'lucide-react';
import { useCase } from '../../context/CaseContext';

interface RelatedRecordsPanelProps {
  caseId: string;
  excludeType?: 'EVIDENCE' | 'SUSPECT' | 'WITNESS';
}

export const RelatedRecordsPanel: React.FC<RelatedRecordsPanelProps> = ({
  caseId,
  excludeType
}) => {
  const { cases, tasks } = useCase();
  const c = cases.find(item => item.id === caseId);

  if (!c) {
    return (
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 text-xs font-mono text-slate-500">
        No case record found to compute relationships.
      </div>
    );
  }

  const caseTasks = tasks.filter(t => t.caseId === caseId);

  return (
    <div className="p-5 rounded-2xl bg-[#0a0f1d] border border-white/10 space-y-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="text-xs font-bold font-hud uppercase tracking-wider text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <span>RELATED RECORD MATRIX</span>
        </div>
        <span className="text-[10px] font-mono text-cyan-400">
          CASE #{c.id}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Evidence Link */}
        {excludeType !== 'EVIDENCE' && (
          <Link
            to={`/cases/${c.id}/evidence`}
            className="p-3 rounded-xl bg-white/[0.02] hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-400/30 transition-all group block"
          >
            <div className="flex items-center justify-between text-slate-400 group-hover:text-cyan-300 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider">EVIDENCE EXH.</span>
              <FolderOpen className="w-3.5 h-3.5" />
            </div>
            <div className="text-lg font-bold font-hud text-white group-hover:text-cyan-300">
              {c.evidenceList.length} Exhibits
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-1 flex items-center gap-1">
              <span>View locker</span>
              <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        )}

        {/* Suspects Link */}
        {excludeType !== 'SUSPECT' && (
          <Link
            to={`/cases/${c.id}/suspects`}
            className="p-3 rounded-xl bg-white/[0.02] hover:bg-amber-500/10 border border-white/10 hover:border-amber-400/30 transition-all group block"
          >
            <div className="flex items-center justify-between text-slate-400 group-hover:text-amber-300 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider">SUSPECTS</span>
              <Users className="w-3.5 h-3.5" />
            </div>
            <div className="text-lg font-bold font-hud text-white group-hover:text-amber-300">
              {c.suspects.length} Persons
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-1 flex items-center gap-1">
              <span>View matrix</span>
              <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        )}

        {/* Witnesses Link */}
        {excludeType !== 'WITNESS' && (
          <Link
            to={`/cases/${c.id}/witnesses`}
            className="p-3 rounded-xl bg-white/[0.02] hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-400/30 transition-all group block"
          >
            <div className="flex items-center justify-between text-slate-400 group-hover:text-emerald-300 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider">WITNESSES</span>
              <Users className="w-3.5 h-3.5" />
            </div>
            <div className="text-lg font-bold font-hud text-white group-hover:text-emerald-300">
              {c.witnesses.length} Recorded
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-1 flex items-center gap-1">
              <span>View depositions</span>
              <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        )}

        {/* Tasks Link */}
        <Link
          to={`/tasks`}
          className="p-3 rounded-xl bg-white/[0.02] hover:bg-purple-500/10 border border-white/10 hover:border-purple-400/30 transition-all group block"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-purple-300 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">ASSIGNED TASKS</span>
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div className="text-lg font-bold font-hud text-white group-hover:text-purple-300">
            {caseTasks.length} Tasks
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1 flex items-center gap-1">
            <span>View task board</span>
            <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
};
