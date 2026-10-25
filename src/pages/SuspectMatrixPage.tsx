import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCase } from '../context/CaseContext';
import { Suspect } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
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
  Eye,
  Plus,
  Trash2,
  Edit,
  Download,
  RotateCcw,
  LayoutGrid,
  Table as TableIcon,
  FolderOpen,
  ArrowRight,
  Shield,
  AlertTriangle,
  Info
} from 'lucide-react';

export const SuspectMatrixPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    cases,
    selectedCase,
    addSuspect,
    updateSuspect,
    deleteSuspect,
    updateSuspectAlibiStatus,
    updateSuspectNotes,
    updateSuspectStatus,
    setPrimeSuspect,
    showToast
  } = useCase();

  // Search, Filter, Sort, Scope, Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [caseScope, setCaseScope] = useState<'CURRENT' | 'ALL'>('CURRENT');
  const [classificationFilter, setClassificationFilter] = useState<'ALL' | 'PRIME SUSPECT' | 'SUSPECT' | 'PERSON OF INTEREST' | 'CLEAR'>('ALL');
  const [alibiFilter, setAlibiFilter] = useState<'ALL' | 'VERIFIED' | 'QUESTIONABLE' | 'DISPROVEN'>('ALL');
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [evidenceFilter, setEvidenceFilter] = useState<'ALL' | 'LINKED' | 'UNLINKED'>('ALL');
  const [sortBy, setSortBy] = useState<'NAME_ASC' | 'RISK_DESC' | 'RISK_ASC' | 'STATUS' | 'EVIDENCE_COUNT'>('RISK_DESC');
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Selected Suspect & Modals
  const [selectedSuspect, setSelectedSuspect] = useState<Suspect | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [compareIdA, setCompareIdA] = useState<string>('');
  const [compareIdB, setCompareIdB] = useState<string>('');

  // Add/Edit Suspect Modal state
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingSuspect, setEditingSuspect] = useState<Suspect | null>(null);
  const [suspectFormData, setSuspectFormData] = useState<{
    name: string;
    alias: string;
    age: number;
    occupation: string;
    motive: string;
    alibi: string;
    alibiStatus: 'VERIFIED' | 'QUESTIONABLE' | 'DISPROVEN';
    riskScore: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    fingerprintMatch: number;
    dnaMatch: number;
    cyberFootprint: string;
    evidenceLinks: string[];
    status: 'SUSPECT' | 'PERSON OF INTEREST' | 'CLEAR' | 'PRIME SUSPECT';
    notes: string;
    caseId: string;
  }>({
    name: '',
    alias: '',
    age: 35,
    occupation: '',
    motive: '',
    alibi: '',
    alibiStatus: 'QUESTIONABLE',
    riskScore: 50,
    riskLevel: 'MEDIUM',
    fingerprintMatch: 0,
    dnaMatch: 0,
    cyberFootprint: '',
    evidenceLinks: [],
    status: 'SUSPECT',
    notes: '',
    caseId: selectedCase?.id || ''
  });

  // Delete Dialog state
  const [suspectToDelete, setSuspectToDelete] = useState<{ id: string; name: string; caseId: string } | null>(null);

  // Note text inside quick view
  const [noteText, setNoteText] = useState('');

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, caseScope, classificationFilter, alibiFilter, riskFilter, evidenceFilter, sortBy]);

  if (!selectedCase) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center font-mono text-cyan-400">
        NO ACTIVE CASE LOADED
      </div>
    );
  }

  // Pool of suspects based on caseScope
  const pool = useMemo(() => {
    if (caseScope === 'ALL') {
      return cases.flatMap(c => c.suspects.map(s => ({ ...s, _caseId: c.id, _caseTitle: c.title })));
    }
    return selectedCase.suspects.map(s => ({ ...s, _caseId: selectedCase.id, _caseTitle: selectedCase.title }));
  }, [cases, selectedCase, caseScope]);

  // Filtered Suspects
  const filteredSuspects = useMemo(() => {
    return pool.filter(s => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.occupation.toLowerCase().includes(q) ||
        (s.alias && s.alias.toLowerCase().includes(q)) ||
        (s.motive && s.motive.toLowerCase().includes(q)) ||
        s.id.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (classificationFilter !== 'ALL' && s.status !== classificationFilter) {
        return false;
      }

      if (alibiFilter !== 'ALL' && s.alibiStatus !== alibiFilter) {
        return false;
      }

      if (riskFilter !== 'ALL') {
        const rLevel = s.riskLevel || 'MEDIUM';
        if (rLevel !== riskFilter) return false;
      }

      const linked = s.linkedEvidence || s.evidenceLinks || [];
      if (evidenceFilter === 'LINKED' && linked.length === 0) return false;
      if (evidenceFilter === 'UNLINKED' && linked.length > 0) return false;

      return true;
    }).sort((a, b) => {
      const threatA = a.threatScore ?? a.riskScore ?? 50;
      const threatB = b.threatScore ?? b.riskScore ?? 50;
      const linkedA = (a.linkedEvidence || a.evidenceLinks || []).length;
      const linkedB = (b.linkedEvidence || b.evidenceLinks || []).length;

      if (sortBy === 'NAME_ASC') return a.name.localeCompare(b.name);
      if (sortBy === 'RISK_DESC') return threatB - threatA;
      if (sortBy === 'RISK_ASC') return threatA - threatB;
      if (sortBy === 'STATUS') return a.status.localeCompare(b.status);
      if (sortBy === 'EVIDENCE_COUNT') return linkedB - linkedA;
      return 0;
    });
  }, [pool, searchQuery, classificationFilter, alibiFilter, riskFilter, evidenceFilter, sortBy]);

  // Pagination calculation
  const totalItems = filteredSuspects.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedSuspects = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSuspects.slice(start, start + pageSize);
  }, [filteredSuspects, currentPage, pageSize]);

  // Open Add Suspect Modal
  const handleOpenAdd = () => {
    setEditingSuspect(null);
    setSuspectFormData({
      name: '',
      alias: '',
      age: 35,
      occupation: '',
      motive: '',
      alibi: '',
      alibiStatus: 'QUESTIONABLE',
      riskScore: 50,
      riskLevel: 'MEDIUM',
      fingerprintMatch: 0,
      dnaMatch: 0,
      cyberFootprint: '',
      evidenceLinks: [],
      status: 'SUSPECT',
      notes: '',
      caseId: selectedCase.id
    });
    setShowAddEditModal(true);
  };

  // Open Edit Suspect Modal
  const handleOpenEdit = (s: Suspect & { _caseId?: string }) => {
    setEditingSuspect(s);
    setSuspectFormData({
      name: s.name,
      alias: s.alias || '',
      age: s.age || 30,
      occupation: s.occupation || '',
      motive: s.motive || '',
      alibi: s.alibi || '',
      alibiStatus: s.alibiStatus || 'QUESTIONABLE',
      riskScore: s.threatScore ?? s.riskScore ?? 50,
      riskLevel: s.riskLevel || 'MEDIUM',
      fingerprintMatch: s.fingerprintMatchRate ?? s.fingerprintMatch ?? 0,
      dnaMatch: s.dnaMatchRate ?? s.dnaMatch ?? 0,
      cyberFootprint: s.cyberFootprint || '',
      evidenceLinks: s.linkedEvidence || s.evidenceLinks || [],
      status: s.status || 'SUSPECT',
      notes: s.notes || s.interrogationNotes || '',
      caseId: s._caseId || selectedCase.id
    });
    setShowAddEditModal(true);
  };

  // Submit Add / Edit Form
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspectFormData.name.trim() || !suspectFormData.occupation.trim()) {
      showToast('Name and Occupation are mandatory fields.', 'warning');
      return;
    }

    if (suspectFormData.age <= 0 || suspectFormData.age > 120) {
      showToast('Please enter a valid age between 1 and 120.', 'warning');
      return;
    }

    const targetCaseId = suspectFormData.caseId || selectedCase.id;

    if (editingSuspect) {
      // Update existing
      updateSuspect(targetCaseId, {
        ...editingSuspect,
        name: suspectFormData.name.trim(),
        alias: suspectFormData.alias.trim() || undefined,
        age: Number(suspectFormData.age),
        occupation: suspectFormData.occupation.trim(),
        motive: suspectFormData.motive.trim(),
        alibi: suspectFormData.alibi.trim(),
        alibiStatus: suspectFormData.alibiStatus,
        riskScore: Number(suspectFormData.riskScore),
        threatScore: Number(suspectFormData.riskScore),
        riskLevel: suspectFormData.riskLevel,
        fingerprintMatch: Number(suspectFormData.fingerprintMatch),
        fingerprintMatchRate: Number(suspectFormData.fingerprintMatch),
        dnaMatch: Number(suspectFormData.dnaMatch),
        dnaMatchRate: Number(suspectFormData.dnaMatch),
        cyberFootprint: suspectFormData.cyberFootprint.trim(),
        evidenceLinks: suspectFormData.evidenceLinks,
        linkedEvidence: suspectFormData.evidenceLinks,
        status: suspectFormData.status,
        notes: suspectFormData.notes.trim(),
        interrogationNotes: suspectFormData.notes.trim()
      });
      showToast(`Suspect dossier updated: ${suspectFormData.name}`, 'success');
    } else {
      // Create new
      addSuspect(targetCaseId, {
        name: suspectFormData.name.trim(),
        alias: suspectFormData.alias.trim() || undefined,
        age: Number(suspectFormData.age),
        occupation: suspectFormData.occupation.trim(),
        avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 99999999)}?w=400&auto=format&fit=crop&q=80`,
        motive: suspectFormData.motive.trim() || 'Pending investigative hypothesis.',
        alibi: suspectFormData.alibi.trim() || 'No sworn alibi statement on record.',
        alibiStatus: suspectFormData.alibiStatus,
        riskScore: Number(suspectFormData.riskScore),
        threatScore: Number(suspectFormData.riskScore),
        riskLevel: suspectFormData.riskLevel,
        fingerprintMatch: Number(suspectFormData.fingerprintMatch),
        fingerprintMatchRate: Number(suspectFormData.fingerprintMatch),
        dnaMatch: Number(suspectFormData.dnaMatch),
        dnaMatchRate: Number(suspectFormData.dnaMatch),
        cyberFootprint: suspectFormData.cyberFootprint.trim() || 'No anomalous digital footprint recorded.',
        evidenceLinks: suspectFormData.evidenceLinks,
        linkedEvidence: suspectFormData.evidenceLinks,
        status: suspectFormData.status,
        notes: suspectFormData.notes.trim() || 'Fictional demo record.',
        interrogationNotes: suspectFormData.notes.trim() || 'Fictional demo record.'
      });
      showToast(`New suspect dossier added: ${suspectFormData.name}`, 'success');
    }

    setShowAddEditModal(false);
  };

  // Confirm delete handler
  const handleConfirmDelete = () => {
    if (suspectToDelete) {
      deleteSuspect(suspectToDelete.caseId, suspectToDelete.id);
      setSuspectToDelete(null);
      showToast('Suspect record expunged from matrix.', 'warning');
    }
  };

  // Export CSV Handler
  const handleExportCsv = () => {
    const headers = ['ID', 'Case ID', 'Name', 'Alias', 'Age', 'Occupation', 'Classification', 'Alibi Status', 'Risk Level', 'Risk Score', 'Fingerprint Match %', 'DNA Match %', 'Linked Evidence IDs', 'Investigative Motive Hypothesis'];
    const rows = filteredSuspects.map(s => [
      `"${s.id}"`,
      `"${s._caseId}"`,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${(s.alias || '').replace(/"/g, '""')}"`,
      s.age,
      `"${s.occupation.replace(/"/g, '""')}"`,
      `"${s.status}"`,
      `"${s.alibiStatus}"`,
      `"${s.riskLevel}"`,
      s.threatScore ?? s.riskScore ?? 50,
      s.fingerprintMatchRate ?? s.fingerprintMatch ?? 0,
      s.dnaMatchRate ?? s.dnaMatch ?? 0,
      `"${(s.linkedEvidence || s.evidenceLinks || []).join('; ')}"`,
      `"${s.motive.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CaseX_Suspect_Matrix_${selectedCase.id}_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Suspect Matrix exported to CSV.', 'success');
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setClassificationFilter('ALL');
    setAlibiFilter('ALL');
    setRiskFilter('ALL');
    setEvidenceFilter('ALL');
    setSortBy('RISK_DESC');
  };

  const getThreat = (s: Suspect) => s.threatScore ?? s.riskScore ?? 50;
  const getFp = (s: Suspect) => s.fingerprintMatchRate ?? s.fingerprintMatch ?? 0;
  const getDna = (s: Suspect) => s.dnaMatchRate ?? s.dnaMatch ?? 0;
  const getLinked = (s: Suspect) => s.linkedEvidence || s.evidenceLinks || [];

  const suspectA = pool.find(s => s.id === compareIdA) || pool[0];
  const suspectB = pool.find(s => s.id === compareIdB) || pool[1] || pool[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 font-mono animate-in fade-in duration-200">
      {/* Educational & Simulation Disclaimer Banner */}
      <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs flex items-center justify-between gap-3 text-slate-300">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            <strong>Educational Simulation Sandbox:</strong> All suspect dossiers, biometric match scores, and investigative hypotheses are fictional educational demonstration records and do not represent actual persons or determinations of guilt.
          </span>
        </div>
        <span className="text-[10px] uppercase font-bold text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded shrink-0 hidden md:inline">
          ST1/ST2 SEC-4
        </span>
      </div>

      {/* Header & Main Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs text-cyan-400 uppercase tracking-widest font-bold">
              PERSONS OF INTEREST MATRIX // CASE #{selectedCase.id}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-hud text-white tracking-wide">
            SUSPECT MATRIX & BIOMETRIC CORRELATION
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-examine alibis, analyze DNA/fingerprint likelihood scores, and correlate exhibits with persons of interest.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            icon={<Plus className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            ADD SUSPECT
          </Button>

          <Button
            variant={isComparing ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => {
              setIsComparing(!isComparing);
              if (!compareIdA && pool[0]) setCompareIdA(pool[0].id);
              if (!compareIdB && pool[1]) setCompareIdB(pool[1].id);
            }}
            icon={<ArrowRightLeft className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            {isComparing ? 'MATRIX VIEW' : 'COMPARE'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCsv}
            icon={<Download className="w-3.5 h-3.5 text-cyan-400" />}
            className="text-xs"
          >
            EXPORT CSV
          </Button>

          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-400">TOTAL:</span>{' '}
            <span className="text-white font-bold">{pool.length}</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Panel */}
      {isComparing && suspectA && suspectB && (
        <div className="p-6 rounded-2xl bg-[#090d16]/95 border-2 border-cyan-500/40 shadow-[0_0_35px_rgba(6,182,212,0.15)] space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold font-hud text-white">
                DUAL SUSPECT BIOMETRIC & MOTIVE COMPARISON
              </h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsComparing(false)}>
              CLOSE COMPARISON
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Subject A */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[10px] uppercase font-bold">SELECT SUBJECT A:</span>
                <select
                  value={compareIdA}
                  onChange={(e) => setCompareIdA(e.target.value)}
                  className="flex-1 p-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-cyan-300 focus:outline-none"
                >
                  {pool.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.occupation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <img
                  src={suspectA.avatar}
                  alt={suspectA.name}
                  className="w-14 h-14 rounded-xl object-cover border border-cyan-400"
                />
                <div>
                  <h3 className="text-sm font-bold font-hud text-white">{suspectA.name}</h3>
                  <p className="text-[11px] text-slate-400">{suspectA.occupation} • Age {suspectA.age}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Badge variant={suspectA.riskLevel === 'CRITICAL' ? 'rose' : suspectA.riskLevel === 'HIGH' ? 'amber' : 'cyan'} size="sm">
                      {suspectA.riskLevel} RISK ({getThreat(suspectA)}/100)
                    </Badge>
                    <Badge variant="slate" size="sm">
                      {suspectA.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800 text-[11px]">
                <div>
                  <span className="text-slate-500 block uppercase font-bold text-[9px]">ALIBI STATUS</span>
                  <span className={`font-bold ${suspectA.alibiStatus === 'DISPROVEN' ? 'text-rose-400' : suspectA.alibiStatus === 'VERIFIED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {suspectA.alibiStatus}: "{suspectA.alibi}"
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-bold text-[9px]">BIOMETRIC MATCHES</span>
                  <span className="text-slate-200">Fingerprint: {getFp(suspectA)}% • DNA: {getDna(suspectA)}%</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-bold text-[9px]">INVESTIGATIVE MOTIVE HYPOTHESIS</span>
                  <span className="text-slate-300">{suspectA.motive}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-bold text-[9px]">LINKED EXHIBITS ({getLinked(suspectA).length})</span>
                  <span className="text-cyan-400">{getLinked(suspectA).join(', ') || 'None tied directly'}</span>
                </div>
              </div>
            </div>

            {/* Subject B */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-500/30 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[10px] uppercase font-bold">SELECT SUBJECT B:</span>
                <select
                  value={compareIdB}
                  onChange={(e) => setCompareIdB(e.target.value)}
                  className="flex-1 p-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-purple-300 focus:outline-none"
                >
                  {pool.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.occupation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <img
                  src={suspectB.avatar}
                  alt={suspectB.name}
                  className="w-14 h-14 rounded-xl object-cover border border-purple-400"
                />
                <div>
                  <h3 className="text-sm font-bold font-hud text-white">{suspectB.name}</h3>
                  <p className="text-[11px] text-slate-400">{suspectB.occupation} • Age {suspectB.age}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Badge variant={suspectB.riskLevel === 'CRITICAL' ? 'rose' : suspectB.riskLevel === 'HIGH' ? 'amber' : 'purple'} size="sm">
                      {suspectB.riskLevel} RISK ({getThreat(suspectB)}/100)
                    </Badge>
                    <Badge variant="slate" size="sm">
                      {suspectB.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800 text-[11px]">
                <div>
                  <span className="text-slate-500 block uppercase font-bold text-[9px]">ALIBI STATUS</span>
                  <span className={`font-bold ${suspectB.alibiStatus === 'DISPROVEN' ? 'text-rose-400' : suspectB.alibiStatus === 'VERIFIED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {suspectB.alibiStatus}: "{suspectB.alibi}"
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-bold text-[9px]">BIOMETRIC MATCHES</span>
                  <span className="text-slate-200">Fingerprint: {getFp(suspectB)}% • DNA: {getDna(suspectB)}%</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-bold text-[9px]">INVESTIGATIVE MOTIVE HYPOTHESIS</span>
                  <span className="text-slate-300">{suspectB.motive}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-bold text-[9px]">LINKED EXHIBITS ({getLinked(suspectB).length})</span>
                  <span className="text-purple-400">{getLinked(suspectB).join(', ') || 'None tied directly'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Filter, Search & View Controls Bar */}
      <div className="p-4 rounded-2xl bg-[#090d16] border border-white/10 space-y-3">
        {/* Top search & scope row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, alias, occupation, motive, ID..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-black/60 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Scope Toggle */}
            <div className="flex items-center bg-black/60 p-1 rounded-xl border border-white/10 text-xs">
              <button
                onClick={() => setCaseScope('CURRENT')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  caseScope === 'CURRENT'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                CURRENT CASE (#{selectedCase.id})
              </button>
              <button
                onClick={() => setCaseScope('ALL')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  caseScope === 'ALL'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ALL CASES ({cases.length})
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-black/60 p-1 rounded-xl border border-white/10 text-xs">
              <button
                onClick={() => setViewMode('CARDS')}
                className={`p-1.5 rounded-lg cursor-pointer ${
                  viewMode === 'CARDS' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
                }`}
                title="Card Grid"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('TABLE')}
                className={`p-1.5 rounded-lg cursor-pointer ${
                  viewMode === 'TABLE' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
                }`}
                title="Data Table"
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Second row: Dropdown Filters & Sorting */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          {/* Classification */}
          <div>
            <label className="text-[10px] text-slate-500 block uppercase mb-1">Classification</label>
            <select
              value={classificationFilter}
              onChange={(e) => setClassificationFilter(e.target.value as any)}
              className="w-full bg-black/60 border border-white/10 rounded-lg p-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Statuses</option>
              <option value="PRIME SUSPECT">Prime Suspect</option>
              <option value="SUSPECT">Suspect</option>
              <option value="PERSON OF INTEREST">Person of Interest</option>
              <option value="CLEAR">Clear</option>
            </select>
          </div>

          {/* Alibi Status */}
          <div>
            <label className="text-[10px] text-slate-500 block uppercase mb-1">Alibi Status</label>
            <select
              value={alibiFilter}
              onChange={(e) => setAlibiFilter(e.target.value as any)}
              className="w-full bg-black/60 border border-white/10 rounded-lg p-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Alibis</option>
              <option value="DISPROVEN">Disproven</option>
              <option value="QUESTIONABLE">Questionable</option>
              <option value="VERIFIED">Verified</option>
            </select>
          </div>

          {/* Risk Level */}
          <div>
            <label className="text-[10px] text-slate-500 block uppercase mb-1">Risk Rating</label>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as any)}
              className="w-full bg-black/60 border border-white/10 rounded-lg p-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Linked Evidence */}
          <div>
            <label className="text-[10px] text-slate-500 block uppercase mb-1">Evidence Links</label>
            <select
              value={evidenceFilter}
              onChange={(e) => setEvidenceFilter(e.target.value as any)}
              className="w-full bg-black/60 border border-white/10 rounded-lg p-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Evidence</option>
              <option value="LINKED">Linked to Exhibit</option>
              <option value="UNLINKED">No Exhibits Tied</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-[10px] text-slate-500 block uppercase mb-1">Sort Order</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-black/60 border border-white/10 rounded-lg p-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="RISK_DESC">Risk Score (High-Low)</option>
              <option value="RISK_ASC">Risk Score (Low-High)</option>
              <option value="NAME_ASC">Name (A-Z)</option>
              <option value="STATUS">Workflow Status</option>
              <option value="EVIDENCE_COUNT">Exhibits Count</option>
            </select>
          </div>

          {/* Page Size & Reset */}
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="text-[10px] text-slate-500 block uppercase mb-1">Page Size</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="w-full bg-black/60 border border-white/10 rounded-lg p-1.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value={6}>6 per page</option>
                <option value={12}>12 per page</option>
                <option value={24}>24 per page</option>
              </select>
            </div>
            <button
              onClick={handleClearFilters}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Reset Filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results Counter & Active Filters Tagging */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
          <span className="text-[11px] text-slate-400">
            Showing <strong className="text-white">{filteredSuspects.length}</strong> of{' '}
            <strong className="text-cyan-400">{pool.length}</strong> suspects
          </span>

          {(searchQuery || classificationFilter !== 'ALL' || alibiFilter !== 'ALL' || riskFilter !== 'ALL' || evidenceFilter !== 'ALL') && (
            <button
              onClick={handleClearFilters}
              className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
            >
              Clear Active Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Suspect Listing */}
      {filteredSuspects.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-white/10 space-y-3">
          <AlertOctagon className="w-10 h-10 text-amber-400 mx-auto" />
          <h3 className="font-hud font-bold text-white text-base">NO MATCHING PERSONS OF INTEREST</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No suspect dossier in this scope matches your active search and filter parameters.
          </p>
          <Button variant="secondary" size="sm" onClick={handleClearFilters}>
            RESET FILTERS
          </Button>
        </div>
      ) : viewMode === 'CARDS' ? (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedSuspects.map((s) => {
            const threat = getThreat(s);
            const isPrime = s.status === 'PRIME SUSPECT';
            const fp = getFp(s);
            const dna = getDna(s);
            const linked = getLinked(s);

            return (
              <div
                key={s.id}
                className={`p-5 rounded-2xl bg-[#090d16]/90 border transition-all duration-200 flex flex-col justify-between group ${
                  isPrime
                    ? 'border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
                    : 'border-white/10 hover:border-cyan-500/40'
                }`}
              >
                <div className="space-y-4">
                  {/* Top identity banner */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={s.avatar}
                          alt={s.name}
                          className="w-14 h-14 rounded-xl object-cover border border-white/10"
                        />
                        {isPrime && (
                          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 ring-2 ring-black flex items-center justify-center">
                            <Crown className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] font-mono text-slate-500 uppercase">
                            #{s.id}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-white/5 text-cyan-300">
                            {s._caseId}
                          </span>
                        </div>
                        <h3 className="font-hud font-bold text-base text-white group-hover:text-cyan-300 transition-colors">
                          {s.name}
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          {s.occupation} • Age {s.age}
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant={
                        s.riskLevel === 'CRITICAL'
                          ? 'rose'
                          : s.riskLevel === 'HIGH'
                          ? 'amber'
                          : 'cyan'
                      }
                      size="sm"
                    >
                      {s.riskLevel}
                    </Badge>
                  </div>

                  {/* Status & Alibi Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        isPrime
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : s.status === 'CLEAR'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-white/5 text-slate-300 border border-white/10'
                      }`}
                    >
                      {s.status}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        s.alibiStatus === 'DISPROVEN'
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                          : s.alibiStatus === 'VERIFIED'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      ALIBI: {s.alibiStatus}
                    </span>

                    <span className="px-2 py-0.5 rounded font-bold bg-purple-500/15 text-purple-300 border border-purple-500/20">
                      {linked.length} EXHIBITS
                    </span>
                  </div>

                  {/* Threat Index Progress Bar */}
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <ProgressBar
                      value={threat}
                      label="WORKFLOW RISK INDEX"
                      size="sm"
                      variant={threat > 75 ? 'rose' : threat > 50 ? 'amber' : 'cyan'}
                    />
                  </div>

                  {/* Biometric Matches */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Fingerprint className="w-3 h-3 text-cyan-400" /> Print:
                      </span>
                      <span className="font-bold text-white text-xs">{fp}%</span>
                    </div>

                    <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Dna className="w-3 h-3 text-purple-400" /> DNA:
                      </span>
                      <span className="font-bold text-white text-xs">{dna}%</span>
                    </div>
                  </div>

                  {/* Motive (Investigative Theory) */}
                  <div className="p-2.5 rounded-xl bg-white/[0.01] border border-white/5 text-[11px] text-slate-300 line-clamp-2">
                    <span className="text-[9px] text-slate-500 uppercase font-bold block">
                      INVESTIGATIVE HYPOTHESIS:
                    </span>
                    {s.motive}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/cases/${s._caseId || selectedCase.id}/suspects/${s.id}`)}
                    icon={<Eye className="w-3 h-3" />}
                    className="flex-1 text-[11px]"
                  >
                    DOSSIER
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenEdit(s)}
                    icon={<Edit className="w-3 h-3" />}
                    className="text-[11px]"
                  >
                    EDIT
                  </Button>

                  <button
                    onClick={() => setSuspectToDelete({ id: s.id, name: s.name, caseId: s._caseId || selectedCase.id })}
                    className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete Suspect"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Data Table View */
        <div className="rounded-2xl bg-[#090d16] border border-white/10 overflow-hidden overflow-x-auto text-xs">
          <table className="w-full text-left font-mono">
            <thead className="bg-white/5 border-b border-white/10 text-[10px] uppercase text-slate-400">
              <tr>
                <th className="p-3">Suspect</th>
                <th className="p-3">Case ID</th>
                <th className="p-3">Classification</th>
                <th className="p-3">Alibi State</th>
                <th className="p-3">Risk Rating</th>
                <th className="p-3">Biometrics</th>
                <th className="p-3">Linked Exhibits</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedSuspects.map((s) => (
                <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={s.avatar}
                        alt={s.name}
                        className="w-8 h-8 rounded-lg object-cover border border-white/10 shrink-0"
                      />
                      <div>
                        <span className="font-bold text-white block text-xs">{s.name}</span>
                        <span className="text-[10px] text-slate-400">{s.occupation}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-cyan-300 text-[11px]">{s._caseId}</td>
                  <td className="p-3">
                    <Badge variant={s.status === 'PRIME SUSPECT' ? 'rose' : 'slate'} size="sm">
                      {s.status}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-[10px] font-bold ${
                        s.alibiStatus === 'DISPROVEN'
                          ? 'text-rose-400'
                          : s.alibiStatus === 'VERIFIED'
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {s.alibiStatus}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-white">{getThreat(s)}/100</span>
                    <span className="text-[10px] text-slate-500 block uppercase">{s.riskLevel}</span>
                  </td>
                  <td className="p-3 text-[11px] text-slate-300">
                    FP: {getFp(s)}% • DNA: {getDna(s)}%
                  </td>
                  <td className="p-3 text-cyan-400 font-bold">
                    {getLinked(s).length} Exhibits
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/cases/${s._caseId || selectedCase.id}/suspects/${s.id}`)}
                        className="text-[10px] py-1 px-2"
                      >
                        VIEW
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(s)}
                        className="text-[10px] py-1 px-2 text-slate-300"
                      >
                        EDIT
                      </Button>
                      <button
                        onClick={() => setSuspectToDelete({ id: s.id, name: s.name, caseId: s._caseId || selectedCase.id })}
                        className="p-1.5 rounded bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 text-xs">
          <span className="text-slate-400">
            Page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong>
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="text-xs"
            >
              PREVIOUS
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  currentPage === p
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                {p}
              </button>
            ))}

            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="text-xs"
            >
              NEXT
            </Button>
          </div>
        </div>
      )}

      {/* Add / Edit Suspect Modal Form */}
      <Modal
        isOpen={showAddEditModal}
        onClose={() => setShowAddEditModal(false)}
        title={editingSuspect ? `EDIT SUSPECT DOSSIER // #${editingSuspect.id}` : 'ENROLL NEW PERSON OF INTEREST'}
        subtitle="Record background intelligence, alibi claims, and biometric correlations"
        maxWidth="2xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 font-mono text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 block uppercase mb-1">Target Case *</label>
              <select
                value={suspectFormData.caseId}
                onChange={(e) => setSuspectFormData({ ...suspectFormData, caseId: e.target.value })}
                className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                {cases.map(c => (
                  <option key={c.id} value={c.id}>
                    #{c.id} - {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block uppercase mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                value={suspectFormData.name}
                onChange={(e) => setSuspectFormData({ ...suspectFormData, name: e.target.value })}
                placeholder="e.g. Elena Rostova"
                className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 block uppercase mb-1">Alias / Street Moniker</label>
              <input
                type="text"
                value={suspectFormData.alias}
                onChange={(e) => setSuspectFormData({ ...suspectFormData, alias: e.target.value })}
                placeholder="e.g. The Curator"
                className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block uppercase mb-1">Age *</label>
              <input
                type="number"
                required
                min={18}
                max={100}
                value={suspectFormData.age}
                onChange={(e) => setSuspectFormData({ ...suspectFormData, age: Number(e.target.value) })}
                className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block uppercase mb-1">Occupation / Role *</label>
              <input
                type="text"
                required
                value={suspectFormData.occupation}
                onChange={(e) => setSuspectFormData({ ...suspectFormData, occupation: e.target.value })}
                placeholder="e.g. Chief Gemologist"
                className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 block uppercase mb-1">Case Classification</label>
              <select
                value={suspectFormData.status}
                onChange={(e) => setSuspectFormData({ ...suspectFormData, status: e.target.value as any })}
                className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="SUSPECT">SUSPECT</option>
                <option value="PERSON OF INTEREST">PERSON OF INTEREST</option>
                <option value="CLEAR">CLEAR</option>
                <option value="PRIME SUSPECT">PRIME SUSPECT</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block uppercase mb-1">Alibi Evaluation</label>
              <select
                value={suspectFormData.alibiStatus}
                onChange={(e) => setSuspectFormData({ ...suspectFormData, alibiStatus: e.target.value as any })}
                className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="QUESTIONABLE">QUESTIONABLE</option>
                <option value="DISPROVEN">DISPROVEN</option>
                <option value="VERIFIED">VERIFIED</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block uppercase mb-1">Risk Rating</label>
              <select
                value={suspectFormData.riskLevel}
                onChange={(e) => setSuspectFormData({ ...suspectFormData, riskLevel: e.target.value as any })}
                className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block uppercase mb-1">Asserted Alibi Statement *</label>
            <textarea
              required
              rows={2}
              value={suspectFormData.alibi}
              onChange={(e) => setSuspectFormData({ ...suspectFormData, alibi: e.target.value })}
              placeholder="Record subject's exact claimed whereabouts during incident timeframe..."
              className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block uppercase mb-1">Investigative Motive Hypothesis *</label>
            <textarea
              required
              rows={2}
              value={suspectFormData.motive}
              onChange={(e) => setSuspectFormData({ ...suspectFormData, motive: e.target.value })}
              placeholder="Record detective theory regarding financial, professional, or personal motive..."
              className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block uppercase mb-1">Digital Cyber Footprint</label>
            <input
              type="text"
              value={suspectFormData.cyberFootprint}
              onChange={(e) => setSuspectFormData({ ...suspectFormData, cyberFootprint: e.target.value })}
              placeholder="e.g. Burner device telemetry pinged local cell mast at 02:22 EST."
              className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Biometrics */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 block uppercase mb-1">Risk Score (0-100)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={suspectFormData.riskScore}
                onChange={(e) => setSuspectFormData({ ...suspectFormData, riskScore: Number(e.target.value) })}
                className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block uppercase mb-1">Fingerprint Match %</label>
              <input
                type="number"
                min={0}
                max={100}
                value={suspectFormData.fingerprintMatch}
                onChange={(e) => setSuspectFormData({ ...suspectFormData, fingerprintMatch: Number(e.target.value) })}
                className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block uppercase mb-1">DNA Likelihood %</label>
              <input
                type="number"
                min={0}
                max={100}
                value={suspectFormData.dnaMatch}
                onChange={(e) => setSuspectFormData({ ...suspectFormData, dnaMatch: Number(e.target.value) })}
                className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <Button variant="ghost" size="sm" type="button" onClick={() => setShowAddEditModal(false)}>
              CANCEL
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingSuspect ? 'SAVE CHANGES' : 'CREATE SUSPECT DOSSIER'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(suspectToDelete)}
        title="CONFIRM SUSPECT DOSSIER EXPUNGEMENT"
        message={`Are you sure you want to delete suspect "${suspectToDelete?.name}"? This will unlink their biometric associations and remove any warrant priority flags.`}
        confirmLabel="EXPUNGE DOSSIER"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setSuspectToDelete(null)}
      />
    </div>
  );
};
