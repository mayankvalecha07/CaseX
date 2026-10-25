import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useCase } from '../context/CaseContext';
import { Witness, WitnessInterviewRecord } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ProgressBar } from '../components/common/ProgressBar';
import {
  MessageSquareQuote,
  CheckCircle,
  AlertTriangle,
  Send,
  User,
  Shield,
  HelpCircle,
  FileText,
  Sparkles,
  Clock,
  ArrowRight,
  Search,
  Plus,
  Trash2,
  Edit,
  Download,
  RotateCcw,
  LayoutGrid,
  Table as TableIcon,
  Info,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  ExternalLink
} from 'lucide-react';

export const WitnessInterviewPage: React.FC = () => {
  const {
    cases,
    selectedCase,
    addWitness,
    updateWitness,
    deleteWitness,
    verifyWitness,
    flagWitness,
    addWitnessNote,
    interviews,
    addInterview,
    deleteInterview,
    showToast
  } = useCase();

  // Search, Filter, Sort, Scope, Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [caseScope, setCaseScope] = useState<'CURRENT' | 'ALL'>('CURRENT');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VERIFIED' | 'UNVERIFIED' | 'FLAGGED'>('ALL');
  const [interviewFilter, setInterviewFilter] = useState<'ALL' | 'HAS_INTERVIEW' | 'NO_INTERVIEW'>('ALL');
  const [sortBy, setSortBy] = useState<'NAME_ASC' | 'CREDIBILITY_DESC' | 'CREDIBILITY_ASC' | 'STATUS'>('CREDIBILITY_DESC');
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Selected Witness for Detail / Interview Session Modal
  const [selectedWitness, setSelectedWitness] = useState<(Witness & { _caseId?: string }) | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'dossier' | 'simulator' | 'timeline'>('dossier');
  const [compareWitness, setCompareWitness] = useState<Witness | null>(null);

  // Add / Edit Witness Modal state
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingWitness, setEditingWitness] = useState<(Witness & { _caseId?: string }) | null>(null);
  const [witnessFormData, setWitnessFormData] = useState<{
    name: string;
    occupation: string;
    relationship: string;
    statement: string;
    verificationStatus: 'VERIFIED' | 'UNVERIFIED' | 'FLAGGED';
    credibility: number;
    keyClues: string;
    notes: string;
    caseId: string;
  }>({
    name: '',
    occupation: '',
    relationship: '',
    statement: '',
    verificationStatus: 'UNVERIFIED',
    credibility: 80,
    keyClues: '',
    notes: '',
    caseId: selectedCase?.id || ''
  });

  // Delete Dialog state
  const [witnessToDelete, setWitnessToDelete] = useState<{ id: string; name: string; caseId: string } | null>(null);

  // Interactive Deposition Logger state
  const [showAddInterviewForm, setShowAddInterviewForm] = useState(false);
  const [interviewInterviewer, setInterviewInterviewer] = useState('Det. Pulkit Gupta');
  const [interviewLocation, setInterviewLocation] = useState('12th Precinct Interrogation Room A');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [interviewKeyFindings, setInterviewKeyFindings] = useState('');

  // Simulated Q&A Practice Sandbox state
  const [interrogationInput, setInterrogationInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'investigator' | 'witness'; text: string; time: string }>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, caseScope, statusFilter, interviewFilter, sortBy]);

  if (!selectedCase) {
    return <div className="p-8 text-center font-mono text-cyan-400">NO CASE SELECTED</div>;
  }

  // Pool of witnesses based on scope
  const pool = useMemo(() => {
    if (caseScope === 'ALL') {
      return cases.flatMap(c => (c.witnesses || []).map(w => ({ ...w, _caseId: c.id, _caseTitle: c.title })));
    }
    return (selectedCase.witnesses || []).map(w => ({ ...w, _caseId: selectedCase.id, _caseTitle: selectedCase.title }));
  }, [cases, selectedCase, caseScope]);

  // Filtered witnesses
  const filteredWitnesses = useMemo(() => {
    return pool.filter(w => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        w.name.toLowerCase().includes(q) ||
        w.occupation.toLowerCase().includes(q) ||
        w.relationship.toLowerCase().includes(q) ||
        w.statement.toLowerCase().includes(q) ||
        w.id.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (statusFilter !== 'ALL' && w.verificationStatus !== statusFilter) {
        return false;
      }

      const hasHistory = (w.interviewHistory && w.interviewHistory.length > 0) || interviews.some(i => i.witnessId === w.id);
      if (interviewFilter === 'HAS_INTERVIEW' && !hasHistory) return false;
      if (interviewFilter === 'NO_INTERVIEW' && hasHistory) return false;

      return true;
    }).sort((a, b) => {
      const credA = a.credibilityScore ?? a.credibility ?? 70;
      const credB = b.credibilityScore ?? b.credibility ?? 70;

      if (sortBy === 'NAME_ASC') return a.name.localeCompare(b.name);
      if (sortBy === 'CREDIBILITY_DESC') return credB - credA;
      if (sortBy === 'CREDIBILITY_ASC') return credA - credB;
      if (sortBy === 'STATUS') return a.verificationStatus.localeCompare(b.verificationStatus);
      return 0;
    });
  }, [pool, searchQuery, statusFilter, interviewFilter, sortBy, interviews]);

  // Pagination calculation
  const totalItems = filteredWitnesses.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedWitnesses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredWitnesses.slice(start, start + pageSize);
  }, [filteredWitnesses, currentPage, pageSize]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingWitness(null);
    setWitnessFormData({
      name: '',
      occupation: '',
      relationship: '',
      statement: '',
      verificationStatus: 'UNVERIFIED',
      credibility: 80,
      keyClues: '',
      notes: '',
      caseId: selectedCase.id
    });
    setShowAddEditModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (w: Witness & { _caseId?: string }) => {
    setEditingWitness(w);
    setWitnessFormData({
      name: w.name,
      occupation: w.occupation,
      relationship: w.relationship,
      statement: w.statement,
      verificationStatus: w.verificationStatus,
      credibility: w.credibilityScore ?? w.credibility ?? 80,
      keyClues: (w.keyClues || []).join(', '),
      notes: w.notes || '',
      caseId: w._caseId || selectedCase.id
    });
    setShowAddEditModal(true);
  };

  // Submit Add / Edit Form
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!witnessFormData.name.trim() || !witnessFormData.statement.trim()) {
      showToast('Name and Sworn Statement are required fields.', 'warning');
      return;
    }

    const cluesList = witnessFormData.keyClues
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const targetCaseId = witnessFormData.caseId || selectedCase.id;

    if (editingWitness) {
      updateWitness(targetCaseId, {
        ...editingWitness,
        name: witnessFormData.name.trim(),
        occupation: witnessFormData.occupation.trim(),
        relationship: witnessFormData.relationship.trim(),
        statement: witnessFormData.statement.trim(),
        verificationStatus: witnessFormData.verificationStatus,
        credibility: Number(witnessFormData.credibility),
        credibilityScore: Number(witnessFormData.credibility),
        keyClues: cluesList,
        notes: witnessFormData.notes.trim()
      });
      showToast(`Witness dossier updated: ${witnessFormData.name}`, 'success');
    } else {
      addWitness(targetCaseId, {
        name: witnessFormData.name.trim(),
        occupation: witnessFormData.occupation.trim(),
        relationship: witnessFormData.relationship.trim(),
        avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 99999999)}?w=400&auto=format&fit=crop&q=80`,
        statement: witnessFormData.statement.trim(),
        verificationStatus: witnessFormData.verificationStatus,
        credibility: Number(witnessFormData.credibility),
        credibilityScore: Number(witnessFormData.credibility),
        keyClues: cluesList,
        notes: witnessFormData.notes.trim() || 'Fictional demo record.',
        interviewHistory: []
      });
      showToast(`New witness deposition enrolled: ${witnessFormData.name}`, 'success');
    }

    setShowAddEditModal(false);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (witnessToDelete) {
      deleteWitness(witnessToDelete.caseId, witnessToDelete.id);
      setWitnessToDelete(null);
      showToast('Witness deposition removed.', 'warning');
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['ID', 'Case ID', 'Name', 'Occupation', 'Relationship', 'Verification Status', 'Credibility Index', 'Official Sworn Statement', 'Key Clues'];
    const rows = filteredWitnesses.map(w => [
      `"${w.id}"`,
      `"${w._caseId}"`,
      `"${w.name.replace(/"/g, '""')}"`,
      `"${w.occupation.replace(/"/g, '""')}"`,
      `"${w.relationship.replace(/"/g, '""')}"`,
      `"${w.verificationStatus}"`,
      w.credibilityScore ?? w.credibility ?? 70,
      `"${w.statement.replace(/"/g, '""')}"`,
      `"${(w.keyClues || []).join('; ')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CaseX_Witness_Directory_${selectedCase.id}_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Witness Directory exported to CSV.', 'success');
  };

  // Open detailed session modal
  const handleOpenInterviewSession = (w: Witness & { _caseId?: string }) => {
    setSelectedWitness(w);
    setActiveModalTab('dossier');
    setShowAddInterviewForm(false);
    setChatHistory([
      {
        sender: 'witness',
        text: `Official Recorded Statement on File: "${w.statement}"`,
        time: 'Logged at Scene'
      }
    ]);
  };

  // Simulated Q&A handler
  const handleSendSimulatedMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!interrogationInput.trim() || !selectedWitness) return;

    const question = interrogationInput.trim();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatHistory((prev) => [...prev, { sender: 'investigator', text: question, time: now }]);
    setInterrogationInput('');
    setIsTyping(true);

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      let response = '';
      const qLower = question.toLowerCase();

      if (qLower.includes('time') || qLower.includes('when') || qLower.includes('clock') || qLower.includes('hour')) {
        response = `As I told officers, my watch read right around the incident hour when I noticed the irregular sound and sudden power drop.`;
      } else if (qLower.includes('who') || qLower.includes('suspect') || qLower.includes('saw') || qLower.includes('see')) {
        response = `I observed a purposeful silhouette wearing dark utility gear moving swiftly along the perimeter. They avoided direct camera angles.`;
      } else if (qLower.includes('door') || qLower.includes('safe') || qLower.includes('vault') || qLower.includes('key')) {
        response = `That sector has electronic badge restrictions. Entry required active insider access or specialized electronic spoofing equipment.`;
      } else if (qLower.includes('alibi') || qLower.includes('you')) {
        response = `I have cooperated with every forensic inquiry, Detective. My station logs and badge swipes confirm my location.`;
      } else {
        response = `I have reported every detail I can recall clearly. Please cross-reference my statement with physical access telemetry.`;
      }

      setChatHistory((prev) => [...prev, { sender: 'witness', text: response, time: now }]);
      setIsTyping(false);
      addWitnessNote(selectedWitness.id, `Simulated Q&A: ${question}`);
    }, 600);
  };

  // Add real interview record into CaseContext
  const handleSaveInterviewRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWitness || !interviewNotes.trim()) return;

    const targetCaseId = selectedWitness._caseId || selectedCase.id;
    const findingsList = interviewKeyFindings
      .split(',')
      .map(f => f.trim())
      .filter(Boolean);

    addInterview({
      caseId: targetCaseId,
      witnessId: selectedWitness.id,
      witnessName: selectedWitness.name,
      interviewerName: interviewInterviewer.trim() || 'Det. Pulkit Gupta',
      interviewDate: new Date().toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      location: interviewLocation.trim() || 'Police Station',
      notes: interviewNotes.trim(),
      keyFindings: findingsList.length > 0 ? findingsList : ['Standard witness deposition recorded without contradiction.']
    });

    setInterviewNotes('');
    setInterviewKeyFindings('');
    setShowAddInterviewForm(false);
    showToast('Interview session logged to case record.', 'success');
  };

  const handleVerify = (wId: string) => {
    verifyWitness(wId);
    showToast('Witness testimony verified and marked in case record.', 'success');
    if (selectedWitness && selectedWitness.id === wId) {
      setSelectedWitness(prev => (prev ? { ...prev, verificationStatus: 'VERIFIED' } : null));
    }
  };

  const handleFlag = (wId: string) => {
    flagWitness(wId);
    showToast('Witness statement flagged for potential contradiction.', 'warning');
    if (selectedWitness && selectedWitness.id === wId) {
      setSelectedWitness(prev => (prev ? { ...prev, verificationStatus: 'FLAGGED' } : null));
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setInterviewFilter('ALL');
    setSortBy('CREDIBILITY_DESC');
  };

  // Interviews associated with selected witness
  const witnessInterviews = useMemo(() => {
    if (!selectedWitness) return [];
    return interviews.filter(i => i.witnessId === selectedWitness.id);
  }, [selectedWitness, interviews]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 font-mono animate-in fade-in duration-200">
      {/* Educational & Simulation Disclaimer Banner */}
      <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs flex items-center justify-between gap-3 text-slate-300">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-purple-400 shrink-0" />
          <span>
            <strong>Educational Simulation Sandbox:</strong> Eyewitness statements and credibility indicators are fictional demonstration records. Credibility indexes are subjective investigator assessments and must be independently corroborated.
          </span>
        </div>
        <span className="text-[10px] uppercase font-bold text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded shrink-0 hidden md:inline">
          ST1/ST2 SEC-5
        </span>
      </div>

      {/* Header & Main Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-xs text-cyan-400 uppercase tracking-widest font-bold">
              WITNESS DIRECTORY & DEPOSITION LOG // CASE #{selectedCase.id}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-hud text-white tracking-wide">
            WITNESS INTERVIEWS & CROSS-EXAMINATION
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit recorded sworn statements, log interview transcripts, and cross-reference testimony with authenticated incident timelines.
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
            ADD WITNESS
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

      {/* Search, Filter, Scope & View Controls Bar */}
      <div className="p-4 rounded-2xl bg-[#090d16] border border-white/10 space-y-3">
        {/* Top search & scope row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by witness name, occupation, statement excerpt, ID..."
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
                    ? 'bg-purple-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                CURRENT CASE (#{selectedCase.id})
              </button>
              <button
                onClick={() => setCaseScope('ALL')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  caseScope === 'ALL'
                    ? 'bg-purple-500 text-slate-950 font-bold'
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
                  viewMode === 'CARDS' ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400 hover:text-white'
                }`}
                title="Card Grid"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('TABLE')}
                className={`p-1.5 rounded-lg cursor-pointer ${
                  viewMode === 'TABLE' ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400 hover:text-white'
                }`}
                title="Data Table"
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Second row: Dropdown filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div>
            <label className="text-[10px] text-slate-500 block uppercase mb-1">Verification Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-black/60 border border-white/10 rounded-lg p-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Statuses</option>
              <option value="VERIFIED">Verified Only</option>
              <option value="UNVERIFIED">Unverified Only</option>
              <option value="FLAGGED">Flagged Contradictions</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 block uppercase mb-1">Interview Log</label>
            <select
              value={interviewFilter}
              onChange={(e) => setInterviewFilter(e.target.value as any)}
              className="w-full bg-black/60 border border-white/10 rounded-lg p-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Records</option>
              <option value="HAS_INTERVIEW">Has Logged Sessions</option>
              <option value="NO_INTERVIEW">Awaiting Formal Interview</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 block uppercase mb-1">Sort Order</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-black/60 border border-white/10 rounded-lg p-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="CREDIBILITY_DESC">Credibility (High-Low)</option>
              <option value="CREDIBILITY_ASC">Credibility (Low-High)</option>
              <option value="NAME_ASC">Name (A-Z)</option>
              <option value="STATUS">Verification State</option>
            </select>
          </div>

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

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
          <span className="text-[11px] text-slate-400">
            Showing <strong className="text-white">{filteredWitnesses.length}</strong> of{' '}
            <strong className="text-purple-400">{pool.length}</strong> recorded deponents
          </span>

          {(searchQuery || statusFilter !== 'ALL' || interviewFilter !== 'ALL') && (
            <button
              onClick={handleClearFilters}
              className="text-[10px] text-purple-400 hover:underline cursor-pointer"
            >
              Clear Active Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Witness Listing */}
      {filteredWitnesses.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-white/10 space-y-3">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
          <h3 className="font-hud font-bold text-white text-base">NO MATCHING WITNESS RECORDS</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No eyewitness statement in this scope matches your active search and filter parameters.
          </p>
          <Button variant="secondary" size="sm" onClick={handleClearFilters}>
            RESET FILTERS
          </Button>
        </div>
      ) : viewMode === 'CARDS' ? (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedWitnesses.map((w) => {
            const cred = w.credibilityScore ?? w.credibility ?? 70;
            const statusVariant = {
              VERIFIED: 'emerald',
              UNVERIFIED: 'cyan',
              FLAGGED: 'rose'
            }[w.verificationStatus] as 'emerald' | 'cyan' | 'rose';

            return (
              <div
                key={w.id}
                className="p-5 rounded-2xl bg-[#090d16]/90 border border-white/10 hover:border-purple-500/50 transition-all duration-200 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Top Name & Verification Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold font-mono text-sm shrink-0">
                        {w.avatar ? (
                          <img src={w.avatar} alt={w.name} className="w-full h-full rounded-xl object-cover" />
                        ) : (
                          w.name.charAt(0)
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] font-mono text-slate-500 uppercase">
                            #{w.id}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-white/5 text-purple-300">
                            {w._caseId}
                          </span>
                        </div>
                        <h3 className="font-hud font-bold text-base text-white group-hover:text-purple-300 transition-colors">
                          {w.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 uppercase">
                          {w.occupation}
                        </p>
                      </div>
                    </div>

                    <Badge variant={statusVariant} size="sm" dot>
                      {w.verificationStatus}
                    </Badge>
                  </div>

                  {/* Relationship & Credibility Score */}
                  <div className="space-y-2.5">
                    <div className="text-xs text-slate-400">
                      <span className="text-slate-500 uppercase font-bold text-[9px] block">CASE RELATION:</span>
                      <span className="text-slate-200 text-[11px]">{w.relationship}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <ProgressBar
                        value={cred}
                        label="SUBJECTIVE CREDIBILITY APPRAISAL"
                        size="sm"
                        variant={cred > 75 ? 'emerald' : cred > 50 ? 'cyan' : 'amber'}
                      />
                    </div>
                  </div>

                  {/* Sworn Statement Quote */}
                  <div className="p-3 rounded-xl bg-white/[0.01] border border-white/5 text-[11px] text-slate-300 italic leading-relaxed line-clamp-3">
                    "{w.statement}"
                  </div>

                  {/* Key Clues */}
                  {w.keyClues && w.keyClues.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {w.keyClues.map((clue, idx) => (
                        <span key={idx} className="text-[9px] px-2 py-0.5 rounded bg-white/5 text-cyan-300 border border-white/10">
                          {clue}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenInterviewSession(w)}
                      icon={<MessageSquareQuote className="w-3.5 h-3.5" />}
                      className="flex-1 text-[11px]"
                    >
                      DEPOSITION & SESSIONS
                    </Button>

                    <button
                      onClick={() => handleVerify(w.id)}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                      title="Verify Testimony"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleFlag(w.id)}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Flag Contradiction"
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleOpenEdit(w)}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Edit Deponent"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setWitnessToDelete({ id: w.id, name: w.name, caseId: w._caseId || selectedCase.id })}
                      className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCompareWitness(w)}
                    icon={<Clock className="w-3.5 h-3.5 text-cyan-400" />}
                    className="w-full text-[10px]"
                  >
                    COMPARE WITH TIMELINE
                  </Button>
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
                <th className="p-3">Witness Name</th>
                <th className="p-3">Case ID</th>
                <th className="p-3">Role / Relation</th>
                <th className="p-3">Status</th>
                <th className="p-3">Credibility</th>
                <th className="p-3">Statement Summary</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedWitnesses.map((w) => (
                <tr key={w.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-3">
                    <span className="font-bold text-white block text-xs">{w.name}</span>
                    <span className="text-[10px] text-slate-400">{w.occupation}</span>
                  </td>
                  <td className="p-3 text-purple-300 text-[11px]">{w._caseId}</td>
                  <td className="p-3 text-slate-300 text-[11px]">{w.relationship}</td>
                  <td className="p-3">
                    <Badge
                      variant={w.verificationStatus === 'VERIFIED' ? 'emerald' : w.verificationStatus === 'FLAGGED' ? 'rose' : 'cyan'}
                      size="sm"
                    >
                      {w.verificationStatus}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-white">{w.credibilityScore ?? w.credibility ?? 70}%</span>
                  </td>
                  <td className="p-3 text-slate-300 text-[11px] max-w-xs truncate italic">
                    "{w.statement}"
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenInterviewSession(w)}
                        className="text-[10px] py-1 px-2"
                      >
                        SESSIONS
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(w)}
                        className="text-[10px] py-1 px-2 text-slate-300"
                      >
                        EDIT
                      </Button>
                      <button
                        onClick={() => setWitnessToDelete({ id: w.id, name: w.name, caseId: w._caseId || selectedCase.id })}
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
                    ? 'bg-purple-500 text-slate-950'
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

      {/* Add / Edit Witness Modal Form */}
      <Modal
        isOpen={showAddEditModal}
        onClose={() => setShowAddEditModal(false)}
        title={editingWitness ? `EDIT WITNESS DEPOSITION // #${editingWitness.id}` : 'ENROLL NEW EYEWITNESS'}
        subtitle="Catalog sworn statements, role relations, and credibility indicators"
        maxWidth="2xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 font-mono text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 block uppercase mb-1">Target Case *</label>
              <select
                value={witnessFormData.caseId}
                onChange={(e) => setWitnessFormData({ ...witnessFormData, caseId: e.target.value })}
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
                value={witnessFormData.name}
                onChange={(e) => setWitnessFormData({ ...witnessFormData, name: e.target.value })}
                placeholder="e.g. Evelyn St. Claire"
                className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 block uppercase mb-1">Occupation / Title *</label>
              <input
                type="text"
                required
                value={witnessFormData.occupation}
                onChange={(e) => setWitnessFormData({ ...witnessFormData, occupation: e.target.value })}
                placeholder="e.g. Head Concierge"
                className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block uppercase mb-1">Relation to Incident *</label>
              <input
                type="text"
                required
                value={witnessFormData.relationship}
                onChange={(e) => setWitnessFormData({ ...witnessFormData, relationship: e.target.value })}
                placeholder="e.g. Monitored elevator lobby"
                className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block uppercase mb-1">Verification Status</label>
              <select
                value={witnessFormData.verificationStatus}
                onChange={(e) => setWitnessFormData({ ...witnessFormData, verificationStatus: e.target.value as any })}
                className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="UNVERIFIED">UNVERIFIED</option>
                <option value="VERIFIED">VERIFIED</option>
                <option value="FLAGGED">FLAGGED CONTRADICTION</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block uppercase mb-1">Official Recorded Sworn Statement *</label>
            <textarea
              required
              rows={3}
              value={witnessFormData.statement}
              onChange={(e) => setWitnessFormData({ ...witnessFormData, statement: e.target.value })}
              placeholder="Record exact sworn testimony captured during police or detective intake..."
              className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 block uppercase mb-1">Subjective Credibility Index (0-100)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={witnessFormData.credibility}
                onChange={(e) => setWitnessFormData({ ...witnessFormData, credibility: Number(e.target.value) })}
                className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none"
              />
              <span className="text-[9px] text-slate-500 mt-0.5 block">Subjective evaluation index for educational tracking.</span>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block uppercase mb-1">Key Clues (Comma Separated)</label>
              <input
                type="text"
                value={witnessFormData.keyClues}
                onChange={(e) => setWitnessFormData({ ...witnessFormData, keyClues: e.target.value })}
                placeholder="e.g. Heard high pitch hum, Saw elevator bypass"
                className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block uppercase mb-1">Detective Field Notes</label>
            <textarea
              rows={2}
              value={witnessFormData.notes}
              onChange={(e) => setWitnessFormData({ ...witnessFormData, notes: e.target.value })}
              placeholder="Observations regarding demeanor, corroborating security camera logs, or inconsistencies..."
              className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <Button variant="ghost" size="sm" type="button" onClick={() => setShowAddEditModal(false)}>
              CANCEL
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingWitness ? 'SAVE CHANGES' : 'CREATE WITNESS RECORD'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(witnessToDelete)}
        title="CONFIRM WITNESS RECORD REMOVAL"
        message={`Are you sure you want to delete witness record "${witnessToDelete?.name}"? Any linked interrogation sessions will also be unlinked.`}
        confirmLabel="DELETE WITNESS"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setWitnessToDelete(null)}
      />

      {/* Witness Deposition, Sessions & Simulated Practice Sandbox Modal */}
      <Modal
        isOpen={Boolean(selectedWitness)}
        onClose={() => setSelectedWitness(null)}
        title={selectedWitness ? `DEPOSITION DOSSIER // ${selectedWitness.name.toUpperCase()}` : 'WITNESS SESSION'}
        subtitle={selectedWitness ? `Role: ${selectedWitness.occupation} • Case #${selectedWitness._caseId}` : ''}
        maxWidth="3xl"
      >
        {selectedWitness && (
          <div className="space-y-4 font-mono text-xs">
            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-white/10 pb-2 gap-2 text-xs">
              <button
                onClick={() => setActiveModalTab('dossier')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeModalTab === 'dossier'
                    ? 'bg-purple-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white bg-white/5'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>OFFICIAL DEPOSITION & SESSIONS ({witnessInterviews.length})</span>
              </button>

              <button
                onClick={() => setActiveModalTab('simulator')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeModalTab === 'simulator'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white bg-white/5'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>SIMULATED PRACTICE SANDBOX</span>
              </button>

              <button
                onClick={() => {
                  setCompareWitness(selectedWitness);
                  setSelectedWitness(null);
                }}
                className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white bg-white/5 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>TIMELINE CORRELATION</span>
              </button>
            </div>

            {/* TAB 1: Official Deposition & Logged Sessions */}
            {activeModalTab === 'dossier' && (
              <div className="space-y-4">
                {/* Official Sworn Statement Card */}
                <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                      OFFICIAL SWORN STATEMENT (ON FILE)
                    </span>
                    <Badge
                      variant={selectedWitness.verificationStatus === 'VERIFIED' ? 'emerald' : selectedWitness.verificationStatus === 'FLAGGED' ? 'rose' : 'cyan'}
                      size="sm"
                    >
                      {selectedWitness.verificationStatus}
                    </Badge>
                  </div>

                  <p className="text-slate-200 text-xs italic leading-relaxed bg-black/40 p-3 rounded-lg border border-white/5">
                    "{selectedWitness.statement}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Deponent: <strong className="text-white">{selectedWitness.name}</strong></span>
                    <span>Credibility Index: <strong className="text-cyan-400">{selectedWitness.credibilityScore ?? selectedWitness.credibility ?? 70}%</strong> (Subjective)</span>
                  </div>

                  {/* Quick verification buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerify(selectedWitness.id)}
                      icon={<CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                      className="text-[10px]"
                    >
                      MARK VERIFIED
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFlag(selectedWitness.id)}
                      icon={<AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                      className="text-[10px] text-rose-400 hover:bg-rose-500/10"
                    >
                      FLAG CONTRADICTION
                    </Button>
                  </div>
                </div>

                {/* Logged Formal Interviews */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>PERSISTED INTERVIEW TRANSCRIPTS & NOTES ({witnessInterviews.length})</span>
                    </h4>

                    {!showAddInterviewForm && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowAddInterviewForm(true)}
                        icon={<Plus className="w-3.5 h-3.5" />}
                        className="text-[10px]"
                      >
                        LOG INTERVIEW SESSION
                      </Button>
                    )}
                  </div>

                  {/* Add interview form */}
                  {showAddInterviewForm && (
                    <form onSubmit={handleSaveInterviewRecord} className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-3">
                      <div className="text-xs font-bold font-hud text-purple-300">
                        RECORD FORMAL INTERVIEW DEPOSITION
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-slate-400 block uppercase mb-1">Interviewer Name *</label>
                          <input
                            type="text"
                            required
                            value={interviewInterviewer}
                            onChange={(e) => setInterviewInterviewer(e.target.value)}
                            className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block uppercase mb-1">Interview Location *</label>
                          <input
                            type="text"
                            required
                            value={interviewLocation}
                            onChange={(e) => setInterviewLocation(e.target.value)}
                            className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block uppercase mb-1">Interview Notes & Questions Raised *</label>
                        <textarea
                          required
                          rows={3}
                          value={interviewNotes}
                          onChange={(e) => setInterviewNotes(e.target.value)}
                          placeholder="Record key interrogation dialogue, behavioral cues, and deponent reactions..."
                          className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block uppercase mb-1">Key Findings (Comma Separated)</label>
                        <input
                          type="text"
                          value={interviewKeyFindings}
                          onChange={(e) => setInterviewKeyFindings(e.target.value)}
                          placeholder="e.g. Confirmed seeing red vehicle, Denies hearing acoustic alarm"
                          className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <Button variant="ghost" size="sm" type="button" onClick={() => setShowAddInterviewForm(false)}>
                          CANCEL
                        </Button>
                        <Button variant="primary" size="sm" type="submit">
                          SAVE DEPOSITION SESSION
                        </Button>
                      </div>
                    </form>
                  )}

                  {/* List of interviews */}
                  {witnessInterviews.length === 0 ? (
                    <p className="p-4 rounded-xl bg-white/[0.01] border border-white/5 text-center text-slate-500 text-xs">
                      No formal interview sessions logged yet for this deponent. Click "Log Interview Session" to register a formal deposition.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {witnessInterviews.map((item) => (
                        <div key={item.id} className="p-3.5 rounded-xl bg-slate-950 border border-white/10 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-purple-400" />
                              <span>{item.interviewDate}</span>
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-500">By: {item.interviewerName}</span>
                              <button
                                onClick={() => deleteInterview(item.id)}
                                className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                                title="Delete Session"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <p className="text-slate-300 text-xs leading-relaxed">
                            {item.notes}
                          </p>

                          {item.keyFindings && item.keyFindings.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {item.keyFindings.map((f, i) => (
                                <span key={i} className="text-[9px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                                  ✓ {f}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: Simulated Q&A Practice Sandbox */}
            {activeModalTab === 'simulator' && (
              <div className="space-y-3">
                <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-[11px] text-cyan-200 flex items-center justify-between">
                  <span>
                    <strong>Practice Simulation Sandbox:</strong> This conversational tool simulates cross-examination and does NOT replace the sworn statement on record.
                  </span>
                  <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-cyan-500/20 font-bold">
                    PRACTICE INTERACTION
                  </span>
                </div>

                {/* Chat window */}
                <div className="h-64 overflow-y-auto space-y-2.5 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  {chatHistory.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex flex-col ${
                        msg.sender === 'investigator' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                        <span className="font-bold">
                          {msg.sender === 'investigator' ? 'INVESTIGATOR' : selectedWitness.name}
                        </span>
                        <span>• {msg.time}</span>
                      </div>
                      <div
                        className={`max-w-md p-3 rounded-xl text-xs leading-relaxed ${
                          msg.sender === 'investigator'
                            ? 'bg-cyan-600 text-slate-950 font-semibold rounded-tr-none'
                            : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex items-center gap-1.5 text-slate-400 italic text-[11px]">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce delay-100" />
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce delay-200" />
                      <span>{selectedWitness.name} is formulating statement...</span>
                    </div>
                  )}
                </div>

                {/* Prompt input */}
                <form onSubmit={handleSendSimulatedMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={interrogationInput}
                    onChange={(e) => setInterrogationInput(e.target.value)}
                    placeholder="Ask specific questions about timestamps, suspects seen, or sound cues..."
                    className="flex-1 p-2.5 bg-black/60 border border-slate-700 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    icon={<Send className="w-3.5 h-3.5" />}
                  >
                    SUBMIT
                  </Button>
                </form>
              </div>
            )}

            <div className="flex items-center justify-end pt-3 border-t border-white/10">
              <Button variant="ghost" size="sm" onClick={() => setSelectedWitness(null)}>
                CLOSE DOSSIER
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Compare With Timeline Modal */}
      <Modal
        isOpen={Boolean(compareWitness)}
        onClose={() => setCompareWitness(null)}
        title={compareWitness ? `TIMELINE CORRELATION // ${compareWitness.name.toUpperCase()}` : 'COMPARE WITH TIMELINE'}
        subtitle="Cross-reference witness statements with authenticated event timestamps"
        maxWidth="3xl"
      >
        {compareWitness && (
          <div className="space-y-5 font-mono text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Witness Assertion */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase">
                    SWORN TESTIMONY STATEMENT
                  </span>
                  <Badge
                    variant={
                      compareWitness.verificationStatus === 'VERIFIED'
                        ? 'emerald'
                        : compareWitness.verificationStatus === 'FLAGGED'
                        ? 'rose'
                        : 'amber'
                    }
                    size="sm"
                  >
                    {compareWitness.verificationStatus}
                  </Badge>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 italic leading-relaxed">
                  "{compareWitness.statement}"
                </div>

                <div className="space-y-1 text-[11px] text-slate-400">
                  <div>Deponent: <span className="text-white font-bold">{compareWitness.name}</span></div>
                  <div>Role: <span className="text-slate-300">{compareWitness.occupation}</span></div>
                  <div>Credibility Score: <span className="text-cyan-400 font-bold">{compareWitness.credibilityScore ?? compareWitness.credibility ?? 75}%</span></div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  {compareWitness.verificationStatus === 'FLAGGED' || ((compareWitness.credibilityScore ?? compareWitness.credibility ?? 70) < 65) ? (
                    <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-[11px]">TIMELINE CONTRADICTION DETECTED:</span>
                        <span className="text-[10px] leading-snug block">
                          Witness observation time window diverges from corroborated electromagnetic grid blackout duration recorded on case timeline.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-[11px]">CORROBORATED BY SEQUENCE:</span>
                        <span className="text-[10px] leading-snug block">
                          Deposition observations temporally align with the reconstructed chronology telemetry.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Case Timeline Events */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-[10px] text-cyan-400 font-bold uppercase block">
                  RECONSTRUCTED CHRONOLOGY ({selectedCase.timeline.length} EVENTS)
                </span>

                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {selectedCase.timeline.map(t => (
                    <div
                      key={t.id}
                      className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px]"
                    >
                      <div className="flex items-center justify-between text-cyan-400 font-bold mb-0.5">
                        <span>{t.time}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-slate-400 uppercase">
                          {t.source}
                        </span>
                      </div>
                      <p className="font-bold text-white text-[11px]">{t.title}</p>
                      <p className="text-slate-400 text-[10px] mt-0.5 leading-snug">{t.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-[11px] text-slate-500">Evaluation-II Timeline Cross-Examination Engine</span>
              <Button variant="secondary" size="sm" onClick={() => setCompareWitness(null)}>
                CLOSE COMPARISON
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
