import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Clock,
  Calendar,
  User,
  AlertTriangle,
  FolderOpen,
  Filter,
  Trash2,
  Edit2,
  ArrowRight,
  List,
  Columns
} from 'lucide-react';
import { useCase } from '../context/CaseContext';
import { InvestigationTask, Priority } from '../types';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';

export const TaskBoardPage: React.FC = () => {
  const { cases, tasks, selectedCaseId, addTask, updateTask, deleteTask, updateTaskStatus } = useCase();
  const [selectedCaseFilter, setSelectedCaseFilter] = useState<string>('ALL');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'KANBAN' | 'LIST'>('KANBAN');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<InvestigationTask | null>(null);

  // Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskCaseId, setTaskCaseId] = useState(selectedCaseId || 'NY-2026-0884');
  const [taskPriority, setTaskPriority] = useState<Priority>('HIGH');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskAssignedTo, setTaskAssignedTo] = useState('Det. Pulkit Gupta');

  const filteredTasks = tasks.filter(t => {
    if (selectedCaseFilter !== 'ALL' && t.caseId !== selectedCaseFilter) return false;
    if (selectedPriorityFilter !== 'ALL' && t.priority !== selectedPriorityFilter) return false;
    return true;
  });

  const todoTasks = filteredTasks.filter(t => t.status === 'TODO');
  const inProgressTasks = filteredTasks.filter(t => t.status === 'IN_PROGRESS');
  const completedTasks = filteredTasks.filter(t => t.status === 'COMPLETED');

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'COMPLETED') return false;
    const due = new Date(dueDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return due < now;
  };

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setTaskTitle('');
    setTaskDescription('');
    setTaskCaseId(selectedCaseId || 'NY-2026-0884');
    setTaskPriority('HIGH');
    setTaskDueDate(new Date().toISOString().split('T')[0]);
    setTaskAssignedTo('Det. Pulkit Gupta');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: InvestigationTask) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description);
    setTaskCaseId(task.caseId);
    setTaskPriority(task.priority);
    setTaskDueDate(task.dueDate);
    setTaskAssignedTo(task.assignedTo || 'Det. Pulkit Gupta');
    setIsModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    if (editingTask) {
      updateTask({
        ...editingTask,
        title: taskTitle.trim(),
        description: taskDescription.trim(),
        caseId: taskCaseId,
        priority: taskPriority,
        dueDate: taskDueDate,
        assignedTo: taskAssignedTo
      });
    } else {
      addTask({
        title: taskTitle.trim(),
        description: taskDescription.trim(),
        caseId: taskCaseId,
        priority: taskPriority,
        dueDate: taskDueDate,
        status: 'TODO',
        assignedTo: taskAssignedTo
      });
    }

    setIsModalOpen(false);
  };

  const priorityColors: Record<Priority, string> = {
    CRITICAL: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    HIGH: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    MEDIUM: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    LOW: 'bg-slate-500/10 text-slate-400 border-slate-500/30'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
            <CheckSquare className="w-4 h-4" />
            <span>OPERATIONAL TASK BOARD</span>
          </div>
          <h1 className="text-2xl font-bold font-hud text-white tracking-wide">
            INVESTIGATION TASK FORCE
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Track operational leads, lab subpoenas, witness interrogations, and suspect surveillance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setViewMode('KANBAN')}
              className={`p-1.5 rounded-lg text-xs font-mono transition-all ${
                viewMode === 'KANBAN'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Kanban Board View"
            >
              <Columns className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`p-1.5 rounded-lg text-xs font-mono transition-all ${
                viewMode === 'LIST'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreateModal}
            icon={<Plus className="w-4 h-4" />}
          >
            CREATE TASK
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white/[0.02] border border-white/10 rounded-xl text-xs font-mono">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>CASE:</span>
            <select
              value={selectedCaseFilter}
              onChange={e => setSelectedCaseFilter(e.target.value)}
              className="bg-black/60 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
            >
              <option value="ALL">ALL CASES ({tasks.length})</option>
              {cases.map(c => (
                <option key={c.id} value={c.id}>
                  {c.id} - {c.title.substring(0, 24)}...
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <span>PRIORITY:</span>
            <select
              value={selectedPriorityFilter}
              onChange={e => setSelectedPriorityFilter(e.target.value)}
              className="bg-black/60 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
            >
              <option value="ALL">ALL PRIORITIES</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-400">
          <span>{filteredTasks.length} Tasks matching filter</span>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'KANBAN' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* TO DO COLUMN */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span className="text-xs font-bold font-hud text-white uppercase tracking-wider">
                  TO DO
                </span>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 font-bold">
                {todoTasks.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[400px]">
              {todoTasks.map(task => renderTaskCard(task))}
              {todoTasks.length === 0 && (
                <div className="p-8 rounded-xl border border-dashed border-white/10 text-center text-xs font-mono text-slate-500">
                  No tasks waiting in To Do.
                </div>
              )}
            </div>
          </div>

          {/* IN PROGRESS COLUMN */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-bold font-hud text-cyan-300 uppercase tracking-wider">
                  IN PROGRESS
                </span>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                {inProgressTasks.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[400px]">
              {inProgressTasks.map(task => renderTaskCard(task))}
              {inProgressTasks.length === 0 && (
                <div className="p-8 rounded-xl border border-dashed border-white/10 text-center text-xs font-mono text-slate-500">
                  No tasks actively in progress.
                </div>
              )}
            </div>
          </div>

          {/* COMPLETED COLUMN */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold font-hud text-emerald-300 uppercase tracking-wider">
                  COMPLETED
                </span>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                {completedTasks.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[400px]">
              {completedTasks.map(task => renderTaskCard(task))}
              {completedTasks.length === 0 && (
                <div className="p-8 rounded-xl border border-dashed border-white/10 text-center text-xs font-mono text-slate-500">
                  No tasks completed yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'LIST' && (
        <div className="rounded-xl border border-white/10 overflow-hidden bg-[#0a0f1d]">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-white/5 border-b border-white/10 text-slate-400 text-[10px] uppercase">
              <tr>
                <th className="p-3">Status</th>
                <th className="p-3">Task Details</th>
                <th className="p-3">Case ID</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Due Date</th>
                <th className="p-3">Assigned To</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTasks.map(task => (
                <tr key={task.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-3">
                    <select
                      value={task.status}
                      onChange={e => updateTaskStatus(task.id, e.target.value as any)}
                      className={`text-[10px] font-mono px-2 py-1 rounded border bg-black/60 font-bold ${
                        task.status === 'COMPLETED'
                          ? 'text-emerald-400 border-emerald-500/30'
                          : task.status === 'IN_PROGRESS'
                          ? 'text-cyan-400 border-cyan-500/30'
                          : 'text-slate-400 border-white/10'
                      }`}
                    >
                      <option value="TODO">TO DO</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-white text-xs">{task.title}</div>
                    <div className="text-slate-400 text-[11px] truncate max-w-xs">{task.description}</div>
                  </td>
                  <td className="p-3 text-cyan-400 font-bold">{task.caseId}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] border ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={isOverdue(task.dueDate, task.status) ? 'text-rose-400 font-bold flex items-center gap-1' : 'text-slate-300'}>
                      {isOverdue(task.dueDate, task.status) && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                      {task.dueDate}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">{task.assignedTo || 'Unassigned'}</td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEditModal(task)}
                      className="text-slate-400 hover:text-white p-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-slate-400 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Task Creation / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'EDIT INVESTIGATION TASK' : 'ASSIGN NEW INVESTIGATION TASK'}
      >
        <form onSubmit={handleSaveTask} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1 font-bold">
              TASK TITLE <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              value={taskTitle}
              onChange={e => setTaskTitle(e.target.value)}
              placeholder="e.g. Subpoena Bank Surveillance Video"
              required
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1 font-bold">
              TASK DESCRIPTION
            </label>
            <textarea
              rows={3}
              value={taskDescription}
              onChange={e => setTaskDescription(e.target.value)}
              placeholder="Operational details, expected deliverables, forensic leads..."
              className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs font-sans text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1 font-bold">
                ASSOCIATED CASE
              </label>
              <select
                value={taskCaseId}
                onChange={e => setTaskCaseId(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
              >
                {cases.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.id} - {c.title.substring(0, 20)}...
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1 font-bold">
                PRIORITY LEVEL
              </label>
              <select
                value={taskPriority}
                onChange={e => setTaskPriority(e.target.value as Priority)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1 font-bold">
                DUE DATE
              </label>
              <input
                type="date"
                value={taskDueDate}
                onChange={e => setTaskDueDate(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1 font-bold">
                ASSIGNED INVESTIGATOR
              </label>
              <input
                type="text"
                value={taskAssignedTo}
                onChange={e => setTaskAssignedTo(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              CANCEL
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingTask ? 'UPDATE TASK' : 'ASSIGN TASK'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );

  function renderTaskCard(task: InvestigationTask) {
    const overdue = isOverdue(task.dueDate, task.status);

    return (
      <div
        key={task.id}
        className="p-4 rounded-xl bg-[#0a0f1d] border border-white/10 hover:border-cyan-400/40 transition-all shadow-md group relative space-y-3"
      >
        <div className="flex items-start justify-between gap-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono border font-bold ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleOpenEditModal(task)}
              className="text-slate-400 hover:text-white p-1"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => deleteTask(task.id)}
              className="text-slate-400 hover:text-rose-400 p-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold font-hud text-white leading-snug">
            {task.title}
          </h4>
          {task.description && (
            <p className="text-xs text-slate-400 line-clamp-2 mt-1 font-sans">
              {task.description}
            </p>
          )}
        </div>

        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1 text-cyan-400 font-bold">
            <FolderOpen className="w-3 h-3" />
            <span>{task.caseId}</span>
          </div>

          <div className="flex items-center gap-1">
            <User className="w-3 h-3 text-slate-500" />
            <span className="truncate max-w-[100px]">{task.assignedTo || 'Unassigned'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 text-[10px] font-mono">
          <div className={`flex items-center gap-1 ${overdue ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
            <Calendar className="w-3 h-3" />
            <span>Due {task.dueDate}</span>
            {overdue && <span className="text-[9px] uppercase tracking-wider text-rose-400">(OVERDUE)</span>}
          </div>

          {/* Quick status selector */}
          <select
            value={task.status}
            onChange={e => updateTaskStatus(task.id, e.target.value as any)}
            className="bg-black/60 border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-slate-300 focus:outline-none"
          >
            <option value="TODO">&rarr; To Do</option>
            <option value="IN_PROGRESS">&rarr; In Progress</option>
            <option value="COMPLETED">&rarr; Completed</option>
          </select>
        </div>
      </div>
    );
  }
};
