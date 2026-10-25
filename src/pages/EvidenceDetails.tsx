import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCase } from '../context/CaseContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Tabs } from '../components/ui/Tabs';
import { TextArea } from '../components/forms/TextArea';
import { ChainOfCustodyModal } from '../components/evidence/ChainOfCustodyModal';
import { BookmarkButton } from '../components/common/BookmarkButton';
import { RelatedRecordsPanel } from '../components/common/RelatedRecordsPanel';
import { formatDateTime } from '../utils/dateTime';
import {
  Package,
  MapPin,
  Clock,
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Edit,
  Trash2,
  Tag,
  ShieldAlert,
  UserCheck,
  Shield,
  CheckSquare
} from 'lucide-react';

export const EvidenceDetails: React.FC = () => {
  const { caseId, evidenceId } = useParams<{ caseId: string; evidenceId: string }>();
  const navigate = useNavigate();
  const {
    cases,
    preferences,
    collectEvidence,
    verifyEvidence,
    deleteEvidence,
    updateEvidenceNote,
    toggleEvidenceReviewStatus
  } = useCase();

  const currentCase = cases.find(c => c.id === caseId);
  const evidence = currentCase?.evidenceList.find(e => e.id === evidenceId || e.code === evidenceId);

  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'connections'>('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCustodyModal, setShowCustodyModal] = useState(false);
  const [userNoteText, setUserNoteText] = useState(evidence?.userNotes || '');

  if (!currentCase || !evidence) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center font-mono">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white mb-2">EVIDENCE EXHIBIT NOT FOUND</h2>
        <p className="text-xs text-slate-400 mb-6">No evidence record with identifier: {evidenceId}</p>
        <Button variant="primary" size="sm" onClick={() => navigate(caseId ? `/cases/${caseId}/evidence` : '/cases')}>
          RETURN TO EVIDENCE LOCKER
        </Button>
      </div>
    );
  }

  const isCollected = evidence.status === 'COLLECTED';
  const isVerified = evidence.analysisResults?.verified;

  const tabs = [
    { id: 'overview', label: 'FORENSIC OVERVIEW', icon: <Package className="w-3.5 h-3.5" /> },
    { id: 'notes', label: 'INVESTIGATOR NOTES', icon: <FlaskConical className="w-3.5 h-3.5" /> },
    { id: 'connections', label: 'CASE CONNECTIONS', icon: <UserCheck className="w-3.5 h-3.5" /> }
  ];

  const handleDelete = () => {
    deleteEvidence(currentCase.id, evidence.id);
    setShowDeleteModal(false);
    navigate(`/cases/${currentCase.id}/evidence`);
  };

  const handleSaveNote = () => {
    updateEvidenceNote(evidence.id, userNoteText);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 font-mono animate-in fade-in duration-200">
      {/* Delete confirmation modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="CONFIRM EVIDENCE EXPUNGEMENT"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <p className="font-bold text-white mb-1">REMOVE FROM CHAIN OF CUSTODY</p>
              <p>
                Are you sure you want to delete <strong>{evidence.title} [{evidence.code}]</strong>? This will break any suspect link references.
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
              className="bg-rose-600 hover:bg-rose-500 text-white border-rose-500"
            >
              CONFIRM DELETE
            </Button>
          </div>
        </div>
      </Modal>

      {/* Chain of Custody Tracker Modal */}
      <ChainOfCustodyModal
        evidence={evidence}
        isOpen={showCustodyModal}
        onClose={() => setShowCustodyModal(false)}
      />

      {/* Back button */}
      <button
        onClick={() => navigate(`/cases/${currentCase.id}/evidence`)}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>BACK TO EVIDENCE LOCKER</span>
      </button>

      {/* Main Evidence Dossier Card */}
      <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-400/30">
                EXHIBIT {evidence.code}
              </span>
              <Badge variant="cyan" size="sm">
                {evidence.category}
              </Badge>
              <Badge variant={evidence.importance === 'CRITICAL' ? 'rose' : 'amber'} size="sm">
                {evidence.importance} IMPORTANCE
              </Badge>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  isCollected
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                }`}
              >
                {evidence.status}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  evidence.reviewStatus === 'REVIEWED'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                    : 'bg-slate-800 text-slate-400 border border-white/10'
                }`}
              >
                {evidence.reviewStatus === 'REVIEWED' ? 'LAB REVIEWED' : 'AWAITING LAB REVIEW'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="font-hud font-bold text-2xl sm:text-3xl text-white tracking-wide">
                {evidence.title}
              </h1>
              <BookmarkButton type="EVIDENCE" id={evidence.id} />
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                Found at: {evidence.locationFound}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Logged: {formatDateTime(evidence.timestamp, preferences.dateTimeFormat)}
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                Custodian: {evidence.currentCustodian || 'Det. Pulkit Gupta'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {!isCollected && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => collectEvidence(evidence.id)}
                icon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                COLLECT EXHIBIT
              </Button>
            )}

            {!isVerified && isCollected && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => verifyEvidence(currentCase.id, evidence.id)}
                icon={<FlaskConical className="w-3.5 h-3.5" />}
                className="bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white"
              >
                VERIFY IN LAB
              </Button>
            )}

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowCustodyModal(true)}
              icon={<Shield className="w-3.5 h-3.5 text-cyan-400" />}
            >
              CUSTODY LOG
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => toggleEvidenceReviewStatus(currentCase.id, evidence.id)}
              icon={<CheckSquare className="w-3.5 h-3.5 text-emerald-400" />}
            >
              {evidence.reviewStatus === 'REVIEWED' ? 'MARK PENDING' : 'MARK REVIEWED'}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/cases/${currentCase.id}/evidence/${evidence.id}/edit`)}
              icon={<Edit className="w-3.5 h-3.5" />}
            >
              EDIT
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              icon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}
              className="text-rose-400 border-rose-500/20 hover:bg-rose-500/10"
            >
              DELETE
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="pt-4">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={id => setActiveTab(id as any)} />
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <span className="text-slate-500 text-[10px] block font-bold">PHYSICAL DESCRIPTION</span>
                <p className="text-slate-200 leading-relaxed text-xs">{evidence.description}</p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <span className="text-slate-500 text-[10px] block font-bold">PRELIMINARY FORENSIC FINDINGS</span>
                <p className="text-slate-300 leading-relaxed text-xs">{evidence.forensicNotes}</p>
              </div>

              {evidence.tags && evidence.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <Tag className="w-3 h-3 text-slate-500 mr-1" />
                  {evidence.tags.map(t => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-cyan-300">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Analysis Results */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-hud font-bold text-cyan-400 text-xs uppercase">
                    LABORATORY SPECTRAL ANALYSIS
                  </span>
                  {isVerified ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> AUTHENTICATED
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      PENDING VERIFICATION
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">ANALYSIS CONFIDENCE / MATCH RATE</span>
                    <span className="text-white font-bold text-sm">
                      {evidence.analysisResults?.matchRate ? `${evidence.analysisResults.matchRate}%` : '95.4%'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">CERTIFYING EXAMINER</span>
                    <span className="text-slate-200">
                      {evidence.analysisResults?.technician || 'Senior Forensic Pathologist'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">TECHNICAL LAB FINDINGS</span>
                    <span className="text-slate-300 leading-relaxed block">
                      {evidence.analysisResults?.details ||
                        'Mass spectrometry confirms presence of synthetic trace compounds and anomalous isotopic signature consistent with internal breach.'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Investigator Notes */}
        {activeTab === 'notes' && (
          <div className="pt-6 space-y-4 text-xs">
            <p className="text-slate-400">
              Attach private detective working notes, evidentiary correlations, and lab review observations to this specific exhibit file:
            </p>
            <TextArea
              value={userNoteText}
              onChange={e => setUserNoteText(e.target.value)}
              placeholder="e.g. Lip print on flute rim is too delicate for a male suspect; check Sarah Chen and Elena Rostova..."
              rows={5}
            />
            <div className="flex justify-end">
              <Button variant="primary" size="sm" onClick={handleSaveNote}>
                SAVE EXHIBIT NOTES
              </Button>
            </div>
          </div>
        )}

        {/* Tab 3: Case Connections */}
        {activeTab === 'connections' && (
          <div className="pt-6 space-y-4 text-xs">
            <h3 className="font-hud font-bold text-slate-300 uppercase tracking-wider text-xs">
              LINKED SUSPECTS IN CURRENT CASE
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentCase.suspects.map(s => {
                const isLinked = (s.evidenceLinks || []).includes(evidence.id) || (s.linkedEvidence || []).includes(evidence.id);
                return (
                  <div
                    key={s.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between ${
                      isLinked
                        ? 'bg-purple-950/20 border-purple-500/40 text-purple-200'
                        : 'bg-white/[0.02] border-white/5 text-slate-400'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-white block">{s.name}</span>
                      <span className="text-[10px] text-slate-400">{s.occupation}</span>
                    </div>
                    {isLinked ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                        DIRECT MATCH
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">Unlinked</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Linked Case Matrix Navigation */}
      <RelatedRecordsPanel caseId={currentCase.id} excludeType="EVIDENCE" />
    </div>
  );
};
