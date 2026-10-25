import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCase } from '../context/CaseContext';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { FormField } from '../components/forms/FormField';
import { TextInput } from '../components/forms/TextInput';
import { TextArea } from '../components/forms/TextArea';
import { SelectInput } from '../components/forms/SelectInput';
import { FormActions } from '../components/forms/FormActions';
import { EmptyState } from '../components/ui/EmptyState';
import { InvestigationNote } from '../types';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Calendar,
  AlertTriangle,
  FolderOpen,
  Users,
  Tag
} from 'lucide-react';

export const Notes: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { cases, selectedCaseId, notes, addNote, updateNote, deleteNote } = useCase();

  const targetCaseId = caseId || selectedCaseId || 'NY-2026-0884';
  const currentCase = cases.find(c => c.id === targetCaseId);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<InvestigationNote | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<InvestigationNote | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<InvestigationNote['category']>('HYPOTHESIS');
  const [selectedEvidenceId, setSelectedEvidenceId] = useState('');
  const [selectedSuspectId, setSelectedSuspectId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const caseNotes = notes.filter(n => n.caseId === targetCaseId);

  // Filtered and Sorted Notes
  const filteredNotes = caseNotes
    .filter(n => {
      const matchesSearch =
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'ALL' || n.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return a.title.localeCompare(b.title);
    });

  const openCreateModal = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setCategory('HYPOTHESIS');
    setSelectedEvidenceId('');
    setSelectedSuspectId('');
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (note: InvestigationNote) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category);
    setSelectedEvidenceId(note.associatedEvidenceIds?.[0] || '');
    setSelectedSuspectId(note.associatedSuspectIds?.[0] || '');
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required.';
    if (!content.trim()) errs.content = 'Content is required.';
    if (content.trim().length < 10) errs.content = 'Note content must be at least 10 characters.';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const associatedEvidenceIds = selectedEvidenceId ? [selectedEvidenceId] : [];
    const associatedSuspectIds = selectedSuspectId ? [selectedSuspectId] : [];

    if (editingNote) {
      updateNote({
        ...editingNote,
        title: title.trim(),
        content: content.trim(),
        category,
        associatedEvidenceIds,
        associatedSuspectIds
      });
    } else {
      addNote({
        caseId: targetCaseId,
        title: title.trim(),
        content: content.trim(),
        category,
        associatedEvidenceIds,
        associatedSuspectIds
      });
    }

    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (noteToDelete) {
      deleteNote(noteToDelete.id);
      setNoteToDelete(null);
    }
  };

  const categoryBadgeColor: Record<InvestigationNote['category'], string> = {
    HYPOTHESIS: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    FORENSICS: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    WITNESS_LEAD: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    PROCEDURAL: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    GENERAL: 'bg-slate-500/15 text-slate-300 border-slate-500/30'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 font-mono animate-in fade-in duration-200">
      {/* Create / Edit Note Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingNote ? 'EDIT INVESTIGATION NOTE' : 'RECORD NEW INVESTIGATION NOTE'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <FormField label="NOTE TITLE" required error={errors.title}>
            <TextInput
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Alibi Contradiction in Shift Logs"
              error={Boolean(errors.title)}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField label="CATEGORY" required>
              <SelectInput
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                options={[
                  { value: 'HYPOTHESIS', label: 'HYPOTHESIS' },
                  { value: 'FORENSICS', label: 'FORENSIC LEAD' },
                  { value: 'WITNESS_LEAD', label: 'WITNESS TESTIMONY' },
                  { value: 'PROCEDURAL', label: 'PROCEDURAL' },
                  { value: 'GENERAL', label: 'GENERAL NOTE' }
                ]}
              />
            </FormField>

            <FormField label="LINK EVIDENCE (OPTIONAL)">
              <SelectInput
                value={selectedEvidenceId}
                onChange={e => setSelectedEvidenceId(e.target.value)}
                options={[
                  { value: '', label: 'None' },
                  ...(currentCase?.evidenceList.map(e => ({
                    value: e.id,
                    label: `[${e.code}] ${e.title}`
                  })) || [])
                ]}
              />
            </FormField>

            <FormField label="LINK SUSPECT (OPTIONAL)">
              <SelectInput
                value={selectedSuspectId}
                onChange={e => setSelectedSuspectId(e.target.value)}
                options={[
                  { value: '', label: 'None' },
                  ...(currentCase?.suspects.map(s => ({
                    value: s.id,
                    label: s.name
                  })) || [])
                ]}
              />
            </FormField>
          </div>

          <FormField label="NOTE CONTENT" required error={errors.content}>
            <TextArea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write detailed observations, chronological deductions, and investigative leads..."
              rows={5}
              error={Boolean(errors.content)}
            />
          </FormField>

          <FormActions
            submitLabel={editingNote ? 'UPDATE NOTE' : 'SAVE TO CASE FILE'}
            onCancel={() => setIsModalOpen(false)}
          />
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(noteToDelete)}
        onClose={() => setNoteToDelete(null)}
        title="CONFIRM NOTE DELETION"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <p className="font-bold text-white mb-1">DELETE NOTE RECORD</p>
              <p>
                Are you sure you want to delete note <strong>"{noteToDelete?.title}"</strong>? This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="ghost" size="sm" onClick={() => setNoteToDelete(null)}>
              CANCEL
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={confirmDelete}
              className="bg-rose-600 hover:bg-rose-500 text-white border-rose-500"
            >
              CONFIRM DELETE
            </Button>
          </div>
        </div>
      </Modal>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
              CASE #{targetCaseId}
            </span>
          </div>
          <h1 className="font-hud font-bold text-2xl text-white tracking-wide">
            INVESTIGATION NOTES & HYPOTHESES
          </h1>
          <p className="text-xs text-slate-400">
            Log hypotheses, link evidence exhibits, and catalog detective reasoning for case evaluation.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={openCreateModal}
          icon={<Plus className="w-3.5 h-3.5" />}
          className="shadow-[0_0_15px_rgba(6,182,212,0.3)] self-start md:self-auto"
        >
          NEW INVESTIGATION NOTE
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
        <div className="flex-1 w-full sm:w-auto relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search notes by keyword or hypothesis..."
            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white text-xs outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="ALL">ALL CATEGORIES</option>
            <option value="HYPOTHESIS">HYPOTHESIS</option>
            <option value="FORENSICS">FORENSICS</option>
            <option value="WITNESS_LEAD">WITNESS LEAD</option>
            <option value="PROCEDURAL">PROCEDURAL</option>
            <option value="GENERAL">GENERAL</option>
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="newest">NEWEST FIRST</option>
            <option value="oldest">OLDEST FIRST</option>
            <option value="title">TITLE (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-8 h-8 text-slate-500" />}
          title="NO INVESTIGATION NOTES RECORDED"
          description={
            searchQuery
              ? `Zero notes found matching "${searchQuery}".`
              : 'Record detective hypotheses, forensic clues, and procedural notes for this active case.'
          }
          actionLabel="ADD FIRST NOTE"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map(note => (
            <div
              key={note.id}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-cyan-400/30 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                      categoryBadgeColor[note.category]
                    }`}
                  >
                    {note.category}
                  </span>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(note)}
                      className="p-1 rounded text-slate-400 hover:text-cyan-400 transition-colors"
                      title="Edit note"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setNoteToDelete(note)}
                      className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-hud font-bold text-sm text-white group-hover:text-cyan-300">
                  {note.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {note.content}
                </p>

                {/* Linked evidence/suspect tags */}
                {((note.associatedEvidenceIds && note.associatedEvidenceIds.length > 0) ||
                  (note.associatedSuspectIds && note.associatedSuspectIds.length > 0)) && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/5 text-[10px]">
                    {note.associatedEvidenceIds?.map(evId => (
                      <span key={evId} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <FolderOpen className="w-3 h-3" />
                        {evId}
                      </span>
                    ))}
                    {note.associatedSuspectIds?.map(sId => (
                      <span key={sId} className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {sId}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(note.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span>Case #{note.caseId}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
