import React, { useState, useMemo } from 'react';
import { useCase } from '../context/CaseContext';
import { Suspect } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { ProgressBar } from '../components/common/ProgressBar';
import {
  Users,
  ShieldAlert,
  Dna,
  Fingerprint,
  FileText,
  AlertOctagon,
  CheckCircle,
  HelpCircle,
  XCircle,
  Sparkles,
  Search,
  Tag,
  ArrowRightLeft,
  Crown,
  ShieldCheck,
  Filter,
  MessageSquare,
  Flame,
  Check,
  Send,
  Eye
} from 'lucide-react';

export const SuspectMatrixPage: React.FC = () => {
  const {
    selectedCase,
    updateSuspectAlibiStatus,
    updateSuspectNotes,
    updateSuspectStatus,
    setPrimeSuspect,
    showToast
  } = useCase();

  const [selectedSuspect, setSelectedSuspect] = useState<Suspect | null>(null);
  const [noteText, setNoteText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PRIME' | 'DISPROVEN' | 'HIGH_RISK' | 'CLEARED'>('ALL');

  // Suspect Comparison Mode state
  const [isComparing, setIsComparing] = useState(false);
  const [compareIdA, setCompareIdA] = useState<string>('');
  const [compareIdB, setCompareIdB] = useState<string>('');

  // Simulated Interrogation state
  const [customQuestion, setCustomQuestion] = useState('');
  const [interrogationLog, setInterrogationLog] = useState<{ q: string; a: string; time: string }[]>([]);

  if (!selectedCase) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center font-mono text-cyan-400">
        NO ACTIVE CASE LOADED
      </div>
    );
  }

  const { suspects, evidenceList } = selectedCase;

  // Filtered Suspects
  const filteredSuspects = useMemo(() => {
    return suspects.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.occupation.toLowerCase().includes(q) ||
        (s.alias && s.alias.toLowerCase().includes(q)) ||
        s.motive.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (statusFilter === 'PRIME') {
        return s.status === 'PRIME SUSPECT' || selectedCase.warrantData?.eligibleSuspectId === s.id;
      }
      if (statusFilter === 'DISPROVEN') {
        return s.alibiStatus === 'DISPROVEN';
      }
      if (statusFilter === 'HIGH_RISK') {
        return s.riskLevel === 'CRITICAL' || s.riskLevel === 'HIGH' || (s.riskScore ?? s.threatScore ?? 0) >= 70;
      }
      if (statusFilter === 'CLEARED') {
        return s.status === 'CLEAR' || s.alibiStatus === 'VERIFIED';
      }

      return true;
    });
  }, [suspects, searchQuery, statusFilter, selectedCase.warrantData]);

  const handleOpenSuspect = (s: Suspect) => {
    setSelectedSuspect(s);
    setNoteText(s.interrogationNotes || s.notes || '');
    setInterrogationLog([
      {
        q: 'Where were you between 01:00 and 03:00 on the night of the incident?',
        a: s.alibi,
        time: 'Initial Police Intake'
      }
    ]);
  };

  const handleStatusChange = (status: 'VERIFIED' | 'QUESTIONABLE' | 'DISPROVEN') => {
    if (selectedSuspect) {
      updateSuspectAlibiStatus(selectedSuspect.id, status);
      setSelectedSuspect((prev) => (prev ? { ...prev, alibiStatus: status } : null));
    }
  };

  const handleClassificationChange = (status: 'SUSPECT' | 'PERSON OF INTEREST' | 'CLEAR' | 'PRIME SUSPECT') => {
    if (selectedSuspect) {
      updateSuspectStatus(selectedSuspect.id, status);
      if (status === 'PRIME SUSPECT') {
        setPrimeSuspect(selectedSuspect.id);
      }
      setSelectedSuspect((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const handleSaveNotes = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSuspect) {
      updateSuspectNotes(selectedSuspect.id, noteText);
      setSelectedSuspect((prev) => (prev ? { ...prev, interrogationNotes: noteText, notes: noteText } : null));
    }
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim() || !selectedSuspect) return;

    let response = `I've already told your team everything. I had nothing to do with what happened.`;
    const qLower = customQuestion.toLowerCase();

    if (qLower.includes('alibi') || qLower.includes('where') || qLower.includes('night')) {
      response = `My alibi is rock solid: "${selectedSuspect.alibi}". You can verify it with anyone.`;
    } else if (qLower.includes('motive') || qLower.includes('money') || qLower.includes('debt') || qLower.includes('patent') || qLower.includes('why')) {
      response = `Whatever you think my motive is, it doesn't make me a criminal. The allegations regarding "${selectedSuspect.motive}" are taken out of context.`;
    } else if (qLower.includes('fingerprint') || qLower.includes('dna') || qLower.includes('biometric') || qLower.includes('evidence')) {
      const fp = selectedSuspect.fingerprintMatchRate ?? selectedSuspect.fingerprintMatch ?? 0;
      const dna = selectedSuspect.dnaMatchRate ?? selectedSuspect.dnaMatch ?? 0;
      if (fp > 75 || dna > 75) {
        response = `That's impossible! Someone must have planted or contaminated the samples. I demand to speak with legal counsel.`;
      } else {
        response = `Your lab results speak for themselves. There is no definitive forensic link tying me to the immediate breach.`;
      }
    }

    setInterrogationLog((prev) => [
      ...prev,
      {
        q: customQuestion,
        a: response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    setCustomQuestion('');
    showToast(`Suspect answered interrogation inquiry.`);
  };

  // Helper getters for robust property reading
  const getFpMatch = (s: Suspect) => s.fingerprintMatchRate ?? s.fingerprintMatch ?? 0;
  const getDnaMatch = (s: Suspect) => s.dnaMatchRate ?? s.dnaMatch ?? 0;
  const getThreat = (s: Suspect) => s.threatScore ?? s.riskScore ?? 50;
  const getLinkedEvidence = (s: Suspect) => s.linkedEvidence || s.evidenceLinks || [];

  const suspectA = suspects.find((s) => s.id === compareIdA) || suspects[0];
  const suspectB = suspects.find((s) => s.id === compareIdB) || suspects[1] || suspects[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">
              PERSONS OF INTEREST MATRIX // #{selectedCase.id}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-hud text-white">
            SUSPECT MATRIX & FORENSIC BIOMETRICS
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Cross-examine alibis, analyze DNA/fingerprint probability matches, and compile criminal profiles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isComparing ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => {
              setIsComparing(!isComparing);
              if (!compareIdA && suspects[0]) setCompareIdA(suspects[0].id);
              if (!compareIdB && suspects[1]) setCompareIdB(suspects[1].id);
            }}
            icon={<ArrowRightLeft className="w-4 h-4" />}
          >
            {isComparing ? 'GRID VIEW' : 'COMPARE SUSPECTS'}
          </Button>

          <div className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">TARGETS:</span>{' '}
            <span className="text-white font-bold font-hud">{suspects.length}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#090d16]/90 border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by suspect name, alias, occupation, motive keyword..."
            className="w-full pl-9 pr-4 py-2 text-xs font-mono bg-slate-950/80 border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-mono">
          <span className="text-slate-500 text-[10px] uppercase font-bold mr-1 hidden sm:inline">FILTER:</span>
          {(['ALL', 'PRIME', 'DISPROVEN', 'HIGH_RISK', 'CLEARED'] as const).map((filterKey) => (
            <button
              key={filterKey}
              onClick={() => setStatusFilter(filterKey)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === filterKey
                  ? 'bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {filterKey === 'ALL'
                ? 'ALL SUSPECTS'
                : filterKey === 'PRIME'
                ? 'PRIME TARGETS'
                : filterKey === 'DISPROVEN'
                ? 'DISPROVEN ALIBI'
                : filterKey === 'HIGH_RISK'
                ? 'HIGH RISK'
                : 'CLEARED'}
            </button>
          ))}
        </div>
      </div>

      {/* Side-by-Side Comparison View */}
      {isComparing && suspectA && suspectB && (
        <div className="p-6 rounded-2xl bg-[#090d16]/95 border-2 border-cyan-500/40 shadow-[0_0_35px_rgba(6,182,212,0.15)] space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold font-hud text-white">
                DUAL SUSPECT BIOMETRIC & MOTIVE COMPARISON
              </h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsComparing(false)}>
              CLOSE COMPARISON
            </Button>
          </div>

          {/* Selector headers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subject 1 */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-4">
              <div className="flex items-center gap-3">
                <select
                  value={compareIdA}
                  onChange={(e) => setCompareIdA(e.target.value)}
                  className="p-2 text-xs font-mono font-bold bg-slate-900 border border-slate-700 rounded-lg text-cyan-300 focus:outline-none focus:border-cyan-400"
                >
                  {suspects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.occupation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-4">
                <img
                  src={suspectA.avatar}
                  alt={suspectA.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-cover border-2 border-cyan-400"
                />
                <div>
                  <h3 className="text-base font-bold font-hud text-white">{suspectA.name}</h3>
                  <p className="text-xs font-mono text-slate-400">{suspectA.occupation}</p>
                  <div className="flex gap-1.5 mt-1">
                    <Badge variant="cyan" size="sm">
                      THREAT: {getThreat(suspectA)}/100
                    </Badge>
                    <Badge variant={suspectA.alibiStatus === 'VERIFIED' ? 'emerald' : suspectA.alibiStatus === 'DISPROVEN' ? 'red' : 'amber'} size="sm">
                      {suspectA.alibiStatus}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-amber-400 font-bold uppercase block">MOTIVE:</span>
                  <p className="text-slate-300">{suspectA.motive}</p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase block">ALIBI:</span>
                  <p className="text-slate-300">{suspectA.alibi}</p>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Fingerprint Match Rate</span>
                    <span className="text-cyan-400 font-bold">{getFpMatch(suspectA)}%</span>
                  </div>
                  <ProgressBar value={getFpMatch(suspectA)} size="sm" variant="cyan" />

                  <div className="flex justify-between text-[11px] pt-1">
                    <span className="text-slate-400">DNA Match Rate</span>
                    <span className="text-emerald-400 font-bold">{getDnaMatch(suspectA)}%</span>
                  </div>
                  <ProgressBar value={getDnaMatch(suspectA)} size="sm" variant="emerald" />
                </div>
              </div>
            </div>

            {/* Subject 2 */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/30 space-y-4">
              <div className="flex items-center gap-3">
                <select
                  value={compareIdB}
                  onChange={(e) => setCompareIdB(e.target.value)}
                  className="p-2 text-xs font-mono font-bold bg-slate-900 border border-slate-700 rounded-lg text-amber-300 focus:outline-none focus:border-amber-400"
                >
                  {suspects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.occupation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-4">
                <img
                  src={suspectB.avatar}
                  alt={suspectB.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-cover border-2 border-amber-400"
                />
                <div>
                  <h3 className="text-base font-bold font-hud text-white">{suspectB.name}</h3>
                  <p className="text-xs font-mono text-slate-400">{suspectB.occupation}</p>
                  <div className="flex gap-1.5 mt-1">
                    <Badge variant="amber" size="sm">
                      THREAT: {getThreat(suspectB)}/100
                    </Badge>
                    <Badge variant={suspectB.alibiStatus === 'VERIFIED' ? 'emerald' : suspectB.alibiStatus === 'DISPROVEN' ? 'red' : 'amber'} size="sm">
                      {suspectB.alibiStatus}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-amber-400 font-bold uppercase block">MOTIVE:</span>
                  <p className="text-slate-300">{suspectB.motive}</p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase block">ALIBI:</span>
                  <p className="text-slate-300">{suspectB.alibi}</p>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Fingerprint Match Rate</span>
                    <span className="text-amber-400 font-bold">{getFpMatch(suspectB)}%</span>
                  </div>
                  <ProgressBar value={getFpMatch(suspectB)} size="sm" variant="amber" />

                  <div className="flex justify-between text-[11px] pt-1">
                    <span className="text-slate-400">DNA Match Rate</span>
                    <span className="text-emerald-400 font-bold">{getDnaMatch(suspectB)}%</span>
                  </div>
                  <ProgressBar value={getDnaMatch(suspectB)} size="sm" variant="emerald" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suspects Cards Grid */}
      {filteredSuspects.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-slate-950/60 border border-slate-800 font-mono space-y-3">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base text-slate-300 font-bold">NO SUSPECTS MATCH FILTER</h3>
          <p className="text-xs text-slate-500">Try adjusting your search keywords or filter criteria.</p>
          <Button variant="secondary" size="sm" onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); }}>
            RESET FILTERS
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuspects.map((suspect) => {
            const riskVariant = {
              CRITICAL: 'red',
              HIGH: 'amber',
              MEDIUM: 'cyan',
              LOW: 'slate'
            }[suspect.riskLevel] as 'red' | 'amber' | 'cyan' | 'slate';

            const alibiVariant = {
              VERIFIED: 'emerald',
              QUESTIONABLE: 'amber',
              DISPROVEN: 'red'
            }[suspect.alibiStatus] as 'emerald' | 'amber' | 'red';

            const isPrime = suspect.status === 'PRIME SUSPECT' || selectedCase.warrantData?.eligibleSuspectId === suspect.id;
            const fpRate = getFpMatch(suspect);
            const dnaRate = getDnaMatch(suspect);
            const linkedEv = getLinkedEvidence(suspect);

            return (
              <div
                key={suspect.id}
                onClick={() => handleOpenSuspect(suspect)}
                className={`p-5 rounded-xl bg-[#090d16]/90 hover:bg-slate-900/90 border transition-all duration-200 cursor-pointer group flex flex-col justify-between hover:shadow-[0_0_25px_rgba(245,158,11,0.15)] relative overflow-hidden ${
                  isPrime
                    ? 'border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                    : 'border-slate-800/90 hover:border-amber-500/50'
                }`}
              >
                {/* Prime Suspect Banner */}
                {isPrime && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-bl-lg text-[9px] font-mono font-bold flex items-center gap-1 shadow-md">
                    <Crown className="w-3 h-3" />
                    PRIME TARGET
                  </div>
                )}

                <div>
                  {/* Avatar & Header Profile */}
                  <div className="flex items-start gap-3.5 mb-4">
                    <div className="relative shrink-0">
                      <img
                        src={suspect.avatar}
                        alt={suspect.name}
                        referrerPolicy="no-referrer"
                        className={`w-16 h-16 rounded-xl object-cover border-2 transition-colors ${
                          isPrime
                            ? 'border-amber-400'
                            : 'border-slate-700 group-hover:border-amber-400'
                        }`}
                      />
                      <span className="absolute -bottom-1 -right-1 text-[9px] font-mono font-bold px-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
                        {suspect.age}y
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <Badge variant={riskVariant} size="sm">
                          RISK: {suspect.riskLevel}
                        </Badge>
                        <span className="text-[10px] font-mono text-slate-500">#{suspect.id}</span>
                      </div>

                      <h3 className="text-lg font-bold font-hud text-white group-hover:text-amber-300 transition-colors truncate">
                        {suspect.name}
                      </h3>
                      <p className="text-xs font-mono text-cyan-400 truncate">{suspect.occupation}</p>
                    </div>
                  </div>

                  {/* Motive & Alibi */}
                  <div className="space-y-2 mb-4 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                      <span className="text-[10px] text-amber-400/90 uppercase font-bold block mb-0.5">
                        MOTIVE HYPOTHESIS:
                      </span>
                      <p className="text-slate-300 line-clamp-2">{suspect.motive}</p>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase">ALIBI VERIFICATION:</span>
                      <Badge variant={alibiVariant} size="sm" dot>
                        {suspect.alibiStatus}
                      </Badge>
                    </div>
                  </div>

                  {/* Biometric Match Bars */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
                        Fingerprint Match
                      </span>
                      <span className="text-white font-bold font-hud">
                        {fpRate}%
                      </span>
                    </div>
                    <ProgressBar
                      value={fpRate}
                      size="sm"
                      showPercent={false}
                      variant={fpRate > 80 ? 'red' : 'cyan'}
                    />

                    <div className="flex items-center justify-between text-[11px] font-mono pt-1">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Dna className="w-3.5 h-3.5 text-emerald-400" />
                        DNA Match
                      </span>
                      <span className="text-white font-bold font-hud">
                        {dnaRate}%
                      </span>
                    </div>
                    <ProgressBar
                      value={dnaRate}
                      size="sm"
                      showPercent={false}
                      variant={dnaRate > 80 ? 'red' : 'emerald'}
                    />
                  </div>
                </div>

                {/* Footer Evidence Link Tags */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>{linkedEv.length} LINKED EVIDENCE</span>
                  <span className="text-amber-400 font-bold group-hover:underline">
                    OPEN DOSSIER →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Suspect Detail & Interrogation Modal */}
      <Modal
        isOpen={!!selectedSuspect}
        onClose={() => setSelectedSuspect(null)}
        title={`CLASSIFIED SUSPECT DOSSIER // ${selectedSuspect?.name}`}
        subtitle={`ID: #${selectedSuspect?.id} • RISK ASSESSMENT: ${selectedSuspect?.riskLevel}`}
        maxWidth="4xl"
      >
        {selectedSuspect && (
          <div className="space-y-5 font-mono text-xs max-h-[80vh] overflow-y-auto pr-1">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <img
                src={selectedSuspect.avatar}
                alt={selectedSuspect.name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-xl object-cover border-2 border-amber-400 shrink-0"
              />

              <div className="flex-1 space-y-1.5 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-xl font-bold font-hud text-white">
                    {selectedSuspect.name}
                  </h3>
                  {selectedSuspect.alias && (
                    <span className="text-amber-400 font-mono text-xs">"{selectedSuspect.alias}"</span>
                  )}
                </div>
                <p className="text-cyan-400">
                  {selectedSuspect.occupation} • Age: {selectedSuspect.age}
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <Badge variant="amber" size="sm">
                    CLASSIFICATION: {selectedSuspect.status}
                  </Badge>
                  <Badge variant="cyan" size="sm">
                    THREAT SCORE: {getThreat(selectedSuspect)}/100
                  </Badge>
                  <Badge variant={selectedSuspect.alibiStatus === 'VERIFIED' ? 'emerald' : selectedSuspect.alibiStatus === 'DISPROVEN' ? 'red' : 'amber'} size="sm" dot>
                    ALIBI: {selectedSuspect.alibiStatus}
                  </Badge>
                </div>
              </div>

              {/* Quick Action: Flag as Prime / Clear */}
              <div className="flex sm:flex-col gap-2 shrink-0">
                <Button
                  variant={selectedSuspect.status === 'PRIME SUSPECT' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleClassificationChange('PRIME SUSPECT')}
                  icon={<Crown className="w-3.5 h-3.5 text-amber-400" />}
                >
                  SET PRIME TARGET
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleClassificationChange('CLEAR')}
                  icon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                >
                  MARK CLEARED
                </Button>
              </div>
            </div>

            {/* Motive & Alibi Statement */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                <span className="text-amber-400 font-bold uppercase block flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  PROBABLE MOTIVE:
                </span>
                <p className="text-slate-200 leading-relaxed">{selectedSuspect.motive}</p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                <span className="text-cyan-400 font-bold uppercase block flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                  STATED ALIBI:
                </span>
                <p className="text-slate-200 leading-relaxed">{selectedSuspect.alibi}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-slate-400 text-[10px]">VERIFY ALIBI:</span>
                  <div className="flex items-center gap-1.5">
                    {(['VERIFIED', 'QUESTIONABLE', 'DISPROVEN'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        className={`px-2 py-1 rounded text-[10px] uppercase font-bold transition-all cursor-pointer ${
                          selectedSuspect.alibiStatus === status
                            ? status === 'VERIFIED'
                              ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                              : status === 'DISPROVEN'
                              ? 'bg-rose-600 text-white shadow-[0_0_10px_rgba(244,63,94,0.5)]'
                              : 'bg-amber-600 text-white shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Biometrics & Forensic Match Scores */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider block">
                LABORATORY BIOMETRIC ANALYSIS:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Fingerprint className="w-4 h-4 text-cyan-400" />
                      Fingerprint Match
                    </span>
                    <span className="text-cyan-400 font-bold font-hud">
                      {getFpMatch(selectedSuspect)}%
                    </span>
                  </div>
                  <ProgressBar value={getFpMatch(selectedSuspect)} size="sm" variant="cyan" />
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Dna className="w-4 h-4 text-emerald-400" />
                      DNA Epithelial Match
                    </span>
                    <span className="text-emerald-400 font-bold font-hud">
                      {getDnaMatch(selectedSuspect)}%
                    </span>
                  </div>
                  <ProgressBar value={getDnaMatch(selectedSuspect)} size="sm" variant="emerald" />
                </div>
              </div>
            </div>

            {/* Cyber Footprint & Linked Evidence */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold uppercase block">
                  DIGITAL & FINANCIAL FOOTPRINT:
                </span>
                <p className="text-slate-300 leading-relaxed">{selectedSuspect.cyberFootprint}</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold uppercase block">
                  LINKED EVIDENCE ARTIFACTS:
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {getLinkedEvidence(selectedSuspect).length === 0 ? (
                    <span className="text-slate-500 italic">No direct evidence items linked yet.</span>
                  ) : (
                    getLinkedEvidence(selectedSuspect).map((evId) => {
                      const matchedEv = evidenceList.find((e) => e.id === evId || e.code === evId);
                      return (
                        <div
                          key={evId}
                          className="px-2 py-1 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[10px] flex items-center gap-1"
                        >
                          <Tag className="w-3 h-3 text-cyan-400" />
                          <span>{matchedEv ? matchedEv.title : evId}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Interactive Interrogation Simulator */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold uppercase">
                <MessageSquare className="w-4 h-4" />
                <span>INTERROGATION LOG & CROSS-EXAMINATION</span>
              </div>

              <div className="space-y-2 max-h-44 overflow-y-auto p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                {interrogationLog.map((log, idx) => (
                  <div key={idx} className="space-y-1 border-b border-slate-800/80 pb-2 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between text-[10px] text-cyan-400 font-bold">
                      <span>Q: {log.q}</span>
                      <span className="text-slate-500">{log.time}</span>
                    </div>
                    <p className="text-slate-200 pl-3 border-l-2 border-amber-400/60 leading-relaxed">
                      "{log.a}"
                    </p>
                  </div>
                ))}
              </div>

              {/* Ask Question Form */}
              <form onSubmit={handleAskQuestion} className="flex gap-2">
                <input
                  type="text"
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder="Ask suspect about alibi, biometrics, motive, or evidence..."
                  className="flex-1 p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400"
                />
                <Button type="submit" variant="primary" size="sm" icon={<Send className="w-3.5 h-3.5" />}>
                  ASK
                </Button>
              </form>
            </div>

            {/* Interrogation Notes Form */}
            <form onSubmit={handleSaveNotes} className="space-y-2">
              <label className="text-amber-400 font-bold uppercase block">
                LEAD INVESTIGATOR OBSERVATIONS & DOSSIER NOTES:
              </label>
              <div className="flex gap-2">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Record verbal admissions, psychological cues, contradictions during cross-examination..."
                  rows={2}
                  className="flex-1 p-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                />
                <Button type="submit" variant="secondary" size="sm" className="self-end" icon={<Check className="w-3.5 h-3.5" />}>
                  SAVE NOTES
                </Button>
              </div>
            </form>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <Button variant="ghost" size="sm" onClick={() => setSelectedSuspect(null)}>
                CLOSE DOSSIER
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
