import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  PlusCircle,
  FileText,
  CheckSquare,
  Calendar,
  Layers,
  HelpCircle,
  Settings,
  Bell,
  Search,
  ScanEye,
  X,
  ArrowRight
} from 'lucide-react';
import { useCase } from '../../context/CaseContext';

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  label: string;
  category: 'NAVIGATION' | 'QUICK ACTION' | 'INTELLIGENCE';
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
}

export const CommandMenu: React.FC<CommandMenuProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { selectedCaseId } = useCase();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeCaseId = selectedCaseId || 'NY-2026-0884';

  const commands: CommandItem[] = [
    // Quick Actions
    {
      id: 'qa-case',
      label: 'Create New Case Dossier',
      category: 'QUICK ACTION',
      icon: <PlusCircle className="w-4 h-4 text-cyan-400" />,
      action: () => navigate('/cases/new')
    },
    {
      id: 'qa-ev',
      label: 'Log New Evidence Exhibit',
      category: 'QUICK ACTION',
      icon: <PlusCircle className="w-4 h-4 text-emerald-400" />,
      action: () => navigate(`/cases/${activeCaseId}/evidence/new`)
    },
    {
      id: 'qa-task',
      label: 'Assign Investigation Task',
      category: 'QUICK ACTION',
      icon: <CheckSquare className="w-4 h-4 text-amber-400" />,
      action: () => navigate('/tasks')
    },
    {
      id: 'qa-note',
      label: 'Document Field Note',
      category: 'QUICK ACTION',
      icon: <FileText className="w-4 h-4 text-purple-400" />,
      action: () => navigate(`/cases/${activeCaseId}/notes`)
    },
    // Navigation
    {
      id: 'nav-dash',
      label: 'Go to Command Center Dashboard',
      category: 'NAVIGATION',
      icon: <LayoutDashboard className="w-4 h-4 text-slate-300" />,
      action: () => navigate('/dashboard')
    },
    {
      id: 'nav-cases',
      label: 'View All Case Archives',
      category: 'NAVIGATION',
      icon: <FolderOpen className="w-4 h-4 text-slate-300" />,
      action: () => navigate('/cases')
    },
    {
      id: 'nav-workspace',
      label: 'Active Case Investigation Workspace',
      category: 'NAVIGATION',
      icon: <Layers className="w-4 h-4 text-cyan-400" />,
      action: () => navigate(`/cases/${activeCaseId}/workspace`)
    },
    {
      id: 'nav-tasks',
      label: 'Open Task Board (Kanban)',
      category: 'NAVIGATION',
      icon: <CheckSquare className="w-4 h-4 text-amber-400" />,
      action: () => navigate('/tasks')
    },
    {
      id: 'nav-calendar',
      label: 'Open Investigation Calendar & Deadlines',
      category: 'NAVIGATION',
      icon: <Calendar className="w-4 h-4 text-emerald-400" />,
      action: () => navigate('/calendar')
    },
    {
      id: 'nav-compare',
      label: 'Compare Case Dossiers Side-by-Side',
      category: 'NAVIGATION',
      icon: <Layers className="w-4 h-4 text-blue-400" />,
      action: () => navigate('/cases/compare')
    },
    {
      id: 'nav-scene',
      label: '3D Crime Scene Explorer',
      category: 'NAVIGATION',
      icon: <ScanEye className="w-4 h-4 text-cyan-400" />,
      action: () => navigate(`/cases/${activeCaseId}/crime-scene`)
    },
    {
      id: 'nav-help',
      label: 'Help Center & Forensics Glossary',
      category: 'NAVIGATION',
      icon: <HelpCircle className="w-4 h-4 text-slate-300" />,
      action: () => navigate('/help')
    },
    {
      id: 'nav-settings',
      label: 'Platform Preferences & Database Cache',
      category: 'NAVIGATION',
      icon: <Settings className="w-4 h-4 text-slate-300" />,
      action: () => navigate('/settings')
    }
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < filteredCommands.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredCommands.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-xl bg-[#0a0f1d] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or jump to feature (or press Esc)..."
            className="w-full bg-transparent text-sm font-mono text-white placeholder-slate-500 focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/10 text-slate-400 border border-white/10">
            ESC
          </kbd>
        </div>

        {/* Command list */}
        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-slate-500">
              No matching commands found.
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors font-mono text-xs ${
                    isSelected
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                      : 'text-slate-300 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="shrink-0">{cmd.icon}</span>
                    <span className="truncate">{cmd.label}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">
                      {cmd.category}
                    </span>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-white/5 bg-black/40 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>Use &uarr; &darr; to navigate</span>
          <span>Press Enter to select</span>
        </div>
      </div>
    </div>
  );
};
