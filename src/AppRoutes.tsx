import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { useCase } from './context/CaseContext';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { CaseLibraryPage } from './pages/CaseLibraryPage';
import { CaseDetails } from './pages/CaseDetails';
import { CaseForm } from './pages/CaseForm';
import { CrimeScenePage } from './pages/CrimeScenePage';
import { EvidenceLockerPage } from './pages/EvidenceLockerPage';
import { EvidenceDetails } from './pages/EvidenceDetails';
import { EvidenceForm } from './pages/EvidenceForm';
import { TimelineBuilderPage } from './pages/TimelineBuilderPage';
import { SuspectMatrixPage } from './pages/SuspectMatrixPage';
import { SuspectDetails } from './pages/SuspectDetails';
import { WitnessInterviewPage } from './pages/WitnessInterviewPage';
import { Notes } from './pages/Notes';
import { CCTVSurveillancePage } from './pages/CCTVSurveillancePage';
import { ForensicsLabPage } from './pages/ForensicsLabPage';
import { DetectiveBoardPage } from './pages/DetectiveBoardPage';
import { AIDeductionPage } from './pages/AIDeductionPage';
import { ArrestWarrantPage } from './pages/ArrestWarrantPage';
import { Intelligence } from './pages/Intelligence';
import { ProfilePage } from './pages/ProfilePage';
import { MyInvestigationsPage } from './pages/MyInvestigationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { TaskBoardPage } from './pages/TaskBoardPage';
import { InvestigationWorkspacePage } from './pages/InvestigationWorkspacePage';
import { InvestigationCalendarPage } from './pages/InvestigationCalendarPage';
import { CaseComparisonPage } from './pages/CaseComparisonPage';
import { HelpCenterPage } from './pages/HelpCenterPage';
import { CaseReportPage } from './pages/CaseReportPage';
import { EvidenceReviewQueuePage } from './pages/EvidenceReviewQueuePage';
import { NotFound } from './pages/NotFound';

