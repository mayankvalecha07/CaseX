import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  Cpu,
  Gavel,
  ShieldAlert,
  MapPin,
  Calendar,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Plus,
  FileText,
  Activity,
  Layers,
  Sparkles,
  Globe,
  Star,
  CheckSquare,
  Square,
  Bell,
  Server,
  Eye,
  Send,
  CalendarDays,
  ShieldCheck,
  Flame,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';
import { formatDateTime } from '../utils/dateTime';

interface DashboardPageProps {
  navigate?: (route: string) => void;
  onOpenCaseSelector?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  navigate: propNavigate,
  onOpenCaseSelector
}) => {
  const routerNavigate = useNavigate();
  const navigate = propNavigate || routerNavigate;

  const {
    selectedCase,
    cases,
    recentCases,
    activities,
    preferences,
    switchCase,
    resetCase,
    getCaseActivities,
    tasks,
    updateTaskStatus,
    notes,
    addNote,
    deleteNote,
    notifications,
    markNotificationRead,
    favoriteCaseIds,
    toggleFavoriteCase,
    recentlyViewed,
    showToast
  } = useCase();

  const { user } = useAuth();
  const [confirmReset, setConfirmReset] = useState(false);

  // Quick Note state
  const [quickNoteTitle, setQuickNoteTitle] = useState('');
  const [quickNoteContent, setQuickNoteContent] = useState('');
  const [quickNoteCategory, setQuickNoteCategory] = useState<'CLUE' | 'HYPOTHESIS' | 'FORENSIC_LEAD' | 'GENERAL'>('CLUE');

  // Real API & Server Health Status
  const [apiHealth, setApiHealth] = useState<{
    online: boolean;
    uptime?: number;
    emailConfigured: boolean;
    emailUser?: string | null;
    loading: boolean;
  }>({
    online: false,
    emailConfigured: false,
    loading: true
  });

  useEffect(() => {
    let isMounted = true;
    const checkHealth = async () => {
      try {
        const [healthRes, emailRes] = await Promise.all([
          fetch('/api/health').catch(() => null),
          fetch('/api/auth/email-config-status').catch(() => null)
        ]);

        const healthData = healthRes && healthRes.ok ? await healthRes.json() : null;
        const emailData = emailRes && emailRes.ok ? await emailRes.json() : null;

        if (isMounted) {
          setApiHealth({
            online: !!healthData && healthData.status === 'ok',
            uptime: healthData?.uptime,
            emailConfigured: !!emailData?.configured,
            emailUser: emailData?.user || null,
            loading: false
          });
        }
      } catch (err) {
        if (isMounted) {
          setApiHealth(prev => ({ ...prev, online: false, loading: false }));
        }
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (!selectedCase) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center font-mono">
        <h2 className="text-xl text-cyan-400 font-bold mb-3">NO ACTIVE CASE LOADED</h2>
        <p className="text-xs text-slate-400 mb-6">Select or register an investigation case to initiate the Command Center.</p>
        <Button variant="primary" onClick={() => navigate('/cases')}>
          Browse Case Library
        </Button>
      </div>
    );
  }

  // Derive all data-driven statistics directly from real application state
  const totalCasesCount = cases.length;
  const activeCasesCount = cases.filter(c => c.status === 'ACTIVE').length;
  const underReviewCasesCount = cases.filter(c => c.status === 'UNDER INVESTIGATION').length;
  const solvedCasesCount = cases.filter(c => c.status === 'SOLVED').length;
  const pendingCasesCount = cases.filter(c => c.status === 'COLD CASE' || c.status === 'RESTRICTED').length;

  const allEvidence = cases.flatMap(c => c.evidenceList);
  const totalEvidenceCount = allEvidence.length;
  const collectedEvidenceCount = selectedCase.evidenceList.filter(e => e.status === 'COLLECTED').length;
  const verifiedEvidenceCount = selectedCase.evidenceList.filter(e => e.analysisResults?.verified).length;
  const awaitingReviewCount = allEvidence.filter(e => e.reviewStatus !== 'REVIEWED').length;

  const totalSuspectsCount = cases.reduce((acc, c) => acc + c.suspects.length, 0);
  const totalWitnessesCount = cases.reduce((acc, c) => acc + c.witnesses.length, 0);

  const pendingTasksCount = tasks.filter(t => t.status !== 'COMPLETED').length;
  const progressPercent = selectedCase.progress;

  const inspectedHotspotsCount = selectedCase.crimeScene.hotspots.filter(h => h.inspected).length;
  const verifiedWitnessesCount = selectedCase.witnesses.filter(w => w.verificationStatus === 'VERIFIED').length;

  const caseActivities = getCaseActivities(selectedCase.id);
  const caseTasks = tasks.filter(t => t.caseId === selectedCase.id || !t.caseId);
  const caseNotes = notes.filter(n => n.caseId === selectedCase.id);
  const casePendingEvidence = selectedCase.evidenceList.filter(item => item.reviewStatus !== 'REVIEWED').length;
  const caseOpenTasks = caseTasks.filter(task => task.status !== 'COMPLETED').length;
  const caseActiveLeads = selectedCase.suspects.filter(suspect => suspect.status !== 'CLEAR').length;
  const caseWitnessFollowUps = selectedCase.witnesses.filter(witness => witness.verificationStatus !== 'VERIFIED').length;
  const caseFlaggedEvents = selectedCase.timeline.filter(event => event.flaggedInconsistency || event.flagged).length;
  const casePendingForensics = selectedCase.forensics.filter(report => report.status !== 'COMPLETED').length;
  const caseNetworkSources = selectedCase.cctvFeeds.filter(feed => Boolean(feed.streamUrl)).length;
  const caseBoardLinks = selectedCase.boardConnections.length;
  const favoriteCases = cases.filter(c => favoriteCaseIds.includes(c.id));

  // Current formatted date
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Priority alerts calculation
  const criticalCases = cases.filter(c => c.priority === 'CRITICAL' && c.status !== 'SOLVED');
  const overdueTasks = tasks.filter(t => t.status !== 'COMPLETED' && t.dueDate && new Date(t.dueDate) < new Date());
  const pendingExhibits = allEvidence.filter(e => e.reviewStatus !== 'REVIEWED' && e.status === 'COLLECTED');
  const recentGlobalActivity = activities.filter(activity => cases.some(item => item.id === activity.caseId)).slice(0, 4);
  const upcomingInterviews = cases.flatMap(item => item.witnesses
    .filter(witness => witness.nextInterviewDate && Date.parse(witness.nextInterviewDate) >= Date.now())
    .map(witness => ({ caseId: item.id, caseTitle: item.title, witness })))
    .sort((a, b) => Date.parse(a.witness.nextInterviewDate || '') - Date.parse(b.witness.nextInterviewDate || '')).slice(0, 4);
  const recentTimelineEvents = cases.flatMap(item => item.timeline.map(event => ({ caseId: item.id, caseTitle: item.title, event })))
    .sort((a, b) => `${b.event.date || ''} ${b.event.time}`.localeCompare(`${a.event.date || ''} ${a.event.time}`)).slice(0, 4);

  const handleSaveQuickNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNoteContent.trim()) return;

    addNote({
      caseId: selectedCase.id,
      title: quickNoteTitle.trim() || `Clue Observation #${Date.now().toString().slice(-4)}`,
      content: quickNoteContent.trim(),
      category: quickNoteCategory,
      author: user?.name || 'Investigator'
    });

    setQuickNoteTitle('');
    setQuickNoteContent('');
    showToast('Quick investigation note recorded.');
  };

  const handleToggleTask = (task: typeof tasks[0]) => {
    const nextStatus = task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    updateTaskStatus(task.id, nextStatus);
    showToast(`Task updated to ${nextStatus.replace('_', ' ')}.`);
  };

  const modules = [
    {
      id: `/cases/${selectedCase.id}/crime-scene`,
      title: 'CRIME SCENE',
      subtitle: `${inspectedHotspotsCount}/${selectedCase.crimeScene.hotspots.length} HOTSPOTS LOGGED`,
      description: 'Explore 2D coordinates with Normal, UV, and IR forensic spectrums.',
      icon: <ScanEye className="w-5 h-5 text-cyan-400" />
    },
    {
      id: `/cases/${selectedCase.id}/evidence`,
      title: 'EVIDENCE LOCKER',
      subtitle: `${collectedEvidenceCount}/${selectedCase.evidenceList.length} COLLECTED`,
      description: 'Physical, biological, trace, and digital chain-of-custody archive.',
      icon: <FolderOpen className="w-5 h-5 text-emerald-400" />
    },
    {
      id: `/cases/${selectedCase.id}/timeline`,
      title: 'TIMELINE BUILDER',
      subtitle: `${selectedCase.timeline.length} CHRONO EVENTS`,
      description: 'Sequence incident timestamps and evaluate timeline coherence score.',
      icon: <Clock className="w-5 h-5 text-amber-400" />
    },
    {
      id: `/cases/${selectedCase.id}/suspects`,
      title: 'SUSPECT MATRIX',
      subtitle: `${selectedCase.suspects.length} PERSONS OF INTEREST`,
      description: 'Compare alibis, DNA/fingerprint matches, and algorithmic risk ratings.',
      icon: <Users className="w-5 h-5 text-purple-400" />
    },
    {
      id: `/cases/${selectedCase.id}/witnesses`,
      title: 'WITNESS INTERVIEWS',
      subtitle: `${verifiedWitnessesCount}/${selectedCase.witnesses.length} STATEMENTS VERIFIED`,
      description: 'Conduct simulated cross-examinations and test credibility indexes.',
      icon: <MessageSquareQuote className="w-5 h-5 text-rose-400" />
    },
    {
      id: `/cases/${selectedCase.id}/notes`,
      title: 'INVESTIGATION NOTES',
      subtitle: `${caseNotes.length} RECORDED NOTES`,
      description: 'Log detective theories, link evidence exhibits, and catalog case notes.',
      icon: <FileText className="w-5 h-5 text-cyan-400" />
    },
    {
      id: `/cases/${selectedCase.id}/cctv`,
      title: 'CCTV SURVEILLANCE',
      subtitle: `${selectedCase.cctvFeeds.length} OPTICAL CHANNELS`,
      description: 'Scrub timecoded footage, analyze frame anomalies, and capture visual proof.',
      icon: <Video className="w-5 h-5 text-rose-400" />
    },
    {
      id: `/cases/${selectedCase.id}/forensics`,
      title: 'FORENSICS LAB',
      subtitle: `${selectedCase.forensics.length} SCIENTIFIC REPORTS`,
      description: 'Mass spectrometry, toxicology assays, and DNA sequencing findings.',
      icon: <FlaskConical className="w-5 h-5 text-cyan-400" />
    },
    {
      id: `/cases/${selectedCase.id}/warrant`,
      title: 'FINAL ARREST WARRANT',
      subtitle: selectedCase.warrantData.warrantIssued ? 'WARRANT EXECUTED' : 'AWAITING FILING',
      description: 'Present judicial probable cause dossier to conclude investigation.',
      icon: <Gavel className="w-5 h-5 text-amber-400" />
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* 1. Welcome Header & Real Shortcuts */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/10 font-mono">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">
              CASEX COMMAND CENTER // {todayFormatted.toUpperCase()}
            </span>
          </div>
          <h2 className="font-hud font-bold text-2xl sm:text-3xl text-white tracking-wide">
            WELCOME, {user?.name ? user.name.toUpperCase() : 'LEAD INVESTIGATOR'}.
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Digital Forensics & Incident Dossier • Active Case #{selectedCase.id}
          </p>
        </div>

        {/* Action Buttons from Section 2 */}
        <div className="hidden">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/cases/new')}
            icon={<Plus className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            CREATE CASE
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/cases/${selectedCase.id}/evidence/new`)}
            icon={<FolderOpen className="w-3.5 h-3.5 text-emerald-400" />}
            className="text-xs"
          >
            ADD EVIDENCE
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/tasks`)}
            icon={<CheckSquare className="w-3.5 h-3.5 text-purple-400" />}
            className="text-xs"
          >
            CREATE TASK
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/cases')}
            icon={<Layers className="w-3.5 h-3.5 text-cyan-400" />}
            className="text-xs"
          >
            VIEW CASES
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/intelligence')}
            icon={<Globe className="w-3.5 h-3.5 text-amber-400" />}
            className="text-xs border border-white/10"
          >
            EXTERNAL INTEL
          </Button>
        </div>
      </div>

      {/* 2. Active Case Command Overview Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)] relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-400/30">
                CASE #{selectedCase.id}
              </span>
              <Badge
                variant={selectedCase.priority === 'CRITICAL' ? 'rose' : 'amber'}
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

            <h1 className="text-2xl sm:text-3xl font-bold font-hud text-white tracking-wide">
              {selectedCase.title}
            </h1>

            <p className="font-mono text-xs text-slate-300 leading-relaxed">
              {selectedCase.shortDescription}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1">
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
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/cases/${selectedCase.id}/workspace`)}
                icon={<Cpu className="w-3.5 h-3.5 text-cyan-400" />}
                className="text-xs"
              >
                WORKSPACE
              </Button>

              {onOpenCaseSelector && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onOpenCaseSelector}
                  className="text-xs"
                >
                  SWITCH CASE
                </Button>
              )}

              {confirmReset ? (
                <div className="flex items-center gap-1.5 bg-slate-900 border border-rose-500/50 p-1 rounded-lg">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      resetCase(selectedCase.id);
                      setConfirmReset(false);
                    }}
                    className="text-[10px] py-1 px-2 bg-rose-600 hover:bg-rose-500 text-white"
                  >
                    RESET NOW
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmReset(false)}
                    className="text-[10px] py-1 px-2 text-slate-400"
                  >
                    CANCEL
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmReset(true)}
                  icon={<RotateCcw className="w-3.5 h-3.5 text-cyan-400" />}
                  className="text-xs border border-white/10 hover:border-cyan-500/40 text-slate-300"
                >
                  RESET
                </Button>
              )}
            </div>

            <div className="w-full sm:w-56 text-right">
              <ProgressBar
                value={progressPercent}
                label="CASE TASK PROGRESS"
                size="md"
                variant={progressPercent > 70 ? 'emerald' : 'cyan'}
              />
            </div>
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4 font-mono">
        <article className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#0b1726] to-[#090d16] border border-cyan-500/20 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] tracking-widest uppercase font-bold text-cyan-300">Case file briefing</span>
            {selectedCase.tags?.includes('SAMPLE-DATA') || selectedCase.tags?.includes('FICTIONAL') ? <Badge variant="purple" size="sm">FICTIONAL DEMO RECORD</Badge> : null}
          </div>
          <h2 className="text-lg font-bold font-hud text-white">{selectedCase.title}</h2>
          <p className="text-xs text-slate-300 leading-relaxed">{selectedCase.fullBriefing || selectedCase.shortDescription}</p>
          <p className="text-[11px] text-slate-400 leading-relaxed">This briefing summarizes the selected shared case file. Confirm source documents and independently verify recorded statements before relying on any detail.</p>
        </article>
        <article className="p-5 rounded-2xl bg-[#0a0f1d] border border-white/10 space-y-3">
          <h3 className="text-[10px] tracking-widest uppercase font-bold text-amber-300">Current investigation focus</h3>
          <p className="text-xs text-slate-300 leading-relaxed">{casePendingEvidence ? `${casePendingEvidence} evidence item(s) in this case still need review.` : 'No evidence review is currently pending for this case.'} {caseOpenTasks ? `${caseOpenTasks} investigation task(s) remain open.` : 'No open case tasks are recorded.'}</p>
          <p className="text-xs text-slate-400 leading-relaxed">{verifiedWitnessesCount} of {selectedCase.witnesses.length} witness record(s) are marked verified; the case timeline currently contains {selectedCase.timeline.length} event(s). These are record statuses and counts, not conclusions about responsibility.</p>
          <p className="text-[11px] text-cyan-200 leading-relaxed">Suggested workflow: review pending exhibits, document witness follow-up, and add task progress only as investigation work is completed.</p>
        </article>
      </section>

      {/* 3. Comprehensive Data-Driven Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 font-mono">
        <StatCard
          label="TOTAL CASES"
          value={totalCasesCount}
          subValue={`${solvedCasesCount} Solved • ${underReviewCasesCount} Under review • ${pendingCasesCount} Cold / restricted`}
          icon={<Layers className="w-4 h-4" />}
          variant="cyan"
        />

        <StatCard
          label="ACTIVE CASES"
          value={activeCasesCount}
          subValue="Active Operations"
          icon={<ShieldAlert className="w-4 h-4" />}
          variant="amber"
        />

        <StatCard
          label="TOTAL EVIDENCE"
          value={totalEvidenceCount}
          subValue={`${collectedEvidenceCount} in Custody`}
          icon={<FolderOpen className="w-4 h-4" />}
          variant="cyan"
        />

        <StatCard
          label="AWAITING REVIEW"
          value={awaitingReviewCount}
          subValue="Evidence Triage Queue"
          icon={<FlaskConical className="w-4 h-4" />}
          variant="rose"
        />

        <StatCard
          label="PERSONS OF INTEREST"
          value={`${totalSuspectsCount} / ${totalWitnessesCount}`}
          subValue="Suspects / Witnesses"
          icon={<Users className="w-4 h-4" />}
          variant="purple"
        />

        <StatCard
          label="PENDING TASKS"
          value={pendingTasksCount}
          subValue="Action Items Open"
          icon={<CheckSquare className="w-4 h-4" />}
          variant={pendingTasksCount > 5 ? 'amber' : 'emerald'}
        />
      </div>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-widest">Selected Case Points</h3>
            <p className="mt-1 text-[10px] font-mono text-slate-500">Live counts from {selectedCase.id}; open a section to review its linked records.</p>
          </div>
          <span className="text-[9px] font-mono text-slate-500">UPDATED FROM SHARED CASE DATA</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 font-mono">
          <Link to={`/cases/${selectedCase.id}/suspects`} className="p-4 rounded-xl bg-[#0a0f1d] border border-white/10 hover:border-amber-400/40 transition-colors"><span className="block text-[10px] uppercase text-amber-300">Suspect leads</span><strong className="block mt-1 text-xl text-white">{caseActiveLeads} <span className="text-xs font-normal text-slate-500">/ {selectedCase.suspects.length}</span></strong><span className="block mt-1 text-[10px] text-slate-500">Records not marked clear; not a finding of guilt.</span></Link>
          <Link to={`/cases/${selectedCase.id}/witnesses`} className="p-4 rounded-xl bg-[#0a0f1d] border border-white/10 hover:border-purple-400/40 transition-colors"><span className="block text-[10px] uppercase text-purple-300">Witness follow-up</span><strong className="block mt-1 text-xl text-white">{caseWitnessFollowUps} <span className="text-xs font-normal text-slate-500">unverified</span></strong><span className="block mt-1 text-[10px] text-slate-500">{selectedCase.witnesses.length} witness record(s) on this case.</span></Link>
          <Link to={`/cases/${selectedCase.id}/evidence`} className="p-4 rounded-xl bg-[#0a0f1d] border border-white/10 hover:border-cyan-400/40 transition-colors"><span className="block text-[10px] uppercase text-cyan-300">Evidence review</span><strong className="block mt-1 text-xl text-white">{casePendingEvidence} <span className="text-xs font-normal text-slate-500">pending</span></strong><span className="block mt-1 text-[10px] text-slate-500">Of {selectedCase.evidenceList.length} linked exhibits.</span></Link>
          <Link to={`/cases/${selectedCase.id}/timeline`} className="p-4 rounded-xl bg-[#0a0f1d] border border-white/10 hover:border-rose-400/40 transition-colors"><span className="block text-[10px] uppercase text-rose-300">Timeline checks</span><strong className="block mt-1 text-xl text-white">{caseFlaggedEvents} <span className="text-xs font-normal text-slate-500">flagged</span></strong><span className="block mt-1 text-[10px] text-slate-500">{selectedCase.timeline.length} recorded events.</span></Link>
          <Link to={`/cases/${selectedCase.id}/forensics`} className="p-4 rounded-xl bg-[#0a0f1d] border border-white/10 hover:border-emerald-400/40 transition-colors"><span className="block text-[10px] uppercase text-emerald-300">Forensics reports</span><strong className="block mt-1 text-xl text-white">{selectedCase.forensics.length} <span className="text-xs font-normal text-slate-500">total</span></strong><span className="block mt-1 text-[10px] text-slate-500">{casePendingForensics} report(s) not marked complete.</span></Link>
          <Link to={`/cases/${selectedCase.id}/cctv`} className="p-4 rounded-xl bg-[#0a0f1d] border border-white/10 hover:border-cyan-400/40 transition-colors"><span className="block text-[10px] uppercase text-cyan-300">Camera sources</span><strong className="block mt-1 text-xl text-white">{caseNetworkSources} <span className="text-xs font-normal text-slate-500">connected</span></strong><span className="block mt-1 text-[10px] text-slate-500">Browser-playable network sources saved to this case.</span></Link>
          <Link to={`/cases/${selectedCase.id}/detective-board`} className="p-4 rounded-xl bg-[#0a0f1d] border border-white/10 hover:border-rose-400/40 transition-colors"><span className="block text-[10px] uppercase text-rose-300">Board connections</span><strong className="block mt-1 text-xl text-white">{caseBoardLinks} <span className="text-xs font-normal text-slate-500">threads</span></strong><span className="block mt-1 text-[10px] text-slate-500">Among {selectedCase.boardNodes.length} linked board leads.</span></Link>
          <Link to={`/cases/${selectedCase.id}/notes`} className="p-4 rounded-xl bg-[#0a0f1d] border border-white/10 hover:border-indigo-400/40 transition-colors"><span className="block text-[10px] uppercase text-indigo-300">Investigation notes</span><strong className="block mt-1 text-xl text-white">{caseNotes.length} <span className="text-xs font-normal text-slate-500">saved</span></strong><span className="block mt-1 text-[10px] text-slate-500">Shared notes linked to this case file.</span></Link>
          <Link to="/tasks" className="p-4 rounded-xl bg-[#0a0f1d] border border-white/10 hover:border-amber-400/40 transition-colors"><span className="block text-[10px] uppercase text-amber-300">Open case tasks</span><strong className="block mt-1 text-xl text-white">{caseOpenTasks} <span className="text-xs font-normal text-slate-500">open</span></strong><span className="block mt-1 text-[10px] text-slate-500">Progress reflects completed checklist and task items.</span></Link>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 font-mono">
        <section className={`${preferences.showWidgets.recentlyViewed ? '' : 'hidden'} p-4 rounded-2xl bg-[#0a0f1d] border border-white/10 space-y-3`}>
          <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Recent cases</h3>
          {recentCases.length ? recentCases.slice(0, 4).map(item => <Link key={item.id} to={`/cases/${item.id}`} onClick={() => switchCase(item.id)} className="block rounded-lg border border-white/5 p-2 hover:border-cyan-400/40"><span className="block text-[10px] text-cyan-400">{item.id} · {item.status}</span><span className="text-xs text-white">{item.title}</span></Link>) : <p className="text-xs text-slate-500">No recently viewed cases.</p>}
        </section>
        <section className={`${preferences.showWidgets.recentActivity ? '' : 'hidden'} p-4 rounded-2xl bg-[#0a0f1d] border border-white/10 space-y-3`}>
          <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Recent investigation activity</h3>
          {recentGlobalActivity.length ? recentGlobalActivity.map(activity => <div key={activity.id} className="border-b border-white/5 pb-2"><p className="text-xs text-slate-200">{activity.description}</p><span className="text-[10px] text-slate-500">{activity.caseId} · {activity.timestamp}</span></div>) : <p className="text-xs text-slate-500">No activity recorded yet.</p>}
        </section>
        <section className={`${preferences.showWidgets.upcomingEvents ? '' : 'hidden'} p-4 rounded-2xl bg-[#0a0f1d] border border-white/10 space-y-3`}>
          <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">Upcoming witness interviews</h3>
          {upcomingInterviews.length ? upcomingInterviews.map(({ caseId, caseTitle, witness }) => <Link key={`${caseId}-${witness.id}`} to={`/cases/${caseId}/witnesses`} className="block border-b border-white/5 pb-2"><span className="block text-xs text-white">{witness.name}</span><span className="text-[10px] text-slate-400">{caseTitle} · {formatDateTime(witness.nextInterviewDate, preferences.dateTimeFormat)}</span></Link>) : <p className="text-xs text-slate-500">No upcoming interviews scheduled.</p>}
        </section>
        <section className={`${preferences.showWidgets.upcomingEvents ? '' : 'hidden'} p-4 rounded-2xl bg-[#0a0f1d] border border-white/10 space-y-3`}>
          <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider">Recent timeline events</h3>
          {recentTimelineEvents.length ? recentTimelineEvents.map(({ caseId, caseTitle, event }) => <Link key={`${caseId}-${event.id}`} to={`/cases/${caseId}/timeline`} className="block border-b border-white/5 pb-2"><span className="block text-xs text-white">{event.title}</span><span className="text-[10px] text-slate-400">{caseTitle} · {event.date || event.time}</span></Link>) : <p className="text-xs text-slate-500">No timeline events recorded.</p>}
        </section>
        <section className={`${preferences.showWidgets.recentEvidence ? '' : 'hidden'} p-4 rounded-2xl bg-[#0a0f1d] border border-white/10 space-y-3`}>
          <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Recent evidence</h3>
          {allEvidence.length ? [...allEvidence].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 4).map(item => <Link key={item.id} to={`/cases/${cases.find(c => c.evidenceList.some(e => e.id === item.id))?.id || selectedCase.id}/evidence/${item.id}`} className="block border-b border-white/5 pb-2"><span className="block text-xs text-white">{item.title}</span><span className="text-[10px] text-slate-400">{item.code} · {item.reviewStatus === 'REVIEWED' ? 'Reviewed' : 'Pending review'}</span></Link>) : <p className="text-xs text-slate-500">No evidence records.</p>}
        </section>
      </div>

      {/* 4. Priority Alerts Banner (If any) */}
      {preferences.showWidgets.priorityAlerts && (criticalCases.length > 0 || overdueTasks.length > 0 || pendingExhibits.length > 0) && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-start gap-3">
            <Flame className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <div className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>ACTIVE PRIORITY INVESTIGATION ALERTS</span>
                <span className="text-[10px] px-2 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold">
                  {criticalCases.length + overdueTasks.length + pendingExhibits.length} NOTICES
                </span>
              </div>
              <p className="text-slate-300 mt-1">
                {criticalCases.length} Critical Priority Cases active • {overdueTasks.length} Overdue Task Deadlines • {pendingExhibits.length} Unreviewed Exhibits in locker.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/evidence/queue')}
              className="text-[11px] border-rose-500/30 hover:bg-rose-500/20 text-rose-200"
            >
              REVIEW LAB QUEUE
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/tasks')}
              className="text-[11px] border-rose-500/30 hover:bg-rose-500/20 text-rose-200"
            >
              RESOLVE TASKS
            </Button>
          </div>
        </div>
      )}

      {/* 5. Central Interactive Grid: Tasks & Quick Notes & Activity */}
      <div className="grid grid-cols-1 gap-6 font-mono">
        {/* Left Column: Recent Tasks with Direct Interactive Status Toggle */}
        <div className="hidden">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-cyan-400" />
                <h3 className="font-hud font-bold text-xs text-white uppercase tracking-wider">
                  INVESTIGATION TASKS ({caseTasks.length})
                </h3>
              </div>
              <Link to="/tasks" className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                <span>VIEW KANBAN</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2.5 pt-3">
              {caseTasks.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No tasks registered for this case.</p>
              ) : (
                caseTasks.slice(0, 4).map(task => {
                  const isCompleted = task.status === 'COMPLETED';
                  return (
                    <div
                      key={task.id}
                      className={`p-3 rounded-xl border transition-all text-xs flex items-start gap-3 ${
                        isCompleted
                          ? 'bg-white/[0.01] border-white/5 opacity-60'
                          : 'bg-white/[0.02] border-white/10 hover:border-cyan-400/30'
                      }`}
                    >
                      <button
                        onClick={() => handleToggleTask(task)}
                        className="mt-0.5 text-cyan-400 hover:text-cyan-300 cursor-pointer shrink-0"
                        title={isCompleted ? 'Mark incomplete' : 'Mark completed'}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500 hover:text-cyan-400" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`font-bold truncate ${isCompleted ? 'line-through text-slate-500' : 'text-white'}`}>
                            {task.title}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                              task.priority === 'CRITICAL'
                                ? 'bg-rose-500/20 text-rose-300'
                                : task.priority === 'HIGH'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-cyan-500/20 text-cyan-300'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                          <span>{task.category}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {task.dueDate}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/tasks')}
            className="w-full text-xs border border-white/5 hover:border-cyan-500/30 text-slate-300 mt-2"
          >
            OPEN FULL TASK BOARD
          </Button>
        </div>

        {/* Center Column: Shared Investigation Notes */}
        <div className="p-5 rounded-2xl bg-[#0a0f1d] border border-cyan-500/20 space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <h3 className="font-hud font-bold text-xs text-white uppercase tracking-wider">
                  INVESTIGATION NOTES
                </h3>
              </div>
              <Link to={`/cases/${selectedCase.id}/notes`} className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                <span>ALL NOTES</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <form onSubmit={handleSaveQuickNote} className="space-y-3 pt-3">
              <input
                type="text"
                placeholder="Note Title / Clue Ref..."
                value={quickNoteTitle}
                onChange={e => setQuickNoteTitle(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />

              <textarea
                rows={3}
                placeholder="Record rapid hypothesis, witness remark, or forensic lead..."
                value={quickNoteContent}
                onChange={e => setQuickNoteContent(e.target.value)}
                required
                className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />

              <div className="flex items-center justify-between gap-2">
                <select
                  value={quickNoteCategory}
                  onChange={e => setQuickNoteCategory(e.target.value as any)}
                  className="bg-black/60 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-slate-300 focus:outline-none focus:border-cyan-400"
                >
                  <option value="CLUE">CLUE</option>
                  <option value="HYPOTHESIS">HYPOTHESIS</option>
                  <option value="FORENSIC_LEAD">FORENSIC LEAD</option>
                  <option value="GENERAL">GENERAL</option>
                </select>

                <Button variant="primary" size="sm" type="submit" icon={<Send className="w-3 h-3" />} className="text-xs">
                  RECORD NOTE
                </Button>
              </div>
            </form>
          </div>

          {/* Shared investigation notes for the selected case */}
          {caseNotes.length > 0 ? (
            <div className="pt-2 border-t border-white/5 space-y-2">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest block">RECENT CASE NOTES:</span>
              {caseNotes.slice(0, 3).map(note => <article key={note.id} className="p-3 rounded-lg bg-black/25 border border-white/5"><div className="flex justify-between gap-2"><span className="text-xs font-semibold text-cyan-200">{note.title}</span><span className="text-[9px] text-slate-500">{note.category}</span></div><p className="mt-1 text-[11px] text-slate-300 leading-relaxed">{note.content}</p></article>)}
            </div>
          ) : <p className="pt-3 text-xs text-slate-500">No notes saved for this case yet. Add a note above; it will also appear on the Investigation Notes page.</p>}
        </div>

        {/* Right Column: Live Activity Stream & Pinned Favorites */}
        <div className="hidden">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="font-hud font-bold text-xs text-white uppercase tracking-wider">
                  ACTIVITY CHRONOLOGY
                </h3>
              </div>
              <span className="text-[10px] text-slate-500">{caseActivities.length} LOGS</span>
            </div>

            <div className="space-y-2 pt-3">
              {caseActivities.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No activity recorded yet.</p>
              ) : (
                caseActivities.slice(0, 4).map(act => (
                  <div
                    key={act.id}
                    className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs flex items-start justify-between gap-2"
                  >
                    <div>
                      <span className="text-[9px] font-bold text-cyan-400 px-1 py-0.2 rounded bg-cyan-500/10 border border-cyan-400/20 mr-1.5">
                        {act.actionType}
                      </span>
                      <span className="text-slate-200 text-[11px]">{act.description}</span>
                    </div>
                    <span className="text-[9px] text-slate-500 shrink-0">{act.timestamp}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pinned Favorite Cases shortcut bar */}
          <div className={`${preferences.showWidgets.favorites ? '' : 'hidden'} pt-3 border-t border-white/5`}>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2">
              <span className="flex items-center gap-1 font-bold text-amber-400 uppercase">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                PINNED CASES ({favoriteCases.length})
              </span>
            </div>
            {favoriteCases.length === 0 ? (
              <span className="text-[10px] text-slate-500 block">No pinned cases. Click star icon in Case Library to pin.</span>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {favoriteCases.slice(0, 3).map(fav => (
                  <button
                    key={fav.id}
                    onClick={() => switchCase(fav.id)}
                    className="text-[10px] px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition-colors cursor-pointer"
                  >
                    #{fav.id} {fav.title.slice(0, 18)}...
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6. Investigation Workstations & Interactive Modules Grid */}
      <div className="hidden">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            INVESTIGATION WORKSTATIONS & SUBSYSTEMS
          </h3>
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            SYSTEMS READY // SELECT WORKSTATION
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

      {/* 7. Bottom Tier: Recently Viewed Records & Real API Status Panel */}
      <div className="hidden">
        {/* Recently Viewed Records */}
        <div className={`${preferences.showWidgets.recentlyViewed ? '' : 'hidden'} p-5 rounded-2xl bg-[#0a0f1d] border border-white/10 space-y-3`}>
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <h3 className="font-hud font-bold text-xs text-white uppercase tracking-wider">
                RECENTLY ACCESSED DOSSIERS
              </h3>
            </div>
            <span className="text-[10px] text-slate-500">{recentlyViewed.length} TRACKED</span>
          </div>

          {recentlyViewed.length === 0 ? (
            <p className="text-xs text-slate-500 py-3 text-center">No dossiers recently opened.</p>
          ) : (
            <div className="space-y-2">
              {recentlyViewed.slice(0, 3).map((rec, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate(rec.path)}
                  className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-400/30 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-white/5 text-cyan-300 uppercase">
                      {rec.type}
                    </span>
                    <span className="text-white truncate font-semibold group-hover:text-cyan-300 text-xs">
                      {rec.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0">{rec.viewedAt}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real API & System Infrastructure Status Panel */}
        <div className={`${preferences.showWidgets.apiStatus ? '' : 'hidden'} p-5 rounded-2xl bg-[#0a0f1d] border border-white/10 space-y-3`}>
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <h3 className="font-hud font-bold text-xs text-white uppercase tracking-wider">
                SYSTEM & AUTHENTICATION STATUS
              </h3>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {apiHealth.loading ? 'CHECKING SERVICES' : apiHealth.online ? 'API AVAILABLE' : 'DEMO MODE'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase">Core Backend API</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {apiHealth.online ? 'ONLINE (200 OK)' : 'STANDALONE READY'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase">Email OTP 2FA Service</span>
              <span className="text-cyan-400 font-bold flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                ACTIVE (SHA-256 SALT)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase">Resolution Email Service</span>
              <span className={`font-bold flex items-center gap-1 mt-0.5 ${apiHealth.emailConfigured ? 'text-emerald-400' : 'text-amber-400'}`}>
                {apiHealth.emailConfigured ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    CONFIGURED ({apiHealth.emailUser || 'SMTP'})
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    FALLBACK (LOCAL RECORD)
                  </>
                )}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase">Database Architecture</span>
              <span className="text-purple-400 font-bold flex items-center gap-1 mt-0.5">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                LOCALSTORAGE v3 SCHEMA
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
