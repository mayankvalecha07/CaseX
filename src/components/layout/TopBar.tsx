import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldAlert,
  ChevronDown,
  User,
  LogOut,
  FolderOpen,
  Settings as SettingsIcon,
  Search,
  Bell,
  Menu,
  X,
  Layers,
  Activity,
  CheckCircle2,
  Lock,
  Globe,
  MoreHorizontal
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCase } from '../../context/CaseContext';
import { Breadcrumbs } from './Breadcrumbs';
import { GlobalSearch } from './GlobalSearch';
import { Badge } from '../common/Badge';

interface TopBarProps {
  onToggleSidebar: () => void;
  onCloseSidebar: () => void;
  isSidebarOpen: boolean;
  onOpenCaseSelector: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onToggleSidebar,
  onCloseSidebar,
  isSidebarOpen,
  onOpenCaseSelector
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, signOut, openAuthModal } = useAuth();
  const {
    selectedCase,
    activities,
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications
  } = useCase();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSignOut = () => {
    signOut();
    setProfileMenuOpen(false);
    navigate('/');
  };

  const recentActivities = activities.slice(0, 8);

  return (
    <>
      <GlobalSearch isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />

      <header className="sticky top-0 z-40 w-full bg-[#07090f]/95 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Left: Sidebar Toggle, Logo & Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            {isAuthenticated && (
              <button
                onClick={onToggleSidebar}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 border border-white/10 cursor-pointer"
                aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                aria-expanded={isSidebarOpen}
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <div
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
              className="flex items-center gap-2.5 cursor-pointer group shrink-0"
            >
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)] group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="block">
                <div className="flex items-center gap-1.5">
                  <span className="font-hud font-bold text-lg text-white tracking-widest uppercase">
                    CASE<span className="text-cyan-400">X</span>
                  </span>
                </div>
                <span className="block text-[8px] font-mono tracking-[0.18em] text-slate-500 uppercase">Investigation System</span>
              </div>
            </div>

            {/* Breadcrumb Path */}
            <div className="hidden">
              <Breadcrumbs />
            </div>
          </div>

          {/* Center: Active Case Quick Switcher (when authenticated) */}
          {isAuthenticated && selectedCase && (
            <div className="hidden lg:flex items-center">
              <button
                onClick={onOpenCaseSelector}
                aria-label={`Switch case; current case ${selectedCase.id}, ${selectedCase.title}`}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400/50 transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] cursor-pointer group max-w-sm"
              >
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase shrink-0">
                  [{selectedCase.id}]
                </span>
                <span className="text-xs font-bold font-hud text-white truncate max-w-[150px]">
                  {selectedCase.title}
                </span>
                <span className="text-[9px] font-mono text-slate-400 group-hover:text-cyan-300">SWITCH</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300 shrink-0" />
              </button>
            </div>
          )}

          {/* Right: Search, Notifications, Explore Cases, Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Global Search Button */}
            {isAuthenticated && <button
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/40 text-slate-400 hover:text-white transition-all cursor-pointer group"
              title="Search CaseX (Cmd+K)"
            >
              <Search className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
              <span className="hidden sm:inline font-mono text-xs">Search...</span>
              <kbd className="hidden md:inline-block text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-400 border border-white/10">
                ⌘K
              </kbd>
            </button>}

            {isAuthenticated && (
              <div className="relative">
                <button onClick={() => { onCloseSidebar(); setQuickActionsOpen(open => !open); }} aria-label="Quick actions; closes the sidebar and opens actions" aria-expanded={quickActionsOpen} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/40 text-slate-400 hover:text-white transition-all cursor-pointer">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {quickActionsOpen && (
                  <div role="menu" aria-label="Quick actions" className="absolute right-0 mt-2 w-48 rounded-xl bg-[#0b0f17] border border-white/15 shadow-2xl py-1 z-50">
                    <button role="menuitem" onClick={onCloseSidebar} className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-white/5">Close sidebar</button>
                    {!isSidebarOpen && <button role="menuitem" onClick={() => { onToggleSidebar(); setQuickActionsOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-white/5">Open navigation</button>}
                    <button role="menuitem" onClick={() => { navigate('/dashboard'); setQuickActionsOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-white/5">Open Workstation</button>
                    <button role="menuitem" onClick={() => { onOpenCaseSelector(); setQuickActionsOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-white/5">Switch case</button>
                    <button role="menuitem" onClick={() => { setSearchModalOpen(true); setQuickActionsOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-white/5">Search CaseX</button>
                  </div>
                )}
              </div>
            )}

            {/* Notifications / Activity Bell */}
            {false && isAuthenticated && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/40 text-slate-400 hover:text-white transition-all cursor-pointer relative"
                  aria-label="Investigation Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 text-black text-[9px] font-bold font-mono flex items-center justify-center animate-pulse">
                      {unreadNotificationCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0b0f17] border border-white/15 shadow-2xl py-3 z-50 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 pb-2 border-b border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-cyan-400" />
                        <span className="font-hud font-bold text-xs text-white uppercase tracking-wider">
                          NOTIFICATIONS
                        </span>
                        {unreadNotificationCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold">
                            {unreadNotificationCount} NEW
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {unreadNotificationCount > 0 && (
                          <button
                            onClick={markAllNotificationsRead}
                            className="text-[10px] font-mono text-cyan-400 hover:underline"
                          >
                            Mark Read
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button
                            onClick={clearNotifications}
                            className="text-[10px] font-mono text-slate-500 hover:text-rose-400"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-white/5 py-1">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs font-mono text-slate-500">
                          No notifications in the queue.
                        </div>
                      ) : (
                        notifications.map(notif => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              markNotificationRead(notif.id);
                              if (notif.link) {
                                navigate(notif.link);
                                setNotificationsOpen(false);
                              }
                            }}
                            className={`p-3 transition-colors cursor-pointer ${
                              !notif.read ? 'bg-cyan-500/5 hover:bg-cyan-500/10' : 'hover:bg-white/5 opacity-70'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                              <span className="text-cyan-400 font-semibold">{notif.title}</span>
                              <span className="text-slate-500">{notif.timestamp}</span>
                            </div>
                            <p className="text-xs font-mono text-slate-200 leading-snug">
                              {notif.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Case Archive / Explorer Button */}
            {isAuthenticated && <button
              onClick={() => navigate('/cases')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                location.pathname.startsWith('/cases') && !location.pathname.includes('/cases/')
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/40'
                  : 'text-slate-300 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>CASES</span>
            </button>}

            {/* External Intelligence Quick Link */}
            {false && isAuthenticated && <button
              onClick={() => navigate('/intelligence')}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-mono text-xs tracking-wider transition-all cursor-pointer ${
                location.pathname === '/intelligence'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-white/10'
              }`}
              title="External Intelligence & Weather API"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden lg:inline">INTEL</span>
            </button>}

            {/* Authenticated Profile Menu or Sign In */}
            {!isAuthenticated ? (
              <button
                onClick={() => openAuthModal(undefined, '/dashboard', 'signin')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>LOGIN</span>
              </button>
            ) : (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden border border-cyan-500/40 relative">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-cyan-950 flex items-center justify-center text-cyan-400 font-bold font-mono text-xs">
                        {user?.name?.charAt(0) || 'D'}
                      </div>
                    )}
                  </div>
                  <span className="hidden sm:inline max-w-28 truncate text-xs font-mono text-slate-200">{user?.name || 'Profile'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0b0f17] border border-white/15 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100 backdrop-blur-2xl">
                    <div className="px-4 py-2.5 border-b border-white/10">
                      <p className="text-xs font-bold text-white font-mono">{user?.name}</p>
                      <p className="text-[10px] font-mono text-slate-400 truncate">{user?.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="cyan" size="sm">
                          {user?.badgeNumber || 'DET-7091'}
                        </Badge>
                        <Badge variant="slate" size="sm">
                          LEVEL 5
                        </Badge>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setProfileMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-xs font-mono text-slate-300 hover:text-cyan-300 hover:bg-white/5 flex items-center gap-2.5 text-left transition-colors cursor-pointer"
                      >
                        <User className="w-4 h-4 text-cyan-400" />
                        <span>MY PROFILE</span>
                      </button>

                    </div>

                    <div className="border-t border-white/10 pt-1 mt-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full px-4 py-2 text-xs font-mono text-rose-400 hover:bg-rose-950/40 flex items-center gap-2.5 text-left transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>SIGN OUT</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
