import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCase } from '../context/CaseContext';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { Modal } from '../components/common/Modal';
import { Tabs } from '../components/ui/Tabs';
import {
  MapPin,
  Calendar,
  Shield,
  User,
  ArrowRight,
  Edit,
  Trash2,
  ScanEye,
  FolderOpen,
  Clock,
  Users,
  MessageSquareQuote,
  FileText,
  Activity,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  FlaskConical,
  Video,
  Network
} from 'lucide-react';

export const CaseDetails: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { cases, selectedCaseId, switchCase, deleteCase, resetCase, getCaseActivities } = useCase();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'activity'>('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const targetCase = cases.find(c => c.id === caseId) || cases.find(c => c.id === selectedCaseId);

  if (!targetCase) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center font-mono">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white mb-2">CASE FILE NOT FOUND</h2>
        <p className="text-xs text-slate-400 mb-6">No investigation record exists with identifier: {caseId}</p>
        <Button variant="primary" size="sm" onClick={() => navigate('/cases')}>
          RETURN TO CASE ARCHIVE
        </Button>
      </div>
    );
  }

  const isCurrentActive = selectedCaseId === targetCase.id;
  const caseActivities = getCaseActivities(targetCase.id);

  const tabs = [
    { id: 'overview', label: 'DOSSIER OVERVIEW', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'modules', label: 'INVESTIGATION MODULES', icon: <FolderOpen className="w-3.5 h-3.5" /> },
    { id: 'activity', label: 'ACTIVITY STREAM', icon: <Activity className="w-3.5 h-3.5" />, badge: caseActivities.length }
  ];

  const priorityColor = {
    CRITICAL: 'rose',
    HIGH: 'amber',
    MEDIUM: 'cyan',
    LOW: 'slate'
  }[targetCase.priority] as 'rose' | 'amber' | 'cyan' | 'slate';

  const handleDelete = () => {
    const success = deleteCase(targetCase.id);
    if (success) {
      setShowDeleteModal(false);
      navigate('/cases');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-in fade-in duration-200">
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="CONFIRM CASE FILE DELETION"
      >
        <div className="space-y-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <p className="font-bold text-white mb-1">IRREVERSIBLE ACTION</p>
              <p>
                Deleting case <strong>{targetCase.title} ({targetCase.id})</strong> will permanently erase all associated evidence locker records, suspect ties, timeline sequences, and notes.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="ghost" size="sm" onClick={() => setShowDeleteModal(false)}>
              CANCEL
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleDelete}
              className="bg-rose-600 hover:bg-rose-500 text-white border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]"
            >
              CONFIRM ARCHIVE / DELETE
            </Button>
          </div>
        </div>
      </Modal>

      {/* Case Header Card */}
      <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-400/30">
                CASE #{targetCase.id}
              </span>
              <Badge variant={priorityColor} size="sm">
                {targetCase.priority} PRIORITY
              </Badge>
              <Badge variant={targetCase.status === 'SOLVED' ? 'emerald' : 'cyan'} size="sm">
                {targetCase.status}
              </Badge>
              {isCurrentActive && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> ACTIVE INVESTIGATION
                </span>
              )}
            </div>

            <h1 className="font-hud font-bold text-2xl sm:text-3xl text-white tracking-wide">
              {targetCase.title}
            </h1>

            <p className="font-mono text-xs sm:text-sm text-slate-300 leading-relaxed">
              {targetCase.shortDescription}
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 font-mono text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                {targetCase.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                {targetCase.incidentDate}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                {targetCase.leadInvestigator}
              </span>
            </div>
          </div>

          {/* Quick Actions & Progress Widget */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 shrink-0">
            <div className="flex items-center gap-2 flex-wrap">
              {!isCurrentActive && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => switchCase(targetCase.id)}
                  className="text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                >
                  SET AS ACTIVE CASE
                </Button>
              )}

              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/cases/${targetCase.id}/edit`)}
                icon={<Edit className="w-3.5 h-3.5 text-slate-300" />}
                className="text-xs"
              >
                EDIT
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                icon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}
                className="text-xs text-rose-400 hover:bg-rose-500/10 border border-rose-500/20"
              >
                DELETE
              </Button>
            </div>

            <div className="w-full sm:w-56 text-right">
              <ProgressBar
                progress={targetCase.progress}
                label="SOLVABILITY INDEX"
                variant={targetCase.progress >= 80 ? 'cyan' : 'emerald'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as any)} />

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6 space-y-4">
              <h3 className="font-hud font-bold text-sm text-cyan-400 tracking-wider uppercase">
                EXECUTIVE BRIEFING & CRIME SCENE CONTEXT
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {targetCase.fullBriefing}
              </p>
            </div>

            <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6 space-y-4">
              <h3 className="font-hud font-bold text-sm text-emerald-400 tracking-wider uppercase">
                ENVIRONMENTAL PHYSICAL PROFILE
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">SCENE NAME</span>
                  <span className="text-white font-bold">{targetCase.crimeScene.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">FACILITY DIMENSIONS</span>
                  <span className="text-white font-bold">{targetCase.crimeScene.dimensions}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 block text-[10px]">ROOM CHARACTERISTICS</span>
                  <span className="text-slate-300">{targetCase.crimeScene.environmentDescription}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Column */}
          <div className="space-y-4">
            <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6 space-y-4">
              <h3 className="font-hud font-bold text-xs text-slate-300 tracking-wider uppercase">
                INVESTIGATION REPOSITORIES
              </h3>

              <div className="space-y-2 text-xs">
                <Link
                  to={`/cases/${targetCase.id}/evidence`}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-400/30 transition-all text-slate-300 hover:text-white"
                >
                  <span className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-cyan-400" />
                    <span>Evidence Locker</span>
                  </span>
                  <span className="font-bold text-cyan-400">{targetCase.evidenceList.length} Items</span>
                </Link>

                <Link
                  to={`/cases/${targetCase.id}/suspects`}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-purple-500/10 border border-white/5 hover:border-purple-400/30 transition-all text-slate-300 hover:text-white"
                >
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span>Suspect Matrix</span>
                  </span>
                  <span className="font-bold text-purple-400">{targetCase.suspects.length} Persons</span>
                </Link>

                <Link
                  to={`/cases/${targetCase.id}/witnesses`}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-amber-500/10 border border-white/5 hover:border-amber-400/30 transition-all text-slate-300 hover:text-white"
                >
                  <span className="flex items-center gap-2">
                    <MessageSquareQuote className="w-4 h-4 text-amber-400" />
                    <span>Witness Statements</span>
                  </span>
                  <span className="font-bold text-amber-400">{targetCase.witnesses.length} Deponents</span>
                </Link>

                <Link
                  to={`/cases/${targetCase.id}/timeline`}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-400/30 transition-all text-slate-300 hover:text-white"
                >
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span>Reconstructed Timeline</span>
                  </span>
                  <span className="font-bold text-emerald-400">{targetCase.timeline.length} Events</span>
                </Link>
              </div>
            </div>

            {/* Replay / Reset Case */}
            <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-5 space-y-3 text-xs">
              <span className="font-bold text-white block flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-400" />
                Case Simulation Controls
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Reset progress to initial state to re-examine crime scene hotspots, clear warrant submissions, and re-solve this case.
              </p>
              {showResetConfirm ? (
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      resetCase(targetCase.id);
                      setShowResetConfirm(false);
                    }}
                    className="bg-amber-600 hover:bg-amber-500 text-white text-[11px]"
                  >
                    CONFIRM RESET
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowResetConfirm(false)}
                    className="text-[11px]"
                  >
                    CANCEL
                  </Button>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowResetConfirm(true)}
                  icon={<RotateCcw className="w-3.5 h-3.5 text-amber-400" />}
                  className="w-full text-[11px] border-white/10"
                >
                  RESET CASE TO ZERO
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Investigation Modules Grid */}
      {activeTab === 'modules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono">
          {[
            {
              title: 'CRIME SCENE EXAMINATION',
              desc: 'Explore interactive 2D floor plans, detect trace residue with UV/IR sensors, and package physical hotspots.',
              to: `/cases/${targetCase.id}/crime-scene`,
              icon: <ScanEye className="w-5 h-5 text-cyan-400" />,
              count: `${targetCase.crimeScene.hotspots.length} Hotspots`
            },
            {
              title: 'EVIDENCE LOCKER',
              desc: 'Catalog, verify, filter, and inspect physical, biological, and digital exhibits with forensic lab reports.',
              to: `/cases/${targetCase.id}/evidence`,
              icon: <FolderOpen className="w-5 h-5 text-emerald-400" />,
              count: `${targetCase.evidenceList.length} Exhibits`
            },
            {
              title: 'TIMELINE BUILDER',
              desc: 'Chronological event sequencer with inconsistency flags and cross-correlation with CCTV logs.',
              to: `/cases/${targetCase.id}/timeline`,
              icon: <Clock className="w-5 h-5 text-amber-400" />,
              count: `${targetCase.timeline.length} Events`
            },
            {
              title: 'SUSPECT MATRIX',
              desc: 'Dossiers, threat indices, biometric matches (DNA & fingerprints), motive breakdown, and dual comparison tool.',
              to: `/cases/${targetCase.id}/suspects`,
              icon: <Users className="w-5 h-5 text-purple-400" />,
              count: `${targetCase.suspects.length} Suspects`
            },
            {
              title: 'WITNESS INTERVIEWS',
              desc: 'Interactive depositions, credibility ratings, dynamic interrogation engine, and timeline comparison.',
              to: `/cases/${targetCase.id}/witnesses`,
              icon: <MessageSquareQuote className="w-5 h-5 text-rose-400" />,
              count: `${targetCase.witnesses.length} Deponents`
            },
            {
              title: 'INVESTIGATION NOTES',
              desc: 'Create, edit, and organize detective hypotheses, forensic clues, and procedural notes.',
              to: `/cases/${targetCase.id}/notes`,
              icon: <FileText className="w-5 h-5 text-cyan-400" />,
              count: 'Case Notes'
            },
            {
              title: 'CCTV SURVEILLANCE',
              desc: 'Real-time multi-angle optic monitoring, timestamp anomaly scrubbing, and facial recognition capture.',
              to: `/cases/${targetCase.id}/cctv`,
              icon: <Video className="w-5 h-5 text-rose-400" />,
              count: `${targetCase.cctvFeeds.length} Feeds`
            },
            {
              title: 'FORENSICS LAB',
              desc: 'Spectroscopy, DNA sequencing, ballistics analysis, and cyber telemetry examination.',
              to: `/cases/${targetCase.id}/forensics`,
              icon: <FlaskConical className="w-5 h-5 text-cyan-400" />,
              count: `${targetCase.forensics.length} Reports`
            },
            {
              title: 'ARREST & JUDICIAL WARRANT',
              desc: 'Review legal criteria, compile probable cause dossier, and submit warrant for magistrate execution.',
              to: `/cases/${targetCase.id}/warrant`,
              icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
              count: targetCase.warrantData.warrantIssued ? 'WARRANT EXECUTED' : 'PENDING PROBABLE CAUSE'
            }
          ].map(module => (
            <Link
              key={module.title}
              to={module.to}
              className="p-5 rounded-2xl bg-white/[0.02] hover:bg-cyan-500/5 border border-white/10 hover:border-cyan-400/40 transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {module.icon}
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                    {module.count}
                  </span>
                </div>
                <h4 className="font-hud font-bold text-sm text-white group-hover:text-cyan-300">
                  {module.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {module.desc}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs text-cyan-400 font-bold group-hover:translate-x-0.5 transition-transform">
                <span>OPEN MODULE</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Tab 3: Activity Stream */}
      {activeTab === 'activity' && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6 font-mono text-xs">
          <h3 className="font-hud font-bold text-sm text-white tracking-wider uppercase mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>CASE ACTIVITY CHRONOLOGY</span>
          </h3>

          {caseActivities.length === 0 ? (
            <p className="text-slate-500 py-8 text-center">No logged activity records for this case yet.</p>
          ) : (
            <div className="divide-y divide-white/5">
              {caseActivities.map(act => (
                <div key={act.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-cyan-400 px-1.5 py-0.2 rounded bg-cyan-500/10 border border-cyan-400/20 mr-2">
                      {act.actionType}
                    </span>
                    <span className="text-slate-200">{act.description}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 shrink-0">{act.timestamp}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
