import React, { useState } from 'react';
import { useCase } from '../context/CaseContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import {
  Cpu,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Workflow,
  RotateCw
} from 'lucide-react';

export const AIDeductionPage: React.FC = () => {
  const { selectedCase, interviews, tasks, showToast } = useCase();
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesizedNotes, setSynthesizedNotes] = useState<string[]>([]);

  if (!selectedCase) {
    return <div className="p-8 text-center font-mono text-cyan-400">NO CASE SELECTED</div>;
  }

  const { deductionMetrics, suspects, evidenceList, timeline, witnesses } = selectedCase;
  const caseTasks = tasks.filter(task => task.caseId === selectedCase.id);
  const pendingEvidence = evidenceList.filter(item => item.reviewStatus !== 'REVIEWED');
  const missingInfo = [
    ...(!evidenceList.length ? ['No evidence exhibits are attached to this case.'] : []),
    ...(!witnesses.length ? ['No witness statements are attached to this case.'] : []),
    ...(!timeline.some(event => event.verified) ? ['No timeline event is marked verified.'] : []),
    ...(pendingEvidence.length ? [`${pendingEvidence.length} evidence review(s) are still pending.`] : []),
    ...(!caseTasks.length ? ['No investigation tasks are recorded.'] : [])
  ];

  const handleSynthesize = () => {
    setIsSynthesizing(true);
    setTimeout(() => {
      setIsSynthesizing(false);
    const pendingReview = pendingEvidence.length;
      const flaggedTimeline = timeline.filter(event => event.flaggedInconsistency).length;
      const caseInterviewCount = interviews.filter(interview => interview.caseId === selectedCase.id).length;
      setSynthesizedNotes([
        `Recorded facts: ${evidenceList.length} evidence items; ${pendingReview} remain pending review.`,
        `Recorded facts: ${timeline.length} timeline events; ${flaggedTimeline} are currently flagged for inconsistency.`,
        `Open questions: corroborate the ${witnesses.length} witness records and ${caseInterviewCount} formal interview records against source material.`,
        `Outstanding work: ${caseTasks.filter(task => task.status !== 'COMPLETED').length} of ${caseTasks.length} case tasks remain open.`,
        suspects.length ? `Follow-up: review the ${suspects.length} linked person records without treating status or unverified leads as findings.` : 'Follow-up: record relevant persons only when supported by the investigation.'
      ]);
      showToast('Rule-based demo analysis generated from the selected case records.');
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-xs font-mono text-purple-400 uppercase tracking-widest font-bold">
              RULE-BASED DEMO ANALYSIS // #{selectedCase.id}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-hud text-white">
            AI DEDUCTION & HYPOTHESIS SYNTHESIS
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            No AI service is configured. This view summarizes recorded sample data and suggests verification questions only.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleSynthesize}
          loading={isSynthesizing}
          icon={<Sparkles className="w-4 h-4" />}
          className="shadow-[0_0_20px_rgba(168,85,247,0.4)]"
        >
          GENERATE DEMO ANALYSIS
        </Button>
      </div>

      {/* Primary Solvability & Hypothesis Hero Card */}
      <div className="p-6 rounded-2xl bg-[#090d16]/90 border border-purple-500/30 shadow-[0_0_35px_rgba(168,85,247,0.15)] space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-purple-400 font-bold uppercase tracking-wider block mb-1">
              RECORDED WORKING HYPOTHESIS (UNVERIFIED):
            </span>
            <p className="text-lg sm:text-xl font-bold font-hud text-white leading-relaxed">
              "{deductionMetrics.primaryHypothesis || 'No hypothesis has been recorded.'}"
            </p>
          </div>

          <div className="w-full md:w-56 p-3 rounded-xl bg-slate-950/80 border border-slate-800 shrink-0 text-right">
            <ProgressBar
              value={deductionMetrics.solvabilityRating}
              label="CASE SOLVABILITY INDEX"
              size="md"
              variant={deductionMetrics.solvabilityRating > 75 ? 'emerald' : 'cyan'}
            />
          </div>
        </div>

        {/* Key Confirmed Findings */}
        <div className="space-y-2 pt-3 border-t border-slate-800">
          <span className="text-xs font-mono text-slate-400 uppercase font-bold">
            RECORDED CASE DATA POINTS:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {deductionMetrics.keyFindings.map((finding, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-300"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{finding}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Synthesized Insights Stream */}
      {synthesizedNotes.length > 0 && (
        <div className="p-5 rounded-xl bg-purple-950/30 border border-purple-500/40 space-y-2">
          <div className="flex items-center gap-2 text-purple-300 text-xs font-mono font-bold">
            <Lightbulb className="w-4 h-4" />
          <span>DEMO ANALYSIS — OBSERVATIONS AND FOLLOW-UP QUESTIONS</span>
          </div>
          <div className="space-y-1.5 text-xs font-mono text-purple-100">
            {synthesizedNotes.map((note, i) => (
              <p key={i}>• {note}</p>
            ))}
          </div>
        </div>
      )}

      {/* Suspect Probabilities & Evidence Cross-Reference Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Suspect Probabilities */}
        <div className="p-5 rounded-xl bg-[#090d16]/90 border border-slate-800 space-y-4">
          <h3 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Workflow className="w-4 h-4" />
            RECORDED PERSON DATA (NOT ATTRIBUTION)
          </h3>

          <div className="space-y-3">
            {suspects.map((s) => {
              const fp = s.fingerprintMatchRate ?? s.fingerprintMatch ?? 0;
              const dna = s.dnaMatchRate ?? s.dnaMatch ?? 0;
              return (
                <div key={s.id} className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-white">{s.name}</span>
                    <span className="text-slate-400">{s.status}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-mono text-slate-400">
                    <span>Alibi status: {s.alibiStatus}</span>
                    <span>Fingerprint field: {s.fingerprintMatchRate ?? s.fingerprintMatch ?? 'not recorded'}{(s.fingerprintMatchRate ?? s.fingerprintMatch) != null ? '%' : ''}</span>
                    <span>DNA field: {s.dnaMatchRate ?? s.dnaMatch ?? 'not recorded'}{(s.dnaMatchRate ?? s.dnaMatch) != null ? '%' : ''}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contradiction & Anomaly Check */}
        <div className="p-5 rounded-xl bg-[#090d16]/90 border border-slate-800 space-y-4">
          <h3 className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            IDENTIFIED CRITICAL CONTRADICTIONS
          </h3>

          <div className="space-y-3">
            {timeline
              .filter((t) => t.flaggedInconsistency)
              .map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-lg bg-rose-950/30 border border-rose-500/40 text-xs font-mono space-y-1"
                >
                  <div className="flex items-center justify-between text-rose-300 font-bold">
                    <span>{item.time} // {item.title}</span>
                    <Badge variant="red" size="sm">
                      FLAGGED
                    </Badge>
                  </div>
                  <p className="text-slate-300">{item.description}</p>
                </div>
              ))}

            {timeline.filter((t) => t.flaggedInconsistency).length === 0 && (
              <div className="p-6 rounded-lg bg-slate-950/60 border border-slate-800 text-center text-xs font-mono text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p>No active chronological anomalies flagged in timeline sequence.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-[#090d16]/90 border border-cyan-500/20 space-y-3">
          <h3 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">EVIDENCE &amp; TIMELINE CROSS-REFERENCES</h3>
          {evidenceList.length ? evidenceList.slice(0, 6).map(item => (
            <div key={item.id} className="rounded-lg border border-white/5 bg-black/20 p-3 text-xs">
              <div className="flex justify-between gap-3"><span className="text-white font-semibold">{item.code} · {item.title}</span><span className="text-amber-300">{item.reviewStatus === 'REVIEWED' ? 'Reviewed' : 'Review pending'}</span></div>
              <p className="mt-1 text-slate-400">{item.description}</p>
            </div>
          )) : <p className="text-xs text-slate-500">No evidence is linked to this case yet.</p>}
          {timeline.slice(0, 5).map(event => <p key={event.id} className="text-[11px] text-slate-400 border-l border-cyan-500/40 pl-2">{event.date || selectedCase.incidentDate} {event.time} · <span className="text-slate-200">{event.title}</span> — {event.description}</p>)}
        </div>
        <div className="p-5 rounded-xl bg-[#090d16]/90 border border-amber-500/20 space-y-3">
          <h3 className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">OUTSTANDING QUESTIONS &amp; NEXT STEPS</h3>
          <ul className="space-y-2 text-xs text-slate-300 list-disc pl-5">
            <li>Which independent source confirms the time and sequence of the recorded events?</li>
            <li>Have original evidence files, collection records, and custody transfers been checked?</li>
            <li>What observation can each witness personally confirm, and what remains second-hand?</li>
            <li>Do recorded alibis align with verified timeline entries? Treat any mismatch as a question to investigate.</li>
          </ul>
          <h4 className="pt-2 text-[10px] font-bold text-rose-300 uppercase">Missing information</h4>
          {missingInfo.length ? <ul className="space-y-1 text-xs text-slate-400 list-disc pl-5">{missingInfo.map(item => <li key={item}>{item}</li>)}</ul> : <p className="text-xs text-slate-400">No missing-data flags from the current demo rules; continue source verification.</p>}
          <h4 className="pt-2 text-[10px] font-bold text-cyan-300 uppercase">Suggested follow-up</h4>
          <p className="text-xs text-slate-400">Confirm provenance, interview witnesses using open-ended questions, document unanswered items, and update the case only when supporting records are available.</p>
        </div>
      </section>
    </div>
  );
};
