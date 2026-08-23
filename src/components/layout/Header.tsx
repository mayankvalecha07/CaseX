import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCase } from '../../context/CaseContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  ShieldAlert,
  ChevronDown,
  User,
  LogOut,
  FolderOpen,
  Settings as SettingsIcon,
  Search,
  Radio,
  Menu,
  X,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  currentRoute: string;
  navigate: (route: string) => void;
  onOpenCaseSelector: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  navigate,
  onOpenCaseSelector,
  isSidebarOpen,
  toggleSidebar
}) => {
  const { user, isAuthenticated, signOut, openAuthModal } = useAuth();
  const { selectedCase } = useCase();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    signOut();
    setProfileMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left Side: Logo & Sidebar Toggle */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 border border-white/10 cursor-pointer"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <div
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)] group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-hud font-bold text-lg text-white tracking-widest uppercase">
                  CASE<span className="text-cyan-400">X</span>
                </span>
                <span className="hidden sm:inline-block text-[9px] font-mono px-1.5 py-0.2 bg-cyan-500/10 text-cyan-400 border border-cyan-400/30 rounded">
                  v2.4
                </span>
              </div>
              <span className="hidden md:block text-[9px] font-mono text-slate-400 tracking-wider">
                DIGITAL CRIME SCENE PLATFORM
              </span>
            </div>
          </div>
        </div>

        {/* Center: Case Switcher (When Authenticated) or Status Badges */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && selectedCase ? (
            <button
              onClick={onOpenCaseSelector}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-400/50 text-left transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] cursor-pointer max-w-md group"
            >
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
                    [{selectedCase.id}]
                  </span>
                  <span className="text-xs font-bold font-hud text-white truncate max-w-[180px] lg:max-w-[240px]">
                    {selectedCase.title}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300 ml-1 shrink-0" />
            </button>
          ) : (
            <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>SYSTEM: ONLINE</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>DATABASE: READY</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Side Navigation Actions */}
        <div className="flex items-center gap-3">
          {/* Explore Cases Button */}
          <button
            onClick={() => {
              if (!isAuthenticated) {
                openAuthModal(undefined, '/cases', 'signin');
              } else {
                navigate('/cases');
              }
            }}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              currentRoute === '/cases'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/40'
                : 'text-slate-300 hover:text-white hover:bg-white/10 border border-white/10'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>EXPLORE CASES</span>
          </button>

          {!isAuthenticated ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => openAuthModal(undefined, '/dashboard', 'signin')}
              icon={<Lock className="w-3.5 h-3.5" />}
              className="shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              SIGN IN
            </Button>
          ) : (
            /* Authenticated Profile Dropdown */
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer"
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

                <div className="hidden sm:block text-left pr-1">
                  <div className="text-xs font-bold text-white font-mono leading-none flex items-center gap-1">
                    {user?.name}
                  </div>
                  <div className="text-[10px] font-mono text-cyan-400/80 mt-0.5">
                    {user?.badgeNumber || 'DET-7091'}
                  </div>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#0a0a0a] border border-white/10 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
                  {/* Investigator Info */}
                  <div className="px-4 py-2.5 border-b border-white/10">
                    <p className="text-xs font-bold text-white font-mono">{user?.name}</p>
                    <p className="text-[10px] font-mono text-slate-400 truncate">{user?.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="cyan" size="sm">
                        {user?.badgeNumber}
                      </Badge>
                      <Badge variant="slate" size="sm">
                        LEVEL 5
                      </Badge>
                    </div>
                  </div>

                  {/* Menu Links */}
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

                    <button
                      onClick={() => {
                        navigate('/my-investigations');
                        setProfileMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-xs font-mono text-slate-300 hover:text-cyan-300 hover:bg-white/5 flex items-center gap-2.5 text-left transition-colors cursor-pointer"
                    >
                      <FolderOpen className="w-4 h-4 text-cyan-400" />
                      <span>MY INVESTIGATIONS</span>
                    </button>

                    <button
                      onClick={() => {
                        navigate('/cases');
                        setProfileMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-xs font-mono text-slate-300 hover:text-cyan-300 hover:bg-white/5 flex items-center gap-2.5 text-left transition-colors cursor-pointer"
                    >
                      <Layers className="w-4 h-4 text-cyan-400" />
                      <span>CASE ARCHIVE</span>
                    </button>

                    <button
                      onClick={() => {
                        navigate('/settings');
                        setProfileMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-xs font-mono text-slate-300 hover:text-cyan-300 hover:bg-white/5 flex items-center gap-2.5 text-left transition-colors cursor-pointer"
                    >
                      <SettingsIcon className="w-4 h-4 text-cyan-400" />
                      <span>SETTINGS</span>
                    </button>
                  </div>

                  {/* Sign Out */}
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
  );
};
