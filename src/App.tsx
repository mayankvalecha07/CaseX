import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CaseProvider, useCase } from './context/CaseContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { Toast } from './components/common/Toast';
import { AuthModal } from './components/auth/AuthModal';
import { CaseSelectorModal } from './components/cases/CaseSelectorModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { CaseLibraryPage } from './pages/CaseLibraryPage';
import { DashboardPage } from './pages/DashboardPage';
import { CrimeScenePage } from './pages/CrimeScenePage';
import { EvidenceLockerPage } from './pages/EvidenceLockerPage';
import { TimelineBuilderPage } from './pages/TimelineBuilderPage';
import { SuspectMatrixPage } from './pages/SuspectMatrixPage';
import { WitnessInterviewPage } from './pages/WitnessInterviewPage';
import { CCTVSurveillancePage } from './pages/CCTVSurveillancePage';
import { ForensicsLabPage } from './pages/ForensicsLabPage';
import { DetectiveBoardPage } from './pages/DetectiveBoardPage';
import { AIDeductionPage } from './pages/AIDeductionPage';
import { ArrestWarrantPage } from './pages/ArrestWarrantPage';
import { ProfilePage } from './pages/ProfilePage';
import { MyInvestigationsPage } from './pages/MyInvestigationsPage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { toastMessage, toastType, hideToast } = useCase();

  // Navigation State
  const [currentRoute, setCurrentRoute] = useState<string>('/');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isCaseSelectorOpen, setIsCaseSelectorOpen] = useState<boolean>(false);
  const [previewCaseId, setPreviewCaseId] = useState<string | null>(null);

  // Sync with browser hash if available
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || '/';
      setCurrentRoute(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    if (window.location.hash) {
      handleHashChange();
    }
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (route: string) => {
    // If attempting to access protected route or cases while unauthenticated, intercept to sign in
    if (!isAuthenticated && route !== '/') {
      openAuthModal(undefined, route, 'signin');
      return;
    }

    setCurrentRoute(route);
    window.location.hash = route;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLandingViewCase = (caseId: string) => {
    setPreviewCaseId(caseId);
    if (!isAuthenticated) {
      openAuthModal(caseId, '/cases', 'signin');
    } else {
      navigate('/cases');
    }
  };

  // Determine if sidebar should be shown (only on authenticated investigation pages)
  const isPublicPage = currentRoute === '/';
  const showSidebar = isAuthenticated && !isPublicPage;

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-slate-200 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={hideToast}
      />

      {/* Global Auth Modal */}
      <AuthModal
        onSuccess={(targetRoute) => {
          const dest = targetRoute || '/cases';
          setCurrentRoute(dest);
          window.location.hash = dest;
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Case Switcher Modal */}
      <CaseSelectorModal
        isOpen={isCaseSelectorOpen}
        onClose={() => setIsCaseSelectorOpen(false)}
      />

      {/* Global Application Header */}
      <Header
        currentRoute={currentRoute}
        navigate={navigate}
        onOpenCaseSelector={() => setIsCaseSelectorOpen(true)}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Body Area */}
      <div className="flex-1 flex w-full">
        {/* Protected Investigation Sidebar */}
        {showSidebar && (
          <Sidebar
            currentRoute={currentRoute}
            navigate={navigate}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Dynamic Route View Content */}
        <main className="flex-1 min-w-0 pb-12">
          {currentRoute === '/' && (
            <LandingPage
              navigate={navigate}
              onViewCasePreview={handleLandingViewCase}
            />
          )}

          {currentRoute === '/cases' && (
            <CaseLibraryPage
              navigate={navigate}
              previewCaseId={previewCaseId}
              onClearPreview={() => setPreviewCaseId(null)}
            />
          )}

          {currentRoute === '/dashboard' && (
            <DashboardPage
              navigate={navigate}
              onOpenCaseSelector={() => setIsCaseSelectorOpen(true)}
            />
          )}

          {currentRoute === '/crime-scene' && <CrimeScenePage />}
          {currentRoute === '/evidence' && <EvidenceLockerPage />}
          {currentRoute === '/timeline' && <TimelineBuilderPage />}
          {currentRoute === '/suspects' && <SuspectMatrixPage />}
          {currentRoute === '/witnesses' && <WitnessInterviewPage />}
          {currentRoute === '/cctv' && <CCTVSurveillancePage />}
          {currentRoute === '/forensics' && <ForensicsLabPage />}
          {currentRoute === '/detective-board' && <DetectiveBoardPage />}
          {currentRoute === '/ai-deduction' && <AIDeductionPage />}
          {currentRoute === '/warrant' && <ArrestWarrantPage />}
          {currentRoute === '/profile' && <ProfilePage />}
          {currentRoute === '/my-investigations' && (
            <MyInvestigationsPage navigate={navigate} />
          )}
          {currentRoute === '/settings' && <SettingsPage />}
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <CaseProvider>
        <AppContent />
      </CaseProvider>
    </AuthProvider>
  );
}

export default App;
