import React, { useState } from 'react';
import { useCase } from '../context/CaseContext';
import { ForensicReport } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import {
  FlaskConical,
  Dna,
  Fingerprint,
  Cpu,
  ShieldCheck,
  RotateCw,
  CheckCircle,
  FileCheck2,
  Sparkles
} from 'lucide-react';

export const ForensicsLabPage: React.FC = () => {
  const { selectedCase, showToast } = useCase();
  const [analyzingReportId, setAnalyzingReportId] = useState<string | null>(null);

  if (!selectedCase) {
    return <div className="p-8 text-center font-mono text-cyan-400">NO CASE SELECTED</div>;
  }

  const { forensics } = selectedCase;

  const handleRunReanalysis = (reportId: string) => {
    setAnalyzingReportId(reportId);
    setTimeout(() => {
      setAnalyzingReportId(null);
      showToast('Spectrometric re-calibration complete. 100% data correlation achieved.');
    }, 1200);
  };

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'DNA':
        return <Dna className="w-5 h-5 text-emerald-400" />;
      case 'FINGERPRINT':
        return <Fingerprint className="w-5 h-5 text-cyan-400" />;
      case 'CYBER':
        return <Cpu className="w-5 h-5 text-purple-400" />;
      default:
        return <FlaskConical className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">
              DEPARTMENT OF FORENSIC SCIENCES // #{selectedCase.id}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-hud text-white">
            FORENSIC LABORATORY ANALYSIS
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Certified spectroscopic assays, ballistic striations, DNA capillary electrophoresis, and digital memory triage.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-400">LAB CERTIFICATES:</span>{' '}
            <span className="text-white font-bold font-hud">{forensics.length}</span>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {forensics.map((rep) => {
          const isAnalyzing = analyzingReportId === rep.id;
          return (
            <div
              key={rep.id}
              className="p-6 rounded-2xl bg-[#090d16]/90 border border-slate-800/90 hover:border-cyan-500/40 transition-all shadow-xl space-y-5"
            >
              {/* Report Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
                    {getReportIcon(rep.type)}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                      REPORT #{rep.id} • {rep.type}
                    </span>
                    <h3 className="text-lg font-bold font-hud text-white">{rep.title}</h3>
                  </div>
                </div>

                <Badge variant={rep.status === 'COMPLETED' ? 'emerald' : 'amber'} size="sm" dot>
                  {rep.status}
                </Badge>
              </div>

              {/* Confidence Meter */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <ProgressBar
                  value={rep.confidenceScore}
                  label="SCIENTIFIC CONFIDENCE LEVEL"
                  size="md"
                  variant={rep.confidenceScore > 85 ? 'emerald' : 'cyan'}
                />
              </div>

              {/* Forensic Findings & Key Conclusion */}
              <div className="space-y-3 text-xs font-mono">
                <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800">
                  <span className="text-slate-400 font-bold uppercase block mb-1">
                    LABORATORY FINDINGS:
                  </span>
                  <p className="text-slate-200 leading-relaxed">{rep.findings}</p>
                </div>

                <div className="p-3.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30">
                  <span className="text-cyan-300 font-bold uppercase block mb-1">
                    FORENSIC CONCLUSION:
                  </span>
                  <p className="text-cyan-100 font-bold leading-relaxed">{rep.conclusion}</p>
                </div>
              </div>

              {/* Footer Metadata & Re-analysis */}
              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                <div className="text-slate-400">
                  <span>EXAMINER: </span>
                  <span className="text-slate-200">{rep.examiner}</span>
                  <span className="block text-[10px] text-slate-500">
                    DATE: {rep.completedDate}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRunReanalysis(rep.id)}
                  loading={isAnalyzing}
                  icon={<RotateCw className="w-3.5 h-3.5 text-cyan-400" />}
                >
                  RE-ANALYZE
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
