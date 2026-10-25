import React from 'react';
import { useCase } from '../context/CaseContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  ShieldAlert,
  FolderOpen,
  Lock,
  Activity,
  Cpu,
  ScanEye,
  ArrowRight,
  Database,
  Radio,
  CheckCircle,
  Clock,
  Sparkles,
  Flame
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

interface LandingPageProps {
  navigate?: (route: string) => void;
  onViewCasePreview?: (caseId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  navigate: propNavigate,
  onViewCasePreview: propOnViewCasePreview
}) => {
  const routerNavigate = useNavigate();
  const navigate = propNavigate || routerNavigate;
  const onViewCasePreview = propOnViewCasePreview || ((id: string) => navigate(`/cases/${id}`));

  const { cases } = useCase();
  const { isAuthenticated, openAuthModal } = useAuth();
  // Public visitors see only explicitly seeded fictional records, never a user's workspace data.
  const demoCases = cases.filter((item) => item.tags?.some((tag) => ['SAMPLE-DATA', 'FICTIONAL'].includes(tag.toUpperCase())));
  const publicCases = isAuthenticated ? cases : demoCases;
  const demoEvidenceCount = demoCases.reduce((sum, item) => sum + (item.evidenceCount || 0), 0);
  const capabilities = [
    { icon: FolderOpen, title: 'Case workspace', text: 'Keep case details, assignments, status, and investigative progress together in one workspace.' },
    { icon: Database, title: 'Evidence custody', text: 'Catalog collected items, record review decisions, and follow how evidence connects to a case.' },
    { icon: Activity, title: 'People & interviews', text: 'Organize suspect and witness profiles, interview notes, and their links to active investigations.' },
    { icon: Clock, title: 'Investigation timeline', text: 'Arrange reported events and investigative actions into a clear, case-linked sequence.' },
    { icon: Radio, title: 'CCTV review', text: 'Review available camera sources and keep surveillance observations attached to the investigation.' },
    { icon: ScanEye, title: 'Reports & analysis', text: 'Bring case records into report and deduction views to support a more complete review.' },
  ];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Background forensic radar / grid effect */}
      <div className="absolute inset-0 forensic-grid opacity-60 pointer-events-none" />
      <div className="absolute inset-0 forensic-dots opacity-40 pointer-events-none" />

      {/* Decorative ambient radial gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16 w-full">
        {/* System HUD Status Bar */}
        <div className="hidden">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">SYSTEM STATUS:</span>
            <span className="text-amber-400 font-bold">DEMO MODE</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-slate-300">CASE DATABASE:</span>
            <span className="text-cyan-400 font-bold">READY ({cases.length} TOTAL)</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span className="text-slate-300">FORENSIC ENGINE:</span>
            <span className="text-purple-400 font-bold">READY</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-slate-300">NETWORK:</span>
            <span className="text-cyan-300 font-bold">SECURE 256-BIT</span>
          </div>
        </div>

        {/* Hero Central Header */}
        <div className="text-center max-w-4xl mx-auto space-y-6 py-8 lg:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-mono tracking-widest uppercase shadow-[0_0_20px_rgba(6,182,212,0.15)]"
          >
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <span>CLASSIFIED FORENSIC INTELLIGENCE SYSTEM</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-hud tracking-wider text-white leading-tight"
          >
            CASE<span className="text-cyan-400">X</span>
            <span className="block text-2xl sm:text-4xl lg:text-5xl mt-2 text-slate-300 font-medium tracking-normal">
              DIGITAL CRIME SCENE <br className="hidden sm:inline" />
              INVESTIGATION PLATFORM
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl font-mono text-cyan-300/90 max-w-2xl mx-auto italic tracking-wide"
          >
            "Every Detail Matters."
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="text-xs sm:text-sm font-mono text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Explore interactive crime scenes, catalog biometrics in evidence lockers, reconstruct timeline sequences, interrogate witnesses, review surveillance feeds, and build prosecutorial warrants.
          </motion.p>

          {/* Primary Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                if (!isAuthenticated) {
                  openAuthModal(undefined, '/cases', 'signin');
                } else {
                  navigate('/cases');
                }
              }}
              icon={<FolderOpen className="w-5 h-5" />}
              className="w-full sm:w-auto text-sm px-8 py-4 shadow-[0_0_30px_rgba(6,182,212,0.5)]"
            >
              EXPLORE CASES
            </Button>

            {!isAuthenticated ? (
              <Button
                variant="secondary"
                size="lg"
                onClick={() => openAuthModal(undefined, '/dashboard', 'signin')}
                icon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto text-sm px-7 py-4"
              >
                OPEN WORKSTATION
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/dashboard')}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
                className="w-full sm:w-auto text-sm px-7 py-4"
              >
                OPEN WORKSTATION
              </Button>
            )}
          </motion.div>
        </div>

        {!isAuthenticated && (
          <section className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3" aria-label="Demo workspace statistics">
            {[
              { value: demoCases.length, label: 'FICTIONAL CASE FILES' },
              { value: demoCases.reduce((sum, item) => sum + (item.suspectCount || 0), 0), label: 'LINKED SUSPECTS' },
              { value: demoCases.reduce((sum, item) => sum + (item.witnessCount || 0), 0), label: 'WITNESS PROFILES' },
              { value: demoEvidenceCount, label: 'EVIDENCE ITEMS' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-cyan-500/20 bg-slate-950/70 px-4 py-5 text-center">
                <div className="font-hud text-2xl sm:text-3xl text-cyan-300">{stat.value}</div>
                <div className="mt-1 text-[9px] sm:text-[10px] font-mono tracking-widest text-slate-500">{stat.label}</div>
              </div>
            ))}
          </section>
        )}

        <section className="mt-16 lg:mt-20" aria-labelledby="platform-capabilities">
          <div className="mb-7 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <p className="text-[10px] font-mono tracking-[0.22em] text-cyan-400">INVESTIGATION TOOLKIT</p>
              <h2 id="platform-capabilities" className="mt-2 text-2xl sm:text-3xl font-hud font-bold text-white">One workspace for every lead</h2>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-slate-400">Connect the people, evidence, observations, and decisions that move an investigation forward.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {capabilities.map(({ icon: Icon, title, text: description }, index) => (
              <motion.article key={title} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: index * 0.04 }} className="rounded-2xl border border-white/10 bg-slate-950/70 p-5 sm:p-6 hover:border-cyan-500/35 transition-colors">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300"><Icon className="h-5 w-5" /></span>
                <h3 className="mt-4 font-hud font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
              </motion.article>
            ))}
          </div>
        </section>

        {/* Fictional sample case previews */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 lg:mt-20"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <h3 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-widest">
                ACTIVE CASE PREVIEWS
              </h3>
            </div>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  openAuthModal(undefined, '/cases', 'signin');
                } else {
                  navigate('/cases');
                }
              }}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>{isAuthenticated ? `VIEW FULL CASE ARCHIVE (${cases.length})` : 'SIGN IN TO OPEN CASE ARCHIVE'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mini Preview Cards Carousel Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {publicCases.slice(0, 3).map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  if (!isAuthenticated) {
                    openAuthModal(c.id, '/cases', 'signin');
                  } else {
                    onViewCasePreview(c.id);
                  }
                }}
                className="p-5 rounded-2xl bg-white/5 hover:bg-white/[0.08] border border-white/10 hover:border-cyan-500/40 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">
                      CASE FILE · {c.id}
                    </span>
                    <Badge variant={c.priority === 'CRITICAL' ? 'red' : 'amber'} size="sm">
                      {c.priority}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-bold font-hud text-white group-hover:text-cyan-300 transition-colors">
                    {c.title}
                  </h4>
                  <p className="text-[11px] font-mono text-slate-400 mt-1 line-clamp-2">
                    {c.shortDescription}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5 text-[10px] font-mono text-slate-400">
                  <span>{c.evidenceCount || 0} EVIDENCE ITEMS</span>
                  <span className="text-cyan-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    PREVIEW <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
        {!isAuthenticated && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-5 sm:px-7">
            <div>
              <p className="font-hud font-bold text-white">Demo records are fictional</p>
              <p className="mt-1 text-sm text-slate-400">Sign in to open your cases and continue work in your investigation workspace.</p>
            </div>
            <Button variant="primary" onClick={() => openAuthModal(undefined, '/dashboard', 'signin')} icon={<Lock className="w-4 h-4" />} className="shrink-0">LOGIN TO CASEX</Button>
          </div>
        )}
      </div>
    </div>
  );
};
