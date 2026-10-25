import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Tag,
  Save
} from 'lucide-react';
import { useCase } from '../../context/CaseContext';
import { CaseStatus, Priority, InvestigationCase } from '../../types';
import { Button } from '../common/Button';

interface WizardDraft {
  id: string;
  title: string;
  type: string;
  location: string;
  incidentDate: string;
  status: CaseStatus;
  priority: Priority;
  leadInvestigator: string;
  shortDescription: string;
  fullBriefing: string;
  tags: string[];
}

const DEFAULT_DRAFT: WizardDraft = {
  id: '',
  title: '',
  type: 'CYBERCRIME',
  location: '',
  incidentDate: new Date().toISOString().split('T')[0],
  status: 'ACTIVE',
  priority: 'HIGH',
  leadInvestigator: 'Det. Pulkit Gupta (DET-7091)',
  shortDescription: '',
  fullBriefing: '',
  tags: ['HIGH-PRIORITY', 'FORENSICS-REQUIRED']
};

export const CaseCreationWizard: React.FC = () => {
  const navigate = useNavigate();
  const { cases, addCase, showToast } = useCase();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<WizardDraft>(() => {
    try {
      const savedDraft = localStorage.getItem('casex_case_wizard_draft');
      if (savedDraft) {
        return JSON.parse(savedDraft);
      }
    } catch { /* no-op */ }
    return {
      ...DEFAULT_DRAFT,
      id: `CASE-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
    };
  });
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-save draft to localStorage
  useEffect(() => {
    if (formData.title || formData.location) {
      try {
        localStorage.setItem('casex_case_wizard_draft', JSON.stringify(formData));
      } catch { /* no-op */ }
    }
  }, [formData]);

  // Check for duplicate warning
  const duplicateMatch = cases.find(
    c =>
      c.id.toLowerCase() === formData.id.toLowerCase() ||
      (formData.title.trim() && c.title.toLowerCase() === formData.title.trim().toLowerCase())
  );

  const discardDraft = () => {
    localStorage.removeItem('casex_case_wizard_draft');
    setFormData({
      ...DEFAULT_DRAFT,
      id: `CASE-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
    });
    setHasRestoredDraft(false);
    showToast('Draft discarded', 'info');
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.id.trim() || !formData.title.trim() || !formData.location.trim()) {
        showToast('Please enter mandatory Case ID, Title, and Location', 'warning');
        return;
      }
    }
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const clean = tagInput.trim().toUpperCase();
      if (clean && !formData.tags.includes(clean)) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, clean] }));
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  };

  const handleSubmit = () => {
    if (!formData.id.trim() || !formData.title.trim()) return;

    setIsSubmitting(true);
    const newCase: Omit<InvestigationCase, 'progress'> = {
      id: formData.id.trim(),
      title: formData.title.trim().toUpperCase(),
      type: formData.type,
      location: formData.location.trim(),
      incidentDate: formData.incidentDate,
      status: formData.status,
      priority: formData.priority,
      leadInvestigator: formData.leadInvestigator,
      shortDescription: formData.shortDescription || 'Initial case briefing pending intake.',
      fullBriefing: formData.fullBriefing || formData.shortDescription || 'Comprehensive case dossier registered.',
      themeColor: 'cyan',
      evidenceCount: 0,
      suspectCount: 0,
      witnessCount: 0,
      tags: formData.tags,
      isArchived: false,
      crimeScene: {
        name: `${formData.location} Crime Scene`,
        environmentDescription: 'Perimeter secured by preliminary forensics unit.',
        dimensions: '15m x 12m',
        hotspots: []
      },
      evidenceList: [],
      suspects: [],
      witnesses: [],
      timeline: [
        {
          id: `tl-init-${Date.now()}`,
          time: formData.incidentDate,
          title: 'Incident Reported',
          description: formData.shortDescription || 'Incident logged into central dispatch.',
          source: 'DISPATCH',
          type: 'DISPATCH'
        }
      ],
      cctvFeeds: [],
      forensics: [],
      boardNodes: [],
      boardConnections: [],
      deductionMetrics: {
        evidenceSynthesisScore: 25,
        timelineCoherence: 20,
        suspectCorrelation: 15,
        solvabilityRating: 30,
        primaryHypothesis: 'Intake analysis in progress',
        contradictionsCount: 0,
        keyFindings: []
      },
      warrantData: {
        warrantIssued: false
      }
    };

    const created = addCase(newCase);
    localStorage.removeItem('casex_case_wizard_draft');
    setIsSubmitting(false);
    navigate(`/cases/${created.id}`);
  };

  const steps = [
    { num: 1, title: 'Case Identifiers' },
    { num: 2, title: 'Classification & Priority' },
    { num: 3, title: 'Briefing & Tags' },
    { num: 4, title: 'Review & Commit' }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Draft recovery banner */}
      {localStorage.getItem('casex_case_wizard_draft') && !hasRestoredDraft && (
        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between text-xs font-mono text-cyan-300">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            <span>Saved case draft detected from earlier session.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setHasRestoredDraft(true)}
              className="px-2.5 py-1 rounded bg-cyan-500 text-black font-bold text-[10px]"
            >
              KEEP DRAFT
            </button>
            <button
              type="button"
              onClick={discardDraft}
              className="text-slate-400 hover:text-rose-400 text-[10px] underline"
            >
              Discard Draft
            </button>
          </div>
        </div>
      )}

      {/* Duplicate warning banner */}
      {duplicateMatch && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs font-mono text-amber-300">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="font-bold">DUPLICATE RECORD WARNING:</span> Case{' '}
            <strong className="text-white">{duplicateMatch.id}</strong> (
            {duplicateMatch.title}) already exists in the central docket. You may adjust the Case ID or Title before proceeding.
          </div>
        </div>
      )}

      {/* Step Indicator Bar */}
      <div className="grid grid-cols-4 gap-2">
        {steps.map(s => {
          const isActive = currentStep === s.num;
          const isDone = currentStep > s.num;
          return (
            <div
              key={s.num}
              className={`p-3 rounded-xl border text-center transition-all ${
                isActive
                  ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : isDone
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                  : 'border-white/10 bg-white/[0.01] text-slate-500'
              }`}
            >
              <div className="text-[10px] font-mono uppercase tracking-wider">
                STEP 0{s.num}
              </div>
              <div className="text-xs font-bold font-hud truncate mt-0.5">
                {s.title}
              </div>
            </div>
          );
        })}
      </div>

      {/* Wizard Step Content */}
      <div className="p-6 rounded-2xl bg-[#0a0f1d] border border-white/10 space-y-5">
        {/* Step 1: Identifiers */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold font-hud text-white uppercase tracking-wider border-b border-white/5 pb-2">
              STEP 1: CASE IDENTIFIERS & JURISDICTION
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase mb-1 font-bold">
                  CASE DOSSIER ID <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={e => setFormData({ ...formData, id: e.target.value })}
                  placeholder="e.g. NY-2026-0884"
                  required
                  className="w-full bg-black/50 border border-white/10 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase mb-1 font-bold">
                  INCIDENT DATE & TIME <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="date"
                  value={formData.incidentDate}
                  onChange={e => setFormData({ ...formData, incidentDate: e.target.value })}
                  required
                  className="w-full bg-black/50 border border-white/10 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase mb-1 font-bold">
                OFFICIAL CASE TITLE <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. THE MIDNIGHT DIAMOND HEIST"
                required
                className="w-full bg-black/50 border border-white/10 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase mb-1 font-bold">
                INCIDENT LOCATION / SCENE <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Apex Tower, Penthouse 74, Manhattan, NY"
                required
                className="w-full bg-black/50 border border-white/10 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Step 2: Classification */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold font-hud text-white uppercase tracking-wider border-b border-white/5 pb-2">
              STEP 2: CLASSIFICATION & PRIORITY LEVEL
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase mb-1 font-bold">
                  INVESTIGATION TYPE
                </label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                >
                  <option value="HIGH-VALUE THEFT">HIGH-VALUE THEFT</option>
                  <option value="HOMICIDE">HOMICIDE</option>
                  <option value="CYBERCRIME">CYBERCRIME</option>
                  <option value="ESPIONAGE">ESPIONAGE</option>
                  <option value="FINANCIAL FRAUD">FINANCIAL FRAUD</option>
                  <option value="NARCOTICS TRAFFICKING">NARCOTICS TRAFFICKING</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase mb-1 font-bold">
                  INITIAL STATUS
                </label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as CaseStatus })}
                  className="w-full bg-black/50 border border-white/10 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="UNDER INVESTIGATION">UNDER INVESTIGATION</option>
                  <option value="COLD CASE">COLD CASE</option>
                  <option value="RESTRICTED">RESTRICTED</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase mb-2 font-bold">
                PRIORITY CLEARANCE
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as Priority[]).map(pri => (
                  <button
                    key={pri}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: pri })}
                    className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition-all ${
                      formData.priority === pri
                        ? pri === 'CRITICAL'
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                          : pri === 'HIGH'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {pri}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase mb-1 font-bold">
                LEAD INVESTIGATOR
              </label>
              <input
                type="text"
                value={formData.leadInvestigator}
                onChange={e => setFormData({ ...formData, leadInvestigator: e.target.value })}
                className="w-full bg-black/50 border border-white/10 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Step 3: Briefing & Tags */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold font-hud text-white uppercase tracking-wider border-b border-white/5 pb-2">
              STEP 3: INVESTIGATIVE BRIEFING & TAGS
            </h4>

            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase mb-1 font-bold">
                EXECUTIVE SUMMARY
              </label>
              <textarea
                rows={2}
                value={formData.shortDescription}
                onChange={e => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="High-level incident summary for dashboard widgets..."
                className="w-full bg-black/50 border border-white/10 focus:border-cyan-400 rounded-xl p-3 text-xs font-sans text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase mb-1 font-bold">
                FULL FORENSIC BRIEFING
              </label>
              <textarea
                rows={4}
                value={formData.fullBriefing}
                onChange={e => setFormData({ ...formData, fullBriefing: e.target.value })}
                placeholder="Detailed crime scene telemetry, MO analysis, and operational constraints..."
                className="w-full bg-black/50 border border-white/10 focus:border-cyan-400 rounded-xl p-3 text-xs font-sans text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase mb-1 font-bold">
                INVESTIGATION TAGS (PRESS ENTER TO ADD)
              </label>
              <div className="flex flex-wrap items-center gap-1.5 p-2 bg-black/50 border border-white/10 rounded-xl min-h-[42px]">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-slate-400 hover:text-white ml-0.5"
                    >
                      &times;
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Type tag and press Enter..."
                  className="bg-transparent text-xs font-mono text-white placeholder-slate-600 focus:outline-none px-2 flex-1"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review & Confirmation */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold font-hud text-white uppercase tracking-wider border-b border-white/5 pb-2 flex items-center justify-between">
              <span>STEP 4: FINAL DOSSIER VERIFICATION</span>
              <span className="text-xs font-mono text-cyan-400 font-bold">READY TO COMMIT</span>
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono p-4 rounded-xl bg-white/[0.02] border border-white/10">
              <div>
                <span className="text-slate-500 block text-[10px]">CASE ID</span>
                <span className="text-cyan-400 font-bold">{formData.id}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">PRIORITY</span>
                <span className="text-rose-400 font-bold">{formData.priority}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block text-[10px]">CASE TITLE</span>
                <span className="text-white font-bold">{formData.title}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">CLASSIFICATION</span>
                <span className="text-slate-200">{formData.type}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">STATUS</span>
                <span className="text-emerald-400">{formData.status}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block text-[10px]">SCENE LOCATION</span>
                <span className="text-slate-200">{formData.location}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block text-[10px]">LEAD INVESTIGATOR</span>
                <span className="text-slate-200">{formData.leadInvestigator}</span>
              </div>
            </div>

            {duplicateMatch && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  Please resolve duplicate warning before final creation or proceed deliberately.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={currentStep === 1 ? () => navigate('/cases') : handleBack}
            icon={<ChevronLeft className="w-4 h-4" />}
          >
            {currentStep === 1 ? 'CANCEL' : 'BACK'}
          </Button>

          <div className="flex items-center gap-2">
            {currentStep < 4 ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleNext}
                icon={<ChevronRight className="w-4 h-4" />}
              >
                PROCEED TO STEP 0{currentStep + 1}
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                icon={<CheckCircle className="w-4 h-4" />}
              >
                COMMIT & OPEN CASE DOSSIER
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
