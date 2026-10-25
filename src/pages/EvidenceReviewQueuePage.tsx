import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox,
  CheckCircle,
  Clock,
  Filter,
  FolderOpen,
  Shield,
  Eye,
  Check,
  RotateCcw,
  Search
} from 'lucide-react';
import { useCase } from '../context/CaseContext';
import { EvidenceItem } from '../types';
import { Button } from '../components/common/Button';
import { ChainOfCustodyModal } from '../components/evidence/ChainOfCustodyModal';
import { Pagination } from '../components/ui/Pagination';
import { formatDateTime } from '../utils/dateTime';

export const EvidenceReviewQueuePage: React.FC = () => {
  const { cases, preferences, toggleEvidenceReviewStatus } = useCase();
  const [selectedCaseFilter, setSelectedCaseFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'PENDING' | 'REVIEWED' | 'ALL'>('PENDING');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'OLDEST' | 'TITLE'>('NEWEST');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [custodyModalItem, setCustodyModalItem] = useState<EvidenceItem | null>(null);

  useEffect(() => setCurrentPage(1), [selectedCaseFilter, selectedStatusFilter, categoryFilter, query, sortBy]);

  // Flatten all evidence items across cases
  const allEvidence: { item: EvidenceItem; caseId: string; caseTitle: string }[] = [];
  cases.forEach(c => {
    c.evidenceList.forEach(e => {
      allEvidence.push({
        item: e,
        caseId: c.id,
        caseTitle: c.title
      });
    });
  });

  const filteredEvidence = allEvidence.filter(entry => {
    if (selectedCaseFilter !== 'ALL' && entry.caseId !== selectedCaseFilter) return false;
    if (categoryFilter !== 'ALL' && entry.item.category !== categoryFilter) return false;
    const searchText = `${entry.item.id} ${entry.item.code} ${entry.item.title} ${entry.item.description} ${entry.caseId} ${entry.caseTitle}`.toLowerCase();
    if (query.trim() && !searchText.includes(query.trim().toLowerCase())) return false;
    const isPending = entry.item.reviewStatus !== 'REVIEWED';
    if (selectedStatusFilter === 'PENDING' && !isPending) return false;
    if (selectedStatusFilter === 'REVIEWED' && isPending) return false;
    return true;
  }).sort((a, b) => sortBy === 'TITLE' ? a.item.title.localeCompare(b.item.title) : sortBy === 'OLDEST' ? a.item.timestamp.localeCompare(b.item.timestamp) : b.item.timestamp.localeCompare(a.item.timestamp));

  const pageCount = Math.max(1, Math.ceil(filteredEvidence.length / pageSize));
  const pagedEvidence = filteredEvidence.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const pendingCount = allEvidence.filter(e => e.item.reviewStatus !== 'REVIEWED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
            <Inbox className="w-4 h-4" />
            <span>FORENSIC LAB TRIAGE</span>
          </div>
          <h1 className="text-2xl font-bold font-hud text-white tracking-wide">
            EVIDENCE REVIEW QUEUE
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Audit, verify, and clear evidence exhibits awaiting lead investigator sign-off.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
            {pendingCount} EXHIBITS AWAITING REVIEW
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white/[0.02] border border-white/10 rounded-xl text-xs font-mono">
        <div className="flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-2 text-slate-400"><Search className="w-3.5 h-3.5 text-cyan-400" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search evidence or case" aria-label="Search evidence review queue" className="bg-black/60 border border-white/10 rounded-lg px-2 py-1 text-xs text-white placeholder:text-slate-500" /></label>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>CASE:</span>
            <select
              value={selectedCaseFilter}
              onChange={e => setSelectedCaseFilter(e.target.value)}
              className="bg-black/60 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
            >
              <option value="ALL">ALL INVESTIGATIONS</option>
              {cases.map(c => (
                <option key={c.id} value={c.id}>
                  {c.id} - {c.title.substring(0, 20)}...
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <span>QUEUE STATUS:</span>
            {(['PENDING', 'REVIEWED', 'ALL'] as const).map(st => (
              <button
                key={st}
                onClick={() => setSelectedStatusFilter(st)}
                className={`px-2.5 py-1 rounded text-[10px] font-mono transition-all ${
                  selectedStatusFilter === st
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-1.5 text-slate-400">CATEGORY:
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="bg-black/60 border border-white/10 rounded-lg px-2 py-1 text-xs text-white">
              <option value="ALL">ALL</option>{Array.from(new Set(allEvidence.map(entry => entry.item.category))).map(category => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-1.5 text-slate-400">SORT:
            <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className="bg-black/60 border border-white/10 rounded-lg px-2 py-1 text-xs text-white"><option value="NEWEST">Newest first</option><option value="OLDEST">Oldest first</option><option value="TITLE">Title</option></select>
          </label>
        </div>

        <div className="text-slate-400 text-xs">
          Showing {filteredEvidence.length} exhibits in queue
        </div>
      </div>

      {/* Exhibits Review Table */}
      <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#0a0f1d]">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-white/5 border-b border-white/10 text-slate-400 text-[10px] uppercase">
            <tr>
              <th className="p-3">Exhibit</th>
              <th className="p-3">Category</th>
              <th className="p-3">Case Dossier</th>
              <th className="p-3">Current Custodian</th>
              <th className="p-3">Collected / Timestamp</th>
              <th className="p-3">Review Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {pagedEvidence.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-xs font-mono text-slate-500">
                  No exhibits matching the selected review queue filter.
                </td>
              </tr>
            ) : (
              pagedEvidence.map(({ item, caseId, caseTitle }) => {
                const isReviewed = item.reviewStatus === 'REVIEWED';
                return (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-cyan-400">{item.code}</span>
                        <span className="text-white font-medium">{item.title}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5">
                        {item.description}
                      </div>
                    </td>

                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-slate-300">
                        {item.category}
                      </span>
                    </td>

                    <td className="p-3">
                      <Link to={`/cases/${caseId}`} className="text-cyan-400 hover:underline flex items-center gap-1 font-bold">
                        <FolderOpen className="w-3 h-3" />
                        <span>{caseId}</span>
                      </Link>
                    </td>

                    <td className="p-3 text-slate-300">
                      {item.currentCustodian || 'Det. Pulkit Gupta'}
                    </td>

                    <td className="p-3 text-slate-400 text-[10px]">{formatDateTime(item.timestamp, preferences.dateTimeFormat)}{item.collectedAt ? <span className="block text-slate-500">Collected {item.collectedAt}</span> : null}</td>

                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                          isReviewed
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {isReviewed ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {isReviewed ? 'REVIEWED' : 'AWAITING REVIEW'}
                      </span>
                    </td>

                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => toggleEvidenceReviewStatus(caseId, item.id)}
                        className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                          isReviewed
                            ? 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                            : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                        }`}
                      >
                        {isReviewed ? 'MARK PENDING' : 'MARK REVIEWED'}
                      </button>

                      <button
                        onClick={() => setCustodyModalItem(item)}
                        className="px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-300 hover:text-white text-[10px] font-mono"
                        title="Chain of Custody"
                      >
                        Custody
                      </button>

                      <Link
                        to={`/cases/${caseId}/evidence/${item.id}`}
                        className="px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 text-[10px] font-mono inline-block"
                      >
                        Details &rarr;
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={currentPage} totalPages={pageCount} onPageChange={setCurrentPage} pageSize={pageSize} pageSizeOptions={[10, 20, 50]} onPageSizeChange={setPageSize} totalItems={filteredEvidence.length} />

      {/* Custody Modal */}
      {custodyModalItem && (
        <ChainOfCustodyModal
          evidence={custodyModalItem}
          isOpen={!!custodyModalItem}
          onClose={() => setCustodyModalItem(null)}
        />
      )}
    </div>
  );
};
