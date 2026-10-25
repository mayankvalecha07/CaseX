import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { Toast } from '../common/Toast';
import { UndoToast } from '../common/UndoToast';
import { CommandMenu } from '../common/CommandMenu';
import { AuthModal } from '../auth/AuthModal';
import { CaseSelectorModal } from '../cases/CaseSelectorModal';
import { useAuth } from '../../context/AuthContext';
import { useCase } from '../../context/CaseContext';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { toastMessage, toastType, hideToast, preferences, cases, selectedCaseId, selectCase } = useCase();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isCaseSelectorOpen, setIsCaseSelectorOpen] = useState(false);
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);

  const toggleSidebar = () => {
    if (window.matchMedia('(min-width: 1024px)').matches) setIsDesktopSidebarOpen(open => !open);
    else setIsSidebarOpen(open => !open);
  };
  const closeSidebar = () => { setIsSidebarOpen(false); setIsDesktopSidebarOpen(false); };

  useEffect(() => {
    const closeDrawerOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setIsSidebarOpen(false); setIsDesktopSidebarOpen(false); }
    };
    window.addEventListener('keydown', closeDrawerOnEscape);
    return () => window.removeEventListener('keydown', closeDrawerOnEscape);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('scanlines-disabled', !preferences.scanlinesEnabled);
    document.documentElement.classList.toggle('compact-density', preferences.density === 'compact');
  }, [preferences.scanlinesEnabled, preferences.density]);

  useEffect(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    if (segments[0] !== 'cases' || !segments[1] || ['new', 'compare'].includes(segments[1])) return;
    const caseId = decodeURIComponent(segments[1]);
    if (caseId !== selectedCaseId && cases.some(item => item.id === caseId)) selectCase(caseId);
  }, [location.pathname, cases, selectCase]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandMenuOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // If on public landing page '/', layout doesn't need the persistent investigation sidebar
  const isLandingPage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-[#07090f] text-slate-200 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Toast Notification Container */}
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={hideToast}
      />

      {/* Floating Undo Toast for reversible actions */}
      <UndoToast />

      {/* Global Command Menu (Ctrl+K) */}
      <CommandMenu
        isOpen={isCommandMenuOpen}
        onClose={() => setIsCommandMenuOpen(false)}
      />

      {/* Global Auth Modal */}
      <AuthModal />

      {/* Case Selector Modal */}
      <CaseSelectorModal
        isOpen={isCaseSelectorOpen}
        onClose={() => setIsCaseSelectorOpen(false)}
      />

      {/* TopBar Application Shell */}
      <TopBar
        onToggleSidebar={toggleSidebar}
        onCloseSidebar={closeSidebar}
        isSidebarOpen={isSidebarOpen || (window.innerWidth >= 1024 && isDesktopSidebarOpen)}
        onOpenCaseSelector={() => setIsCaseSelectorOpen(true)}
      />

      {/* App Body Area */}
      <div className="flex-1 flex w-full relative">
        {/* Sidebar Navigation */}
        {!isLandingPage && (
          <Sidebar
            isOpen={isSidebarOpen}
            isDesktopOpen={isDesktopSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Nested Route View Content */}
        <main className="flex-1 min-w-0 pb-12 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Application Footer */}
      {!isLandingPage && <Footer />}
    </div>
  );
};
