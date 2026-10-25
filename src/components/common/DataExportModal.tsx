import React, { useState } from 'react';
import { Download, X, FileSpreadsheet, Check } from 'lucide-react';
import { useCase } from '../../context/CaseContext';
import { Button } from './Button';

interface DataExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExportCategory = 'CASES' | 'EVIDENCE' | 'TASKS' | 'TIMELINE' | 'ALL';

export const DataExportModal: React.FC<DataExportModalProps> = ({ isOpen, onClose }) => {
  const { cases, tasks, selectedCase } = useCase();
  const [category, setCategory] = useState<ExportCategory>('CASES');
  const [includeArchived, setIncludeArchived] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportedStatus, setExportedStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  // RFC-4180 CSV cell escaper
  const escapeCsv = (str: string | number | undefined | null): string => {
    if (str === null || str === undefined) return '""';
    const stringified = String(str);
    if (stringified.includes('"') || stringified.includes(',') || stringified.includes('\n') || stringified.includes('\r')) {
      return `"${stringified.replace(/"/g, '""')}"`;
    }
    return `"${stringified}"`;
  };

  const generateAndDownloadCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent = [
      headers.map(escapeCsv).join(','),
      ...rows.map(row => row.map(escapeCsv).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    setIsExporting(true);
    setExportedStatus(null);

    setTimeout(() => {
      try {
        const filteredCases = includeArchived ? cases : cases.filter(c => !c.isArchived);

        if (category === 'CASES') {
          const headers = [
            'Case ID',
            'Title',
            'Classification',
            'Status',
            'Priority',
            'Progress (%)',
            'Incident Date',
            'Location',
            'Lead Investigator',
            'Evidence Count',
            'Suspect Count',
            'Witness Count',
            'Is Archived'
          ];
          const rows = filteredCases.map(c => [
            c.id,
            c.title,
            c.type,
            c.status,
            c.priority,
            c.progress,
            c.incidentDate,
            c.location,
            c.leadInvestigator,
            c.evidenceCount,
            c.suspectCount,
            c.witnessCount,
            c.isArchived ? 'YES' : 'NO'
          ]);
          generateAndDownloadCsv('CaseX_Case_Dossiers', headers, rows);
          setExportedStatus(`Exported ${rows.length} Case Dossiers successfully.`);
        } else if (category === 'EVIDENCE') {
          const headers = [
            'Evidence Code',
            'Exhibit Title',
            'Case ID',
            'Category',
            'Importance',
            'Review Status',
            'Location Found',
            'Timestamp',
            'Current Custodian',
            'Storage Location'
          ];
          const rows: (string | number)[][] = [];
          filteredCases.forEach(c => {
            c.evidenceList.forEach(e => {
              rows.push([
                e.code,
                e.title,
                c.id,
                e.category,
                e.importance,
                e.reviewStatus || 'PENDING_REVIEW',
                e.locationFound,
                e.timestamp,
                e.currentCustodian || 'Unassigned',
                e.storageLocation || 'Locker B-14'
              ]);
            });
          });
          generateAndDownloadCsv('CaseX_Evidence_Locker', headers, rows);
          setExportedStatus(`Exported ${rows.length} Evidence Exhibits successfully.`);
        } else if (category === 'TASKS') {
          const headers = [
            'Task ID',
            'Case ID',
            'Task Title',
            'Description',
            'Priority',
            'Status',
            'Due Date',
            'Assigned Investigator'
          ];
          const rows = tasks.map(t => [
            t.id,
            t.caseId,
            t.title,
            t.description,
            t.priority,
            t.status,
            t.dueDate,
            t.assignedTo || 'Unassigned'
          ]);
          generateAndDownloadCsv('CaseX_Investigation_Tasks', headers, rows);
          setExportedStatus(`Exported ${rows.length} Tasks successfully.`);
        } else if (category === 'TIMELINE') {
          const headers = [
            'Event ID',
            'Case ID',
            'Time',
            'Event Title',
            'Description',
            'Source',
            'Flagged'
          ];
          const rows: (string | number)[][] = [];
          filteredCases.forEach(c => {
            c.timeline.forEach(t => {
              rows.push([
                t.id,
                c.id,
                t.time,
                t.title,
                t.description,
                t.source,
                t.flagged ? 'YES' : 'NO'
              ]);
            });
          });
          generateAndDownloadCsv('CaseX_Timeline_Events', headers, rows);
          setExportedStatus(`Exported ${rows.length} Timeline Events successfully.`);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsExporting(false);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-[#0a0f1d] border border-cyan-500/30 rounded-2xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-hud text-white tracking-wide">
              EXPORT DATASET (CSV)
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              RFC-4180 Compliant Spreadsheet Generator
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
              SELECT EXPORT DOMAIN
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'CASES', label: 'Case Dossiers', count: cases.length },
                { id: 'EVIDENCE', label: 'Evidence Locker', count: cases.reduce((acc, c) => acc + c.evidenceList.length, 0) },
                { id: 'TASKS', label: 'Investigation Tasks', count: tasks.length },
                { id: 'TIMELINE', label: 'Timeline Chronology', count: cases.reduce((acc, c) => acc + c.timeline.length, 0) }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setCategory(opt.id as ExportCategory)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    category === opt.id
                      ? 'border-cyan-400 bg-cyan-500/15 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                      : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold font-hud">{opt.label}</div>
                  <div className="text-[10px] font-mono text-cyan-400 mt-1">
                    {opt.count} Records available
                  </div>
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={includeArchived}
              onChange={e => setIncludeArchived(e.target.checked)}
              className="rounded bg-black border-white/20 text-cyan-500 focus:ring-0"
            />
            <span className="text-xs font-mono text-slate-300">
              Include archived records in export batch
            </span>
          </label>

          {exportedStatus && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{exportedStatus}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-white/5">
          <Button variant="ghost" size="sm" onClick={onClose}>
            CLOSE
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExport}
            isLoading={isExporting}
            icon={<Download className="w-4 h-4" />}
          >
            GENERATE & DOWNLOAD CSV
          </Button>
        </div>
      </div>
    </div>
  );
};
