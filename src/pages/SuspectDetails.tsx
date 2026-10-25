import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCase } from '../context/CaseContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Tabs } from '../components/ui/Tabs';
import { TextArea } from '../components/forms/TextArea';
import { RelatedRecordsPanel } from '../components/common/RelatedRecordsPanel';
import {
  Users,
  Fingerprint,
  Dna,
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  Clock,
  Sparkles,
  Gavel,
  FileText
} from 'lucide-react';

export const SuspectDetails: React.FC = () => {
  const { caseId, suspectId } = useParams<{ caseId: string; suspectId: string }>();
  const navigate = useNavigate();
  const {
    cases,
    updateSuspectAlibiStatus,
    updateSuspectNotes,
    updateSuspectStatus,
    setPrimeSuspect
  } = useCase();

  const currentCase = cases.find(c => c.id === caseId);
  const suspect = currentCase?.suspects.find(s => s.id === suspectId);

  const [activeTab, setActiveTab] = useState<'profile' | 'evidence' | 'timeline' | 'interrogation'>('profile');
  const [interrogationText, setInterrogationText] = useState(suspect?.interrogationNotes || suspect?.notes || '');

  if (!currentCase || !suspect) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center font-mono">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white mb-2">SUSPECT DOSSIER NOT FOUND</h2>
        <p className="text-xs text-slate-400 mb-6">No subject with identifier: {suspectId}</p>
        <Button variant="primary" size="sm" onClick={() => navigate(caseId ? `/cases/${caseId}/suspects` : '/cases')}>
          RETURN TO SUSPECT MATRIX
        </Button>
      </div>
    );
  }

  const isPrime = suspect.status === 'PRIME SUSPECT' || currentCase.warrantData.eligibleSuspectId === suspect.id;

  const tabs = [
    { id: 'profile', label: 'PROFILE & ALIBI', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'evidence', label: 'LINKED EVIDENCE', icon: <FolderOpen className="w-3.5 h-3.5" />, badge: (suspect.linkedEvidence || suspect.evidenceLinks || []).length },
    { id: 'timeline', label: 'TIMELINE TRACK', icon: <Clock className="w-3.5 h-3.5" /> },
    { id: 'interrogation', label: 'INTERROGATION NOTES', icon: <FileText className="w-3.5 h-3.5" /> }
  ];

  const handleAlibiChange = (status: 'VERIFIED' | 'QUESTIONABLE' | 'DISPROVEN') => {
    updateSuspectAlibiStatus(suspect.id, status);
  };

  const handleSaveNotes = () => {
    updateSuspectNotes(suspect.id, interrogationText);
  };

  const handleSetPrime = () => {
    setPrimeSuspect(suspect.id);
  };

  // Find linked evidence exhibits
  const linkedIds = suspect.linkedEvidence || suspect.evidenceLinks || [];
  const linkedExhibits = currentCase.evidenceList.filter(e => linkedIds.includes(e.id) || linkedIds.includes(e.code));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 font-mono animate-in fade-in duration-200">
      <button
        onClick={() => navigate(`/cases/${currentCase.id}/suspects`)}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>BACK TO SUSPECT MATRIX</span>
      </button>

      {/* Educational Simulation Notice */}
      <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-slate-300 flex items-center justify-between gap-3">
        <span>
          <strong>Investigative Classification Notice:</strong> Risk scores and case statuses are recorded workflow hypotheses within this educational simulation and do not constitute legal determinations of guilt.
        </span>
        <span className="text-[10px] uppercase font-bold text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded shrink-0">
          FICTIONAL DEMO RECORD
        </span>
      </div>

      {/* Header Banner */}
      <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/10 relative shrink-0">
              <img
                src={suspect.avatar}
                alt={suspect.name}
                className="w-full h-full object-cover"
              />
              {isPrime && (
                <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-rose-500 animate-ping" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                  DOSSIER #{suspect.id}
                </span>
                <Badge
                  variant={
                    suspect.riskLevel === 'CRITICAL'
                      ? 'rose'
                      : suspect.riskLevel === 'HIGH'
                      ? 'amber'
                      : 'cyan'
                  }
                  size="sm"
                >
                  {suspect.riskLevel} RISK ({suspect.threatScore || suspect.riskScore || 50}/100)
                </Badge>
                {isPrime ? (
                  <Badge variant="rose" size="sm">
                    PRIME SUSPECT
                  </Badge>
                ) : (
                  <Badge variant="slate" size="sm">
                    {suspect.status}
                  </Badge>
                )}
              </div>

              <h1 className="font-hud font-bold text-2xl text-white tracking-wide">
                {suspect.name}
              </h1>

              <p className="text-xs text-slate-400">
                {suspect.occupation} • Age {suspect.age} {suspect.alias ? `• Known as "${suspect.alias}"` : ''}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {!isPrime ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleSetPrime}
                icon={<Gavel className="w-3.5 h-3.5" />}
                className="bg-rose-600 hover:bg-rose-500 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
              >
                FLAG AS PRIME TARGET
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/30">
                <CheckCircle2 className="w-4 h-4 text-rose-400" />
                <span>PRIMARY WARRANT TARGET</span>
              </div>
            )}

            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/cases/${currentCase.id}/warrant`)}
            >
              GO TO WARRANT
            </Button>
          </div>
        </div>

        {/* Biometric Scores Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-white/10 text-xs">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-slate-500 text-[10px] block flex items-center gap-1.5">
              <Fingerprint className="w-3.5 h-3.5 text-cyan-400" /> FINGERPRINT MATCH
            </span>
            <span className="text-white font-bold text-base mt-1 block">
              {suspect.fingerprintMatchRate || suspect.fingerprintMatch || 0}%
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-slate-500 text-[10px] block flex items-center gap-1.5">
              <Dna className="w-3.5 h-3.5 text-purple-400" /> DNA CROSS-MATCH
            </span>
            <span className="text-white font-bold text-base mt-1 block">
              {suspect.dnaMatchRate || suspect.dnaMatch || 0}%
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-slate-500 text-[10px] block">ALIBI CREDIBILITY</span>
            <span
              className={`font-bold text-xs mt-1 block uppercase ${
                suspect.alibiStatus === 'DISPROVEN'
                  ? 'text-rose-400'
                  : suspect.alibiStatus === 'VERIFIED'
                  ? 'text-emerald-400'
                  : 'text-amber-400'
              }`}
            >
              {suspect.alibiStatus}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-slate-500 text-[10px] block">LINKED EXHIBITS</span>
            <span className="text-cyan-400 font-bold text-base mt-1 block">
              {linkedExhibits.length}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="pt-4">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={id => setActiveTab(id as any)} />
        </div>

        {/* Tab 1: Profile & Alibi */}
        {activeTab === 'profile' && (
          <div className="pt-6 space-y-6 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <span className="text-slate-500 text-[10px] block font-bold uppercase">
                  INVESTIGATIVE MOTIVE ASSESSMENT
                </span>
                <p className="text-slate-200 leading-relaxed text-xs">{suspect.motive}</p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <span className="text-slate-500 text-[10px] block font-bold uppercase">
                  CYBER FOOTPRINT & ACCESS CREDENTIALS
                </span>
                <p className="text-slate-300 leading-relaxed text-xs">{suspect.cyberFootprint}</p>
              </div>
            </div>

            {/* Alibi Section with Direct Status Toggles */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">
                    ASSERTED ALIBI STATEMENT
                  </span>
                  <p className="text-slate-200 text-xs mt-1">"{suspect.alibi}"</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-slate-400 mr-1">STATUS:</span>
                  {(['VERIFIED', 'QUESTIONABLE', 'DISPROVEN'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => handleAlibiChange(st)}
                      className={`text-[10px] px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${
                        suspect.alibiStatus === st
                          ? st === 'DISPROVEN'
                            ? 'bg-rose-600 text-white shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                            : st === 'VERIFIED'
                            ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                            : 'bg-amber-600 text-white shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                          : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Linked Evidence */}
        {activeTab === 'evidence' && (
          <div className="pt-6 space-y-4 text-xs">
            <h3 className="text-slate-400 font-bold uppercase text-xs">
              EXHIBITS FORENSICALLY TIED TO {suspect.name.toUpperCase()}
            </h3>

            {linkedExhibits.length === 0 ? (
              <p className="p-8 text-center text-slate-500 bg-white/[0.01] rounded-xl border border-white/5">
                No physical evidence items currently link directly to this suspect's dossier.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {linkedExhibits.map(ex => (
                  <div
                    key={ex.id}
                    onClick={() => navigate(`/cases/${currentCase.id}/evidence/${ex.id}`)}
                    className="p-4 rounded-xl bg-white/[0.02] hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-400/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-cyan-400">[{ex.code}]</span>
                      <Badge variant="cyan" size="sm">
                        {ex.category}
                      </Badge>
                    </div>
                    <h4 className="font-bold text-white group-hover:text-cyan-300 text-xs">
                      {ex.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {ex.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Timeline Track */}
        {activeTab === 'timeline' && (
          <div className="pt-6 space-y-4 text-xs">
            <h3 className="text-slate-400 font-bold uppercase text-xs">
              SUSPECT TIMELINE CHRONOLOGY
            </h3>
            <div className="space-y-3">
              {currentCase.timeline.map(t => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3"
                >
                  <span className="text-cyan-400 font-bold text-xs shrink-0">{t.time}</span>
                  <div>
                    <h4 className="font-bold text-white text-xs">{t.title}</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">{t.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Interrogation Notes */}
        {activeTab === 'interrogation' && (
          <div className="pt-6 space-y-4 text-xs">
            <p className="text-slate-400">
              Record interview transcript highlights, psychological contradictions, and body language observations:
            </p>
            <TextArea
              value={interrogationText}
              onChange={e => setInterrogationText(e.target.value)}
              placeholder="e.g. Subject averted eye contact when asked about Penthouse laser cutter..."
              rows={5}
            />
            <div className="flex justify-end">
              <Button variant="primary" size="sm" onClick={handleSaveNotes}>
                SAVE INTERROGATION DOSSIER
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Linked Case Matrix Navigation */}
      <RelatedRecordsPanel caseId={currentCase.id} excludeType="SUSPECT" />
    </div>
  );
};
