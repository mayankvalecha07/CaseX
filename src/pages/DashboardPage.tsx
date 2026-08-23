import React from 'react';
import { useCase } from '../context/CaseContext';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { Button } from '../components/common/Button';
import {
  ScanEye,
  FolderOpen,
  Clock,
  Users,
  MessageSquareQuote,
  Video,
  FlaskConical,
  Network,
  Cpu,
  Gavel,
  ShieldAlert,
  MapPin,
  Calendar,
  ArrowRight,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardPageProps {
  navigate: (route: string) => void;
  onOpenCaseSelector: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  navigate,
  onOpenCaseSelector
}) => {
  const { selectedCase } = useCase();
  const { user } = useAuth();

  if (!selectedCase) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-mono text-cyan-400">NO ACTIVE CASE LOADED</h2>
        <Button variant="primary" onClick={() => navigate('/cases')} className="mt-4">
          Browse Case Library
        </Button>
      </div>
    );
  }

  const collectedEvidenceCount = selectedCase.evidenceList.filter(
    (e) => e.status === 'COLLECTED'
  ).length;

  const inspectedHotspotsCount = selectedCase.crimeScene.hotspots.filter(
    (h) => h.inspected
  ).length;

  const verifiedWitnessesCount = selectedCase.witnesses.filter(
    (w) => w.verificationStatus === 'VERIFIED'
  ).length;

  const modules = [
    {
      id: '/crime-scene',
      title: 'CRIME SCENE',
      subtitle: `${inspectedHotspotsCount}/${selectedCase.crimeScene.hotspots.length} HOTSPOTS LOGGED`,
      description: 'Explore 3D coordinates with Normal, UV, and IR forensic spectrums.',
      icon: <ScanEye className="w-5 h-5 text-cyan-400" />,
      color: 'cyan'
    },
    {
      id: '/evidence',
      title: 'EVIDENCE LOCKER',
      subtitle: `${collectedEvidenceCount}/${selectedCase.evidenceList.length} COLLECTED`,
      description: 'Physical, biological, trace, and digital chain-of-custody archive.',
      icon: <FolderOpen className="w-5 h-5 text-cyan-400" />,
      color: 'cyan'
    },
    {
      id: '/timeline',
      title: 'TIMELINE BUILDER',
      subtitle: `${selectedCase.timeline.length} CHRONO EVENTS`,
      description: 'Sequence incident timestamps and evaluate timeline coherence score.',
      icon: <Clock className="w-5 h-5 text-emerald-400" />,
      color: 'emerald'
    },
    {
      id: '/suspects',
      title: 'SUSPECT MATRIX',
      subtitle: `${selectedCase.suspects.length} PERSONS OF INTEREST`,
      description: 'Compare alibis, DNA/fingerprint matches, and algorithmic risk ratings.',
      icon: <Users className="w-5 h-5 text-amber-400" />,
      color: 'amber'
    },
    {
      id: '/witnesses',
      title: 'WITNESS INTERVIEW',
      subtitle: `${verifiedWitnessesCount}/${selectedCase.witnesses.length} STATEMENTS VERIFIED`,
      description: 'Conduct simulated cross-examinations and test credibility indexes.',
      icon: <MessageSquareQuote className="w-5 h-5 text-purple-400" />,
      color: 'purple'
    },
    {
      id: '/cctv',
      title: 'CCTV SURVEILLANCE',
      subtitle: `${selectedCase.cctvFeeds.length} OPTICAL CHANNELS`,
      description: 'Scrub timecoded footage, analyze frame anomalies, and capture visual proof.',
      icon: <Video className="w-5 h-5 text-rose-400" />,
      color: 'red'
    },
    {
      id: '/forensics',
      title: 'FORENSICS LAB',
      subtitle: `${selectedCase.forensics.length} SCIENTIFIC REPORTS`,
      description: 'Mass spectrometry, toxicology assays, and DNA sequencing findings.',
      icon: <FlaskConical className="w-5 h-5 text-cyan-400" />,
      color: 'cyan'
    },
    {
      id: '/detective-board',
      title: 'DETECTIVE BOARD',
      subtitle: `${selectedCase.boardNodes.length} PINNED CLUES`,
      description: 'Spatial investigation canvas linking evidence nodes and motive strings.',
      icon: <Network className="w-5 h-5 text-blue-400" />,
      color: 'blue'
    },
    {
      id: '/ai-deduction',
      title: 'AI DEDUCTION',
      subtitle: `${selectedCase.deductionMetrics.solvabilityRating}% SOLVABILITY INDEX`,
      description: 'Automated synthesis of contradictions and hypothesis probability.',
      icon: <Cpu className="w-5 h-5 text-purple-400" />,
      color: 'purple'
    },
    {
      id: '/warrant',
      title: 'FINAL ARREST WARRANT',
      subtitle: selectedCase.warrantData.warrantIssued ? 'WARRANT EXECUTED' : 'AWAITING FILING',
      description: 'Present judicial probable cause dossier to conclude investigation.',
      icon: <Gavel className="w-5 h-5 text-amber-400" />,
      color: selectedCase.warrantData.warrantIssued ? 'emerald' : 'amber'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Banner: Active Case Command Header */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)] relative overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider">
                CASE #{selectedCase.id}
              </span>
              <Badge
                variant={selectedCase.priority === 'CRITICAL' ? 'red' : 'amber'}
                size="sm"
              >
                PRIORITY: {selectedCase.priority}
              </Badge>
              <Badge variant="cyan" size="sm" dot>
                {selectedCase.status}
              </Badge>
              <Badge variant="slate" size="sm">
                {selectedCase.type}
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold font-hud text-white tracking-wide">
              {selectedCase.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-300">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>{selectedCase.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>{selectedCase.incidentDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                <span>LEAD: {selectedCase.leadInvestigator}</span>
              </div>
            </div>
          </div>

          {/* Quick Switch Button & Progress Indicator */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={onOpenCaseSelector}
              className="text-xs"
            >
              SWITCH INVESTIGATION
            </Button>

            <div className="w-full sm:w-56 text-right">
              <ProgressBar
                value={selectedCase.progress}
                label="TOTAL CASE SOLVABILITY"
                size="md"
                variant={selectedCase.progress > 70 ? 'emerald' : 'cyan'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          label="EVIDENCE FILES"
          value={selectedCase.evidenceList.length}
          subValue={`${collectedEvidenceCount} Collected`}
          icon={<FolderOpen className="w-4 h-4" />}
          variant="cyan"
        />

        <StatCard
          label="SUSPECTS"
          value={selectedCase.suspects.length}
          subValue="Persons of Interest"
          icon={<Users className="w-4 h-4" />}
          variant="amber"
        />

        <StatCard
          label="WITNESSES"
          value={selectedCase.witnesses.length}
          subValue={`${verifiedWitnessesCount} Verified`}
          icon={<MessageSquareQuote className="w-4 h-4" />}
          variant="purple"
        />

        <StatCard
          label="TIMELINE"
          value={selectedCase.timeline.length}
          subValue="Events Logged"
          icon={<Clock className="w-4 h-4" />}
          variant="emerald"
        />

        <StatCard
          label="CCTV FEEDS"
          value={selectedCase.cctvFeeds.length}
          subValue="Optical Streams"
          icon={<Video className="w-4 h-4" />}
          variant="red"
        />

        <StatCard
          label="DEDUCTION"
          value={`${selectedCase.deductionMetrics.solvabilityRating}%`}
          subValue="Coherence Score"
          icon={<Cpu className="w-4 h-4" />}
          variant="purple"
        />
      </div>

      {/* Central Interactive Modules Navigation Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            INVESTIGATION WORKSTATIONS & MODULES
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            ALL SYSTEMS READY // SELECT MODULE TO PROCEED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((m, idx) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.03 }}
              onClick={() => navigate(m.id)}
              className="p-5 rounded-2xl bg-white/5 hover:bg-white/[0.08] border border-white/10 hover:border-cyan-500/50 transition-all duration-200 cursor-pointer group flex flex-col justify-between hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-cyan-500/40 transition-colors">
                    {m.icon}
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-cyan-300 border border-white/10 font-semibold">
                    {m.subtitle}
                  </span>
                </div>

                <h4 className="text-base font-bold font-hud text-white group-hover:text-cyan-300 transition-colors">
                  {m.title}
                </h4>

                <p className="text-xs font-mono text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {m.description}
                </p>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5 text-xs font-mono text-cyan-400">
                <span className="text-[10px] text-slate-500 group-hover:text-slate-400">
                  OPEN TERMINAL
                </span>
                <span className="group-hover:translate-x-1 transition-transform flex items-center gap-1 font-bold">
                  LAUNCH <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Case Executive Findings & Hypotheses */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
        <h4 className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          CURRENT SYNTHESIZED WORKING HYPOTHESIS
        </h4>

        <p className="text-sm font-mono text-slate-200 leading-relaxed bg-black/40 p-4 rounded-xl border border-white/10">
          "{selectedCase.deductionMetrics.primaryHypothesis}"
        </p>

        <div className="space-y-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
            KEY CONFIRMED FINDINGS:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {selectedCase.deductionMetrics.keyFindings.map((finding, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-slate-300"
              >
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>{finding}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
