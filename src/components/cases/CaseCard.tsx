import React from 'react';
import { InvestigationCase } from '../../types';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { MapPin, Calendar, FolderOpen, Users, Eye, ShieldAlert } from 'lucide-react';

interface CaseCardProps {
  caseData: InvestigationCase;
  onViewCase: (caseData: InvestigationCase) => void;
  onQuickEnter?: (caseData: InvestigationCase) => void;
  isActive?: boolean;
}

export const CaseCard: React.FC<CaseCardProps> = ({
  caseData,
  onViewCase,
  isActive = false
}) => {
  const priorityVariant = {
    CRITICAL: 'red',
    HIGH: 'amber',
    MEDIUM: 'cyan',
    LOW: 'slate'
  }[caseData.priority] as 'red' | 'amber' | 'cyan' | 'slate';

  const statusVariant = {
    ACTIVE: 'cyan',
    'UNDER INVESTIGATION': 'purple',
    'COLD CASE': 'amber',
    SOLVED: 'emerald',
    RESTRICTED: 'red'
  }[caseData.status] as 'cyan' | 'purple' | 'amber' | 'emerald' | 'red';

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl bg-white/5 border transition-all duration-300 backdrop-blur-md overflow-hidden hover:translate-y-[-2px] ${
        isActive
          ? 'border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.25)]'
          : 'border-white/10 hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]'
      }`}
    >
      {/* Top accent glow line */}
      <div
        className={`h-0.5 w-full ${
          caseData.priority === 'CRITICAL'
            ? 'bg-rose-500/80'
            : caseData.priority === 'HIGH'
            ? 'bg-amber-500/80'
            : 'bg-cyan-500/80'
        }`}
      />

      <div className="p-5 flex-1 flex flex-col">
        {/* Badges & ID */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-mono text-cyan-400 font-bold tracking-widest uppercase">
            CASE #{caseData.id}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant={priorityVariant} size="sm">
              {caseData.priority}
            </Badge>
            <Badge variant={statusVariant} size="sm" dot={caseData.status === 'ACTIVE'}>
              {caseData.status}
            </Badge>
          </div>
        </div>

        {/* Title & Type */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-white font-hud tracking-wide group-hover:text-cyan-300 transition-colors line-clamp-1">
            {caseData.title}
          </h3>
          <p className="text-[11px] font-mono text-cyan-400/80 uppercase tracking-wider mt-0.5">
            {caseData.type}
          </p>
        </div>

        {/* Location & Incident Date */}
        <div className="space-y-1.5 mb-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-cyan-400/70 shrink-0" />
            <span className="truncate">{caseData.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-cyan-400/70 shrink-0" />
            <span>{caseData.incidentDate}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300/90 leading-relaxed line-clamp-2 mb-5">
          {caseData.shortDescription}
        </p>

        {/* Metrics Counter Pill Bar */}
        <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-black/40 border border-white/5 mb-5 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-[10px] font-mono text-slate-400">
              <FolderOpen className="w-3 h-3 text-cyan-400" />
              <span>EVD</span>
            </div>
            <span className="text-sm font-bold font-hud text-white">
              {caseData.evidenceCount}
            </span>
          </div>
          <div className="border-x border-white/5">
            <div className="flex items-center justify-center gap-1 text-[10px] font-mono text-slate-400">
              <Users className="w-3 h-3 text-amber-400" />
              <span>SUSP</span>
            </div>
            <span className="text-sm font-bold font-hud text-white">
              {caseData.suspectCount}
            </span>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-[10px] font-mono text-slate-400">
              <Eye className="w-3 h-3 text-purple-400" />
              <span>WIT</span>
            </div>
            <span className="text-sm font-bold font-hud text-white">
              {caseData.witnessCount}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-auto">
          <ProgressBar
            value={caseData.progress}
            label="INVESTIGATION PROGRESS"
            size="sm"
            variant={caseData.progress > 70 ? 'emerald' : caseData.progress > 40 ? 'cyan' : 'amber'}
          />
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-5 py-3.5 bg-black/30 border-t border-white/5 flex items-center justify-between">
        <span className="text-[10px] font-mono text-slate-500">
          LEAD: {caseData.leadInvestigator.split('(')[0]}
        </span>
        <button
          onClick={() => onViewCase(caseData)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 font-mono font-bold text-xs uppercase tracking-wider border border-cyan-400/30 hover:border-cyan-400 transition-all duration-200 cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.1)]"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>VIEW CASE</span>
        </button>
      </div>
    </div>
  );
};
