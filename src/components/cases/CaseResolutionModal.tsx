import React, { useState } from 'react';
import { Gavel, X, Mail, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { useCase } from '../../context/CaseContext';
import { Button } from '../common/Button';

interface CaseResolutionModalProps {
  caseId: string;
  caseTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onResolved?: () => void;
}

export const CaseResolutionModal: React.FC<CaseResolutionModalProps> = ({
  caseId,
  caseTitle,
  isOpen,
  onClose,
  onResolved
}) => {
  const { resolveCase } = useCase();
  const [summary, setSummary] = useState(
    'All judicial evidentiary requirements have been met. Biometric analysis, chronology reconciliation, and suspect corroboration conclusively seal the indictment.'
  );
  const [sendEmail, setSendEmail] = useState(true);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    const res = await resolveCase(caseId, summary, sendEmail, recipientEmail || undefined);
    setIsSubmitting(false);
    setFeedback({
      success: res.success,
      message: res.message
    });

    if (res.success) {
      setTimeout(() => {
        onResolved?.();
        onClose();
      }, 1800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-[#0a0f1d] border border-emerald-500/40 rounded-2xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Gavel className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-hud text-white tracking-wide">
              JUDICIAL CASE RESOLUTION
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Close Docket #{caseId} &bull; {caseTitle}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5 font-bold">
              JUDICIAL RESOLUTION SUMMARY <span className="text-emerald-400">*</span>
            </label>
            <textarea
              rows={4}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="Enter comprehensive conclusion summary justifying case closure..."
              required
              className="w-full bg-black/50 border border-white/10 focus:border-emerald-500 rounded-xl p-3 text-xs font-sans text-slate-200 placeholder-slate-600 focus:outline-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={e => setSendEmail(e.target.checked)}
                className="rounded bg-black border-white/20 text-emerald-500 focus:ring-0"
              />
              <span className="text-xs font-mono text-slate-200 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                Dispatch Formal Resolution Email (Nodemailer)
              </span>
            </label>

            {sendEmail && (
              <div>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={e => setRecipientEmail(e.target.value)}
                  placeholder="Recipient email (defaults to official investigator inbox)"
                  className="w-full bg-black/50 border border-white/10 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none"
                />
                <p className="text-[10px] font-mono text-slate-500 mt-1">
                  Sent using server-side SMTP credentials. OTP authentication remains preserved.
                </p>
              </div>
            )}
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2 ${
                feedback.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {feedback.success ? (
                <CheckCircle className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              className="bg-emerald-500 hover:bg-emerald-400 text-black border-emerald-400 font-bold"
              icon={<ShieldCheck className="w-4 h-4" />}
            >
              OFFICIALLY MARK SOLVED
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
