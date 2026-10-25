import React, { useState } from 'react';
import { useCase } from '../context/CaseContext';
import { TimelineEvent } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { ProgressBar } from '../components/common/ProgressBar';
import {
  Clock,
  ArrowUp,
  ArrowDown,
  Flag,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  User,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const TimelineBuilderPage: React.FC = () => {
  const {
    selectedCase,
    reorderTimeline,
    toggleFlagTimelineEvent,
    addTimelineEvent,
    deleteTimelineEvent,
    showToast
  } = useCase();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [time, setTime] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [actor, setActor] = useState('');
  const [evidenceCode, setEvidenceCode] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    score: number;
    message: string;
    inconsistencies: number;
  } | null>(null);

  if (!selectedCase) {
    return <div className="p-8 text-center font-mono text-cyan-400">NO CASE SELECTED</div>;
  }

  const { timeline } = selectedCase;

  const handleMoveUp = (index: number) => {
    if (index > 0) reorderTimeline(index, index - 1);
  };

  const handleMoveDown = (index: number) => {
    if (index < timeline.length - 1) reorderTimeline(index, index + 1);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!time || !title) return;

    addTimelineEvent({
      time,
      title,
      location: location || 'Crime Scene Perimeter',
      description,
      actor: actor || 'Unknown Subject',
      evidenceCode: evidenceCode || undefined,
      confidence: 90
    });

    setIsAddModalOpen(false);
    setTime('');
    setTitle('');
    setLocation('');
    setDescription('');
    setActor('');
    setEvidenceCode('');
  };

  const handleVerifyTimeline = () => {
    const flaggedCount = timeline.filter((e) => e.flaggedInconsistency).length;
    const total = timeline.length;
    const score = Math.max(20, Math.round(((total - flaggedCount) / (total || 1)) * 100));

    let msg = '';
    if (flaggedCount === 0) {
      msg = 'All sequenced timeline events conform to physical and biometric timestamps without chronological contradiction.';
    } else {
      msg = `Detected ${flaggedCount} temporal contradiction(s) requiring investigative cross-examination.`;
    }

    setVerificationResult({
      score,
      message: msg,
      inconsistencies: flaggedCount
    });

    showToast(`Timeline Verification Complete: Coherence Rating ${score}%`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">
              TEMPORAL CHRONOLOGY // #{selectedCase.id}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-hud text-white">
            TIMELINE BUILDER & RECONSTRUCTION
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Sequence timestamps, identify alibi discrepancies, and test causal event logic.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleVerifyTimeline}
            icon={<ShieldCheck className="w-4 h-4 text-cyan-400" />}
          >
            VERIFY TIMELINE
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            LOG EVENT
          </Button>
        </div>
      </div>

      {/* Verification Score Card if verified */}
      {verificationResult && (
        <div className="p-4 rounded-xl bg-slate-950/90 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                verificationResult.inconsistencies === 0
                  ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300'
                  : 'bg-amber-950/80 border-amber-400 text-amber-300'
              }`}
            >
              {verificationResult.inconsistencies === 0 ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-white uppercase">
                  TIMELINE COHERENCE:
                </span>
                <span className="text-sm font-hud font-bold text-cyan-400">
                  {verificationResult.score}%
                </span>
              </div>
              <p className="text-xs font-mono text-slate-300 mt-0.5">
                {verificationResult.message}
              </p>
            </div>
          </div>

          <div className="w-full md:w-48 shrink-0">
            <ProgressBar
              value={verificationResult.score}
              size="sm"
              variant={verificationResult.score > 80 ? 'emerald' : 'amber'}
            />
          </div>
        </div>
      )}

      {/* Timeline Stream */}
      <div className="relative pl-6 sm:pl-10 space-y-6 before:absolute before:left-3 sm:before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-slate-700 before:to-slate-900">
        <AnimatePresence>
          {timeline.map((item, index) => {
            const isFirst = index === 0;
            const isLast = index === timeline.length - 1;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="relative group"
              >
                {/* Timeline node icon on track */}
                <div
                  className={`absolute -left-6 sm:-left-10 top-4 -translate-x-1/2 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-transform group-hover:scale-110 ${
                    item.flaggedInconsistency
                      ? 'bg-rose-950 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.6)]'
                      : 'bg-slate-950 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                </div>

                {/* Event Card */}
                <div
                  className={`p-5 rounded-xl border transition-all duration-200 ${
                    item.flaggedInconsistency
                      ? 'bg-rose-950/20 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
                      : 'bg-[#090d16]/90 border-slate-800/90 hover:border-cyan-500/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded border border-cyan-500/30">
                        {item.time}
                      </span>
                      <h3 className="text-base font-bold font-hud text-white">{item.title}</h3>
                      {item.flaggedInconsistency && (
                        <Badge variant="red" size="sm">
                          CONTRADICTION FLAGGED
                        </Badge>
                      )}
                    </div>

                    {/* Reorder and Flag Controls */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={isFirst}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Move Earlier"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={isLast}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Move Later"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => toggleFlagTimelineEvent(item.id)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          item.flaggedInconsistency
                            ? 'bg-rose-950 border-rose-500 text-rose-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-rose-400'
                        }`}
                        title="Flag / Unflag Inconsistency"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => deleteTimelineEvent(item.id)}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 cursor-pointer"
                        title="Delete Event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata line */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 mb-2">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400/80" />
                      <span>{item.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-amber-400/80" />
                      <span>ACTOR: {item.actor}</span>
                    </div>
                    {item.evidenceCode && (
                      <span className="text-[10px] font-mono text-cyan-300 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                        LINKED EVD: {item.evidenceCode}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm font-mono text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add Event Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="LOG TIMELINE EVENT"
        subtitle="ENTER VERIFIED OR SUSPECTED INCIDENT CHRONOLOGY"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4 font-mono text-xs text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-cyan-400 uppercase block mb-1">Time (e.g. 23:45 EST)</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="23:45 EST"
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="text-cyan-400 uppercase block mb-1">Actor / Individual</label>
              <input
                type="text"
                value={actor}
                onChange={(e) => setActor(e.target.value)}
                placeholder="Marcus Vance / Unknown"
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="text-cyan-400 uppercase block mb-1">Event Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Vault Thermal Sensor Trip"
              className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-cyan-400 uppercase block mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Penthouse Sub-Vault"
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-cyan-400 uppercase block mb-1">Linked Evidence Code</label>
              <input
                type="text"
                value={evidenceCode}
                onChange={(e) => setEvidenceCode(e.target.value)}
                placeholder="EVD-001"
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="text-cyan-400 uppercase block mb-1">Incident Summary</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe physical movement or forensic timestamp verification..."
              rows={3}
              className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              CANCEL
            </Button>
            <Button type="submit" variant="primary" size="sm">
              SAVE TO TIMELINE
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
