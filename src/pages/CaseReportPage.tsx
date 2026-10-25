import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Printer,
  FileText,
  Shield,
  FolderOpen,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { useCase } from '../context/CaseContext';
import { Button } from '../components/common/Button';

export const CaseReportPage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const { cases, selectedCaseId, tasks, interviews, getCaseNotes, getCaseChecklist } = useCase();

  const activeCaseId = caseId || selectedCaseId || 'NY-2026-0884';
  const [selectedReportCaseId, setSelectedReportCaseId] = useState(activeCaseId);
  useEffect(() => setSelectedReportCaseId(activeCaseId), [activeCaseId]);

  const c = cases.find(item => item.id === selectedReportCaseId) || cases[0];

  if (!c) {
    return (
      <div className="p-8 text-center text-xs font-mono text-slate-500">
        No case dossier found to compile official report.
      </div>
    );
  }

  const caseNotes = getCaseNotes(c.id);
  const caseChecklist = getCaseChecklist(c.id);
  const caseTasks = tasks.filter(t => t.caseId === c.id);
  const completedTasks = caseTasks.filter(t => t.status === 'COMPLETED');
  const caseInterviews = interviews.filter(interview => interview.caseId === c.id);

  const handlePrint = () => {
    window.print();
  };

  const reportDate = new Date().toLocaleString([], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Action Bar (hidden during printing) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link to={`/cases/${c.id}`} className="text-slate-400 hover:text-white p-1">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold font-hud text-white tracking-wide">
              OFFICIAL CASE DOSSIER REPORT
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Ready for executive review and printable archival.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedReportCaseId}
            onChange={e => setSelectedReportCaseId(e.target.value)}
            className="bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
          >
            {cases.map(item => (
              <option key={item.id} value={item.id}>
                {item.id} - {item.title.substring(0, 24)}...
              </option>
            ))}
          </select>

          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            icon={<Printer className="w-4 h-4" />}
          >
            PRINT DOSSIER
          </Button>
        </div>
      </div>

      {/* Printable Report Document Shell */}
      <article
        aria-label="Official Case Dossier Report"
        className="p-8 sm:p-12 rounded-2xl bg-[#0a0f1d] border border-white/10 print:border-none print:p-0 print:bg-white print:text-black space-y-8 shadow-2xl"
      >
        {/* Document Header */}
        <header className="border-b-2 border-cyan-500/50 print:border-black pb-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-2xl font-black font-hud text-white print:text-black tracking-widest">
                CASE<span className="text-cyan-400 print:text-blue-700">X</span> FORENSIC ARCHIVE
              </div>
              <div className="text-xs font-mono text-cyan-400 print:text-blue-700 font-bold tracking-wider mt-1">
                CONFIDENTIAL INVESTIGATIVE DOSSIER &bull; OFFICIAL COPY
              </div>
            </div>

            <div className="text-right text-xs font-mono text-slate-400 print:text-gray-600 space-y-0.5">
              <div>REPORT GENERATED: {reportDate}</div>
              <div>CLASSIFICATION: {c.priority} // RESTRICTED</div>
              <div>STATUS: {c.status}</div>
            </div>
          </div>

          <div className="pt-2">
            <h2 className="text-2xl font-bold font-hud text-white print:text-black tracking-wide">
              {c.title}
            </h2>
            <div className="flex items-center gap-4 text-xs font-mono text-slate-300 print:text-gray-700 mt-1">
              <span><strong>DOSSIER ID:</strong> {c.id}</span>
              <span>&bull;</span>
              <span><strong>SCENE:</strong> {c.location}</span>
              <span>&bull;</span>
              <span><strong>INCIDENT DATE:</strong> {c.incidentDate}</span>
            </div>
          </div>
        </header>

        {/* Executive Summary */}
        <section className="space-y-2">
          <h3 className="text-xs font-bold font-hud uppercase tracking-widest text-cyan-400 print:text-blue-700 border-b border-white/5 print:border-gray-300 pb-1">
            1. EXECUTIVE BRIEFING &amp; OVERVIEW
          </h3>
          <p className="text-xs text-slate-200 print:text-gray-800 leading-relaxed font-sans">
            {c.fullBriefing || c.shortDescription}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono text-slate-300 print:text-gray-700">
            <div><span className="text-slate-500 print:text-gray-500 block text-[10px]">Lead Investigator</span> {c.leadInvestigator}</div>
            <div><span className="text-slate-500 print:text-gray-500 block text-[10px]">Classification</span> {c.type}</div>
            <div><span className="text-slate-500 print:text-gray-500 block text-[10px]">Overall Progress</span> {c.progress}% Completed</div>
            <div><span className="text-slate-500 print:text-gray-500 block text-[10px]">Warrant Status</span> {c.warrantData.warrantIssued ? 'Issued' : 'Pending'}</div>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-bold font-hud uppercase tracking-widest text-cyan-400 print:text-blue-700 border-b border-white/5 print:border-gray-300 pb-1">
            FORENSIC REPORTS ({c.forensics.length})
          </h3>
          {c.forensics.length ? c.forensics.map(report => <div key={report.id} className="rounded-lg border border-white/10 print:border-gray-300 p-3 text-xs space-y-1">
            <div className="font-bold text-white print:text-black">{report.title} <span className="font-normal text-slate-400">· {report.status}</span></div>
            <p className="text-slate-300 print:text-gray-700">{report.findings}</p>
            {report.conclusion && <p className="text-slate-400 print:text-gray-600">Recorded conclusion: {report.conclusion}</p>}
          </div>) : <p className="text-xs text-slate-500 print:text-gray-600">No forensic reports are recorded for this case.</p>}
        </section>

        {/* Evidence Exhibit Manifest */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold font-hud uppercase tracking-widest text-cyan-400 print:text-blue-700 border-b border-white/5 print:border-gray-300 pb-1">
            2. FORENSIC EVIDENCE EXHIBIT MANIFEST ({c.evidenceList.length} EXHIBITS)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-white/10 print:border-gray-300 text-slate-400 print:text-gray-600 text-[10px]">
                  <th className="py-2">Code</th>
                  <th className="py-2">Exhibit Name</th>
                  <th className="py-2">Category</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Current Custodian</th>
                  <th className="py-2">Forensic Findings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 print:divide-gray-200">
                {c.evidenceList.map(ev => (
                  <tr key={ev.id} className="text-[11px] text-slate-300 print:text-gray-800">
                    <td className="py-2 font-bold text-cyan-400 print:text-blue-700">{ev.code}</td>
                    <td className="py-2 font-bold text-white print:text-black">{ev.title}</td>
                    <td className="py-2">{ev.category}</td>
                    <td className="py-2">{ev.reviewStatus || ev.status}</td>
                    <td className="py-2">{ev.currentCustodian || 'Locker B-14'}</td>
                    <td className="py-2 max-w-xs truncate">{ev.forensicNotes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-bold font-hud uppercase tracking-widest text-cyan-400 print:text-blue-700 border-b border-white/5 print:border-gray-300 pb-1">
            WITNESS RECORDS &amp; INTERVIEWS ({c.witnesses.length} WITNESSES · {caseInterviews.length} INTERVIEWS)
          </h3>
          {c.witnesses.length ? c.witnesses.map(witness => {
            const witnessInterviews = caseInterviews.filter(interview => interview.witnessId === witness.id);
            return <div key={witness.id} className="rounded-lg border border-white/10 print:border-gray-300 p-3 text-xs space-y-1">
              <div className="font-bold text-white print:text-black">{witness.name} <span className="font-normal text-slate-400">· {witness.occupation} · {witness.verificationStatus}</span></div>
              <p className="text-slate-300 print:text-gray-700">Recorded statement: {witness.statement}</p>
              {witnessInterviews.map(interview => <p key={interview.id} className="text-slate-400 print:text-gray-600">Interview {interview.interviewDate}: {interview.notes || interview.audioTranscript || interview.keyFindings.join('; ') || 'Interview record created; no notes provided.'}</p>)}
            </div>;
          }) : <p className="text-xs text-slate-500 print:text-gray-600">No witness records are attached to this case.</p>}
        </section>

        {/* Suspects & Persons of Interest */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold font-hud uppercase tracking-widest text-cyan-400 print:text-blue-700 border-b border-white/5 print:border-gray-300 pb-1">
            3. SUSPECT &amp; PERSON OF INTEREST DOSSIERS ({c.suspects.length} PERSONS)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {c.suspects.map(susp => (
              <div
                key={susp.id}
                className="p-3.5 rounded-xl border border-white/10 print:border-gray-300 bg-white/[0.01] print:bg-transparent space-y-1.5 text-xs font-mono"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white print:text-black">{susp.name}</span>
                  <span className="text-[10px] text-amber-400 print:text-gray-800">{susp.status}</span>
                </div>
                <div className="text-[11px] text-slate-400 print:text-gray-600">
                  Motive: {susp.motive}
                </div>
                <div className="text-[11px] text-slate-400 print:text-gray-600">
                  Alibi: {susp.alibi} ({susp.alibiStatus})
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline Chronology */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold font-hud uppercase tracking-widest text-cyan-400 print:text-blue-700 border-b border-white/5 print:border-gray-300 pb-1">
            4. RECONCILED CHRONOLOGICAL TIMELINE ({c.timeline.length} EVENTS)
          </h3>
          <div className="space-y-2">
            {c.timeline.map(tl => (
              <div
                key={tl.id}
                className="p-2.5 rounded-lg border border-white/5 print:border-gray-200 flex items-start gap-4 text-xs font-mono"
              >
                <div className="text-cyan-400 print:text-blue-700 font-bold shrink-0 w-20">
                  {tl.time}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="text-white print:text-black font-bold">{tl.title}</div>
                  <div className="text-slate-400 print:text-gray-600 text-[11px]">{tl.description}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Task Completion Audit */}
        <section className="space-y-2">
          <h3 className="text-xs font-bold font-hud uppercase tracking-widest text-cyan-400 print:text-blue-700 border-b border-white/5 print:border-gray-300 pb-1">
            5. OPERATIONAL MILESTONES &amp; TASKS ({completedTasks.length}/{caseTasks.length} COMPLETED)
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {caseTasks.map(t => (
              <div key={t.id} className="flex items-center gap-2 text-slate-300 print:text-gray-800">
                <CheckCircle className={`w-3.5 h-3.5 ${t.status === 'COMPLETED' ? 'text-emerald-400 print:text-green-600' : 'text-slate-600'}`} />
                <span className="truncate">{t.title} ({t.status})</span>
              </div>
            ))}
          </div>
        </section>

        {/* Resolution Statement */}
        {c.resolutionSummary && (
          <section className="p-4 rounded-xl border border-emerald-500/30 print:border-gray-400 bg-emerald-500/5 print:bg-transparent space-y-1.5">
            <h3 className="text-xs font-bold font-hud uppercase tracking-widest text-emerald-400 print:text-black">
              JUDICIAL RESOLUTION STATEMENT
            </h3>
            <p className="text-xs text-slate-200 print:text-gray-800 leading-relaxed font-sans">
              {c.resolutionSummary}
            </p>
          </section>
        )}

        {/* Document Footer */}
        <footer className="pt-6 border-t border-white/10 print:border-black text-center text-[10px] font-mono text-slate-500 print:text-gray-500">
          <div>CASEX DIGITAL INVESTIGATION PLATFORM &bull; INVESTIGATION DOSSIER</div>
          <div>Sample/demo records are fictional. Verify source material and findings before operational or judicial use.</div>
        </footer>
      </article>
    </div>
  );
};