// Helper component that redirects to the active case URL
const ActiveCaseRedirect: React.FC<{ subpath: string }> = ({ subpath }) => {
  const { selectedCaseId } = useCase();
  const caseId = selectedCaseId || 'NY-2026-0884';
  return <Navigate to={`/cases/${caseId}/${subpath}`} replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public Landing Route */}
        <Route path="/" element={<LandingPage />} />

        {/* Command Center Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Case Archive & Management */}
        <Route
          path="/cases"
          element={
            <ProtectedRoute>
              <CaseLibraryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cases/new"
          element={
            <ProtectedRoute>
              <CaseForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cases/:caseId"
          element={
            <ProtectedRoute>
              <CaseDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cases/:caseId/edit"
          element={
            <ProtectedRoute>
              <CaseForm />
            </ProtectedRoute>
          }
        />

        {/* Crime Scene Exploration */}
        <Route
          path="/cases/:caseId/crime-scene"
          element={
            <ProtectedRoute>
              <CrimeScenePage />
            </ProtectedRoute>
          }
        />
        <Route path="/crime-scene" element={<ActiveCaseRedirect subpath="crime-scene" />} />

        {/* Evidence Locker & Exhibits */}
        <Route
          path="/cases/:caseId/evidence"
          element={
            <ProtectedRoute>
              <EvidenceLockerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cases/:caseId/evidence/new"
          element={
            <ProtectedRoute>
              <EvidenceForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cases/:caseId/evidence/:evidenceId"
          element={
            <ProtectedRoute>
              <EvidenceDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cases/:caseId/evidence/:evidenceId/edit"
          element={
            <ProtectedRoute>
              <EvidenceForm />
            </ProtectedRoute>
          }
        />
        <Route path="/evidence" element={<ActiveCaseRedirect subpath="evidence" />} />

        {/* Chronological Timeline */}
        <Route
          path="/cases/:caseId/timeline"
          element={
            <ProtectedRoute>
              <TimelineBuilderPage />
            </ProtectedRoute>
          }
        />
        <Route path="/timeline" element={<ActiveCaseRedirect subpath="timeline" />} />

        {/* Suspect Matrix & Dossiers */}
        <Route
          path="/cases/:caseId/suspects"
          element={
            <ProtectedRoute>
              <SuspectMatrixPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cases/:caseId/suspects/:suspectId"
          element={
            <ProtectedRoute>
              <SuspectDetails />
            </ProtectedRoute>
          }
        />
        <Route path="/suspects" element={<ActiveCaseRedirect subpath="suspects" />} />

        {/* Witness Interviews */}
        <Route
          path="/cases/:caseId/witnesses"
          element={
            <ProtectedRoute>
              <WitnessInterviewPage />
            </ProtectedRoute>
          }
        />
        <Route path="/witnesses" element={<ActiveCaseRedirect subpath="witnesses" />} />

        {/* Investigation Notes */}
        <Route
          path="/cases/:caseId/notes"
          element={
            <ProtectedRoute>
              <Notes />
            </ProtectedRoute>
          }
        />
        <Route path="/notes" element={<ActiveCaseRedirect subpath="notes" />} />

        {/* CCTV Surveillance Channels */}
        <Route
          path="/cases/:caseId/cctv"
          element={
            <ProtectedRoute>
              <CCTVSurveillancePage />
            </ProtectedRoute>
          }
        />
        <Route path="/cctv" element={<ActiveCaseRedirect subpath="cctv" />} />

        {/* Forensics Lab */}
        <Route
          path="/cases/:caseId/forensics"
          element={
            <ProtectedRoute>
              <ForensicsLabPage />
            </ProtectedRoute>
          }
        />
        <Route path="/forensics" element={<ActiveCaseRedirect subpath="forensics" />} />

        {/* Detective Board */}
        <Route
          path="/cases/:caseId/detective-board"
          element={
            <ProtectedRoute>
              <DetectiveBoardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/detective-board" element={<ActiveCaseRedirect subpath="detective-board" />} />

        {/* Rule-Based AI Deduction Assessment */}
        <Route
          path="/cases/:caseId/ai-deduction"
          element={
            <ProtectedRoute>
              <AIDeductionPage />
            </ProtectedRoute>
          }
        />
        <Route path="/ai-deduction" element={<ActiveCaseRedirect subpath="ai-deduction" />} />

        {/* Final Arrest Warrant */}
        <Route
          path="/cases/:caseId/warrant"
          element={
            <ProtectedRoute>
              <ArrestWarrantPage />
            </ProtectedRoute>
          }
        />
        <Route path="/warrant" element={<ActiveCaseRedirect subpath="warrant" />} />

        {/* External Intelligence & Open-Meteo Weather */}
        <Route
          path="/intelligence"
          element={
            <ProtectedRoute>
              <Intelligence />
            </ProtectedRoute>
          }
        />

        {/* Operational Task Board */}
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TaskBoardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cases/:caseId/tasks"
          element={
            <ProtectedRoute>
              <TaskBoardPage />
            </ProtectedRoute>
          }
        />

        {/* Dedicated Case Investigation Workspace */}
        <Route
          path="/cases/:caseId/workspace"
          element={
            <ProtectedRoute>
              <InvestigationWorkspacePage />
            </ProtectedRoute>
          }
        />
        <Route path="/workspace" element={<ActiveCaseRedirect subpath="workspace" />} />

        {/* Investigation Calendar & Due Dates */}
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <InvestigationCalendarPage />
            </ProtectedRoute>
          }
        />

        {/* Case Comparison Engine */}
        <Route
          path="/cases/compare"
          element={
            <ProtectedRoute>
              <CaseComparisonPage />
            </ProtectedRoute>
          }
        />

        {/* Printable Official Case Dossier Report */}
        <Route
          path="/cases/:caseId/report"
          element={
            <ProtectedRoute>
              <CaseReportPage />
            </ProtectedRoute>
          }
        />
        <Route path="/reports" element={<ActiveCaseRedirect subpath="report" />} />

        {/* Evidence Review Queue */}
        <Route
          path="/evidence/review"
          element={
            <ProtectedRoute>
              <EvidenceReviewQueuePage />
            </ProtectedRoute>
          }
        />

        {/* Help Center & Forensics Glossary */}
        <Route
          path="/help"
          element={
            <ProtectedRoute>
              <HelpCenterPage />
            </ProtectedRoute>
          }
        />

        {/* User Account & Preferences */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-investigations"
          element={
            <ProtectedRoute>
              <MyInvestigationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Custom 404 Catch-All Page */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};
