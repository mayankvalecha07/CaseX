import React, { useState, useMemo } from 'react';
import { useCase } from '../context/CaseContext';
import { EvidenceItem, EvidenceType, Importance } from '../types';
import { SearchBar } from '../components/common/SearchBar';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import {
  FolderOpen,
  Filter,
  Tag,
  MapPin,
  Calendar,
  Eye,
  CheckCircle,
  FileText,
  FlaskConical,
  Dna,
  Cpu,
  Fingerprint,
  ShieldAlert,
  Send
} from 'lucide-react';

export const EvidenceLockerPage: React.FC = () => {
  const { selectedCase, collectEvidence, markEvidenceExamined, updateEvidenceNote } = useCase();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedImportance, setSelectedImportance] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [activeModalEvidence, setActiveModalEvidence] = useState<EvidenceItem | null>(null);
  const [noteInput, setNoteInput] = useState('');

  if (!selectedCase) {
    return <div className="p-8 text-center font-mono text-cyan-400">NO CASE SELECTED</div>;
  }

  const categoryOptions = [
    'ALL',
    'PHYSICAL',
    'BIOLOGICAL',
    'DIGITAL',
    'TRACE',
    'DOCUMENT',
    'BALLISTICS'
  ];

  const importanceOptions = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  const statusOptions = ['ALL', 'COLLECTED', 'INSPECTED', 'UNINSPECTED'];

  const filteredEvidence = useMemo(() => {
    return selectedCase.evidenceList.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q));

      if (!matchesSearch) return false;
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
      if (selectedImportance !== 'ALL' && item.importance !== selectedImportance) return false;
      if (selectedStatus !== 'ALL' && item.status !== selectedStatus) return false;

      return true;
    });
  }, [selectedCase.evidenceList, searchQuery, selectedCategory, selectedImportance, selectedStatus]);

  const handleOpenEvidence = (item: EvidenceItem) => {
    setActiveModalEvidence(item);
    setNoteInput(item.userNotes || '');
  };

  const handleCollect = () => {
    if (activeModalEvidence) {
      collectEvidence(activeModalEvidence.id);
      setActiveModalEvidence((prev) => (prev ? { ...prev, status: 'COLLECTED' } : null));
    }
  };

  const handleMarkExamined = () => {
    if (activeModalEvidence) {
      markEvidenceExamined(activeModalEvidence.id);
      setActiveModalEvidence((prev) =>
        prev
          ? {
              ...prev,
              status: 'INSPECTED',
              analysisResults: {
                matchRate: 98,
                technician: 'Senior Forensics Examiner',
                details: 'Full spectroscopic verification complete.',
                verified: true
              }
            }
          : null
      );
    }
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeModalEvidence) {
      updateEvidenceNote(activeModalEvidence.id, noteInput);
      setActiveModalEvidence((prev) => (prev ? { ...prev, userNotes: noteInput } : null));
    }
  };

  const getCategoryIcon = (category: EvidenceType) => {
    switch (category) {
      case 'BIOLOGICAL':
        return <Dna className="w-4 h-4 text-emerald-400" />;
      case 'DIGITAL':
        return <Cpu className="w-4 h-4 text-cyan-400" />;
      case 'TRACE':
        return <Fingerprint className="w-4 h-4 text-purple-400" />;
      case 'BALLISTICS':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      default:
        return <FolderOpen className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">
              CHAIN OF CUSTODY // #{selectedCase.id}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-hud text-white">
            EVIDENCE LOCKER & REPOSITORY
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Classified vault containing authenticated forensic artifacts, biometrics, and physical specimens.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-400">TOTAL EVIDENCE:</span>{' '}
            <span className="text-white font-bold font-hud">{selectedCase.evidenceList.length}</span>
          </div>
          <div className="px-3 py-2 rounded-lg bg-cyan-950/80 border border-cyan-500/40">
            <span className="text-cyan-300">COLLECTED:</span>{' '}
            <span className="text-cyan-400 font-bold font-hud">
              {selectedCase.evidenceList.filter((e) => e.status === 'COLLECTED').length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#090d16]/90 border border-slate-800 space-y-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="SEARCH EVIDENCE CODE, TITLE, LOCATION, OR TAGS..."
        />

        {/* Filters Group */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800 text-xs font-mono">
          {/* Categories */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-cyan-400" /> CATEGORY:
            </span>
            {categoryOptions.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg uppercase tracking-wider text-[10px] font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">STATUS:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-cyan-300 focus:outline-none focus:border-cyan-400"
            >
              {statusOptions.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Evidence Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEvidence.map((item) => {
          const importanceVariant = {
            CRITICAL: 'red',
            HIGH: 'amber',
            MEDIUM: 'cyan',
            LOW: 'slate'
          }[item.importance] as 'red' | 'amber' | 'cyan' | 'slate';

          const statusVariant = {
            COLLECTED: 'emerald',
            INSPECTED: 'cyan',
            UNINSPECTED: 'red'
          }[item.status] as 'emerald' | 'cyan' | 'red';

          return (
            <div
              key={item.id}
              onClick={() => handleOpenEvidence(item)}
              className="p-5 rounded-xl bg-[#090d16]/90 hover:bg-slate-900/90 border border-slate-800/90 hover:border-cyan-500/50 transition-all duration-200 cursor-pointer group flex flex-col justify-between hover:shadow-[0_0_25px_rgba(6,182,212,0.15)]"
            >
              <div>
                {/* Top Code & Status */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
                    {item.code}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={importanceVariant} size="sm">
                      {item.importance}
                    </Badge>
                    <Badge variant={statusVariant} size="sm" dot>
                      {item.status}
                    </Badge>
                  </div>
                </div>

                {/* Title & Category Icon */}
                <div className="flex items-start gap-2.5 mb-2">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-hud text-white group-hover:text-cyan-300 transition-colors">
                      {item.title}
                    </h3>
                    <span className="text-[10px] font-mono text-cyan-400/80 uppercase">
                      {item.category} EVIDENCE
                    </span>
                  </div>
                </div>

                {/* Location & Time */}
                <div className="space-y-1 my-3 text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-1.5 line-clamp-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400/80 shrink-0" />
                    <span>{item.locationFound}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400/80 shrink-0" />
                    <span>{item.timestamp}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs font-mono text-slate-300 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {item.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 flex items-center gap-1"
                    >
                      <Tag className="w-2.5 h-2.5 text-cyan-400" />
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Analysis match badge if present */}
              {item.analysisResults && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> LAB VERIFIED
                  </span>
                  <span className="text-cyan-300 font-hud font-bold">
                    MATCH: {item.analysisResults.matchRate}%
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Evidence Detail & Action Modal */}
      <Modal
        isOpen={!!activeModalEvidence}
        onClose={() => setActiveModalEvidence(null)}
        title={`EVIDENCE DOSSIER // ${activeModalEvidence?.code}`}
        subtitle={activeModalEvidence?.title}
        maxWidth="3xl"
      >
        {activeModalEvidence && (
          <div className="space-y-6 font-sans">
            {/* Header info card */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div>
                <span className="text-slate-400 uppercase block">CATEGORY:</span>
                <span className="text-cyan-300 font-bold">{activeModalEvidence.category}</span>
              </div>
              <div>
                <span className="text-slate-400 uppercase block">FOUND AT:</span>
                <span className="text-white font-bold line-clamp-1">
                  {activeModalEvidence.locationFound}
                </span>
              </div>
              <div>
                <span className="text-slate-400 uppercase block">STATUS:</span>
                <Badge
                  variant={
                    activeModalEvidence.status === 'COLLECTED'
                      ? 'emerald'
                      : activeModalEvidence.status === 'INSPECTED'
                      ? 'cyan'
                      : 'red'
                  }
                  size="sm"
                  dot
                >
                  {activeModalEvidence.status}
                </Badge>
              </div>
            </div>

            {/* Description & Forensic Notes */}
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-mono text-slate-400 uppercase font-bold mb-1">
                  ARTIFACT DESCRIPTION
                </h4>
                <p className="text-xs sm:text-sm font-mono text-slate-200 p-3 rounded-lg bg-slate-900 border border-slate-800 leading-relaxed">
                  {activeModalEvidence.description}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-mono text-cyan-400 uppercase font-bold mb-1">
                  PRELIMINARY FORENSIC NOTES
                </h4>
                <p className="text-xs sm:text-sm font-mono text-cyan-100 p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30 leading-relaxed">
                  {activeModalEvidence.forensicNotes}
                </p>
              </div>
            </div>

            {/* Forensic Lab Analysis Breakdown if available */}
            {activeModalEvidence.analysisResults && (
              <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-bold uppercase flex items-center gap-1.5">
                    <FlaskConical className="w-4 h-4" />
                    CERTIFIED FORENSIC REPORT ATTACHED
                  </span>
                  <span className="text-emerald-300 font-bold font-hud">
                    CONFIDENCE: {activeModalEvidence.analysisResults.matchRate}%
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-300">
                  {activeModalEvidence.analysisResults.details}
                </p>
                <span className="text-[10px] font-mono text-slate-500 block">
                  Examiner: {activeModalEvidence.analysisResults.technician}
                </span>
              </div>
            )}

            {/* Investigator Custom Note */}
            <form onSubmit={handleSaveNote} className="space-y-2">
              <label className="text-xs font-mono text-amber-400 uppercase font-bold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                INVESTIGATOR CASE NOTES:
              </label>
              <div className="flex gap-2">
                <textarea
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Record observations, cross-references, or interrogation leads..."
                  rows={2}
                  className="flex-1 p-3 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                />
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="self-end"
                  icon={<Send className="w-3 h-3" />}
                >
                  SAVE NOTE
                </Button>
              </div>
            </form>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button variant="ghost" size="sm" onClick={() => setActiveModalEvidence(null)}>
                CLOSE
              </Button>

              {activeModalEvidence.status !== 'INSPECTED' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkExamined}
                  icon={<Eye className="w-3.5 h-3.5" />}
                >
                  MARK EXAMINED & ATTACH REPORT
                </Button>
              )}

              {activeModalEvidence.status !== 'COLLECTED' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCollect}
                  icon={<FolderOpen className="w-3.5 h-3.5" />}
                >
                  COLLECT TO SECURE VAULT
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
