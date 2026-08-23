import React from 'react';
import { useCase } from '../../context/CaseContext';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { Folder, CheckCircle, ArrowRight } from 'lucide-react';

interface CaseSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CaseSelectorModal: React.FC<CaseSelectorModalProps> = ({
  isOpen,
  onClose
}) => {
  const { cases, selectedCaseId, switchCase } = useCase();

  const handleSelect = (id: string) => {
    switchCase(id);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="SWITCH ACTIVE INVESTIGATION"
      subtitle="SELECT A CASE FILE TO LOAD INTO FORENSIC WORKSTATION"
      maxWidth="3xl"
    >
      <div className="space-y-3">
        <p className="text-xs font-mono text-slate-400">
          Switching active investigations dynamically updates all crime scenes, evidence lockers, suspect matrices, and timeline data.
        </p>

        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {cases.map((c) => {
            const isSelected = c.id === selectedCaseId;
            return (
              <div
                key={c.id}
                onClick={() => handleSelect(c.id)}
                className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                    : 'bg-white/5 border-white/10 hover:border-cyan-500/40 hover:bg-white/[0.08]'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-mono text-cyan-400 font-bold">
                      #{c.id}
                    </span>
                    <Badge variant={c.priority === 'CRITICAL' ? 'red' : 'amber'} size="sm">
                      {c.priority}
                    </Badge>
                    <Badge variant="slate" size="sm">
                      {c.type}
                    </Badge>
                  </div>
                  <h4 className="text-base font-bold font-hud text-white truncate">
                    {c.title}
                  </h4>
                  <p className="text-xs font-mono text-slate-400 truncate mt-0.5">
                    {c.location} • {c.incidentDate}
                  </p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-white/10">
                  <div className="w-28 text-right shrink-0">
                    <ProgressBar value={c.progress} size="sm" showPercent />
                  </div>

                  {isSelected ? (
                    <div className="flex items-center gap-1 text-xs font-mono text-cyan-400 font-bold px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-400/30 shrink-0">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>ACTIVE</span>
                    </div>
                  ) : (
                    <button className="flex items-center gap-1 text-xs font-mono text-slate-300 hover:text-cyan-300 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 transition-colors shrink-0">
                      <span>LOAD</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
