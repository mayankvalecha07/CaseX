import React, { useState } from 'react';
import { Upload, X, AlertTriangle, CheckCircle, FileText, AlertCircle } from 'lucide-react';
import { useCase } from '../../context/CaseContext';
import { InvestigationCase, CaseStatus, Priority } from '../../types';
import { Button } from './Button';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedRow {
  rowNumber: number;
  data: Partial<InvestigationCase>;
  errors: string[];
  isDuplicate: boolean;
  isValid: boolean;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({ isOpen, onClose }) => {
  const { cases, importCasesFromCsv } = useCase();
  const [csvRawText, setCsvRawText] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [step, setStep] = useState<'INPUT' | 'PREVIEW' | 'RESULT'>('INPUT');
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);

  if (!isOpen) return null;

  // Simple CSV line parser handling quotes
  const parseCsvLines = (text: string): string[][] => {
    const lines: string[][] = [];
    const rawLines = text.split(/\r?\n/).filter(line => line.trim().length > 0);

    for (const line of rawLines) {
      const row: string[] = [];
      let current = '';
      let insideQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (insideQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            insideQuotes = !insideQuotes;
          }
        } else if (char === ',' && !insideQuotes) {
          row.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      row.push(current.trim());
      lines.push(row);
    }
    return lines;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      setCsvRawText(content);
      parseContent(content);
    };
    reader.readAsText(file);
  };

  const parseContent = (content: string) => {
    const grid = parseCsvLines(content);
    if (grid.length < 2) {
      setParsedRows([]);
      return;
    }

    const headers = grid[0].map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
    const rows: ParsedRow[] = [];

    const idIdx = headers.findIndex(h => h.includes('caseid') || h.includes('id'));
    const titleIdx = headers.findIndex(h => h.includes('title') || h.includes('name'));
    const typeIdx = headers.findIndex(h => h.includes('type') || h.includes('classification') || h.includes('category'));
    const statusIdx = headers.findIndex(h => h.includes('status'));
    const priorityIdx = headers.findIndex(h => h.includes('priority'));
    const locationIdx = headers.findIndex(h => h.includes('location'));
    const investigatorIdx = headers.findIndex(h => h.includes('investigator') || h.includes('lead'));

    for (let i = 1; i < grid.length; i++) {
      const line = grid[i];
      const errors: string[] = [];

      const rawId = idIdx !== -1 && line[idIdx] ? line[idIdx].trim() : `IMP-${Date.now().toString(36)}-${i}`;
      const rawTitle = titleIdx !== -1 && line[titleIdx] ? line[titleIdx].trim() : '';

      if (!rawTitle) {
        errors.push('Missing Case Title');
      }

      const isDuplicate = cases.some(
        c => c.id.toLowerCase() === rawId.toLowerCase() || (rawTitle && c.title.toLowerCase() === rawTitle.toLowerCase())
      );

      if (isDuplicate) {
        errors.push('Potential duplicate ID or Title in active docket');
      }

      const caseData: Partial<InvestigationCase> = {
        id: rawId,
        title: rawTitle || 'Untitled Case',
        type: typeIdx !== -1 && line[typeIdx] ? line[typeIdx] : 'FORENSIC INVESTIGATION',
        status: (statusIdx !== -1 && line[statusIdx] ? line[statusIdx].toUpperCase() : 'ACTIVE') as CaseStatus,
        priority: (priorityIdx !== -1 && line[priorityIdx] ? line[priorityIdx].toUpperCase() : 'MEDIUM') as Priority,
        location: locationIdx !== -1 && line[locationIdx] ? line[locationIdx] : 'Metropolitan Area',
        leadInvestigator: investigatorIdx !== -1 && line[investigatorIdx] ? line[investigatorIdx] : 'Det. Pulkit Gupta'
      };

      rows.push({
        rowNumber: i + 1,
        data: caseData,
        errors,
        isDuplicate,
        isValid: errors.length === 0
      });
    }

    setParsedRows(rows);
    setStep('PREVIEW');
  };

  const handleCommitImport = () => {
    const validData = parsedRows.filter(r => r.isValid).map(r => r.data);
    const result = importCasesFromCsv(validData);
    setImportResult(result);
    setStep('RESULT');
  };

  const loadSampleCsv = () => {
    const sample = `Case ID,Title,Classification,Status,Priority,Location,Lead Investigator\nCSV-2026-001,The Phantom Wiretap,CYBERCRIME,ACTIVE,CRITICAL,"Wall Street Terminal 3","Det. Pulkit Gupta"\nCSV-2026-002,Warehouse Arson Incident,ARSON,UNDER INVESTIGATION,HIGH,"Brooklyn Docks Berth 12","Special Agent Chen"\nCSV-2026-003,Stolen Biometric Drive,DATA HEIST,ACTIVE,MEDIUM,"Cambridge Biotech Lab","Agent Sterling"`;
    setCsvRawText(sample);
    parseContent(sample);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#0a0f1d] border border-cyan-500/30 rounded-2xl shadow-2xl p-6 relative max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 shrink-0">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-hud text-white tracking-wide">
              BATCH CSV IMPORT WITH PREVIEW
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Validation, Duplicate Detection & Schema Conformance
            </p>
          </div>
        </div>

        {step === 'INPUT' && (
          <div className="space-y-4 overflow-y-auto flex-1 pr-1">
            <div className="border-2 border-dashed border-white/10 hover:border-cyan-400/50 rounded-xl p-8 text-center transition-colors bg-white/[0.01]">
              <FileText className="w-10 h-10 text-cyan-400/60 mx-auto mb-3" />
              <p className="text-sm font-hud text-slate-200 mb-1">
                Drag and drop your Case CSV spreadsheet here
              </p>
              <p className="text-xs text-slate-400 font-mono mb-4">
                Headers expected: Case ID, Title, Classification, Status, Priority, Location, Lead Investigator
              </p>
              <label className="inline-block px-4 py-2 rounded-xl bg-cyan-500 text-black font-mono text-xs font-bold hover:bg-cyan-400 cursor-pointer transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                SELECT CSV FILE
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-mono text-slate-400">
                Or test with pre-formatted forensic case templates:
              </span>
              <button
                type="button"
                onClick={loadSampleCsv}
                className="text-xs font-mono text-cyan-400 hover:underline"
              >
                Load Sample CSV &rarr;
              </button>
            </div>
          </div>
        )}

        {step === 'PREVIEW' && (
          <div className="space-y-4 overflow-y-auto flex-1 pr-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">
                Found <strong className="text-cyan-400">{parsedRows.length}</strong> records in CSV
              </span>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400">
                  {parsedRows.filter(r => r.isValid).length} Valid
                </span>
                <span className="text-rose-400">
                  {parsedRows.filter(r => !r.isValid).length} Issues
                </span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/30 max-h-72">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-white/5 border-b border-white/10 text-slate-400 text-[10px] uppercase">
                  <tr>
                    <th className="p-2.5">Row</th>
                    <th className="p-2.5">Case ID</th>
                    <th className="p-2.5">Title</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Priority</th>
                    <th className="p-2.5">Validation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {parsedRows.map(row => (
                    <tr
                      key={row.rowNumber}
                      className={row.isValid ? 'hover:bg-white/[0.02]' : 'bg-rose-500/5'}
                    >
                      <td className="p-2.5 text-slate-500">#{row.rowNumber}</td>
                      <td className="p-2.5 text-cyan-400 font-bold">{row.data.id}</td>
                      <td className="p-2.5 text-slate-200 truncate max-w-[180px]">
                        {row.data.title}
                      </td>
                      <td className="p-2.5 text-slate-300">{row.data.status}</td>
                      <td className="p-2.5 text-slate-300">{row.data.priority}</td>
                      <td className="p-2.5">
                        {row.isValid ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px]">
                            <CheckCircle className="w-3 h-3" /> Ready
                          </span>
                        ) : (
                          <div className="space-y-0.5 text-rose-400 text-[10px]">
                            {row.errors.map((err, i) => (
                              <div key={i} className="flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 shrink-0" />
                                <span>{err}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('INPUT')}
              >
                BACK TO UPLOAD
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCommitImport}
                disabled={parsedRows.filter(r => r.isValid).length === 0}
              >
                CONFIRM IMPORT ({parsedRows.filter(r => r.isValid).length} ROWS)
              </Button>
            </div>
          </div>
        )}

        {step === 'RESULT' && importResult && (
          <div className="space-y-4 py-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-8 h-8" />
            </div>

            <h4 className="text-base font-bold font-hud text-white">
              CSV BATCH IMPORT COMPLETED
            </h4>

            <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto text-xs font-mono py-2">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                <div className="text-xl font-bold text-emerald-400 font-hud">
                  {importResult.imported}
                </div>
                <div className="text-slate-400 text-[10px] mt-1">IMPORTED</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                <div className="text-xl font-bold text-amber-400 font-hud">
                  {importResult.skipped}
                </div>
                <div className="text-slate-400 text-[10px] mt-1">SKIPPED / INVALID</div>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div className="text-left p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono max-h-32 overflow-y-auto">
                <div className="font-bold mb-1">Row Exceptions:</div>
                {importResult.errors.map((err, i) => (
                  <div key={i} className="text-[11px] leading-relaxed">&bull; {err}</div>
                ))}
              </div>
            )}

            <div className="pt-4">
              <Button variant="primary" size="sm" onClick={onClose}>
                VIEW CASE DOCKET
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
