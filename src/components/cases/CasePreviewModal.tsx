import React from 'react';
import { InvestigationCase } from '../../types';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ProgressBar } from '../common/ProgressBar';
import { MapPin, Calendar, FolderOpen, Users, Eye, ArrowRight, Shield, Clock } from 'lucide-react';

interface CasePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: InvestigationCase | null;
  onEnterInvestigation: (caseData: InvestigationCase) => void;
  isAuthenticated: boolean;
}

export const CasePreviewModal: React.FC<CasePreviewModalProps> = ({
  isOpen,
  onClose,
  caseData,
  onEnterInvestigation,
  isAuthenticated
}) => {
  if (!caseData) return null;

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`CLASSIFIED CASE FILE // #${caseData.id}`}
      subtitle="DIGITAL CRIME SCENE INVESTIGATION DOSSIER"
      maxWidth="4xl"
    >
      <div className="space-y-6 font-sans">
        {/* Header summary banner */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={priorityVariant} size="md">
                PRIORITY: {caseData.priority}
              </Badge>
              <Badge variant={statusVariant} size="md" dot>
                STATUS: {caseData.status}
              </Badge>
              <Badge variant="blue" size="md">
                {caseData.type}
              </Badge>
            </div>
            <span className="text-xs font-mono text-cyan-400">
              LEAD: {caseData.leadInvestigator}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold font-hud text-white tracking-wide">
            {caseData.title}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>LOCATION: {caseData.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>INCIDENT DATE: {caseData.incidentDate}</span>
            </div>
          </div>
        </div>

        {/* Progress & Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-slate-400 mb-1">
              <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>EVIDENCE</span>
            </div>
            <span className="text-xl font-bold font-hud text-white">
              {caseData.evidenceCount} Files
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-slate-400 mb-1">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>SUSPECTS</span>
            </div>
            <span className="text-xl font-bold font-hud text-white">
              {caseData.suspectCount} Profiles
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-slate-400 mb-1">
              <Eye className="w-3.5 h-3.5 text-purple-400" />
              <span>WITNESSES</span>
            </div>
            <span className="text-xl font-bold font-hud text-white">
              {caseData.witnessCount} Logged
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-slate-400 mb-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>TIMELINE</span>
            </div>
            <span className="text-xl font-bold font-hud text-white">
              {caseData.timeline.length} Events
            </span>
          </div>
        </div>

        {/* Executive Case Summary */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4" />
            CASE SUMMARY & BRIEFING
          </h4>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 leading-relaxed space-y-3 font-mono text-xs sm:text-sm">
            <p>{caseData.fullBriefing}</p>
            <p className="text-xs text-slate-400 italic">
              Crime Scene: {caseData.crimeScene.name} ({caseData.crimeScene.dimensions}) -{' '}
              {caseData.crimeScene.environmentDescription}
            </p>
          </div>
        </div>

        {/* Suspect Matrix Preview */}
        <div>
          <h4 className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
            <Users className="w-4 h-4" />
            IDENTIFIED PERSONS OF INTEREST
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {caseData.suspects.slice(0, 4).map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
              >
                <img
                  src={s.avatar}
                  alt={s.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-white truncate font-mono">
                      {s.name}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase ${
                        s.riskLevel === 'CRITICAL'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-white/10 text-slate-300'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-slate-400 truncate">{s.occupation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <ProgressBar
          value={caseData.progress}
          label="OVERALL SOLVABILITY & RECONSTRUCTION PROGRESS"
          size="md"
          variant={caseData.progress > 70 ? 'emerald' : 'cyan'}
        />

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-white/10">
          <Button variant="ghost" onClick={onClose} size="md" className="w-full sm:w-auto">
            CLOSE
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => onEnterInvestigation(caseData)}
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
            className="w-full sm:w-auto shadow-[0_0_20px_rgba(6,182,212,0.4)]"
          >
            {isAuthenticated ? 'ENTER INVESTIGATION' : 'AUTHENTICATE & ENTER INVESTIGATION'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
