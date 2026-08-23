import React, { useState, useMemo } from 'react';
import { useCase } from '../context/CaseContext';
import { useAuth } from '../context/AuthContext';
import { InvestigationCase } from '../types';
import { SearchBar } from '../components/common/SearchBar';
import { CaseGrid } from '../components/cases/CaseGrid';
import { CasePreviewModal } from '../components/cases/CasePreviewModal';
import { Badge } from '../components/common/Badge';
import {
  FolderArchive,
  Filter,
  ArrowDownUp,
  ShieldAlert,
  Layers,
  Sparkles,
  CheckCircle
} from 'lucide-react';

interface CaseLibraryPageProps {
  navigate: (route: string) => void;
  previewCaseId?: string | null;
  onClearPreview?: () => void;
}

export const CaseLibraryPage: React.FC<CaseLibraryPageProps> = ({
  navigate,
  previewCaseId,
  onClearPreview
}) => {
  const { cases, switchCase, selectedCaseId } = useCase();
  const { isAuthenticated, openAuthModal } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [selectedSort, setSelectedSort] = useState<string>('LATEST');
  const [previewCase, setPreviewCase] = useState<InvestigationCase | null>(() => {
    if (previewCaseId) {
      return cases.find(c => c.id === previewCaseId) || null;
    }
    return null;
  });

  const filterOptions = [
    'ALL',
    'ACTIVE',
    'UNDER INVESTIGATION',
    'COLD CASE',
    'SOLVED',
    'CRITICAL',
    'HIGH',
    'MEDIUM'
  ];

  const sortOptions = [
    { value: 'LATEST', label: 'LATEST INCIDENT' },
    { value: 'OLDEST', label: 'OLDEST INCIDENT' },
    { value: 'PRIORITY', label: 'HIGHEST PRIORITY' },
    { value: 'MOST_EVIDENCE', label: 'MOST EVIDENCE' },
    { value: 'MOST_PROGRESS', label: 'MOST PROGRESS' }
  ];

  // Dynamic search and filter
  const filteredCases = useMemo(() => {
    return cases
      .filter((c) => {
        // Search query match
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          c.id.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.type.toLowerCase().includes(q) ||
          c.shortDescription.toLowerCase().includes(q);

        if (!matchesSearch) return false;

        // Category / Status / Priority filter
        if (selectedFilter === 'ALL') return true;
        if (c.status === selectedFilter) return true;
        if (c.priority === selectedFilter) return true;

        return false;
      })
      .sort((a, b) => {
        if (selectedSort === 'LATEST') {
          return new Date(b.incidentDate).getTime() - new Date(a.incidentDate).getTime();
        }
        if (selectedSort === 'OLDEST') {
          return new Date(a.incidentDate).getTime() - new Date(b.incidentDate).getTime();
        }
        if (selectedSort === 'PRIORITY') {
          const priorityScore = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
          return (priorityScore[b.priority] || 0) - (priorityScore[a.priority] || 0);
        }
        if (selectedSort === 'MOST_EVIDENCE') {
          return b.evidenceCount - a.evidenceCount;
        }
        if (selectedSort === 'MOST_PROGRESS') {
          return b.progress - a.progress;
        }
        return 0;
      });
  }, [cases, searchQuery, selectedFilter, selectedSort]);

  const handleOpenPreview = (caseData: InvestigationCase) => {
    setPreviewCase(caseData);
  };

  const handleClosePreview = () => {
    setPreviewCase(null);
    if (onClearPreview) onClearPreview();
  };

  const handleEnterInvestigation = (caseData: InvestigationCase) => {
    if (isAuthenticated) {
      switchCase(caseData.id);
      handleClosePreview();
      navigate('/dashboard');
    } else {
      // Unauthenticated: prompt sign-in and save this target case
      handleClosePreview();
      openAuthModal(caseData.id, '/dashboard', 'signin');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Archive Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">
              CLASSIFIED REPOSITORY // LEVEL 4 CLEARANCE
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-hud text-white tracking-wide">
            CASE ARCHIVE & LIBRARY
          </h1>
          <p className="text-xs sm:text-sm font-mono text-slate-400 mt-1">
            Browse, search, and initiate active criminal investigation dossiers.
          </p>
        </div>

        {/* Global Statistics count */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-slate-400">TOTAL CASES:</span>{' '}
            <span className="text-white font-bold font-hud">{cases.length}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-slate-400">MATCHING:</span>{' '}
            <span className="text-cyan-400 font-bold font-hud">{filteredCases.length}</span>
          </div>
        </div>
      </div>

      {/* Search, Filter & Sort Controls Bar */}
      <div className="p-5 rounded-2xl bg-white/5 border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="SEARCH CASE ID, TITLE, LOCATION, TYPE..."
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowDownUp className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-xs font-mono text-slate-400 uppercase">SORT:</span>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#0a0a0a] text-white">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-white/10">
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 mr-2 shrink-0">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>FILTER:</span>
          </div>
          {filterOptions.map((filter) => {
            const isSelected = selectedFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`text-[11px] font-mono px-3 py-1 rounded-full uppercase tracking-wider transition-all cursor-pointer font-medium ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)] border border-cyan-400'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Case Grid */}
      <CaseGrid
        cases={filteredCases}
        onViewCase={handleOpenPreview}
        activeCaseId={selectedCaseId}
      />

      {/* Case Preview Modal */}
      <CasePreviewModal
        isOpen={!!previewCase}
        onClose={handleClosePreview}
        caseData={previewCase}
        onEnterInvestigation={handleEnterInvestigation}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
};
