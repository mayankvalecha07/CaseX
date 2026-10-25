import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCase } from '../context/CaseContext';
import { useAuth } from '../context/AuthContext';
import { FormField } from '../components/forms/FormField';
import { TextInput } from '../components/forms/TextInput';
import { TextArea } from '../components/forms/TextArea';
import { SelectInput } from '../components/forms/SelectInput';
import { FormActions } from '../components/forms/FormActions';
import { InvestigationCase, CaseStatus, Priority } from '../types';
import { ArrowLeft, ShieldAlert, Sparkles, Wand2, FormInput } from 'lucide-react';
import { CaseCreationWizard } from '../components/cases/CaseCreationWizard';

export const CaseForm: React.FC = () => {
  const { caseId } = useParams<{ caseId?: string }>();
  const navigate = useNavigate();
  const { cases, addCase, updateCase } = useCase();
  const { user } = useAuth();

  const isEditMode = Boolean(caseId);
  const existingCase = isEditMode ? cases.find(c => c.id === caseId) : null;
  const [creationMode, setCreationMode] = useState<'WIZARD' | 'FORM'>('WIZARD');

  // Form state
  const [title, setTitle] = useState('');
  const [caseType, setCaseType] = useState('HIGH-VALUE THEFT');
  const [location, setLocation] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [status, setStatus] = useState<CaseStatus>('ACTIVE');
  const [priority, setPriority] = useState<Priority>('HIGH');
  const [shortDescription, setShortDescription] = useState('');
  const [fullBriefing, setFullBriefing] = useState('');
  const [sceneName, setSceneName] = useState('');
  const [environmentDescription, setEnvironmentDescription] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (existingCase) {
      setTitle(existingCase.title);
      setCaseType(existingCase.type);
      setLocation(existingCase.location);
      setIncidentDate(existingCase.incidentDate);
      setStatus(existingCase.status);
      setPriority(existingCase.priority);
      setShortDescription(existingCase.shortDescription);
      setFullBriefing(existingCase.fullBriefing);
      setSceneName(existingCase.crimeScene.name);
      setEnvironmentDescription(existingCase.crimeScene.environmentDescription);
    } else {
      // Defaults for new case
      const now = new Date();
      setIncidentDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} 02:00 EST`);
    }
  }, [existingCase]);

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!title.trim()) {
      errs.title = 'Case title is strictly required.';
    } else if (title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters long.';
    }

    if (!location.trim()) {
      errs.location = 'Incident location is required.';
    }

    if (!incidentDate.trim()) {
      errs.incidentDate = 'Incident timestamp is required.';
    }

    if (!shortDescription.trim()) {
      errs.shortDescription = 'Executive summary is required.';
    } else if (shortDescription.trim().length < 15) {
      errs.shortDescription = 'Summary must contain at least 15 characters.';
    }

    if (!fullBriefing.trim()) {
      errs.fullBriefing = 'Detailed case briefing is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    if (isEditMode && existingCase) {
      const updated: InvestigationCase = {
        ...existingCase,
        title: title.trim().toUpperCase(),
        type: caseType,
        location: location.trim(),
        incidentDate: incidentDate.trim(),
        status,
        priority,
        shortDescription: shortDescription.trim(),
        fullBriefing: fullBriefing.trim(),
        crimeScene: {
          ...existingCase.crimeScene,
          name: sceneName.trim() || existingCase.crimeScene.name,
          environmentDescription: environmentDescription.trim() || existingCase.crimeScene.environmentDescription
        }
      };

      updateCase(updated);
      setIsSubmitting(false);
      navigate(`/cases/${updated.id}`);
    } else {
      // Generate new Case ID
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const newId = `CX-2026-${randomSuffix}`;

      const newCaseData: Omit<InvestigationCase, 'progress'> = {
        id: newId,
        title: title.trim().toUpperCase(),
        type: caseType,
        location: location.trim(),
        incidentDate: incidentDate.trim(),
        status,
        priority,
        shortDescription: shortDescription.trim(),
        fullBriefing: fullBriefing.trim(),
        leadInvestigator: user ? `${user.name} (${user.badgeNumber})` : 'Senior Detective',
        evidenceCount: 0,
        suspectCount: 0,
        witnessCount: 0,
        lastAccessed: 'Just now',
        themeColor: 'cyan',
        crimeScene: {
          name: sceneName.trim() || 'Primary Crime Scene',
          environmentDescription: environmentDescription.trim() || 'Standard investigation perimeter with secured ingress corridors.',
          dimensions: '12m x 10m',
          hotspots: []
        },
        evidenceList: [],
        suspects: [],
        witnesses: [],
        timeline: [
          {
            id: `tl-${Date.now()}`,
            time: '02:00 EST',
            title: 'Initial Incident Window',
            description: 'Disruption or breach registered in facility telemetry.',
            source: 'DISPATCH',
            type: 'INCIDENT_ORIGIN'
          }
        ],
        cctvFeeds: [],
        forensics: [],
        boardNodes: [],
        boardConnections: [],
        deductionMetrics: {
          evidenceSynthesisScore: 20,
          timelineCoherence: 25,
          suspectCorrelation: 15,
          solvabilityRating: 20,
          primaryHypothesis: 'Awaiting on-site evidence cataloging and forensic extraction.',
          contradictionsCount: 0,
          keyFindings: ['Initial crime scene logged into CaseX.']
        },
        warrantData: {
          minimumEvidenceRequired: 3,
          legalCriteria: [
            'Physical or biological trace establishing suspect presence at scene.',
            'Disproven or contradictory alibi during primary incident window.',
            'Documented motive and unauthorized security credential access.'
          ],
          warrantIssued: false
        }
      };

      const created = addCase(newCaseData);
      setIsSubmitting(false);
      navigate(`/cases/${created.id}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 font-mono">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-4 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>BACK</span>
      </button>

      <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-hud font-bold text-lg sm:text-xl text-white tracking-wider">
              {isEditMode ? `EDIT INVESTIGATION DOSSIER: #${caseId}` : 'REGISTER NEW INVESTIGATION CASE'}
            </h1>
            <p className="text-xs text-slate-400">
              {isEditMode
                ? 'Update procedural parameters, scene coordinates, and executive briefings.'
                : 'Formulate initial case parameters to instantiate evidence lockers and suspect matrices.'}
            </p>
          </div>
        </div>

        {!isEditMode && (
          <div className="flex items-center gap-2 mb-6 p-1.5 rounded-xl bg-black/40 border border-white/10 w-fit">
            <button
              type="button"
              onClick={() => setCreationMode('WIZARD')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                creationMode === 'WIZARD'
                  ? 'bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>4-STEP GUIDED WIZARD</span>
            </button>
            <button
              type="button"
              onClick={() => setCreationMode('FORM')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                creationMode === 'FORM'
                  ? 'bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FormInput className="w-3.5 h-3.5" />
              <span>STANDARD FORM</span>
            </button>
          </div>
        )}

        {!isEditMode && creationMode === 'WIZARD' ? (
          <CaseCreationWizard />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="CASE TITLE" required error={errors.title}>
              <TextInput
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. THE EMERALD ARCHIVE INCIDENT"
                error={Boolean(errors.title)}
              />
            </FormField>

            <FormField label="INCIDENT CLASSIFICATION" required>
              <SelectInput
                value={caseType}
                onChange={e => setCaseType(e.target.value)}
                options={[
                  { value: 'HIGH-VALUE THEFT', label: 'HIGH-VALUE THEFT' },
                  { value: 'HOMICIDE', label: 'HOMICIDE / FOUL PLAY' },
                  { value: 'CYBER SABOTAGE', label: 'CYBER SABOTAGE / EMP' },
                  { value: 'ESPIONAGE', label: 'CORPORATE ESPIONAGE' },
                  { value: 'KIDNAPPING', label: 'HIGH-PROFILE ABDUCTION' }
                ]}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="PRIMARY SCENE LOCATION" required error={errors.location}>
              <TextInput
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. 740 PARK AVE, SUITE 14B, NEW YORK, NY"
                error={Boolean(errors.location)}
              />
            </FormField>

            <FormField label="INCIDENT DATE / TIMESTAMP" required error={errors.incidentDate}>
              <TextInput
                value={incidentDate}
                onChange={e => setIncidentDate(e.target.value)}
                placeholder="e.g. 2026-07-14 02:35 EST"
                error={Boolean(errors.incidentDate)}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="INVESTIGATION STATUS" required>
              <SelectInput
                value={status}
                onChange={e => setStatus(e.target.value as CaseStatus)}
                options={[
                  { value: 'ACTIVE', label: 'ACTIVE (IN PROGRESS)' },
                  { value: 'UNDER INVESTIGATION', label: 'UNDER ACTIVE LAB REVIEW' },
                  { value: 'COLD CASE', label: 'COLD CASE / SUSPENDED' },
                  { value: 'SOLVED', label: 'SOLVED / WARRANT EXECUTED' },
                  { value: 'RESTRICTED', label: 'RESTRICTED / SEALED' }
                ]}
              />
            </FormField>

            <FormField label="THREAT / PRIORITY LEVEL" required>
              <SelectInput
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
                options={[
                  { value: 'CRITICAL', label: 'CRITICAL (TOP TIER)' },
                  { value: 'HIGH', label: 'HIGH' },
                  { value: 'MEDIUM', label: 'MEDIUM' },
                  { value: 'LOW', label: 'LOW' }
                ]}
              />
            </FormField>
          </div>

          <FormField
            label="EXECUTIVE SUMMARY"
            required
            hint="Max 250 characters"
            error={errors.shortDescription}
          >
            <TextInput
              value={shortDescription}
              onChange={e => setShortDescription(e.target.value)}
              placeholder="Brief 1-2 sentence overview of the crime and initial findings..."
              maxLength={250}
              error={Boolean(errors.shortDescription)}
            />
          </FormField>

          <FormField
            label="DETAILED CASE BRIEFING"
            required
            hint="Chronology, known factors, perimeter security notes"
            error={errors.fullBriefing}
          >
            <TextArea
              value={fullBriefing}
              onChange={e => setFullBriefing(e.target.value)}
              placeholder="Comprehensive incident report outlining entry points, electrical logs, security responses, and physical discoveries..."
              rows={5}
              error={Boolean(errors.fullBriefing)}
            />
          </FormField>

          <div className="pt-2 border-t border-white/10 space-y-4">
            <h3 className="font-hud font-bold text-xs text-cyan-400 tracking-wider uppercase">
              CRIME SCENE ROOM METRICS
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="CRIME SCENE ROOM NAME">
                <TextInput
                  value={sceneName}
                  onChange={e => setSceneName(e.target.value)}
                  placeholder="e.g. Master Vault & Gallery"
                />
              </FormField>

              <FormField label="ENVIRONMENT CHARACTERISTICS">
                <TextInput
                  value={environmentDescription}
                  onChange={e => setEnvironmentDescription(e.target.value)}
                  placeholder="e.g. Pressurized clean-room with biometric sensors"
                />
              </FormField>
            </div>
          </div>

          <FormActions
            submitLabel={isEditMode ? 'SAVE DOSSIER' : 'INSTANTIATE CASE'}
            onCancel={() => navigate(-1)}
            isSubmitting={isSubmitting}
          />
        </form>
      )}
      </div>
    </div>
  );
};
