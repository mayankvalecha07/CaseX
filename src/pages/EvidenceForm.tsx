import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCase } from '../context/CaseContext';
import { FormField } from '../components/forms/FormField';
import { TextInput } from '../components/forms/TextInput';
import { TextArea } from '../components/forms/TextArea';
import { SelectInput } from '../components/forms/SelectInput';
import { FormActions } from '../components/forms/FormActions';
import { EvidenceItem, EvidenceType, Importance } from '../types';
import { ArrowLeft, Package, Sparkles } from 'lucide-react';

export const EvidenceForm: React.FC = () => {
  const { caseId, evidenceId } = useParams<{ caseId: string; evidenceId?: string }>();
  const navigate = useNavigate();
  const { cases, addEvidence, updateEvidence } = useCase();

  const currentCase = cases.find(c => c.id === caseId);
  const isEditMode = Boolean(evidenceId);
  const existingEvidence = isEditMode
    ? currentCase?.evidenceList.find(e => e.id === evidenceId || e.code === evidenceId)
    : null;

  // Form State
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<EvidenceType>('PHYSICAL');
  const [importance, setImportance] = useState<Importance>('HIGH');
  const [locationFound, setLocationFound] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [description, setDescription] = useState('');
  const [forensicNotes, setForensicNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (existingEvidence) {
      setTitle(existingEvidence.title);
      setCode(existingEvidence.code);
      setCategory(existingEvidence.category);
      setImportance(existingEvidence.importance);
      setLocationFound(existingEvidence.locationFound);
      setTimestamp(existingEvidence.timestamp);
      setDescription(existingEvidence.description);
      setForensicNotes(existingEvidence.forensicNotes);
      setTagsInput(existingEvidence.tags?.join(', ') || '');
    } else {
      // Default code for new evidence
      const randNum = Math.floor(10 + Math.random() * 90);
      setCode(`EV-${caseId?.substring(0, 2) || 'CX'}-${randNum}`);
      setTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' EST');
    }
  }, [existingEvidence, caseId]);

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!title.trim()) {
      errs.title = 'Evidence title is required.';
    } else if (title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters.';
    }

    if (!code.trim()) {
      errs.code = 'Evidence registry code is required.';
    }

    if (!locationFound.trim()) {
      errs.locationFound = 'Found location is required.';
    }

    if (!description.trim()) {
      errs.description = 'Physical description is required.';
    }

    if (!forensicNotes.trim()) {
      errs.forensicNotes = 'Preliminary forensic notes are required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentCase || !validate()) {
      return;
    }

    setIsSubmitting(true);

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    if (isEditMode && existingEvidence) {
      const updated: EvidenceItem = {
        ...existingEvidence,
        title: title.trim(),
        code: code.trim().toUpperCase(),
        category,
        importance,
        locationFound: locationFound.trim(),
        timestamp: timestamp.trim(),
        description: description.trim(),
        forensicNotes: forensicNotes.trim(),
        tags
      };
      updateEvidence(currentCase.id, updated);
      setIsSubmitting(false);
      navigate(`/cases/${currentCase.id}/evidence/${updated.id}`);
    } else {
      const newEvidenceData: Omit<EvidenceItem, 'id' | 'status'> = {
        code: code.trim().toUpperCase(),
        title: title.trim(),
        category,
        importance,
        locationFound: locationFound.trim(),
        timestamp: timestamp.trim(),
        description: description.trim(),
        forensicNotes: forensicNotes.trim(),
        tags,
        analysisResults: {
          matchRate: 94,
          technician: 'Forensic Lab Unit',
          details: 'Exhibit securely logged and verified under clean-room protocol.',
          verified: false
        }
      };

      const created = addEvidence(currentCase.id, newEvidenceData);
      setIsSubmitting(false);
      navigate(`/cases/${currentCase.id}/evidence/${created.id}`);
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

      <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-hud font-bold text-lg sm:text-xl text-white tracking-wider">
              {isEditMode ? `EDIT EVIDENCE EXHIBIT: ${existingEvidence?.code}` : 'CATALOG NEW PHYSICAL EVIDENCE'}
            </h1>
            <p className="text-xs text-slate-400">
              {isEditMode
                ? 'Update forensic parameters, exhibit categorization, and discovery notes.'
                : `Log a discovered exhibit into Case #${caseId} Evidence Locker.`}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="EXHIBIT TITLE" required error={errors.title}>
              <TextInput
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Broken Acoustic Laser Diode"
                error={Boolean(errors.title)}
              />
            </FormField>

            <FormField label="EVIDENCE CODE" required error={errors.code}>
              <TextInput
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="e.g. EV-NY-09"
                error={Boolean(errors.code)}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="EVIDENCE CATEGORY" required>
              <SelectInput
                value={category}
                onChange={e => setCategory(e.target.value as EvidenceType)}
                options={[
                  { value: 'PHYSICAL', label: 'PHYSICAL OBJECT / HARDWARE' },
                  { value: 'BIOLOGICAL', label: 'BIOLOGICAL / DNA / RESIDUE' },
                  { value: 'DIGITAL', label: 'DIGITAL STORAGE / TELEMETRY' },
                  { value: 'TRACE', label: 'TRACE FIBER / RESIDUE' },
                  { value: 'BALLISTICS', label: 'BALLISTICS / PROJECTILE' },
                  { value: 'DOCUMENT', label: 'DOCUMENT / LEDGER / BLUEPRINT' }
                ]}
              />
            </FormField>

            <FormField label="LEGAL IMPORTANCE" required>
              <SelectInput
                value={importance}
                onChange={e => setImportance(e.target.value as Importance)}
                options={[
                  { value: 'CRITICAL', label: 'CRITICAL (CASE-BREAKING)' },
                  { value: 'HIGH', label: 'HIGH (DIRECT CORROBORATION)' },
                  { value: 'MEDIUM', label: 'MEDIUM (CIRCUMSTANTIAL)' },
                  { value: 'LOW', label: 'LOW (PERIPHERAL)' }
                ]}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="FOUND AT (EXACT SCENE LOCATION)" required error={errors.locationFound}>
              <TextInput
                value={locationFound}
                onChange={e => setLocationFound(e.target.value)}
                placeholder="e.g. Master Vault interior floor, under safe latch"
                error={Boolean(errors.locationFound)}
              />
            </FormField>

            <FormField label="DISCOVERY TIMESTAMP" required>
              <TextInput
                value={timestamp}
                onChange={e => setTimestamp(e.target.value)}
                placeholder="e.g. 03:45 EST"
              />
            </FormField>
          </div>

          <FormField label="PHYSICAL APPEARANCE & SPECIFICATIONS" required error={errors.description}>
            <TextArea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detailed physical characteristics, color, serial numbers, wear, damage..."
              rows={3}
              error={Boolean(errors.description)}
            />
          </FormField>

          <FormField label="PRELIMINARY FORENSIC NOTES" required error={errors.forensicNotes}>
            <TextArea
              value={forensicNotes}
              onChange={e => setForensicNotes(e.target.value)}
              placeholder="Initial lab notes, spectrometer indications, chemical or biometric signatures..."
              rows={3}
              error={Boolean(errors.forensicNotes)}
            />
          </FormField>

          <FormField label="TAGS (COMMA-SEPARATED)" hint="e.g. laser, vault, bypass, acoustic">
            <TextInput
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="laser, bypass, safe, hardware"
            />
          </FormField>

          <FormActions
            submitLabel={isEditMode ? 'SAVE EXHIBIT' : 'PACKAGE & LOG EVIDENCE'}
            onCancel={() => navigate(-1)}
            isSubmitting={isSubmitting}
          />
        </form>
      </div>
    </div>
  );
};
