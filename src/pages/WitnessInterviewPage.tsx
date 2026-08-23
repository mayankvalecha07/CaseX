import React, { useState } from 'react';
import { useCase } from '../context/CaseContext';
import { Witness } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { ProgressBar } from '../components/common/ProgressBar';
import {
  MessageSquareQuote,
  CheckCircle,
  AlertTriangle,
  Send,
  User,
  Shield,
  HelpCircle,
  FileText,
  Sparkles
} from 'lucide-react';

export const WitnessInterviewPage: React.FC = () => {
  const { selectedCase, verifyWitness, flagWitness, addWitnessNote, showToast } = useCase();
  const [selectedWitness, setSelectedWitness] = useState<Witness | null>(null);
  const [interrogationInput, setInterrogationInput] = useState('');
  const [chatHistory, setChatHistory] = useState<
    Array<{ sender: 'investigator' | 'witness'; text: string; time: string }>
  >([]);
  const [isTyping, setIsTyping] = useState(false);

  if (!selectedCase) {
    return <div className="p-8 text-center font-mono text-cyan-400">NO CASE SELECTED</div>;
  }

  const { witnesses } = selectedCase;

  const handleOpenInterview = (w: Witness) => {
    setSelectedWitness(w);
    setChatHistory([
      {
        sender: 'witness',
        text: `Official Sworn Statement: "${w.statement}"`,
        time: 'Logged at Scene'
      }
    ]);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!interrogationInput.trim() || !selectedWitness) return;

    const question = interrogationInput.trim();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatHistory((prev) => [...prev, { sender: 'investigator', text: question, time: now }]);
    setInterrogationInput('');
    setIsTyping(true);

    setTimeout(() => {
      // Generate intelligent contextual response
      let response = '';
      const qLower = question.toLowerCase();

      if (qLower.includes('time') || qLower.includes('when') || qLower.includes('clock')) {
        response = `As I told Officer Miller, I was nearby right around the incident hour. My watch read just past the scheduled hour when I noticed the irregular sound.`;
      } else if (
        qLower.includes('who') ||
        qLower.includes('suspect') ||
        qLower.includes('saw') ||
        qLower.includes('see')
      ) {
        response = `I saw a silhouette wearing dark clothing moving with extreme purpose toward the perimeter. They seemed to know exactly where cameras were angled.`;
      } else if (
        qLower.includes('safe') ||
        qLower.includes('vault') ||
        qLower.includes('lock') ||
        qLower.includes('code')
      ) {
        response = `Access to that area is strictly controlled. Anyone who entered without triggering immediate loud sirens had to possess insider clearance or advanced signal spoofing tools.`;
      } else if (qLower.includes('alibi') || qLower.includes('you')) {
        response = `I have nothing to hide, Detective. Check my badge logs and phone GPS—everything matches what I reported.`;
      } else {
        response = `I swear to you, I've shared every detail I can recall. Look into the security logs and the forensic traces—they will confirm what I witnessed.`;
      }

      setChatHistory((prev) => [...prev, { sender: 'witness', text: response, time: now }]);
      setIsTyping(false);
      addWitnessNote(selectedWitness.id, `Q: ${question} | A: ${response}`);
    }, 600);
  };

  const handleVerify = (wId: string) => {
    verifyWitness(wId);
    showToast('Witness testimony verified and marked in case record.');
    if (selectedWitness && selectedWitness.id === wId) {
      setSelectedWitness((prev) => (prev ? { ...prev, verificationStatus: 'VERIFIED' } : null));
    }
  };

  const handleFlag = (wId: string) => {
    flagWitness(wId);
    showToast('Witness statement flagged for potential contradiction.');
    if (selectedWitness && selectedWitness.id === wId) {
      setSelectedWitness((prev) => (prev ? { ...prev, verificationStatus: 'FLAGGED' } : null));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">
              CROSS-EXAMINATION & TESTIMONY // #{selectedCase.id}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-hud text-white">
            WITNESS INTERVIEWS & INTERROGATION
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Evaluate eyewitness credibility indexes, cross-examine accounts, and flag testimony inconsistencies.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-400">RECORDED TESTIMONIES:</span>{' '}
            <span className="text-white font-bold font-hud">{witnesses.length}</span>
          </div>
        </div>
      </div>

      {/* Witness Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {witnesses.map((w) => {
          const statusVariant = {
            VERIFIED: 'emerald',
            UNVERIFIED: 'cyan',
            FLAGGED: 'red'
          }[w.verificationStatus] as 'emerald' | 'cyan' | 'red';

          return (
            <div
              key={w.id}
              className="p-5 rounded-xl bg-[#090d16]/90 border border-slate-800/90 hover:border-purple-500/50 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Top Name & Verification Status */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold font-mono text-xs">
                      {w.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold font-hud text-white">{w.name}</h3>
                      <span className="text-[10px] font-mono text-purple-400 uppercase">
                        {w.occupation}
                      </span>
                    </div>
                  </div>

                  <Badge variant={statusVariant} size="sm" dot>
                    {w.verificationStatus}
                  </Badge>
                </div>

                {/* Relationship & Credibility */}
                <div className="space-y-2.5 my-3">
                  <div className="text-xs font-mono text-slate-400">
                    <span className="text-slate-500 uppercase">RELATION TO CASE:</span>{' '}
                    <span className="text-slate-200">{w.relationship}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                    <ProgressBar
                      value={w.credibilityScore}
                      label="CREDIBILITY INDEX"
                      size="sm"
                      variant={w.credibilityScore > 75 ? 'emerald' : w.credibilityScore > 50 ? 'cyan' : 'amber'}
                    />
                  </div>
                </div>

                {/* Statement Quote */}
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs font-mono text-slate-300 italic leading-relaxed">
                  "{w.statement}"
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleOpenInterview(w)}
                  icon={<MessageSquareQuote className="w-3.5 h-3.5" />}
                  className="flex-1 text-xs"
                >
                  INTERROGATE
                </Button>

                <button
                  onClick={() => handleVerify(w.id)}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                  title="Verify Testimony"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleFlag(w.id)}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Flag Inconsistency"
                >
                  <AlertTriangle className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Interrogation Simulator Modal */}
      <Modal
        isOpen={!!selectedWitness}
        onClose={() => setSelectedWitness(null)}
        title={`INTERROGATION SESSION // ${selectedWitness?.name}`}
        subtitle={`CREDIBILITY: ${selectedWitness?.credibilityScore}% • OCCUPATION: ${selectedWitness?.occupation}`}
        maxWidth="3xl"
      >
        {selectedWitness && (
          <div className="space-y-4 font-mono text-xs">
            {/* Live Chat Message Feed */}
            <div className="h-72 overflow-y-auto space-y-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${
                    msg.sender === 'investigator' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                    <span className="font-bold">
                      {msg.sender === 'investigator' ? 'DETECTIVE' : selectedWitness.name}
                    </span>
                    <span>• {msg.time}</span>
                  </div>
                  <div
                    className={`max-w-md p-3 rounded-xl ${
                      msg.sender === 'investigator'
                        ? 'bg-cyan-600 text-slate-950 font-semibold rounded-tr-none'
                        : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1.5 text-slate-400 italic text-[11px]">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce delay-100" />
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce delay-200" />
                  <span>{selectedWitness.name} is formulating a statement...</span>
                </div>
              )}
            </div>

            {/* Question Input Field */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={interrogationInput}
                onChange={(e) => setInterrogationInput(e.target.value)}
                placeholder="Ask specific questions about timestamps, suspects seen, keys, or security breaches..."
                className="flex-1 p-3 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon={<Send className="w-3.5 h-3.5" />}
              >
                ASK
              </Button>
            </form>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVerify(selectedWitness.id)}
                  icon={<CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                >
                  MARK TESTIMONY VERIFIED
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFlag(selectedWitness.id)}
                  icon={<AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                >
                  FLAG INCONSISTENCY
                </Button>
              </div>

              <Button variant="ghost" size="sm" onClick={() => setSelectedWitness(null)}>
                CLOSE SESSION
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
