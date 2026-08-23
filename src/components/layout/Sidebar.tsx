import React from 'react';
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
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface SidebarProps {
  currentRoute: string;
  navigate: (route: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  navigate,
  isOpen,
  onClose
}) => {
  const { selectedCase } = useCase();

  const navItems = [
    {
      id: '/dashboard',
      label: 'COMMAND CENTER',
      icon: <LayoutDashboard className="w-4 h-4" />,
      badge: selectedCase ? `${selectedCase.progress}%` : undefined
    },
    {
      id: '/crime-scene',
      label: 'CRIME SCENE',
      icon: <ScanEye className="w-4 h-4" />,
      badge: selectedCase?.crimeScene.hotspots.filter(h => !h.inspected).length
        ? `${selectedCase.crimeScene.hotspots.filter(h => !h.inspected).length} NEW`
        : undefined,
      badgeColor: 'cyan'
    },
    {
      id: '/evidence',
      label: 'EVIDENCE LOCKER',
      icon: <FolderOpen className="w-4 h-4" />,
      badge: selectedCase ? `${selectedCase.evidenceList.length}` : undefined
    },
    {
      id: '/timeline',
      label: 'TIMELINE BUILDER',
      icon: <Clock className="w-4 h-4" />,
      badge: selectedCase ? `${selectedCase.timeline.length}` : undefined
    },
    {
      id: '/suspects',
      label: 'SUSPECT MATRIX',
      icon: <Users className="w-4 h-4" />,
      badge: selectedCase ? `${selectedCase.suspects.length}` : undefined
    },
    {
      id: '/witnesses',
      label: 'WITNESS INTERVIEW',
      icon: <MessageSquareQuote className="w-4 h-4" />,
      badge: selectedCase ? `${selectedCase.witnesses.length}` : undefined
    },
    {
      id: '/cctv',
      label: 'CCTV SURVEILLANCE',
      icon: <Video className="w-4 h-4" />,
      badge: 'LIVE',
      badgeColor: 'red'
    },
    {
      id: '/forensics',
      label: 'FORENSICS LAB',
      icon: <FlaskConical className="w-4 h-4" />,
      badge: selectedCase ? `${selectedCase.forensics.length}` : undefined
    },
    {
      id: '/detective-board',
      label: 'DETECTIVE BOARD',
      icon: <Network className="w-4 h-4" />
    },
    {
      id: '/ai-deduction',
      label: 'AI DEDUCTION',
      icon: <Cpu className="w-4 h-4" />,
      badge: 'AI',
      badgeColor: 'purple'
    },
    {
      id: '/warrant',
      label: 'ARREST / WARRANT',
      icon: <Gavel className="w-4 h-4" />,
      badge: selectedCase?.warrantData.warrantIssued ? 'ISSUED' : 'PENDING',
      badgeColor: selectedCase?.warrantData.warrantIssued ? 'emerald' : 'amber'
    }
  ];

  const handleNav = (route: string) => {
    navigate(route);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-16 left-0 z-35 h-[calc(100vh-4rem)] w-64 bg-[#080808]/95 lg:bg-[#080808]/90 border-r border-white/10 backdrop-blur-xl flex flex-col justify-between transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Navigation Items */}
        <div className="py-4 px-3 space-y-1 overflow-y-auto flex-1">
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-cyan-400/70 font-semibold flex items-center justify-between">
            <span>INVESTIGATION MODULES</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          </div>

          {navItems.map((item) => {
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-mono tracking-wider transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-400/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'
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
              </button>
            );
          })}
        </div>

        {/* Case Status Pill at Bottom of Sidebar */}
        {selectedCase && (
          <div className="p-3 border-t border-white/10 bg-transparent">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                <span>ACTIVE DOSSIER</span>
                <span className="text-cyan-400 font-bold">{selectedCase.id}</span>
              </div>
              <p className="text-xs font-bold font-hud text-white truncate">
                {selectedCase.title}
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[10px] font-mono">
                <span className="text-slate-400">PRIORITY</span>
                <span
                  className={`font-bold ${
                    selectedCase.priority === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'
                  }`}
                >
                  {selectedCase.priority}
                </span>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
