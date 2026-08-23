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
  const { selectedCase, showToast } = useCase();
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesizedNotes, setSynthesizedNotes] = useState<string[]>([]);

  if (!selectedCase) {
    return <div className="p-8 text-center font-mono text-cyan-400">NO CASE SELECTED</div>;
  }

  const { deductionMetrics, suspects, evidenceList, timeline } = selectedCase;

  const handleSynthesize = () => {
    setIsSynthesizing(true);
    setTimeout(() => {
      setIsSynthesizing(false);
      setSynthesizedNotes([
        `Cross-referenced ${evidenceList.filter((e) => e.status === 'COLLECTED').length} secured evidence artifacts with ${suspects.length} suspect alibis.`,
        `High probability correlation confirmed between physical laser bypassing tools and prime suspect's electrical engineering specialization.`,
        `Recommendation: Sufficient evidence exists to proceed with formal judicial arrest warrant filing.`
      ]);
      showToast('AI Deduction Matrix synthesized with 94% probabilistic certainty.');
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
              NEURAL INFERENCE ENGINE // #{selectedCase.id}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-hud text-white">
            AI DEDUCTION & HYPOTHESIS SYNTHESIS
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Automated forensic reasoning, anomaly detection, and probabilistic suspect attribution.
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
          SYNTHESIZE DEDUCTION
        </Button>
      </div>

      {/* Primary Solvability & Hypothesis Hero Card */}
      <div className="p-6 rounded-2xl bg-[#090d16]/90 border border-purple-500/30 shadow-[0_0_35px_rgba(168,85,247,0.15)] space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-purple-400 font-bold uppercase tracking-wider block mb-1">
              LEADING WORKING HYPOTHESIS:
            </span>
            <p className="text-lg sm:text-xl font-bold font-hud text-white leading-relaxed">
              "{deductionMetrics.primaryHypothesis}"
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
            CONFIRMED DEDUCTIVE MILESTONES:
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
            <span>AI SYNTHESIS COMPLETE</span>
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
            SUSPECT INVOLVEMENT PROBABILITY
          </h3>

          <div className="space-y-3">
            {suspects.map((s) => {
              const fp = s.fingerprintMatchRate ?? s.fingerprintMatch ?? 0;
              const dna = s.dnaMatchRate ?? s.dnaMatch ?? 0;
              const probability = Math.round(
                (fp * 0.4 +
                  dna * 0.4 +
                  (s.alibiStatus === 'DISPROVEN' ? 30 : s.alibiStatus === 'QUESTIONABLE' ? 15 : 0)) /
                  1.1
              );
              const clamped = Math.min(99, Math.max(12, probability));

              return (
                <div key={s.id} className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-white">{s.name}</span>
                    <span
                      className={`font-bold font-hud ${
                        clamped > 75
                          ? 'text-rose-400'
                          : clamped > 50
                          ? 'text-amber-400'
                          : 'text-cyan-400'
                      }`}
                    >
                      {clamped}% INVOLVEMENT CHANCE
                    </span>
                  </div>
                  <ProgressBar
                    value={clamped}
                    size="sm"
                    showPercent={false}
                    variant={clamped > 75 ? 'red' : clamped > 50 ? 'amber' : 'cyan'}
                  />
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
    </div>
  );
};