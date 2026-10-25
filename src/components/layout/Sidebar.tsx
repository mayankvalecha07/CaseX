import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useCase } from '../../context/CaseContext';
import {
  LayoutDashboard,
  ScanEye,
  FolderOpen,
  Clock,
  Users,
  MessageSquareQuote,
  Video,
  FlaskConical,
  Network,
  Cpu,
  Gavel,
  FileText,
  Globe,
  Database,
  User,
  Settings as SettingsIcon,
  X,
  ShieldAlert,
  Layers,
  CheckSquare,
  Calendar,
  Printer,
  Inbox,
  HelpCircle,
  GitCompare
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  isDesktopOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number | undefined;
  badgeColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, isDesktopOpen, onClose }) => {
  const location = useLocation();
  const { selectedCase, tasks } = useCase();

  const caseId = selectedCase?.id || 'NY-2026-0884';

  const commandItems: NavItem[] = [
    {
      to: '/dashboard',
      label: 'COMMAND CENTER',
      icon: <LayoutDashboard className="w-4 h-4" />,
      badge: selectedCase ? `${selectedCase.progress}%` : undefined
    },
    {
      to: `/cases/${caseId}/workspace`,
      label: 'ACTIVE WORKSPACE',
      icon: <Layers className="w-4 h-4" />,
      badge: 'FOCUS',
      badgeColor: 'cyan'
    },
    {
      to: '/tasks',
      label: 'TASK BOARD',
      icon: <CheckSquare className="w-4 h-4" />,
      badge: tasks.filter(t => t.status !== 'COMPLETED').length
        ? `${tasks.filter(t => t.status !== 'COMPLETED').length}`
        : undefined,
      badgeColor: 'amber'
    },
    {
      to: '/calendar',
      label: 'CALENDAR & DUE DATES',
      icon: <Calendar className="w-4 h-4" />
    },
    {
      to: '/cases/compare',
      label: 'CASE COMPARISON',
      icon: <GitCompare className="w-4 h-4" />
    }
  ];

  const investigationItems: NavItem[] = [
    {
      to: '/cases',
      label: 'CASES',
      icon: <FolderOpen className="w-4 h-4" />
    },
    {
      to: `/cases/${caseId}/crime-scene`,
      label: 'CRIME SCENE',
      icon: <ScanEye className="w-4 h-4" />,
      badge: selectedCase?.crimeScene.hotspots.filter(h => !h.inspected).length
        ? `${selectedCase.crimeScene.hotspots.filter(h => !h.inspected).length} NEW`
        : undefined,
      badgeColor: 'cyan'
    },
    {
      to: `/cases/${caseId}/evidence`,
      label: 'EVIDENCE',
      icon: <FolderOpen className="w-4 h-4" />,
      badge: selectedCase ? `${selectedCase.evidenceList.length}` : undefined
    },
    {
      to: '/evidence/review',
      label: 'REVIEW QUEUE',
      icon: <Inbox className="w-4 h-4" />
    },
    {
      to: `/cases/${caseId}/timeline`,
      label: 'TIMELINE',
      icon: <Clock className="w-4 h-4" />,
      badge: selectedCase ? `${selectedCase.timeline.length}` : undefined
    },
    {
      to: `/cases/${caseId}/suspects`,
      label: 'SUSPECTS',
      icon: <Users className="w-4 h-4" />,
      badge: selectedCase ? `${selectedCase.suspects.length}` : undefined
    },
    {
      to: `/cases/${caseId}/witnesses`,
      label: 'WITNESSES',
      icon: <MessageSquareQuote className="w-4 h-4" />,
      badge: selectedCase ? `${selectedCase.witnesses.length}` : undefined
    },
    {
      to: `/cases/${caseId}/notes`,
      label: 'INVESTIGATION NOTES',
      icon: <FileText className="w-4 h-4" />
    },
    {
      to: `/cases/${caseId}/report`,
      label: 'CASE REPORT & PRINT',
      icon: <Printer className="w-4 h-4" />
    },
    {
      to: `/cases/${caseId}/cctv`,
      label: 'CCTV SURVEILLANCE',
      icon: <Video className="w-4 h-4" />,
      badge: 'CAM',
      badgeColor: 'cyan'
    },
    {
      to: `/cases/${caseId}/forensics`,
      label: 'FORENSICS LAB',
      icon: <FlaskConical className="w-4 h-4" />
    },
    {
      to: `/cases/${caseId}/detective-board`,
      label: 'DETECTIVE BOARD',
      icon: <Network className="w-4 h-4" />
    },
    {
      to: `/cases/${caseId}/ai-deduction`,
      label: 'AI DEDUCTION',
      icon: <Cpu className="w-4 h-4" />,
      badge: 'EVAL',
      badgeColor: 'purple'
    },
    {
      to: `/cases/${caseId}/warrant`,
      label: 'ARREST / WARRANT',
      icon: <Gavel className="w-4 h-4" />,
      badge: selectedCase?.warrantData.warrantIssued ? 'ISSUED' : 'PENDING',
      badgeColor: selectedCase?.warrantData.warrantIssued ? 'emerald' : 'amber'
    }
  ];

  const intelligenceItems: NavItem[] = [
    {
      to: '/intelligence',
      label: 'EXTERNAL INTELLIGENCE',
      icon: <Globe className="w-4 h-4" />,
      badge: 'REST API'
    },
    {
      to: '/help',
      label: 'HELP & GLOSSARY',
      icon: <HelpCircle className="w-4 h-4" />
    }
  ];

  const accountItems: NavItem[] = [
    {
      to: '/profile',
      label: 'PROFILE',
      icon: <User className="w-4 h-4" />
    },
    {
      to: '/settings',
      label: 'SETTINGS',
      icon: <SettingsIcon className="w-4 h-4" />
    }
  ];

  const renderNavGroup = (title: string, items: NavItem[]) => (
    <div className="space-y-1">
      <div className="px-3 pt-3 pb-1 text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold flex items-center justify-between">
        <span>{title}</span>
      </div>
      {items.map(item => {
        // Match path accurately
        const isMatch =
          location.pathname === item.to ||
          (item.to !== '/dashboard' &&
            item.to !== '/cases' &&
            location.pathname.startsWith(item.to));

        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono tracking-wider transition-all group ${
              isMatch
                ? 'bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-400/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={`transition-colors ${
                  isMatch ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'
                }`}
              >
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </div>

            {item.badge && (
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 ${
                  item.badgeColor === 'red'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : item.badgeColor === 'emerald'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : item.badgeColor === 'purple'
                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    : item.badgeColor === 'amber'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-cyan-500/10 text-cyan-400 border border-cyan-400/20'
                }`}
              >
                {item.badge}
              </span>
            )}
          </NavLink>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          role="presentation"
          aria-label="Close navigation menu"
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* Sidebar Shell */}
      <aside
        className={`fixed lg:sticky top-16 left-0 z-35 h-[calc(100vh-4rem)] w-64 bg-gradient-to-b from-[#0c1422]/98 via-[#080c15]/98 to-[#07090f]/98 lg:from-[#0c1422]/95 lg:via-[#080c15]/95 lg:to-[#07090f]/95 border-r border-cyan-400/15 shadow-[10px_0_40px_rgba(0,0,0,0.25)] backdrop-blur-2xl flex flex-col justify-between transition-transform duration-300 ${
          `${isOpen ? 'translate-x-0' : '-translate-x-full'} ${isDesktopOpen ? 'lg:translate-x-0' : 'lg:hidden'}`
        }`}
      >
        {/* Navigation Section */}
        <div className="py-4 px-3 overflow-y-auto flex-1 space-y-4 divide-y divide-cyan-300/[0.08]">
          {/* Mobile close bar */}
          <div className="lg:hidden flex items-center justify-between pb-2 px-2 border-b border-white/10">
            <span className="text-[11px] font-mono text-cyan-400 font-bold">NAVIGATION MENU</span>
            <button
              onClick={onClose}
              aria-label="Close navigation menu"
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {renderNavGroup('COMMAND', commandItems)}
          {renderNavGroup('INVESTIGATION', investigationItems)}
          {renderNavGroup('INTELLIGENCE', intelligenceItems)}
          {renderNavGroup('ACCOUNT', accountItems)}
        </div>

        {/* Current Case Indicator Card */}
        {selectedCase && (
          <div className="p-3 border-t border-cyan-300/15 bg-gradient-to-r from-cyan-500/[0.06] to-transparent">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-950/35 to-slate-950/70 border border-cyan-400/20 shadow-inner">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                <span>ACTIVE DOSSIER</span>
                <span className="text-cyan-400 font-bold">#{selectedCase.id}</span>
              </div>
              <p className="text-xs font-bold font-hud text-white truncate">
                {selectedCase.title}
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[10px] font-mono">
                <span className="text-slate-400">PROGRESS</span>
                <span className="text-cyan-400 font-bold">{selectedCase.progress}%</span>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
