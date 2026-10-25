import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  FolderOpen,
  Package,
  Users,
  MessageSquareQuote,
  Clock,
  FileText,
  FlaskConical,
  CheckSquare,
  Network,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useCase } from '../../context/CaseContext';
import { useDebounce } from '../../hooks/useDebounce';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { cases, notes, tasks, selectCase } = useCase();

  const [rawQuery, setRawQuery] = useState('');
  const debouncedQuery = useDebounce(rawQuery, 250);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setRawQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const query = debouncedQuery.trim().toLowerCase();

  // Search across Cases
  const matchedCases = query
    ? cases.filter(
        c =>
          c.title.toLowerCase().includes(query) ||
          c.id.toLowerCase().includes(query) ||
          c.shortDescription.toLowerCase().includes(query) ||
          c.location.toLowerCase().includes(query)
      )
    : [];

  // Search across Evidence
  const matchedEvidence: { caseId: string; caseTitle: string; item: any }[] = [];
  if (query) {
    cases.forEach(c => {
      c.evidenceList.forEach(ev => {
        if (
          ev.title.toLowerCase().includes(query) ||
          ev.id.toLowerCase().includes(query) ||
          ev.code.toLowerCase().includes(query) ||
          ev.description.toLowerCase().includes(query) ||
          ev.category.toLowerCase().includes(query)
        ) {
          matchedEvidence.push({ caseId: c.id, caseTitle: c.title, item: ev });
        }
      });
    });
  }

  // Search across Suspects
  const matchedSuspects: { caseId: string; caseTitle: string; suspect: any }[] = [];
  if (query) {
    cases.forEach(c => {
      c.suspects.forEach(s => {
        if (
          s.name.toLowerCase().includes(query) ||
          s.id.toLowerCase().includes(query) ||
          s.occupation.toLowerCase().includes(query) ||
          s.motive.toLowerCase().includes(query) ||
          (s.alias && s.alias.toLowerCase().includes(query))
        ) {
          matchedSuspects.push({ caseId: c.id, caseTitle: c.title, suspect: s });
        }
      });
    });
  }

  // Search across Witnesses
  const matchedWitnesses: { caseId: string; caseTitle: string; witness: any }[] = [];
  if (query) {
    cases.forEach(c => {
      c.witnesses.forEach(w => {
        if (
          w.name.toLowerCase().includes(query) ||
          w.id.toLowerCase().includes(query) ||
          w.statement.toLowerCase().includes(query) ||
          w.occupation.toLowerCase().includes(query) ||
          (w.interviewHistory || []).some(entry => entry.question.toLowerCase().includes(query) || entry.response.toLowerCase().includes(query))
        ) {
          matchedWitnesses.push({ caseId: c.id, caseTitle: c.title, witness: w });
        }
      });
    });
  }

  // Search across Timeline Events
  const matchedTimeline: { caseId: string; caseTitle: string; event: any }[] = [];
  if (query) {
    cases.forEach(c => {
      c.timeline.forEach(t => {
        if (
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.time.toLowerCase().includes(query)
        ) {
          matchedTimeline.push({ caseId: c.id, caseTitle: c.title, event: t });
        }
      });
    });
  }

  // Search across Investigation Notes
  const matchedNotes = query
    ? notes.filter(
        n =>
          n.title.toLowerCase().includes(query) ||
          n.content.toLowerCase().includes(query) ||
          n.category.toLowerCase().includes(query)
      )
    : [];

  const matchedTasks = query ? tasks.filter(task => [task.id, task.title, task.description, task.assignedTo || '', task.caseId].some(value => value.toLowerCase().includes(query))) : [];
  const matchedReports = query ? cases.flatMap(c => c.forensics
    .filter(report => [report.id, report.title, report.findings, report.conclusion || '', report.examiner].some(value => value.toLowerCase().includes(query)))
    .map(report => ({ caseId: c.id, caseTitle: c.title, report }))) : [];
  const matchedBoard = query ? cases.flatMap(c => c.boardNodes
    .filter(node => [node.id, node.title, node.subtitle || '', node.summary || ''].some(value => value.toLowerCase().includes(query)))
    .map(node => ({ caseId: c.id, caseTitle: c.title, node }))) : [];

  const totalResults =
    matchedCases.length +
    matchedEvidence.length +
    matchedSuspects.length +
    matchedWitnesses.length +
    matchedTimeline.length +
    matchedNotes.length +
    matchedTasks.length +
    matchedReports.length +
    matchedBoard.length;

  const handleSelectCase = (caseId: string) => {
    selectCase(caseId);
    navigate(`/cases/${caseId}`);
    onClose();
  };

  const handleSelectEvidence = (caseId: string, evId: string) => {
    selectCase(caseId);
    navigate(`/cases/${caseId}/evidence/${evId}`);
    onClose();
  };

  const handleSelectSuspect = (caseId: string, suspId: string) => {
    selectCase(caseId);
    navigate(`/cases/${caseId}/suspects/${suspId}`);
    onClose();
  };

  const handleSelectTimeline = (caseId: string) => {
    selectCase(caseId);
    navigate(`/cases/${caseId}/timeline`);
    onClose();
  };

  const handleSelectWitness = (caseId: string) => {
    selectCase(caseId);
    navigate(`/cases/${caseId}/witnesses`);
    onClose();
  };

  const handleSelectNote = (caseId: string) => {
    selectCase(caseId);
    navigate(`/cases/${caseId}/notes`);
    onClose();
  };

  const handleSelectTask = (caseId: string) => {
    selectCase(caseId);
    navigate(`/cases/${caseId}/tasks`);
    onClose();
  };

  const handleSelectReport = (caseId: string) => {
    selectCase(caseId);
    navigate(`/cases/${caseId}/forensics`);
    onClose();
  };

  const handleSelectBoard = (caseId: string) => {
    selectCase(caseId);
    navigate(`/cases/${caseId}/detective-board`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-2xl bg-[#090d16] border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)] overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-white/[0.02]">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={rawQuery}
            onChange={e => setRawQuery(e.target.value)}
            placeholder="Search cases, evidence, suspects, witnesses, tasks, reports, notes..."
            className="w-full bg-transparent text-white font-mono text-sm placeholder:text-slate-500 outline-none"
          />
          {rawQuery && (
            <button
              onClick={() => setRawQuery('')}
              className="p-1 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-400">
            ESC
          </span>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {!query ? (
            <div className="py-12 text-center text-slate-500 font-mono text-xs">
              <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p>Type a keyword, evidence ID, suspect name, or clue to search...</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {['blackout', 'laser', 'neurotoxin', 'fingerprint', 'diamond', 'vault'].map(term => (
                  <button
                    key={term}
                    onClick={() => setRawQuery(term)}
                    className="text-[10px] px-2 py-1 rounded bg-white/5 border border-white/10 text-cyan-300 hover:bg-white/10 transition-colors"
                  >
                    #{term}
                  </button>
                ))}
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-12 text-center font-mono text-xs text-slate-400">
              <p className="text-white font-bold mb-1">NO MATCHING INTELLIGENCE FOUND</p>
              <p className="text-[11px] text-slate-500">
                Zero records found matching "{query}". Try checking spelling or using broader search terms.
              </p>
            </div>
          ) : (
            <>
              {/* Matched Cases */}
              {matchedCases.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>INVESTIGATION CASES ({matchedCases.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedCases.map(c => (
                      <button
                        key={c.id}
                        onClick={() => handleSelectCase(c.id)}
                        className="w-full text-left p-2.5 rounded-xl bg-white/[0.03] hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-400/30 transition-all flex items-center justify-between group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-cyan-400 font-bold">[{c.id}]</span>
                            <span className="text-xs font-bold font-hud text-white group-hover:text-cyan-300">
                              {c.title}
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-slate-400 line-clamp-1 mt-0.5">
                            {c.shortDescription}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Evidence */}
              {matchedEvidence.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Package className="w-3.5 h-3.5" />
                    <span>EVIDENCE LOCKER ({matchedEvidence.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedEvidence.slice(0, 6).map(({ caseId, caseTitle, item }) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelectEvidence(caseId, item.id)}
                        className="w-full text-left p-2.5 rounded-xl bg-white/[0.03] hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-400/30 transition-all flex items-center justify-between group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-emerald-400 font-bold">[{item.code}]</span>
                            <span className="text-xs font-bold text-white group-hover:text-emerald-300">
                              {item.title}
                            </span>
                            <span className="text-[9px] font-mono px-1.5 rounded bg-white/10 text-slate-400">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-slate-400 line-clamp-1 mt-0.5">
                            {item.description}
                          </p>
                          <span className="text-[9px] font-mono text-slate-500">Case: {caseTitle}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Suspects */}
              {matchedSuspects.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" />
                    <span>SUSPECT DOSSIERS ({matchedSuspects.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedSuspects.slice(0, 6).map(({ caseId, caseTitle, suspect }) => (
                      <button
                        key={suspect.id}
                        onClick={() => handleSelectSuspect(caseId, suspect.id)}
                        className="w-full text-left p-2.5 rounded-xl bg-white/[0.03] hover:bg-purple-500/10 border border-white/5 hover:border-purple-400/30 transition-all flex items-center justify-between group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white group-hover:text-purple-300">
                              {suspect.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">({suspect.occupation})</span>
                            <span className="text-[9px] font-mono px-1.5 rounded bg-rose-500/20 text-rose-300">
                              {suspect.riskLevel} RISK
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-slate-400 line-clamp-1 mt-0.5">
                            Motive: {suspect.motive}
                          </p>
                          <span className="text-[9px] font-mono text-slate-500">Case: {caseTitle}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Witnesses */}
              {matchedWitnesses.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                    <MessageSquareQuote className="w-3.5 h-3.5" />
                    <span>WITNESS TESTIMONIES ({matchedWitnesses.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedWitnesses.slice(0, 4).map(({ caseId, caseTitle, witness }) => (
                      <button
                        key={witness.id}
                        onClick={() => handleSelectWitness(caseId)}
                        className="w-full text-left p-2.5 rounded-xl bg-white/[0.03] hover:bg-amber-500/10 border border-white/5 hover:border-amber-400/30 transition-all flex items-center justify-between group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white group-hover:text-amber-300">
                              {witness.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">({witness.relationship})</span>
                          </div>
                          <p className="text-[11px] font-mono text-slate-400 line-clamp-1 mt-0.5">
                            "{witness.statement}"
                          </p>
                          <span className="text-[9px] font-mono text-slate-500">Case: {caseTitle}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Investigation Notes */}
              {matchedNotes.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    <span>INVESTIGATION NOTES ({matchedNotes.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedNotes.map(n => (
                      <button
                        key={n.id}
                        onClick={() => handleSelectNote(n.caseId)}
                        className="w-full text-left p-2.5 rounded-xl bg-white/[0.03] hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-400/30 transition-all flex items-center justify-between group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white group-hover:text-cyan-300">
                              {n.title}
                            </span>
                            <span className="text-[9px] font-mono px-1.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                              {n.category}
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-slate-400 line-clamp-1 mt-0.5">
                            {n.content}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {matchedTasks.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2"><CheckSquare className="w-3.5 h-3.5" /><span>INVESTIGATION TASKS ({matchedTasks.length})</span></div>
                  <div className="space-y-1.5">{matchedTasks.slice(0, 8).map(task => {
                    const taskCase = cases.find(c => c.id === task.caseId);
                    return <button key={task.id} onClick={() => handleSelectTask(task.caseId)} className="w-full text-left p-2.5 rounded-xl bg-white/[0.03] hover:bg-amber-500/10 border border-white/5 flex items-center justify-between"><span><span className="block text-xs font-bold text-white">{task.title}</span><span className="text-[10px] text-slate-400">{task.caseId} · {taskCase?.title || 'Case unavailable'} · {task.status}</span></span><ArrowRight className="w-4 h-4 text-amber-400" /></button>;
                  })}</div>
                </div>
              )}

              {matchedReports.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2"><FlaskConical className="w-3.5 h-3.5" /><span>FORENSIC REPORTS ({matchedReports.length})</span></div>
                  <div className="space-y-1.5">{matchedReports.slice(0, 8).map(({ caseId, caseTitle, report }) => <button key={report.id} onClick={() => handleSelectReport(caseId)} className="w-full text-left p-2.5 rounded-xl bg-white/[0.03] hover:bg-emerald-500/10 border border-white/5 flex items-center justify-between"><span><span className="block text-xs font-bold text-white">{report.title}</span><span className="text-[10px] text-slate-400">{caseId} · {caseTitle} · {report.status}</span></span><ArrowRight className="w-4 h-4 text-emerald-400" /></button>)}</div>
                </div>
              )}

              {matchedTimeline.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2"><Clock className="w-3.5 h-3.5" /><span>TIMELINE EVENTS ({matchedTimeline.length})</span></div>
                  <div className="space-y-1.5">{matchedTimeline.slice(0, 8).map(({ caseId, caseTitle, event }) => <button key={event.id} onClick={() => handleSelectTimeline(caseId)} className="w-full text-left p-2.5 rounded-xl bg-white/[0.03] hover:bg-purple-500/10 border border-white/5 flex items-center justify-between"><span><span className="block text-xs font-bold text-white">{event.title}</span><span className="text-[10px] text-slate-400">{caseId} · {caseTitle} · {event.time}</span></span><ArrowRight className="w-4 h-4 text-purple-400" /></button>)}</div>
                </div>
              )}

              {matchedBoard.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2"><Network className="w-3.5 h-3.5" /><span>DETECTIVE BLACKBOARD ({matchedBoard.length})</span></div>
                  <div className="space-y-1.5">{matchedBoard.slice(0, 8).map(({ caseId, caseTitle, node }) => <button key={node.id} onClick={() => handleSelectBoard(caseId)} className="w-full text-left p-2.5 rounded-xl bg-white/[0.03] hover:bg-cyan-500/10 border border-white/5 flex items-center justify-between"><span><span className="block text-xs font-bold text-white">{node.title}</span><span className="text-[10px] text-slate-400">{caseId} · {caseTitle} · {node.summary || node.subtitle || node.type}</span></span><ArrowRight className="w-4 h-4 text-cyan-400" /></button>)}</div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 bg-black/40 flex items-center justify-between text-[11px] font-mono text-slate-500 px-4">
          <span>Navigate with mouse or keyboard</span>
          <span>CaseX Global Omnisearch v2.4</span>
        </div>
      </div>
    </div>
  );
};
