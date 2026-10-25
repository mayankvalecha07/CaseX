import React, { useState } from 'react';
import { Shield, X, ArrowRight, Plus, Clock, User, MapPin, FileText } from 'lucide-react';
import { EvidenceItem } from '../../types';
import { useCase } from '../../context/CaseContext';
import { Button } from '../common/Button';

interface ChainOfCustodyModalProps {
  evidence: EvidenceItem;
  isOpen: boolean;
  onClose: () => void;
}

export const ChainOfCustodyModal: React.FC<ChainOfCustodyModalProps> = ({
  evidence,
  isOpen,
  onClose
}) => {
  const { addCustodyTransfer, getEvidenceCustody } = useCase();
  const [showAddForm, setShowAddForm] = useState(false);
  const [transferredBy, setTransferredBy] = useState(evidence.currentCustodian || 'Det. Pulkit Gupta');
  const [receivedBy, setReceivedBy] = useState('');
  const [storageLocation, setStorageLocation] = useState(evidence.storageLocation || 'Secure Evidence Locker B-14');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const transfers = getEvidenceCustody(evidence.id);

  const handleAddTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receivedBy.trim() || !storageLocation.trim()) return;

    addCustodyTransfer({
      evidenceId: evidence.id,
      transferDate: new Date().toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      transferredBy,
      receivedBy,
      storageLocation,
      notes: notes || 'Standard forensic chain of custody handoff.'
    });

    setReceivedBy('');
    setNotes('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#0a0f1d] border border-cyan-500/40 rounded-2xl shadow-2xl p-6 relative max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 shrink-0">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-hud text-white tracking-wide">
              CHAIN OF CUSTODY TRACKER
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Exhibit {evidence.code}: {evidence.title}
            </p>
          </div>
        </div>

        {/* Current status banner */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-white/[0.02] border border-white/10 rounded-xl mb-4 shrink-0 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Current Custodian</span>
            <span className="text-cyan-400 font-bold">{evidence.currentCustodian || 'Unassigned'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Storage Repository</span>
            <span className="text-slate-200">{evidence.storageLocation || 'Evidence Vault'}</span>
          </div>
        </div>

        {/* Scrollable history */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              CUSTODY AUDIT LOG ({transfers.length + 1} ENTRIES)
            </h4>
            {!showAddForm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(true)}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                RECORD TRANSFER
              </Button>
            )}
          </div>

          {showAddForm && (
            <form onSubmit={handleAddTransfer} className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/30 space-y-3">
              <div className="text-xs font-bold font-hud text-cyan-300">
                LOG CUSTODY TRANSFER
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                    Transferred By
                  </label>
                  <input
                    type="text"
                    value={transferredBy}
                    onChange={e => setTransferredBy(e.target.value)}
                    required
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                    Received By (New Custodian) *
                  </label>
                  <input
                    type="text"
                    value={receivedBy}
                    onChange={e => setReceivedBy(e.target.value)}
                    placeholder="e.g. Dr. Aris Thorne (Forensics Lab)"
                    required
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                  Destination Storage Location *
                </label>
                <input
                  type="text"
                  value={storageLocation}
                  onChange={e => setStorageLocation(e.target.value)}
                  placeholder="e.g. Spectroscopy Lab Cleanroom"
                  required
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                  Transfer Justification & Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Reason for movement, seal serial number, tamper condition..."
                  className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs font-sans text-white focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button variant="ghost" size="sm" type="button" onClick={() => setShowAddForm(false)}>
                  CANCEL
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  SAVE TRANSFER
                </Button>
              </div>
            </form>
          )}

          {/* Timeline of transfers */}
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-cyan-500/20">
            {/* Initial collection node */}
            <div className="relative">
              <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20" />
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-bold">INITIAL RECOVERY & INTAKE</span>
                  <span className="text-slate-500">{evidence.collectedAt || evidence.timestamp}</span>
                </div>
                <p className="text-xs text-slate-300">
                  Recovered from <strong>{evidence.locationFound}</strong> by Crime Scene Unit.
                </p>
                <div className="text-[10px] font-mono text-slate-500 flex items-center gap-3 pt-1">
                  <span>Initial Custodian: Det. Pulkit Gupta</span>
                  <span>Location: {evidence.storageLocation || 'Evidence Locker'}</span>
                </div>
              </div>
            </div>

            {/* Subsequent transfers */}
            {transfers.map(tr => (
              <div key={tr.id} className="relative">
                <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-cyan-400 ring-4 ring-cyan-500/20" />
                <div className="p-3 rounded-xl bg-white/[0.02] border border-cyan-500/20 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                      <span>{tr.transferredBy}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      <span>{tr.receivedBy}</span>
                    </span>
                    <span className="text-slate-500">{tr.transferDate}</span>
                  </div>

                  <div className="text-xs text-slate-300">
                    <span className="text-slate-500 font-mono text-[10px]">FACILITY:</span> {tr.storageLocation}
                  </div>

                  {tr.notes && (
                    <p className="text-xs text-slate-400 italic bg-black/30 p-2 rounded border border-white/5">
                      "{tr.notes}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-[10px] font-mono text-slate-500 text-center">
            * Note: This tracker is a student-project simulation of chain of custody records and is not a legally certified digital signature system.
          </div>
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-white/5 mt-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            CLOSE
          </Button>
        </div>
      </div>
    </div>
  );
};
