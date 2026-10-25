import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCase } from '../context/CaseContext';
import { useAuth } from '../context/AuthContext';
import { InvestigationCase, CaseStatus } from '../types';
import { SearchBar } from '../components/common/SearchBar';
import { CaseGrid } from '../components/cases/CaseGrid';
import { CasePreviewModal } from '../components/cases/CasePreviewModal';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Pagination } from '../components/ui/Pagination';
import { BulkActionToolbar } from '../components/common/BulkActionToolbar';
import { DataExportModal } from '../components/common/DataExportModal';
import { CsvImportModal } from '../components/common/CsvImportModal';
import { BookmarkButton } from '../components/common/BookmarkButton';
import {
  FolderArchive,
  Filter,
  ArrowDownUp,
  Plus,
  LayoutGrid,
  Table as TableIcon,
  MapPin,
  Download,
  Upload,
  Archive,
  Wand2
} from 'lucide-react';

interface CaseLibraryPageProps {
  navigate?: (route: string) => void;
  previewCaseId?: string | null;
  onClearPreview?: () => void;
}

export const CaseLibraryPage: React.FC<CaseLibraryPageProps> = ({
  navigate: propNavigate,
  previewCaseId,
  onClearPreview
}) => {
  const routerNavigate = useNavigate();
  const navigate = propNavigate || routerNavigate;

  const {
    cases,
    switchCase,
    selectedCaseId,
    preferences,
    updatePreferences,
    bulkUpdateCaseStatus,
    bulkDeleteCases,
    bulkArchiveCases,
    restoreCase
  } = useCase();
  const { isAuthenticated, openAuthModal } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [selectedSort, setSelectedSort] = useState<string>('LATEST');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>(() => preferences.defaultCaseView === 'cards' ? 'grid' : 'table');
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(preferences.pageSize);

  // Bulk Selection State
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

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
        // Archive filter
        if (showArchived && !c.isArchived) return false;
        if (!showArchived && c.isArchived) return false;

        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          c.id.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.type.toLowerCase().includes(q) ||
          c.shortDescription.toLowerCase().includes(q);

        if (!matchesSearch) return false;

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
          const priorityOrder: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        }
        if (selectedSort === 'MOST_EVIDENCE') {
          return b.evidenceList.length - a.evidenceList.length;
        }
        if (selectedSort === 'MOST_PROGRESS') {
          return b.progress - a.progress;
        }
        return 0;
      });
  }, [cases, searchQuery, selectedFilter, selectedSort, showArchived]);

  // Paginated cases
  const paginatedCases = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCases.slice(start, start + pageSize);
  }, [filteredCases, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredCases.length / pageSize) || 1;

  const handleOpenPreview = (caseData: InvestigationCase) => {
    setPreviewCase(caseData);
  };

  const handleClosePreview = () => {
    setPreviewCase(null);
    onClearPreview?.();
  };

  const handleEnterInvestigation = (caseId: string) => {
    if (!isAuthenticated) {
      openAuthModal(caseId, `/cases/${caseId}`);
      return;
    }
    switchCase(caseId);
    navigate(`/cases/${caseId}`);
  };

  // Bulk Selection Handlers
  const handleToggleSelectRow = (caseId: string) => {
    setSelectedCaseIds(prev =>
      prev.includes(caseId) ? prev.filter(id => id !== caseId) : [...prev, caseId]
    );
  };

  const handleSelectAllPage = () => {
    const pageIds = paginatedCases.map(c => c.id);
    setSelectedCaseIds(pageIds);
  };

  const handleClearSelection = () => {
    setSelectedCaseIds([]);
  };

  const handleBulkStatusChange = (status: CaseStatus) => {
    bulkUpdateCaseStatus(selectedCaseIds, status);
    setSelectedCaseIds([]);
  };

  const handleBulkArchive = () => {
    bulkArchiveCases(selectedCaseIds);
    setSelectedCaseIds([]);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Permanently delete ${selectedCaseIds.length} case dossiers?`)) {
      bulkDeleteCases(selectedCaseIds);
      setSelectedCaseIds([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
            <FolderArchive className="w-4 h-4" />
            <span>CENTRAL REPOSITORY &bull; {cases.length} TOTAL DOSSIERS</span>
          </div>
          <h1 className="text-2xl font-bold font-hud text-white tracking-wide">
            CASE ARCHIVE &amp; INVESTIGATIONS
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Browse, filter, inspect, and initiate classified digital crime investigations.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExportModalOpen(true)}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            EXPORT CSV
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsImportModalOpen(true)}
            icon={<Upload className="w-3.5 h-3.5" />}
          >
            IMPORT CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/cases/new')}
            icon={<Plus className="w-4 h-4" />}
          >
            NEW CASE
          </Button>
        </div>
      </div>

      {/* Bulk Action Floating Toolbar */}
      <BulkActionToolbar
        selectedCount={selectedCaseIds.length}
        totalCount={paginatedCases.length}
        onClearSelection={handleClearSelection}
        onSelectAll={handleSelectAllPage}
        onBulkStatusChange={handleBulkStatusChange}
        onBulkArchive={handleBulkArchive}
        onBulkDelete={handleBulkDelete}
      />

      {/* Search, Archive Toggle, and Filter Controls */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val);
                setCurrentPage(1);
              }}
              placeholder="Search by title, case ID, location, MO..."
            />
          </div>

          <div className="flex items-center gap-3 justify-between md:justify-end">
            {/* Archive Filter Toggle */}
            <button
              onClick={() => {
                setShowArchived(!showArchived);
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border transition-all cursor-pointer ${
                showArchived
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                  : 'bg-white/5 text-slate-400 hover:text-white border-white/10'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>{showArchived ? 'ARCHIVED DOSSIERS' : 'ACTIVE DOCKET'}</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
              <button
                onClick={() => { setViewMode('grid'); updatePreferences({ defaultCaseView: 'cards' }); }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setViewMode('table'); updatePreferences({ defaultCaseView: 'table' }); }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
                }`}
                title="Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <ArrowDownUp className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-cyan-200 outline-none focus:border-cyan-400 cursor-pointer"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-white/10">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mr-2 shrink-0">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>FILTER:</span>
          </div>
          {filterOptions.map((filter) => {
            const isSelected = selectedFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => {
                  setSelectedFilter(filter);
                  setCurrentPage(1);
                }}
                className={`text-[11px] px-3 py-1 rounded-full uppercase tracking-wider transition-all cursor-pointer font-medium ${
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

      {/* Case Grid or Table View */}
      {viewMode === 'grid' ? (
        <CaseGrid
          cases={paginatedCases}
          onViewCase={handleOpenPreview}
          activeCaseId={selectedCaseId}
        />
      ) : (
        /* Table View */
        <div className="rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedCaseIds.length > 0 && selectedCaseIds.length === paginatedCases.length}
                    onChange={handleSelectAllPage}
                    className="rounded bg-black border-white/20 text-cyan-500"
                  />
                </th>
                <th className="p-4">CASE ID &amp; TITLE</th>
                <th className="p-4">LOCATION</th>
                <th className="p-4">STATUS</th>
                <th className="p-4">PRIORITY</th>
                <th className="p-4">SOLVABILITY</th>
                <th className="p-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedCases.map(c => {
                const isSelected = selectedCaseIds.includes(c.id);
                return (
                  <tr
                    key={c.id}
                    className={`transition-colors cursor-pointer ${
                      isSelected ? 'bg-cyan-500/10' : 'hover:bg-white/5'
                    }`}
                    onClick={() => handleOpenPreview(c)}
                  >
                    <td className="p-4" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectRow(c.id)}
                        className="rounded bg-black border-white/20 text-cyan-500"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <BookmarkButton id={c.id} type="CASE" />
                        <div>
                          <span className="text-[10px] text-cyan-400 font-bold block">[{c.id}]</span>
                          <span className="font-bold text-white text-xs font-hud block">{c.title}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">
                      <span className="flex items-center gap-1.5 text-xs">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        {c.location}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge variant={c.status === 'SOLVED' ? 'emerald' : 'cyan'} size="sm">
                        {c.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={c.priority === 'CRITICAL' ? 'rose' : c.priority === 'HIGH' ? 'amber' : 'slate'}
                        size="sm"
                      >
                        {c.priority}
                      </Badge>
                    </td>
                    <td className="p-4 font-bold text-cyan-400">
                      {c.progress}%
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {c.isArchived ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            restoreCase(c.id);
                          }}
                          className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold border border-amber-400/30 text-[10px]"
                        >
                          RESTORE
                        </button>
                      ) : null}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/cases/${c.id}`);
                        }}
                        className="px-3 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/30 text-[11px] cursor-pointer"
                      >
                        OPEN DOSSIER
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={p => setCurrentPage(p)}
        pageSize={pageSize}
        pageSizeOptions={[6, 10, 20, 50]}
        onPageSizeChange={sz => {
          setPageSize(sz);
          updatePreferences({ pageSize: sz });
          setCurrentPage(1);
        }}
        totalItems={filteredCases.length}
      />

      {/* Case Preview Modal */}
      <CasePreviewModal
        isOpen={!!previewCase}
        onClose={handleClosePreview}
        caseData={previewCase}
        onEnterInvestigation={handleEnterInvestigation}
        isAuthenticated={isAuthenticated}
      />

      {/* Data Export Modal */}
      <DataExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
};
