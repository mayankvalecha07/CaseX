import React, { useState } from 'react';
import { useCase } from '../context/CaseContext';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  Gavel,
  ShieldCheck,
  Award,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Sparkles,
  Lock,
  RotateCcw,
  RefreshCw,
  FolderArchive
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ArrestWarrantPage: React.FC = () => {
  const { selectedCase, issueArrestWarrant, resetCase, showToast } = useCase();
  const { user } = useAuth();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [selectedSuspectId, setSelectedSuspectId] = useState<string>(() => {
    return selectedCase?.warrantData.primeSuspectId || selectedCase?.suspects[0]?.id || '';
  });

  const [probableCause, setProbableCause] = useState<string>(() => {
    return (
      selectedCase?.warrantData.probableCauseSummary ||
      'Physical evidence recovered at the crime scene directly matches the suspect’s DNA and biometric markers. Alibi verification revealed substantial chronological contradictions.'
    );
  });

  if (!selectedCase) {
    return <div className="p-8 text-center font-mono text-cyan-400">NO CASE SELECTED</div>;
  }

  const { warrantData, suspects, evidenceList, timeline } = selectedCase;

  const collectedEvidenceCount = evidenceList.filter((e) => e.status === 'COLLECTED').length;
  const isEvidenceCriteriaMet = collectedEvidenceCount >= 2;
  const isTimelineCriteriaMet = timeline.length >= 3;
  const isSuspectCriteriaMet = Boolean(selectedSuspectId);

  const canIssue =
    isEvidenceCriteriaMet &&
    isTimelineCriteriaMet &&
    isSuspectCriteriaMet &&
    !warrantData.warrantIssued;

  const handleIssueWarrant = () => {
    if (!canIssue) return;

    issueArrestWarrant(selectedSuspectId, probableCause);

    // Launch celebratory confetti
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });

    showToast('FEDERAL ARREST WARRANT ISSUED // CASE MARKED SOLVED');
  };

  const primeSuspect = suspects.find((s) => s.id === (warrantData.primeSuspectId || selectedSuspectId));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-xs font-mono text-amber-400 uppercase tracking-widest font-bold">
              JUDICIAL FILING & PROBABLE CAUSE // #{selectedCase.id}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-hud text-white">
            ARREST WARRANT & CASE CONCLUSION
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Compile affidavits, verify evidence thresholds, and execute formal judicial warrant.
          </p>
        </div>

        <Badge
          variant={warrantData.warrantIssued ? 'emerald' : 'amber'}
          size="md"
          dot
        >
          {warrantData.warrantIssued ? 'WARRANT EXECUTED • SOLVED' : 'AWAITING JUDICIAL FILING'}
        </Badge>
      </div>

      {/* Official Warrant Certificate if issued */}
      {warrantData.warrantIssued ? (
        <div className="p-8 rounded-2xl bg-[#090d16] border-2 border-emerald-500/60 shadow-[0_0_50px_rgba(16,185,129,0.25)] relative overflow-hidden font-mono space-y-6">
          {/* Official Seal Watermark */}
          <div className="absolute right-6 top-6 opacity-10 pointer-events-none">
            <ShieldCheck className="w-48 h-48 text-emerald-400" />
          </div>

          <div className="flex items-center justify-between border-b border-emerald-500/30 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-400 text-emerald-300">
                <Gavel className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-hud text-white">
                  JUDICIAL WARRANT FOR ARREST
                </h3>
                <span className="text-xs text-emerald-400">
                  WARRANT REF: #{warrantData.warrantNumber} • FILED {warrantData.issuedDate}
                </span>
              </div>
            </div>

            <span className="px-3 py-1 rounded bg-emerald-950 border border-emerald-400 text-emerald-300 text-xs font-bold">
              AUTHORIZED
            </span>
          </div>

          {/* Suspect target banner */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-4">
            {primeSuspect && (
              <img
                src={primeSuspect.avatar}
                alt={primeSuspect.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-400"
              />
            )}
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">SUBJECT OF WARRANT:</span>
              <h4 className="text-xl font-bold font-hud text-white">{primeSuspect?.name}</h4>
              <p className="text-xs text-cyan-400">
                {primeSuspect?.occupation} • Threat Index: {primeSuspect?.threatScore}/100
              </p>
            </div>
          </div>

          {/* Probable Cause Narrative */}
          <div className="space-y-1">
            <span className="text-xs text-emerald-400 font-bold uppercase block">
              SWORN PROBABLE CAUSE AFFIDAVIT:
            </span>
            <p className="text-xs sm:text-sm text-slate-200 p-4 rounded-xl bg-slate-950 border border-slate-800 leading-relaxed">
              "{warrantData.probableCauseSummary}"
            </p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-xs">
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 uppercase block text-[10px]">AFFIANT INVESTIGATOR:</span>
              <span className="text-white font-bold">{user?.name || selectedCase.leadInvestigator}</span>
              <span className="text-cyan-400 block text-[10px]">Badge #{user?.badgeNumber || 'DET-7091'}</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 uppercase block text-[10px]">PRESIDING MAGISTRATE:</span>
              <span className="text-emerald-400 font-bold">{warrantData.judgeName}</span>
              <span className="text-slate-400 block text-[10px]">High Forensic Judiciary Court</span>
            </div>
          </div>

          {/* Replay & Reset Case Controls */}
          <div className="pt-4 border-t border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <div>
              <span className="text-white font-bold block flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-cyan-400" />
                Replay / Reset This Case
              </span>
              <span className="text-slate-400 text-[11px]">
                Clear warrant status, reset evidence collection, and start this investigation fresh from zero.
              </span>
            </div>

            {showResetConfirm ? (
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    resetCase(selectedCase.id);
                    setShowResetConfirm(false);
                  }}
                  className="bg-rose-600 hover:bg-rose-500 text-white border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                >
                  CONFIRM RESET
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowResetConfirm(false)}
                >
                  CANCEL
                </Button>
              </div>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowResetConfirm(true)}
                icon={<RotateCcw className="w-3.5 h-3.5 text-cyan-400" />}
                className="shrink-0"
              >
                RESET CASE PROGRESS
              </Button>
            )}
          </div>
        </div>
      ) : (
        /* Warrant Drafting & Criteria Checklist */
        <div className="space-y-6 font-mono text-xs">
          {/* Statutory Thresholds */}
          <div className="p-5 rounded-xl bg-[#090d16] border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              MANDATORY PROSECUTORIAL CRITERIA:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                className={`p-3 rounded-lg border flex items-center gap-2.5 ${
                  isEvidenceCriteriaMet
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Min 2 Secured Evidence ({collectedEvidenceCount} Collected)</span>
              </div>

              <div
                className={`p-3 rounded-lg border flex items-center gap-2.5 ${
                  isTimelineCriteriaMet
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Timeline Chronology ({timeline.length} Events)</span>
              </div>

              <div
                className={`p-3 rounded-lg border flex items-center gap-2.5 ${
                  isSuspectCriteriaMet
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Prime Suspect Designated</span>
              </div>
            </div>
          </div>

          {/* Drafting Form */}
          <div className="p-6 rounded-2xl bg-[#090d16] border border-cyan-500/30 space-y-4">
            <div>
              <label className="text-cyan-400 uppercase font-bold block mb-1">
                DESIGNATE PRIME PERPETRATOR:
              </label>
              <select
                value={selectedSuspectId}
                onChange={(e) => setSelectedSuspectId(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                {suspects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.occupation}) — Risk: {s.riskLevel} • DNA: {s.dnaMatchRate}%
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-cyan-400 uppercase font-bold block mb-1">
                PROBABLE CAUSE JUDICIAL AFFIDAVIT:
              </label>
              <textarea
                value={probableCause}
                onChange={(e) => setProbableCause(e.target.value)}
                rows={4}
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <Button
                variant="primary"
                size="lg"
                onClick={handleIssueWarrant}
                disabled={!canIssue}
                icon={<Gavel className="w-5 h-5" />}
                className="shadow-[0_0_25px_rgba(6,182,212,0.4)]"
              >
                EXECUTE FORMAL ARREST WARRANT
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
