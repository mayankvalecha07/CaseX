import React from 'react';
import { useCase } from '../context/CaseContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import {
  FolderOpen,
  ArrowRight,
  ShieldAlert,
  Clock,
  CheckCircle,
  MapPin,
  Calendar
} from 'lucide-react';

interface MyInvestigationsPageProps {
  navigate: (route: string) => void;
}

export const MyInvestigationsPage: React.FC<MyInvestigationsPageProps> = ({
  navigate
}) => {
  const { cases, switchCase, selectedCaseId } = useCase();

  const handleResume = (caseId: string) => {
    switchCase(caseId);
    navigate('/dashboard');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">
              ACTIVE CASELOAD // INVESTIGATOR TRACKER
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-hud text-white">
            MY INVESTIGATIONS
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Classified criminal investigations assigned to your active biometric badge.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/cases')}
          icon={<FolderOpen className="w-4 h-4" />}
        >
          BROWSE ALL ARCHIVED CASES
        </Button>
      </div>

      {/* Case List */}
      <div className="space-y-4 font-mono">
        {cases.map((c) => {
          const isActive = c.id === selectedCaseId;
          const collectedCount = c.evidenceList.filter((e) => e.status === 'COLLECTED').length;

          return (
            <div
              key={c.id}
              className={`p-6 rounded-2xl border transition-all duration-200 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 ${
                isActive
                  ? 'bg-cyan-500/10 border-cyan-400/50 shadow-[0_0_30px_rgba(6,182,212,0.15)]'
                  : 'bg-white/5 border-white/10 hover:border-cyan-500/40 hover:bg-white/[0.08]'
              }`}
            >
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-cyan-400">#{c.id}</span>
                  <Badge variant={c.priority === 'CRITICAL' ? 'red' : 'amber'} size="sm">
                    {c.priority}
                  </Badge>
                  <Badge variant="cyan" size="sm">
                    {c.status}
                  </Badge>
                  {isActive && (
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-bold">
                      CURRENTLY LOADED
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold font-hud text-white">{c.title}</h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{c.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{c.incidentDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span>
                      {collectedCount}/{c.evidenceList.length} Evidence Collected
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress & Action */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/10">
                <div className="w-full sm:w-44 text-right">
                  <ProgressBar
                    value={c.progress}
                    label="SOLVABILITY"
                    size="sm"
                    variant={c.progress > 70 ? 'emerald' : 'cyan'}
                  />
                </div>

                <Button
                  variant={isActive ? 'primary' : 'secondary'}
                  size="md"
                  onClick={() => handleResume(c.id)}
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                  className="shadow-lg"
                >
                  {isActive ? 'RESUME INVESTIGATION' : 'LOAD & RESUME'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
