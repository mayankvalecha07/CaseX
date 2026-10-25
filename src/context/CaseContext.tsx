import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  InvestigationCase,
  EvidenceItem,
  Suspect,
  Witness,
  TimelineEvent,
  BoardNode,
  BoardConnection,
  CCTVFeed,
  InvestigationNote,
  ActivityRecord,
  InvestigationTask,
  CustodyTransfer,
  WitnessInterviewRecord,
  ChecklistItem,
  CaseNotification,
  RecentlyViewedRecord,
  UndoAction,
  CaseStatus,
  Priority
} from '../types';
import { INITIAL_CASES, ensureCaseDemoRecords } from '../data/cases';

export interface UserPreferences {
  density: 'comfortable' | 'compact';
  defaultCaseView: 'table' | 'cards';
  pageSize: number;
  scanlinesEnabled: boolean;
  dateTimeFormat: 'locale' | 'iso';
  notificationsEnabled: boolean;
  notificationCategories: Record<CaseNotification['type'], boolean>;
  showWidgets: {
    recentEvidence: boolean;
    recentActivity: boolean;
    priorityAlerts: boolean;
    quickNotes: boolean;
    upcomingEvents: boolean;
    favorites: boolean;
    recentlyViewed: boolean;
    apiStatus: boolean;
    tasks: boolean;
  };
}

interface CaseContextType {
  cases: InvestigationCase[];
  selectedCaseId: string | null;
  selectedCase: InvestigationCase | null;
  recentCases: InvestigationCase[];
  notes: InvestigationNote[];
  activities: ActivityRecord[];
  tasks: InvestigationTask[];
  custodyTransfers: CustodyTransfer[];
  interviews: WitnessInterviewRecord[];
  notifications: CaseNotification[];
  unreadNotificationCount: number;
  favoriteCaseIds: string[];
  favoriteEvidenceIds: string[];
  recentlyViewed: RecentlyViewedRecord[];
  currentUndo: UndoAction | null;
  preferences: UserPreferences;

  // Navigation & Active Case
  selectCase: (id: string) => void;
  switchCase: (id: string) => void;

  // Case CRUD & Resolution
  addCase: (newCase: Omit<InvestigationCase, 'progress'>) => InvestigationCase;
  updateCase: (updatedCase: InvestigationCase) => void;
  deleteCase: (caseId: string) => boolean;
  archiveCase: (caseId: string) => void;
  restoreCase: (caseId: string) => void;
  resolveCase: (
    caseId: string,
    resolutionSummary: string,
    sendEmail?: boolean,
    recipientEmail?: string
  ) => Promise<{ success: boolean; emailSent?: boolean; message: string }>;

  // Evidence CRUD & Chain of Custody
  addEvidence: (caseId: string, item: Omit<EvidenceItem, 'id' | 'status'>) => EvidenceItem;
  updateEvidence: (caseId: string, item: EvidenceItem) => void;
  deleteEvidence: (caseId: string, evidenceId: string) => void;
  collectEvidence: (evidenceIdOrCode: string) => void;
  verifyEvidence: (caseId: string, evidenceId: string) => void;
  inspectHotspot: (hotspotId: string) => void;
  collectHotspot: (hotspotId: string) => void;
  updateEvidenceNote: (evidenceId: string, note: string) => void;
  markEvidenceExamined: (evidenceId: string) => void;
  toggleEvidenceReviewStatus: (caseId: string, evidenceId: string) => void;
  addCustodyTransfer: (transfer: Omit<CustodyTransfer, 'id'>) => CustodyTransfer;
  getEvidenceCustody: (evidenceId: string) => CustodyTransfer[];

  // Timeline CRUD & Actions
  reorderTimeline: (fromIndex: number, toIndex: number) => void;
  addTimelineEvent: (event: Omit<TimelineEvent, 'id'>) => void;
  updateTimelineEvent: (caseId: string, event: TimelineEvent) => void;
  toggleTimelineFlag: (eventId: string) => void;
  deleteTimelineEvent: (eventId: string) => void;

  // Suspect CRUD & Actions
  addSuspect: (caseId: string, suspect: Omit<Suspect, 'id'>) => Suspect;
  updateSuspect: (caseId: string, suspect: Suspect) => void;
  deleteSuspect: (caseId: string, suspectId: string) => void;
  updateSuspectAlibiStatus: (suspectId: string, status: 'VERIFIED' | 'QUESTIONABLE' | 'DISPROVEN') => void;
  updateSuspectNotes: (suspectId: string, notes: string) => void;
  updateSuspectStatus: (suspectId: string, status: 'SUSPECT' | 'PERSON OF INTEREST' | 'CLEAR' | 'PRIME SUSPECT') => void;
  setPrimeSuspect: (suspectId: string) => void;

  // Witness CRUD & Interviews
  addWitness: (caseId: string, witness: Omit<Witness, 'id'>) => Witness;
  updateWitness: (caseId: string, witness: Witness) => void;
  deleteWitness: (caseId: string, witnessId: string) => void;
  interviewWitness: (witnessId: string, question: string) => string;
  updateWitnessVerification: (witnessId: string, status: 'VERIFIED' | 'UNVERIFIED' | 'FLAGGED') => void;
  verifyWitness: (witnessId: string) => void;
  flagWitness: (witnessId: string) => void;
  addWitnessNote: (witnessId: string, note: string) => void;
  addInterview: (interview: Omit<WitnessInterviewRecord, 'id'>) => WitnessInterviewRecord;
  updateInterview: (interview: WitnessInterviewRecord) => void;
  deleteInterview: (interviewId: string) => void;
  getCaseInterviews: (caseId?: string) => WitnessInterviewRecord[];

  // Investigation Notes CRUD
  addNote: (note: Omit<InvestigationNote, 'id' | 'createdAt' | 'updatedAt'>) => InvestigationNote;
  updateNote: (note: InvestigationNote) => void;
  deleteNote: (noteId: string) => void;
  getCaseNotes: (caseId?: string) => InvestigationNote[];

  // Task Board CRUD
  addTask: (task: Omit<InvestigationTask, 'id' | 'createdDate'>) => InvestigationTask;
  updateTask: (task: InvestigationTask) => void;
  deleteTask: (taskId: string) => void;
  updateTaskStatus: (taskId: string, status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED') => void;
  getCaseTasks: (caseId?: string) => InvestigationTask[];

  // Checklist Actions
  toggleChecklistItem: (caseId: string, itemId: string) => void;
  addChecklistItem: (caseId: string, label: string, category?: string, required?: boolean) => void;
  getCaseChecklist: (caseId?: string) => ChecklistItem[];

  // Activity History
  addActivity: (actionType: ActivityRecord['actionType'], description: string, caseId?: string, relatedRecordId?: string) => void;
  getCaseActivities: (caseId?: string) => ActivityRecord[];

  // Board & CCTV Actions
  addBoardNode: (node: Omit<BoardNode, 'id'>) => void;
  updateBoardNode: (id: string, changes: Partial<Pick<BoardNode, 'title' | 'type' | 'summary'>>) => void;
  updateBoardNodePos: (id: string, x: number, y: number) => void;
  deleteBoardNode: (id: string) => void;
  addBoardConnection: (connection: Omit<BoardConnection, 'id'>) => void;
  deleteBoardConnection: (id: string) => void;
  addCCTVFeed: (caseId: string, feed: Omit<CCTVFeed, 'id'>) => string;
  updateCCTVFeed: (caseId: string, feedId: string, changes: Partial<CCTVFeed>) => void;
  deleteCCTVFeed: (caseId: string, feedId: string) => void;
  captureCCTVClue: (camId: string) => void;

  // Final Warrant
  issueArrestWarrant: (suspectId: string, probableCauseSummary?: string) => { success: boolean; message: string };

  // Bookmarks & Favorites
  toggleFavoriteCase: (caseId: string) => void;
  toggleFavoriteEvidence: (evidenceId: string) => void;
  isCaseFavorite: (caseId: string) => boolean;
  isEvidenceFavorite: (evidenceId: string) => boolean;

  // Recently Viewed Tracking
  trackRecentlyViewed: (record: Omit<RecentlyViewedRecord, 'viewedAt'>) => void;
  clearRecentlyViewed: () => void;

  // Notification Center
  addNotification: (notification: Omit<CaseNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  // Undo Functionality
  setUndoAction: (action: UndoAction) => void;
  triggerUndo: () => void;
  dismissUndo: () => void;

  // Tags
  addCaseTag: (caseId: string, tag: string) => void;
  removeCaseTag: (caseId: string, tag: string) => void;
  addEvidenceTag: (caseId: string, evidenceId: string, tag: string) => void;
  removeEvidenceTag: (caseId: string, evidenceId: string, tag: string) => void;

  // Bulk Actions
  bulkUpdateCaseStatus: (caseIds: string[], status: CaseStatus) => void;
  bulkDeleteCases: (caseIds: string[]) => void;
  bulkArchiveCases: (caseIds: string[]) => void;

  // CSV Import
  importCasesFromCsv: (newCases: Partial<InvestigationCase>[]) => { imported: number; skipped: number; errors: string[] };

  // Preferences
  updatePreferences: (newPrefs: Partial<UserPreferences>) => void;

  // System & Reset
  resetCase: (caseId?: string) => void;
  resetAllCasesToDefault: () => void;
  toastMessage: string | null;
  toastType: 'success' | 'error' | 'warning' | 'info';
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  hideToast: () => void;
}

const CaseContext = createContext<CaseContextType | undefined>(undefined);

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: 'chk-1', label: 'Initial incident report & crime scene scanned', completed: false, category: 'SCENE', required: true },
  { id: 'chk-2', label: 'Physical and digital exhibits logged into Evidence Locker', completed: false, category: 'EVIDENCE', required: true },
  { id: 'chk-3', label: 'Forensic spectrometry analysis verified by lab technician', completed: false, category: 'FORENSICS', required: true },
  { id: 'chk-4', label: 'Suspect interrogations and alibis verified', completed: false, category: 'SUSPECTS', required: true },
  { id: 'chk-5', label: 'Witness statements cross-examined with CCTV anomalies', completed: false, category: 'WITNESSES', required: false },
  { id: 'chk-6', label: 'Chronological timeline established with zero contradictions', completed: false, category: 'TIMELINE', required: true },
  { id: 'chk-7', label: 'Judicial warrant probable cause affidavit signed', completed: false, category: 'LEGAL', required: true }
];

const INITIAL_TASKS: InvestigationTask[] = [
  {
    id: 'task-ny-1',
    caseId: 'NY-2026-0884',
    title: 'Examine Sub-Basement Breaker Relay 4B',
    description: 'Inspect physical terminal where the 92-second localized blackout was triggered.',
    priority: 'CRITICAL',
    dueDate: '2026-10-28',
    status: 'IN_PROGRESS',
    createdDate: '2026-07-14',
    assignedTo: 'Det. Pulkit Gupta'
  },
  {
    id: 'task-ny-2',
    caseId: 'NY-2026-0884',
    title: 'Subpoena New Jersey Pharma Batch Shipments',
    description: 'Cross-reference Zolpidem analog synthesis lot numbers with regional distributors.',
    priority: 'HIGH',
    dueDate: '2026-10-30',
    status: 'TODO',
    createdDate: '2026-07-14',
    assignedTo: 'Special Agent Chen'
  },
  {
    id: 'task-ny-3',
    caseId: 'NY-2026-0884',
    title: 'Acoustic Resonance Cutter Spectrogram Review',
    description: 'Complete ultrasonic frequency profile analysis on vault door steel microfractures.',
    priority: 'MEDIUM',
    dueDate: '2026-10-22',
    status: 'COMPLETED',
    createdDate: '2026-07-14',
    assignedTo: 'Dr. Aris Thorne'
  },
  {
    id: 'task-ny-4',
    caseId: 'NY-2026-0884',
    title: 'Cross-Examine Penthouse Security Guard',
    description: 'Re-interview Marcus Vance regarding his movements prior to the neurotoxin aerosol exposure.',
    priority: 'HIGH',
    dueDate: '2026-10-25',
    status: 'TODO',
    createdDate: '2026-07-15',
    assignedTo: 'Det. Pulkit Gupta'
  },
  {
    id: 'task-la-1',
    caseId: 'LA-2026-0317',
    title: 'Analyze Server Room Access Badges',
    description: 'Audit RFID scan logs between 01:00 and 03:00 on the night of the data exfiltration.',
    priority: 'CRITICAL',
    dueDate: '2026-11-02',
    status: 'IN_PROGRESS',
    createdDate: '2026-03-18',
    assignedTo: 'Agent Sterling'
  }
];

const INITIAL_TRANSFERS: CustodyTransfer[] = [
  {
    id: 'tr-1',
    evidenceId: 'ev-ny-01',
    transferDate: '2026-07-14 04:30',
    transferredBy: 'Officer R. Davis (Crime Scene Unit)',
    receivedBy: 'Det. Pulkit Gupta (Lead Investigator)',
    storageLocation: 'Secure Evidence Locker B-14',
    notes: 'Vault dial micro-scrapings sealed in anti-static tamper-evident pouch.'
  },
  {
    id: 'tr-2',
    evidenceId: 'ev-ny-01',
    transferDate: '2026-07-14 06:15',
    transferredBy: 'Det. Pulkit Gupta (Lead Investigator)',
    receivedBy: 'Dr. Elena Rostova (Forensics Lab)',
    storageLocation: 'Forensics Spectroscopy Lab Unit 2',
    notes: 'Transferred for electron-microscope acoustic striation mapping.'
  },
  {
    id: 'tr-3',
    evidenceId: 'ev-ny-02',
    transferDate: '2026-07-14 03:45',
    transferredBy: 'Officer T. Walsh (CSU)',
    receivedBy: 'Det. Pulkit Gupta',
    storageLocation: 'Refrigerated Evidence Unit R-02',
    notes: 'Preserved at 4°C to avoid evaporation of volatile neurotoxin metabolites.'
  }
];

const INITIAL_INTERVIEWS: WitnessInterviewRecord[] = [
  {
    id: 'int-1',
    caseId: 'NY-2026-0884',
    witnessId: 'wit-ny-1',
    witnessName: 'Evelyn St. Claire',
    interviewerName: 'Det. Pulkit Gupta',
    interviewDate: '2026-07-14 11:30',
    location: '12th Precinct Interrogation Room A',
    notes: 'Witness appeared visibly anxious. Confirmed hearing a high-pitched hum approximately 20 seconds before the corridor lights failed.',
    keyFindings: [
      'Heard acoustic hum prior to blackout',
      'Noticed concierge elevator bypass at 02:30',
      'Reported faint scent of lavender or bitter almond'
    ]
  },
  {
    id: 'int-2',
    caseId: 'NY-2026-0884',
    witnessId: 'wit-ny-2',
    witnessName: 'Marcus Vance',
    interviewerName: 'Det. Pulkit Gupta',
    interviewDate: '2026-07-14 15:45',
    location: 'Metropolitan General Hospital, Room 402',
    notes: 'Subject recovering from sedative exposure. Stated he responded to a false thermal alarm near the gallery before losing consciousness.',
    keyFindings: [
      'Triggered by spoofed thermal alarm',
      'Confirms keycard was still in his breast pocket upon waking',
      'Saw silhouette wearing high-grade night vision optics'
    ]
  }
];

const INITIAL_NOTIFICATIONS: CaseNotification[] = [
  {
    id: 'notif-1',
    title: 'Forensic Lab Alert',
    message: 'Spectrometry match completed for Evidence EV-NY-02 (Zolpidem stemware).',
    type: 'EVIDENCE',
    timestamp: '2 hours ago',
    read: false,
    link: '/cases/NY-2026-0884/evidence'
  },
  {
    id: 'notif-2',
    title: 'Task Overdue Notice',
    message: 'Task "Acoustic Resonance Cutter Spectrogram Review" was finalized.',
    type: 'TASK',
    timestamp: '5 hours ago',
    read: false,
    link: '/tasks'
  },
  {
    id: 'notif-3',
    title: 'New CCTV Anomaly Captured',
    message: 'Camera CAM-01 recorded an unflagged transient blackout signature.',
    type: 'CASE',
    timestamp: '1 day ago',
    read: true,
    link: '/cases/NY-2026-0884/cctv'
  }
];

const INITIAL_NOTES: InvestigationNote[] = [
  {
    id: 'note-ny-1',
    caseId: 'NY-2026-0884',
    title: 'Blackout Transient Duration Analysis',
    content: 'The 92-second localized blackout precisely targets sub-grid relay Alpha-4. Zero peripheral buildings experienced power drops, confirming direct physical sabotage inside Apex Tower elevator shafts.',
    category: 'HYPOTHESIS',
    associatedEvidenceIds: ['ev-ny-01', 'ev-ny-03'],
    associatedSuspectIds: ['susp-ny-01'],
    createdAt: '2026-07-14T04:15:00.000Z',
    updatedAt: '2026-07-14T04:15:00.000Z'
  },
  {
    id: 'note-ny-2',
    caseId: 'NY-2026-0884',
    title: 'Spectrometric Sedative Batch Match',
    content: 'Zolpidem residue recovered from executive champagne glass shows synthesized isotopic markers unique to pharmaceutical manufacturing facility in New Jersey.',
    category: 'FORENSICS',
    associatedEvidenceIds: ['ev-ny-02'],
    associatedSuspectIds: ['susp-ny-02'],
    createdAt: '2026-07-14T05:30:00.000Z',
    updatedAt: '2026-07-14T05:30:00.000Z'
  },
  {
    id: 'note-la-1',
    caseId: 'LA-2026-0317',
    title: 'Synthetic Neurotoxin Delivery Method',
    content: 'Aerosol canisters found in HVAC ventilation intake. Dual-stage release suggests remote timer trigger.',
    category: 'FORENSICS',
    associatedEvidenceIds: ['ev-la-01'],
    createdAt: '2026-03-18T09:00:00.000Z',
    updatedAt: '2026-03-18T09:00:00.000Z'
  }
];

const SAMPLE_CASE_NOTES: InvestigationNote[] = INITIAL_CASES.map((caseRecord) => ({
  id: `note-demo-${caseRecord.id}`,
  caseId: caseRecord.id,
  title: `Fictional demo note — ${caseRecord.title} source checks`,
  content: `FICTIONAL TRAINING NOTE — This is not a verified finding. Review the original intake record for ${caseRecord.title}, confirm the dates and chain of custody for ${caseRecord.evidenceList.slice(0, 2).map(item => item.code).join(' and ') || 'any linked exhibits'}, and compare witness accounts with independently verified timeline entries. Record any discrepancy as an open question until corroborated.`,
  category: 'GENERAL',
  associatedEvidenceIds: caseRecord.evidenceList.slice(0, 2).map(item => item.id),
  associatedSuspectIds: caseRecord.suspects.slice(0, 1).map(suspect => suspect.id),
  createdAt: caseRecord.incidentDate,
  updatedAt: caseRecord.incidentDate
}));

const INITIAL_ACTIVITIES: ActivityRecord[] = [
  {
    id: 'act-1',
    caseId: 'NY-2026-0884',
    actionType: 'CASE_CREATED',
    description: 'Initial Case Dossier logged into CaseX central database.',
    timestamp: '2026-07-14 02:45'
  },
  {
    id: 'act-2',
    caseId: 'NY-2026-0884',
    actionType: 'EVIDENCE_COLLECTED',
    description: 'Collected Stemware with sedative residue from Penthouse 74.',
    timestamp: '2026-07-14 03:22',
    relatedRecordId: 'ev-ny-02'
  },
  {
    id: 'act-3',
    caseId: 'NY-2026-0884',
    actionType: 'EVIDENCE_VERIFIED',
    description: 'Forensic Lab verified Acoustic Resonance cutter marks on vault door.',
    timestamp: '2026-07-14 04:05',
    relatedRecordId: 'ev-ny-01'
  },
  {
    id: 'act-4',
    caseId: 'NY-2026-0884',
    actionType: 'NOTE_ADDED',
    description: 'Investigator logged new hypothesis on blackout transient duration.',
    timestamp: '2026-07-14 04:15'
  }
];

const DEFAULT_PREFERENCES: UserPreferences = {
  density: 'comfortable',
  defaultCaseView: 'table',
  pageSize: 10,
  scanlinesEnabled: true,
  dateTimeFormat: 'locale',
  notificationsEnabled: true,
  notificationCategories: { CASE: true, EVIDENCE: true, TASK: true, WARRANT: true, SYSTEM: true },
  showWidgets: {
    recentEvidence: true,
    recentActivity: true,
    priorityAlerts: true,
    quickNotes: true,
    upcomingEvents: true,
    favorites: true,
    recentlyViewed: true,
    apiStatus: true,
    tasks: true
  }
};

const CASE_SEED_VERSION = 'casex-3.3';

const normalizeCases = (rawCases: InvestigationCase[]): InvestigationCase[] => {
  return rawCases.map((c) => ({
    ...c,
    evidenceList: (c.evidenceList || []).map(e => ({
      ...e,
      currentCustodian: e.currentCustodian || 'Det. Pulkit Gupta (Lead Investigator)',
      storageLocation: e.storageLocation || 'Secure Evidence Locker B-14',
      tags: e.tags || [],
      reviewStatus: e.reviewStatus || (e.status === 'COLLECTED' ? 'REVIEWED' : 'PENDING_REVIEW'),
      custodyHistory: e.custodyHistory || []
    })),
    witnesses: c.witnesses || [],
    timeline: c.timeline || [],
    cctvFeeds: (c.cctvFeeds || []).map((feed, index) => ({
      ...feed,
      camCode: feed.camCode || `CAM-${String(index + 1).padStart(2, '0')}`,
      cameraName: feed.cameraName || feed.locationName || `Camera ${index + 1}`,
      location: feed.location || feed.locationName || c.location,
      status: feed.status || 'ARCHIVED'
    })),
    forensics: c.forensics || [],
    boardNodes: c.boardNodes || [],
    boardConnections: c.boardConnections || [],
    tags: c.tags || ['HIGH-PRIORITY', 'FORENSICS-REQUIRED'],
    isArchived: c.isArchived || false,
    checklist: Array.isArray(c.checklist) ? c.checklist : DEFAULT_CHECKLIST,
    tasks: c.tasks || [],
    suspects: (c.suspects || []).map((s) => ({
      ...s,
      threatScore: s.threatScore ?? s.riskScore ?? 50,
      riskScore: s.riskScore ?? s.threatScore ?? 50,
      fingerprintMatchRate: s.fingerprintMatchRate ?? s.fingerprintMatch ?? 0,
      fingerprintMatch: s.fingerprintMatch ?? s.fingerprintMatchRate ?? 0,
      dnaMatchRate: s.dnaMatchRate ?? s.dnaMatch ?? 0,
      dnaMatch: s.dnaMatch ?? s.dnaMatchRate ?? 0,
      linkedEvidence: s.linkedEvidence || s.evidenceLinks || [],
      evidenceLinks: s.evidenceLinks || s.linkedEvidence || [],
      interrogationNotes: s.interrogationNotes || s.notes || '',
      notes: s.notes || s.interrogationNotes || '',
      alibiStatus: s.alibiStatus || 'QUESTIONABLE',
      status: s.status || 'SUSPECT'
    }))
  }));
};

const mergeSeedData = (savedCases: InvestigationCase[], initialCases: InvestigationCase[]): InvestigationCase[] => {
  return initialCases.map(initCase => {
    const saved = savedCases.find(sc => sc.id === initCase.id);
    if (!saved) return initCase;

    // Merge suspects without losing user changes or missing seed entries
    const existingSuspectIds = new Set((saved.suspects || []).map(s => s.id));
    const mergedSuspects = [...(saved.suspects || [])];
    for (const initSuspect of initCase.suspects || []) {
      if (!existingSuspectIds.has(initSuspect.id)) {
        mergedSuspects.push(initSuspect);
      }
    }

    // Merge witnesses without losing user changes or missing seed entries
    const existingWitnessIds = new Set((saved.witnesses || []).map(w => w.id));
    const mergedWitnesses = [...(saved.witnesses || [])];
    for (const initWitness of initCase.witnesses || []) {
      if (!existingWitnessIds.has(initWitness.id)) {
        mergedWitnesses.push(initWitness);
      }
    }

    // Merge evidence if new exhibits exist
    const existingEvidenceIds = new Set((saved.evidenceList || []).map(e => e.id));
    const mergedEvidence = [...(saved.evidenceList || [])];
    for (const initEv of initCase.evidenceList || []) {
      if (!existingEvidenceIds.has(initEv.id)) {
        mergedEvidence.push(initEv);
      }
    }

    const existingCameraIds = new Set((saved.cctvFeeds || []).map(feed => feed.id));
    const mergedCameras = [...(saved.cctvFeeds || [])];
    for (const initFeed of initCase.cctvFeeds || []) {
      if (!existingCameraIds.has(initFeed.id)) mergedCameras.push(initFeed);
    }

    const mergeById = <T extends { id: string }>(savedItems: T[] | undefined, seedItems: T[] | undefined): T[] => {
      const merged = [...(savedItems || [])];
      const existingIds = new Set(merged.map(item => item.id));
      for (const item of seedItems || []) if (!existingIds.has(item.id)) merged.push(item);
      return merged;
    };
    const mergedTimeline = mergeById(saved.timeline, initCase.timeline);
    const mergedForensics = mergeById(saved.forensics, initCase.forensics);
    const mergedBoardNodes = mergeById(saved.boardNodes, initCase.boardNodes);
    const mergedBoardConnections = mergeById(saved.boardConnections, initCase.boardConnections);

    return {
      ...initCase,
      ...saved,
      evidenceList: mergedEvidence,
      cctvFeeds: mergedCameras,
      timeline: mergedTimeline,
      forensics: mergedForensics,
      boardNodes: mergedBoardNodes,
      boardConnections: mergedBoardConnections,
      suspects: mergedSuspects,
      witnesses: mergedWitnesses,
      evidenceCount: mergedEvidence.length,
      suspectCount: mergedSuspects.length,
      witnessCount: mergedWitnesses.length
    };
  }).concat(
    // Keep custom cases added by the user
    savedCases.filter(sc => !initialCases.some(ic => ic.id === sc.id))
  );
};

export const CaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Cases State
  const [cases, setCases] = useState<InvestigationCase[]>(() => {
    try {
      const saved = localStorage.getItem('casex_cases_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        const seedVersion = localStorage.getItem('casex_seed_version');
        if (seedVersion !== CASE_SEED_VERSION) {
          const migrated = normalizeCases(mergeSeedData(parsed, INITIAL_CASES)).map(c => ({
            ...ensureCaseDemoRecords(c),
            progress: 0,
            checklist: (c.checklist || []).map(item => /^chk-[1-7]$/.test(item.id) ? { ...item, completed: false } : item)
          }));
          localStorage.setItem('casex_seed_version', CASE_SEED_VERSION);
          return migrated;
        }
        return normalizeCases(mergeSeedData(parsed, INITIAL_CASES));
      }
      localStorage.setItem('casex_seed_version', CASE_SEED_VERSION);
      return normalizeCases(INITIAL_CASES);
    } catch {
      return normalizeCases(INITIAL_CASES);
    }
  });

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('casex_selected_case_id') || 'NY-2026-0884';
    } catch {
      return 'NY-2026-0884';
    }
  });

  const [recentCaseIds, setRecentCaseIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('casex_recent_case_ids');
      return saved ? JSON.parse(saved) : ['NY-2026-0884', 'LA-2026-0317'];
    } catch {
      return ['NY-2026-0884', 'LA-2026-0317'];
    }
  });

  // Notes State
  const [notes, setNotes] = useState<InvestigationNote[]>(() => {
    try {
      const saved = localStorage.getItem('casex_notes_v3');
      const seedVersion = localStorage.getItem('casex_notes_seed_version');
      if (saved) {
        const parsed: InvestigationNote[] = JSON.parse(saved);
        if (seedVersion !== 'casex-notes-1') {
          const ids = new Set(parsed.map(note => note.id));
          const merged = [...parsed, ...INITIAL_NOTES, ...SAMPLE_CASE_NOTES].filter((note, index, all) => !ids.has(note.id) || index < parsed.length);
          localStorage.setItem('casex_notes_v3', JSON.stringify(merged));
          localStorage.setItem('casex_notes_seed_version', 'casex-notes-1');
          return merged;
        }
        return parsed;
      }
      localStorage.setItem('casex_notes_seed_version', 'casex-notes-1');
      return [...INITIAL_NOTES, ...SAMPLE_CASE_NOTES];
    } catch {
      return [...INITIAL_NOTES, ...SAMPLE_CASE_NOTES];
    }
  });

  // Activities State
  const [activities, setActivities] = useState<ActivityRecord[]>(() => {
    try {
      const saved = localStorage.getItem('casex_activities_v3');
      return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
    } catch {
      return INITIAL_ACTIVITIES;
    }
  });

  // Tasks State
  const [tasks, setTasks] = useState<InvestigationTask[]>(() => {
    try {
      const saved = localStorage.getItem('casex_tasks_v3');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  // Custody Transfers State
  const [custodyTransfers, setCustodyTransfers] = useState<CustodyTransfer[]>(() => {
    try {
      const saved = localStorage.getItem('casex_transfers_v3');
      return saved ? JSON.parse(saved) : INITIAL_TRANSFERS;
    } catch {
      return INITIAL_TRANSFERS;
    }
  });

  // Interviews State
  const [interviews, setInterviews] = useState<WitnessInterviewRecord[]>(() => {
    try {
      const saved = localStorage.getItem('casex_interviews_v3');
      return saved ? JSON.parse(saved) : INITIAL_INTERVIEWS;
    } catch {
      return INITIAL_INTERVIEWS;
    }
  });

  // Notifications State
  const [notifications, setNotifications] = useState<CaseNotification[]>(() => {
    try {
      const saved = localStorage.getItem('casex_notifications_v3');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // Favorites State
  const [favoriteCaseIds, setFavoriteCaseIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('casex_fav_cases_v3');
      return saved ? JSON.parse(saved) : ['NY-2026-0884'];
    } catch {
      return ['NY-2026-0884'];
    }
  });

  const [favoriteEvidenceIds, setFavoriteEvidenceIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('casex_fav_evidence_v3');
      return saved ? JSON.parse(saved) : ['ev-ny-01'];
    } catch {
      return ['ev-ny-01'];
    }
  });

  // Recently Viewed State
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedRecord[]>(() => {
    try {
      const saved = localStorage.getItem('casex_recently_viewed_v3');
      return saved ? JSON.parse(saved) : [
        { id: 'NY-2026-0884', type: 'CASE', title: 'THE MIDNIGHT DIAMOND HEIST', subtitle: 'Apex Tower, Manhattan', path: '/cases/NY-2026-0884', viewedAt: new Date().toLocaleTimeString() },
        { id: 'ev-ny-01', type: 'EVIDENCE', title: 'Acoustic Resonance Dial Scrapings', subtitle: 'Apex Vault Door', path: '/cases/NY-2026-0884/evidence', viewedAt: new Date().toLocaleTimeString() }
      ];
    } catch {
      return [];
    }
  });

  // Undo Action State
  const [currentUndo, setCurrentUndo] = useState<UndoAction | null>(null);

  // Preferences State
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem('casex_user_preferences_v3');
      if (!saved) return DEFAULT_PREFERENCES;
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_PREFERENCES,
        ...parsed,
        showWidgets: { ...DEFAULT_PREFERENCES.showWidgets, ...(parsed.showWidgets || {}) },
        notificationCategories: { ...DEFAULT_PREFERENCES.notificationCategories, ...(parsed.notificationCategories || {}) }
      };
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  const showToast = useCallback((msg: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  }, []);

  const hideToast = useCallback(() => setToastMessage(null), []);

  // Safe localStorage synchronization
  useEffect(() => {
    try {
      localStorage.setItem('casex_cases_v3', JSON.stringify(cases));
    } catch (e) {
      console.error('Error saving cases', e);
    }
  }, [cases]);

  useEffect(() => {
    try {
      localStorage.setItem('casex_notes_v3', JSON.stringify(notes));
    } catch (e) {
      console.error('Error saving notes', e);
    }
  }, [notes]);

  useEffect(() => {
    try {
      localStorage.setItem('casex_activities_v3', JSON.stringify(activities));
    } catch (e) {
      console.error('Error saving activities', e);
    }
  }, [activities]);

  useEffect(() => {
    try {
      localStorage.setItem('casex_tasks_v3', JSON.stringify(tasks));
    } catch (e) {
      console.error('Error saving tasks', e);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem('casex_transfers_v3', JSON.stringify(custodyTransfers));
    } catch (e) {
      console.error('Error saving transfers', e);
    }
  }, [custodyTransfers]);

  useEffect(() => {
    try {
      localStorage.setItem('casex_interviews_v3', JSON.stringify(interviews));
    } catch (e) {
      console.error('Error saving interviews', e);
    }
  }, [interviews]);

  useEffect(() => {
    try {
      localStorage.setItem('casex_notifications_v3', JSON.stringify(notifications));
    } catch (e) {
      console.error('Error saving notifications', e);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem('casex_fav_cases_v3', JSON.stringify(favoriteCaseIds));
    } catch (e) {
      console.error('Error saving fav cases', e);
    }
  }, [favoriteCaseIds]);

  useEffect(() => {
    try {
      localStorage.setItem('casex_fav_evidence_v3', JSON.stringify(favoriteEvidenceIds));
    } catch (e) {
      console.error('Error saving fav evidence', e);
    }
  }, [favoriteEvidenceIds]);

  useEffect(() => {
    try {
      localStorage.setItem('casex_recently_viewed_v3', JSON.stringify(recentlyViewed));
    } catch (e) {
      console.error('Error saving recently viewed', e);
    }
  }, [recentlyViewed]);

  useEffect(() => {
    try {
      localStorage.setItem('casex_user_preferences_v3', JSON.stringify(preferences));
    } catch (e) {
      console.error('Error saving preferences', e);
    }
  }, [preferences]);

  useEffect(() => {
    if (selectedCaseId) {
      localStorage.setItem('casex_selected_case_id', selectedCaseId);
      setRecentCaseIds(prev => {
        const next = [selectedCaseId, ...prev.filter(id => id !== selectedCaseId)].slice(0, 5);
        try {
          localStorage.setItem('casex_recent_case_ids', JSON.stringify(next));
        } catch { /* no-op */ }
        return next;
      });
    }
  }, [selectedCaseId]);

  const selectedCase = useMemo(() => {
    return cases.find(c => c.id === selectedCaseId) || cases[0] || null;
  }, [cases, selectedCaseId]);

  const recentCases = useMemo(() => {
    return recentCaseIds
      .map(id => cases.find(c => c.id === id))
      .filter((c): c is InvestigationCase => !!c);
  }, [recentCaseIds, cases]);

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const selectCase = useCallback((id: string) => {
    setSelectedCaseId(id);
  }, []);

  const switchCase = useCallback((id: string) => {
    const target = cases.find(c => c.id === id);
    if (target) {
      setSelectedCaseId(id);
      showToast(`Switched active investigation to ${target.title} (${target.id})`, 'info');
    }
  }, [cases, showToast]);

  const calculateCaseProgress = useCallback((c: InvestigationCase): number => {
    // Progress rule: completed checklist items and completed tasks divided by
    // all checklist items and tasks for this case. Status is independent.
    const checklist = c.checklist || [];
    const caseTasks = tasks.filter(task => task.caseId === c.id);
    const total = checklist.length + caseTasks.length;
    if (!total) return 0;
    const completed = checklist.filter(item => item.completed).length + caseTasks.filter(task => task.status === 'COMPLETED').length;
    return Math.round((completed / total) * 100);
  }, [tasks]);

  // Keep the persisted case progress field synchronized with shared checklist/task state.
  useEffect(() => {
    setCases(prev => {
      let changed = false;
      const next = prev.map(c => {
        const progress = calculateCaseProgress(c);
        if (c.progress === progress) return c;
        changed = true;
        return { ...c, progress };
      });
      return changed ? next : prev;
    });
  }, [calculateCaseProgress]);

  const addActivity = useCallback((
    actionType: ActivityRecord['actionType'],
    description: string,
    caseId?: string,
    relatedRecordId?: string
  ) => {
    const targetCaseId = caseId || selectedCaseId || 'GENERAL';
    const newRecord: ActivityRecord = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      caseId: targetCaseId,
      actionType,
      description,
      timestamp: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      relatedRecordId
    };
    setActivities(prev => [newRecord, ...prev].slice(0, 150));
  }, [selectedCaseId]);

  const addNotification = useCallback((notification: Omit<CaseNotification, 'id' | 'timestamp' | 'read'>) => {
    if (!preferences.notificationsEnabled || !preferences.notificationCategories[notification.type]) return;
    const newNotif: CaseNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 50));
  }, [preferences.notificationsEnabled, preferences.notificationCategories]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast('All notifications marked as read', 'info');
  }, [showToast]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    showToast('Notification center cleared', 'info');
  }, [showToast]);

  // Undo management
  const setUndoAction = useCallback((action: UndoAction) => {
    setCurrentUndo(action);
    setTimeout(() => {
      setCurrentUndo(prev => (prev?.id === action.id ? null : prev));
    }, 6000);
  }, []);

  const triggerUndo = useCallback(() => {
    if (currentUndo) {
      currentUndo.undo();
      showToast(`Reversed: ${currentUndo.description}`, 'info');
      setCurrentUndo(null);
    }
  }, [currentUndo, showToast]);

  const dismissUndo = useCallback(() => {
    setCurrentUndo(null);
  }, []);

  // Update selected case helper
  const updateSelectedCase = useCallback((updater: (prevCase: InvestigationCase) => InvestigationCase) => {
    if (!selectedCaseId) return;
    setCases(prev =>
      prev.map(c => {
        if (c.id === selectedCaseId) {
          const updated = updater(c);
          updated.progress = calculateCaseProgress(updated);
          updated.evidenceCount = updated.evidenceList.length;
          updated.suspectCount = updated.suspects.length;
          updated.witnessCount = updated.witnesses.length;
          return updated;
        }
        return c;
      })
    );
  }, [selectedCaseId, calculateCaseProgress]);

  // ===================== CASE CRUD & RESOLUTION =====================
  const addCase = useCallback((newCaseData: Omit<InvestigationCase, 'progress'>): InvestigationCase => {
    const fullCase: InvestigationCase = {
      ...ensureCaseDemoRecords(newCaseData as InvestigationCase),
      progress: 0,
      evidenceCount: newCaseData.evidenceList.length < 6 ? 6 : newCaseData.evidenceList.length,
      suspectCount: newCaseData.suspects.length < 6 ? 6 : newCaseData.suspects.length,
      witnessCount: newCaseData.witnesses.length < 6 ? 6 : newCaseData.witnesses.length,
      checklist: newCaseData.checklist || [],
      tags: newCaseData.tags || ['NEW-CASE'],
      isArchived: false
    };

    setCases(prev => [fullCase, ...prev]);
    setSelectedCaseId(fullCase.id);
    addActivity('CASE_CREATED', `New Investigation Case registered: ${fullCase.title} (${fullCase.id})`, fullCase.id);
    addNotification({
      title: 'New Case Docket Registered',
      message: `${fullCase.id}: ${fullCase.title} added by Lead Investigator.`,
      type: 'CASE',
      link: `/cases/${fullCase.id}`
    });
    showToast(`Case "${fullCase.title}" (${fullCase.id}) successfully created!`, 'success');
    return fullCase;
  }, [addActivity, addNotification, showToast]);

  const updateCase = useCallback((updatedCase: InvestigationCase) => {
    setCases(prev =>
      prev.map(c => {
        if (c.id === updatedCase.id) {
          const fresh = {
            ...updatedCase,
            evidenceCount: updatedCase.evidenceList.length,
            suspectCount: updatedCase.suspects.length,
            witnessCount: updatedCase.witnesses.length
          };
          fresh.progress = calculateCaseProgress(fresh);
          return fresh;
        }
        return c;
      })
    );
    addActivity('CASE_UPDATED', `Case Dossier modified: ${updatedCase.title} (${updatedCase.id})`, updatedCase.id);
    showToast(`Case ${updatedCase.id} successfully updated`, 'success');
  }, [calculateCaseProgress, addActivity, showToast]);

  const deleteCase = useCallback((caseId: string): boolean => {
    const target = cases.find(c => c.id === caseId);
    if (!target) return false;
    const relatedNotes = notes.filter(note => note.caseId === caseId);
    const relatedTasks = tasks.filter(task => task.caseId === caseId);
    const relatedInterviews = interviews.filter(interview => interview.caseId === caseId);
    const evidenceIds = new Set(target.evidenceList.map(evidence => evidence.id));
    const relatedTransfers = custodyTransfers.filter(transfer => evidenceIds.has(transfer.evidenceId));

    // Register undo
    setUndoAction({
      id: `undo-del-case-${Date.now()}`,
      description: `Delete Case ${caseId}`,
      undo: () => {
        setCases(prev => [target, ...prev]);
        setNotes(prev => [...relatedNotes, ...prev]);
        setTasks(prev => [...relatedTasks, ...prev]);
        setInterviews(prev => [...relatedInterviews, ...prev]);
        setCustodyTransfers(prev => [...relatedTransfers, ...prev]);
      }
    });

    setCases(prev => prev.filter(c => c.id !== caseId));
    setNotes(prev => prev.filter(note => note.caseId !== caseId));
    setTasks(prev => prev.filter(task => task.caseId !== caseId));
    setInterviews(prev => prev.filter(interview => interview.caseId !== caseId));
    setCustodyTransfers(prev => prev.filter(transfer => !evidenceIds.has(transfer.evidenceId)));
    setNotifications(prev => prev.filter(notification => !notification.link?.startsWith(`/cases/${caseId}`)));
    setFavoriteCaseIds(prev => prev.filter(id => id !== caseId));
    setFavoriteEvidenceIds(prev => prev.filter(id => !evidenceIds.has(id)));
    setRecentlyViewed(prev => prev.filter(record => record.id !== caseId && !evidenceIds.has(record.id)));
    setRecentCaseIds(prev => prev.filter(id => id !== caseId));
    if (selectedCaseId === caseId) {
      const remaining = cases.filter(c => c.id !== caseId);
      if (remaining.length > 0) {
        setSelectedCaseId(remaining[0].id);
      } else {
        setSelectedCaseId(null);
      }
    }
    addActivity('CASE_DELETED', `Case Dossier removed: ${target.title} (${caseId})`, caseId);
    showToast(`Case ${caseId} deleted. Click Undo to restore.`, 'warning');
    return true;
  }, [cases, selectedCaseId, notes, tasks, interviews, custodyTransfers, setUndoAction, addActivity, showToast]);

  const archiveCase = useCallback((caseId: string) => {
    setCases(prev => prev.map(c => c.id === caseId ? { ...c, isArchived: true } : c));
    addActivity('CASE_UPDATED', `Case Dossier archived: ${caseId}`, caseId);
    showToast(`Case ${caseId} moved to archive.`, 'info');
  }, [addActivity, showToast]);

  const restoreCase = useCallback((caseId: string) => {
    setCases(prev => prev.map(c => c.id === caseId ? { ...c, isArchived: false } : c));
    addActivity('CASE_UPDATED', `Case Dossier restored from archive: ${caseId}`, caseId);
    showToast(`Case ${caseId} restored to active docket.`, 'success');
  }, [addActivity, showToast]);

  const resolveCase = useCallback(async (
    caseId: string,
    resolutionSummary: string,
    sendEmail: boolean = true,
    recipientEmail?: string
  ): Promise<{ success: boolean; emailSent?: boolean; message: string }> => {
    const target = cases.find(c => c.id === caseId);
    if (!target) {
      return { success: false, message: 'Case not found' };
    }

    // 1. Update Case status and progress in local state
    setCases(prev =>
      prev.map(c => {
        if (c.id === caseId) {
          return {
            ...c,
            status: 'SOLVED',
            resolutionSummary,
            warrantData: {
              ...c.warrantData,
              probableCauseSummary: resolutionSummary
            }
          };
        }
        return c;
      })
    );

    addActivity('WARRANT_ISSUED', `Case officially RESOLVED: ${target.title} (${caseId}).`, caseId);
    addNotification({
      title: 'Investigation Solved & Sealed',
      message: `Case ${caseId}: ${target.title} has officially been marked SOLVED.`,
      type: 'WARRANT',
      link: `/cases/${caseId}`
    });

    let emailSent = false;
    let emailStatusMessage = '';

    // 2. Dispatch real resolution email via dedicated server endpoint
    if (sendEmail) {
      try {
        const response = await fetch('/api/cases/send-resolution-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            caseId,
            caseTitle: target.title,
            resolutionSummary,
            resolvedBy: target.leadInvestigator || 'Lead Investigator',
            recipientEmail: recipientEmail || undefined,
            resolutionDate: new Date().toISOString().split('T')[0]
          })
        });

        const data = await response.json();
        if (response.ok && data.success) {
          emailSent = true;
          emailStatusMessage = data.message || 'Resolution email successfully dispatched.';
        } else {
          emailStatusMessage = data.error || 'Email service unconfigured. Case saved as solved locally.';
        }
      } catch (err: any) {
        emailStatusMessage = `Failed to contact resolution email service: ${err.message}`;
      }
    }

    showToast(`Case ${caseId} officially marked SOLVED!`, 'success');
    return {
      success: true,
      emailSent,
      message: emailStatusMessage || 'Case solved successfully.'
    };
  }, [cases, addActivity, addNotification, showToast]);

  // ===================== EVIDENCE CRUD =====================
  const addEvidence = useCallback((caseId: string, item: Omit<EvidenceItem, 'id' | 'status'>): EvidenceItem => {
    const codeNumber = Math.floor(100 + Math.random() * 900);
    const newId = `ev-${Date.now().toString(36)}-${codeNumber}`;
    const newItem: EvidenceItem = {
      ...item,
      id: newId,
      code: item.code || `EX-${codeNumber}`,
      status: 'COLLECTED',
      collectedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      currentCustodian: item.currentCustodian || 'Det. Pulkit Gupta',
      storageLocation: item.storageLocation || 'Secure Evidence Locker B-14',
      reviewStatus: 'PENDING_REVIEW',
      custodyHistory: []
    };

    setCases(prev =>
      prev.map(c => {
        if (c.id === caseId) {
          const updatedEvidence = [newItem, ...c.evidenceList];
          const updated = { ...c, evidenceList: updatedEvidence };
          updated.progress = calculateCaseProgress(updated);
          updated.evidenceCount = updatedEvidence.length;
          return updated;
        }
        return c;
      })
    );

    addActivity('EVIDENCE_COLLECTED', `New Exhibit added: ${newItem.title} (${newItem.code})`, caseId, newId);
    addNotification({
      title: 'New Exhibit Logged',
      message: `${newItem.code}: ${newItem.title} logged into locker for case ${caseId}.`,
      type: 'EVIDENCE',
      link: `/cases/${caseId}/evidence`
    });
    showToast(`Evidence ${newItem.code} logged to locker!`, 'success');
    return newItem;
  }, [calculateCaseProgress, addActivity, addNotification, showToast]);

  const updateEvidence = useCallback((caseId: string, item: EvidenceItem) => {
    setCases(prev =>
      prev.map(c => {
        if (c.id === caseId) {
          const updatedList = c.evidenceList.map(e => (e.id === item.id ? item : e));
          const updated = { ...c, evidenceList: updatedList };
          updated.progress = calculateCaseProgress(updated);
          return updated;
        }
        return c;
      })
    );
    addActivity('CASE_UPDATED', `Evidence exhibit updated: ${item.title} (${item.code})`, caseId, item.id);
    showToast(`Exhibit ${item.code} updated`, 'info');
  }, [calculateCaseProgress, addActivity, showToast]);

  const deleteEvidence = useCallback((caseId: string, evidenceId: string) => {
    setCases(prev =>
      prev.map(c => {
        if (c.id === caseId) {
          const updatedList = c.evidenceList.filter(e => e.id !== evidenceId);
          const boardNodes = c.boardNodes.filter(node => node.refId !== evidenceId);
          const removedNodeIds = new Set(c.boardNodes.filter(node => node.refId === evidenceId).map(node => node.id));
          const updated = {
            ...c,
            evidenceList: updatedList,
            suspects: c.suspects.map(suspect => ({
              ...suspect,
              evidenceLinks: (suspect.evidenceLinks || []).filter(id => id !== evidenceId),
              linkedEvidence: (suspect.linkedEvidence || []).filter(id => id !== evidenceId)
            })),
            boardNodes,
            boardConnections: c.boardConnections.filter(connection => !removedNodeIds.has(connection.fromId || connection.fromNodeId || '') && !removedNodeIds.has(connection.toId || connection.toNodeId || ''))
          };
          updated.progress = calculateCaseProgress(updated);
          updated.evidenceCount = updatedList.length;
          return updated;
        }
        return c;
      })
    );
    setNotes(prev => prev.map(note => note.caseId !== caseId ? note : {
      ...note,
      associatedEvidenceIds: (note.associatedEvidenceIds || []).filter(id => id !== evidenceId)
    }));
    setCustodyTransfers(prev => prev.filter(transfer => transfer.evidenceId !== evidenceId));
    setFavoriteEvidenceIds(prev => prev.filter(id => id !== evidenceId));
    setRecentlyViewed(prev => prev.filter(record => record.id !== evidenceId));
    addActivity('CASE_UPDATED', `Evidence exhibit removed: ${evidenceId}`, caseId, evidenceId);
    showToast('Evidence exhibit deleted from locker', 'warning');
  }, [calculateCaseProgress, addActivity, showToast]);

  const collectEvidence = useCallback((evidenceIdOrCode: string) => {
    updateSelectedCase(prev => {
      const updatedList = prev.evidenceList.map(e => {
        if (e.id === evidenceIdOrCode || e.code === evidenceIdOrCode) {
          return {
            ...e,
            status: 'COLLECTED' as const,
            reviewStatus: 'PENDING_REVIEW' as const,
            collectedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
        return e;
      });
      return { ...prev, evidenceList: updatedList };
    });
    addActivity('EVIDENCE_COLLECTED', `Exhibit ${evidenceIdOrCode} transferred to evidence locker.`, selectedCaseId || undefined);
    showToast(`Exhibit logged and transferred to Evidence Locker`, 'success');
  }, [updateSelectedCase, addActivity, selectedCaseId, showToast]);

  const verifyEvidence = useCallback((caseId: string, evidenceId: string) => {
    setCases(prev =>
      prev.map(c => {
        if (c.id === caseId) {
          const updatedList = c.evidenceList.map(e => {
            if (e.id === evidenceId) {
              return {
                ...e,
                reviewStatus: 'REVIEWED' as const,
                analysisResults: {
                  matchRate: e.analysisResults?.matchRate || 95,
                  technician: e.analysisResults?.technician || 'Dr. Elena Rostova',
                  details: e.analysisResults?.details || 'Chromatographic & spectral forensics verified authentic.',
                  verified: true
                }
              };
            }
            return e;
          });
          const updated = { ...c, evidenceList: updatedList };
          updated.progress = calculateCaseProgress(updated);
          return updated;
        }
        return c;
      })
    );
    addActivity('EVIDENCE_VERIFIED', `Exhibit ${evidenceId} verified by forensics technician.`, caseId, evidenceId);
    showToast('Evidence exhibit forensic verification completed', 'success');
  }, [calculateCaseProgress, addActivity, showToast]);

  const toggleEvidenceReviewStatus = useCallback((caseId: string, evidenceId: string) => {
    setCases(prev =>
      prev.map(c => {
        if (c.id === caseId) {
          const updatedList = c.evidenceList.map(e => {
            if (e.id === evidenceId) {
              const nextStatus = e.reviewStatus === 'REVIEWED' ? 'PENDING_REVIEW' : 'REVIEWED';
              return { ...e, reviewStatus: nextStatus as 'PENDING_REVIEW' | 'REVIEWED' };
            }
            return e;
          });
          const updated = { ...c, evidenceList: updatedList };
          updated.progress = calculateCaseProgress(updated);
          return updated;
        }
        return c;
      })
    );
    addActivity('CASE_UPDATED', `Evidence review status changed for ${evidenceId}.`, caseId, evidenceId);
    showToast('Evidence review status updated', 'info');
  }, [calculateCaseProgress, addActivity, showToast]);

  const inspectHotspot = useCallback((hotspotId: string) => {
    updateSelectedCase(prev => {
      const hotspots = prev.crimeScene.hotspots.map(h => (h.id === hotspotId ? { ...h, inspected: true } : h));
      return { ...prev, crimeScene: { ...prev.crimeScene, hotspots } };
    });
  }, [updateSelectedCase]);

  const collectHotspot = useCallback((hotspotId: string) => {
    updateSelectedCase(prev => {
      let targetName = 'Exhibit';
      const hotspots = prev.crimeScene.hotspots.map(h => {
        if (h.id === hotspotId) {
          targetName = h.name;
          return { ...h, collected: true, inspected: true };
        }
        return h;
      });

      const existingEvidence = prev.evidenceList.find(e => e.id === hotspotId);
      let updatedEvidence = prev.evidenceList;
      if (!existingEvidence) {
        const hs = prev.crimeScene.hotspots.find(h => h.id === hotspotId);
        if (hs) {
          const newEv: EvidenceItem = {
            id: hs.id,
            code: `EX-${Math.floor(100 + Math.random() * 900)}`,
            title: hs.name,
            category: hs.type,
            importance: hs.importance,
            locationFound: prev.crimeScene.name,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            description: hs.description,
            forensicNotes: hs.details,
            status: 'COLLECTED',
            tags: [hs.type, 'CRIME-SCENE'],
            currentCustodian: 'Det. Pulkit Gupta',
            storageLocation: 'Secure Evidence Locker B-14',
            reviewStatus: 'PENDING_REVIEW',
            collectedAt: hs.discoveredAt || 'Just now',
            custodyHistory: []
          };
          updatedEvidence = [newEv, ...prev.evidenceList];
        }
      } else {
        updatedEvidence = prev.evidenceList.map(e =>
          e.id === hotspotId ? { ...e, status: 'COLLECTED' as const } : e
        );
      }

      addActivity('EVIDENCE_COLLECTED', `Collected hotspot artifact: ${targetName}`, prev.id, hotspotId);
      return {
        ...prev,
        crimeScene: { ...prev.crimeScene, hotspots },
        evidenceList: updatedEvidence
      };
    });
    showToast('Hotspot collected and added to Evidence Locker', 'success');
  }, [updateSelectedCase, addActivity, showToast]);

  const updateEvidenceNote = useCallback((evidenceId: string, note: string) => {
    updateSelectedCase(prev => ({
      ...prev,
      evidenceList: prev.evidenceList.map(e => (e.id === evidenceId ? { ...e, userNotes: note } : e))
    }));
  }, [updateSelectedCase]);

  const markEvidenceExamined = useCallback((evidenceId: string) => {
    updateSelectedCase(prev => ({
      ...prev,
      evidenceList: prev.evidenceList.map(e =>
        e.id === evidenceId
          ? {
              ...e,
              status: e.status === 'UNINSPECTED' ? ('INSPECTED' as const) : e.status
            }
          : e
      )
    }));
  }, [updateSelectedCase]);

  // Custody Transfers
  const addCustodyTransfer = useCallback((transfer: Omit<CustodyTransfer, 'id'>): CustodyTransfer => {
    const newTransfer: CustodyTransfer = {
      ...transfer,
      id: `tr-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`
    };

    setCustodyTransfers(prev => [newTransfer, ...prev]);

    // Also update current custodian in the evidence item
    setCases(prev =>
      prev.map(c => ({
        ...c,
        evidenceList: c.evidenceList.map(e => {
          if (e.id === transfer.evidenceId) {
            return {
              ...e,
              currentCustodian: transfer.receivedBy,
              storageLocation: transfer.storageLocation,
              custodyHistory: [newTransfer, ...(e.custodyHistory || [])]
            };
          }
          return e;
        })
      }))
    );

    addActivity('EVIDENCE_VERIFIED', `Chain of custody recorded for Exhibit ${transfer.evidenceId}: Transferred to ${transfer.receivedBy}`);
    showToast(`Chain of Custody updated for exhibit`, 'success');
    return newTransfer;
  }, [addActivity, showToast]);

  const getEvidenceCustody = useCallback((evidenceId: string): CustodyTransfer[] => {
    return custodyTransfers.filter(tr => tr.evidenceId === evidenceId);
  }, [custodyTransfers]);

  // ===================== TIMELINE CRUD =====================
  const reorderTimeline = useCallback((fromIndex: number, toIndex: number) => {
    updateSelectedCase(prev => {
      const result = Array.from(prev.timeline);
      const [removed] = result.splice(fromIndex, 1);
      result.splice(toIndex, 0, removed);
      return { ...prev, timeline: result };
    });
  }, [updateSelectedCase]);

  const addTimelineEvent = useCallback((event: Omit<TimelineEvent, 'id'>) => {
    const newId = `tl-${Date.now().toString(36)}`;
    const newEvent: TimelineEvent = { ...event, id: newId };
    updateSelectedCase(prev => {
      const nextTimeline = [...prev.timeline, newEvent];
      const sorted = nextTimeline.sort((a, b) => a.time.localeCompare(b.time));
      return { ...prev, timeline: sorted };
    });
    addActivity('TIMELINE_ADDED', `Timeline Event documented: ${event.title}`, selectedCaseId || undefined);
    showToast(`Event "${event.title}" added to investigation timeline`, 'success');
  }, [updateSelectedCase, addActivity, selectedCaseId, showToast]);

  const updateTimelineEvent = useCallback((caseId: string, event: TimelineEvent) => {
    setCases(prev =>
      prev.map(c => {
        if (c.id === caseId) {
          return {
            ...c,
            timeline: c.timeline.map(t => (t.id === event.id ? event : t))
          };
        }
        return c;
      })
    );
    showToast('Timeline event updated', 'info');
  }, [showToast]);

  const toggleTimelineFlag = useCallback((eventId: string) => {
    updateSelectedCase(prev => ({
      ...prev,
      timeline: prev.timeline.map(t =>
        t.id === eventId
          ? {
              ...t,
              flagged: !t.flagged,
              flaggedInconsistency: !t.flaggedInconsistency
            }
          : t
      )
    }));
  }, [updateSelectedCase]);

  const deleteTimelineEvent = useCallback((eventId: string) => {
    updateSelectedCase(prev => ({
      ...prev,
      timeline: prev.timeline.filter(t => t.id !== eventId)
    }));
    showToast('Timeline event deleted', 'warning');
  }, [updateSelectedCase, showToast]);

  // ===================== SUSPECT CRUD =====================
  const addSuspect = useCallback((caseId: string, suspect: Omit<Suspect, 'id'>): Suspect => {
    const newId = `susp-${Date.now().toString(36)}`;
    const newSuspect: Suspect = {
      ...suspect,
      id: newId,
      threatScore: suspect.threatScore ?? suspect.riskScore ?? 45,
      riskScore: suspect.riskScore ?? suspect.threatScore ?? 45,
      riskLevel: suspect.riskLevel || 'MEDIUM',
      status: suspect.status || 'PERSON OF INTEREST'
    };

    setCases(prev =>
      prev.map(c => {
        if (c.id === caseId) {
          const updatedSuspects = [newSuspect, ...c.suspects];
          const updated = { ...c, suspects: updatedSuspects, suspectCount: updatedSuspects.length };
          updated.progress = calculateCaseProgress(updated);
          return updated;
        }
        return c;
      })
    );

    addActivity('SUSPECT_UPDATED', `Suspect dossier added: ${newSuspect.name}`, caseId, newId);
    showToast(`Suspect profile "${newSuspect.name}" added to matrix`, 'success');
    return newSuspect;
  }, [calculateCaseProgress, addActivity, showToast]);

  const updateSuspect = useCallback((caseId: string, suspect: Suspect) => {
    setCases(prev =>
      prev.map(c => {
        if (c.id === caseId) {
          return {
            ...c,
            suspects: c.suspects.map(s => (s.id === suspect.id ? suspect : s))
          };
        }
        return c;
      })
    );
    addActivity('SUSPECT_UPDATED', `Suspect dossier updated: ${suspect.name}`, caseId, suspect.id);
    showToast(`Suspect dossier updated: ${suspect.name}`, 'info');
  }, [addActivity, showToast]);

  const deleteSuspect = useCallback((caseId: string, suspectId: string) => {
    setCases(prev =>
      prev.map(c => {
        if (c.id === caseId) {
          const updatedSuspects = c.suspects.filter(s => s.id !== suspectId);
          const boardNodes = c.boardNodes.filter(node => node.refId !== suspectId);
          const removedNodeIds = new Set(c.boardNodes.filter(node => node.refId === suspectId).map(node => node.id));
          return {
            ...c,
            suspects: updatedSuspects,
            suspectCount: updatedSuspects.length,
            boardNodes,
            boardConnections: c.boardConnections.filter(connection => !removedNodeIds.has(connection.fromId || connection.fromNodeId || '') && !removedNodeIds.has(connection.toId || connection.toNodeId || '')),
            warrantData: c.warrantData.eligibleSuspectId === suspectId || c.warrantData.primeSuspectId === suspectId
              ? { ...c.warrantData, eligibleSuspectId: undefined, primeSuspectId: undefined }
              : c.warrantData
          };
        }
        return c;
      })
    );
    setNotes(prev => prev.map(note => note.caseId !== caseId ? note : {
      ...note,
      associatedSuspectIds: (note.associatedSuspectIds || []).filter(id => id !== suspectId)
    }));
    setRecentlyViewed(prev => prev.filter(record => record.id !== suspectId));
    addActivity('SUSPECT_UPDATED', `Suspect record removed: ${suspectId}`, caseId, suspectId);
    showToast('Suspect dossier removed from matrix', 'warning');
  }, [addActivity, showToast]);

  const updateSuspectAlibiStatus = useCallback((suspectId: string, status: 'VERIFIED' | 'QUESTIONABLE' | 'DISPROVEN') => {
    updateSelectedCase(prev => ({
      ...prev,
      suspects: prev.suspects.map(s => (s.id === suspectId ? { ...s, alibiStatus: status } : s))
    }));
    addActivity('SUSPECT_UPDATED', `Alibi status for suspect updated to ${status}.`, selectedCaseId || undefined, suspectId);
    showToast(`Alibi status set to ${status}`, 'info');
  }, [updateSelectedCase, addActivity, selectedCaseId, showToast]);

  const updateSuspectNotes = useCallback((suspectId: string, notes: string) => {
    updateSelectedCase(prev => ({
      ...prev,
      suspects: prev.suspects.map(s =>
        s.id === suspectId
          ? {
              ...s,
              notes,
              interrogationNotes: notes
            }
          : s
      )
    }));
  }, [updateSelectedCase]);

  const updateSuspectStatus = useCallback((suspectId: string, status: 'SUSPECT' | 'PERSON OF INTEREST' | 'CLEAR' | 'PRIME SUSPECT') => {
    updateSelectedCase(prev => ({
      ...prev,
      suspects: prev.suspects.map(s => (s.id === suspectId ? { ...s, status } : s))
    }));
    showToast(`Suspect status updated to ${status}`, 'info');
  }, [updateSelectedCase, showToast]);

  const setPrimeSuspect = useCallback((suspectId: string) => {
    updateSelectedCase(prev => {
      const suspects = prev.suspects.map(s => ({
        ...s,
        status: s.id === suspectId ? ('PRIME SUSPECT' as const) : s.status === 'PRIME SUSPECT' ? ('SUSPECT' as const) : s.status
      }));
      return {
        ...prev,
        suspects,
        warrantData: {
          ...prev.warrantData,
          primeSuspectId: suspectId,
          eligibleSuspectId: suspectId
        }
      };
    });
    addActivity('SUSPECT_UPDATED', `Designated Prime Suspect for judicial indictment.`, selectedCaseId || undefined, suspectId);
    showToast(`Prime suspect designated for warrant processing`, 'warning');
  }, [updateSelectedCase, addActivity, selectedCaseId, showToast]);

  // ===================== WITNESS CRUD & INTERVIEWS =====================
  const addWitness = useCallback((caseId: string, witness: Omit<Witness, 'id'>): Witness => {
    const newId = `wit-${Date.now().toString(36)}`;
    const newWitness: Witness = {
      ...witness,
      id: newId,
      credibilityScore: witness.credibilityScore ?? witness.credibility ?? 70,
      credibility: witness.credibility ?? witness.credibilityScore ?? 70,
      verificationStatus: witness.verificationStatus || 'UNVERIFIED',
      interviewHistory: witness.interviewHistory || []
    };

    setCases(prev =>
      prev.map(c => {
        if (c.id === caseId) {
          const updatedWitnesses = [newWitness, ...c.witnesses];
          const updated = { ...c, witnesses: updatedWitnesses, witnessCount: updatedWitnesses.length };
          updated.progress = calculateCaseProgress(updated);
          return updated;
        }
        return c;
      })
    );

    addActivity('CASE_UPDATED', `Witness deposition recorded: ${newWitness.name}`, caseId, newId);
    showToast(`Witness "${newWitness.name}" added to dossier`, 'success');
    return newWitness;
  }, [calculateCaseProgress, addActivity, showToast]);

  const updateWitness = useCallback((caseId: string, witness: Witness) => {
    setCases(prev =>
      prev.map(c => {
        if (c.id === caseId) {
          return {
            ...c,
            witnesses: c.witnesses.map(w => (w.id === witness.id ? witness : w))
          };
        }
        return c;
      })
    );
    addActivity('CASE_UPDATED', `Witness record updated: ${witness.name}`, caseId, witness.id);
    showToast(`Witness record updated: ${witness.name}`, 'info');
  }, [addActivity, showToast]);

  const deleteWitness = useCallback((caseId: string, witnessId: string) => {
    const witnessInterviews = interviews.filter(interview => interview.caseId === caseId && interview.witnessId === witnessId);
    setCases(prev =>
      prev.map(c => {
        if (c.id === caseId) {
          const updatedWitnesses = c.witnesses.filter(w => w.id !== witnessId);
          const removedNodeIds = new Set(c.boardNodes.filter(node => node.refId === witnessId).map(node => node.id));
          return {
            ...c,
            witnesses: updatedWitnesses,
            witnessCount: updatedWitnesses.length,
            boardNodes: c.boardNodes.filter(node => node.refId !== witnessId),
            boardConnections: c.boardConnections.filter(connection => !removedNodeIds.has(connection.fromId || connection.fromNodeId || '') && !removedNodeIds.has(connection.toId || connection.toNodeId || '')),
            timeline: c.timeline.filter(event => !witnessInterviews.some(interview => event.id === `tl-${interview.id}`))
          };
        }
        return c;
      })
    );
    setInterviews(prev => prev.filter(interview => !(interview.caseId === caseId && interview.witnessId === witnessId)));
    setRecentlyViewed(prev => prev.filter(record => record.id !== witnessId));
    addActivity('CASE_UPDATED', `Witness record removed: ${witnessId}`, caseId, witnessId);
    showToast('Witness record deleted', 'warning');
  }, [interviews, addActivity, showToast]);

  const interviewWitness = useCallback((witnessId: string, question: string): string => {
    const defaultResponse = 'No response recorded. Enter the witness\'s actual response after the interview.';
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    updateSelectedCase(prev => ({
      ...prev,
      witnesses: prev.witnesses.map(w => {
        if (w.id === witnessId) {
          const interviewHistory = w.interviewHistory || [];
          return {
            ...w,
            interviewHistory: [...interviewHistory, { question, response: defaultResponse, timestamp: time }]
          };
        }
        return w;
      })
    }));

    return defaultResponse;
  }, [updateSelectedCase]);

  const updateWitnessVerification = useCallback((witnessId: string, status: 'VERIFIED' | 'UNVERIFIED' | 'FLAGGED') => {
    updateSelectedCase(prev => ({
      ...prev,
      witnesses: prev.witnesses.map(w => (w.id === witnessId ? { ...w, verificationStatus: status } : w))
    }));
    showToast(`Witness verification set to ${status}`, 'info');
  }, [updateSelectedCase, showToast]);

  const verifyWitness = useCallback((witnessId: string) => updateWitnessVerification(witnessId, 'VERIFIED'), [updateWitnessVerification]);
  const flagWitness = useCallback((witnessId: string) => updateWitnessVerification(witnessId, 'FLAGGED'), [updateWitnessVerification]);

  const addWitnessNote = useCallback((witnessId: string, note: string) => {
    updateSelectedCase(prev => ({
      ...prev,
      witnesses: prev.witnesses.map(w => (w.id === witnessId ? { ...w, notes: note } : w))
    }));
  }, [updateSelectedCase]);

  // Witness Interview Records
  const addInterview = useCallback((interview: Omit<WitnessInterviewRecord, 'id'>): WitnessInterviewRecord => {
    const newInterview: WitnessInterviewRecord = {
      ...interview,
      id: `int-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`
    };
    setInterviews(prev => [newInterview, ...prev]);
    const recordedResponse = newInterview.audioTranscript || newInterview.notes || newInterview.keyFindings.join('; ') || 'Interview record created; transcript not provided.';
    setCases(prev => prev.map(c => c.id !== newInterview.caseId ? c : {
      ...c,
      witnesses: c.witnesses.map(w => w.id !== newInterview.witnessId ? w : {
        ...w,
        interviewStatus: 'COMPLETED',
        nextInterviewDate: undefined,
        interviewHistory: [...(w.interviewHistory || []), {
          interviewId: newInterview.id,
          question: 'Recorded interview',
          response: recordedResponse,
          timestamp: newInterview.interviewDate
        }]
      }),
      timeline: [...c.timeline, {
        id: `tl-${newInterview.id}`,
        time: newInterview.interviewDate,
        date: newInterview.interviewDate,
        title: `Witness interview recorded: ${newInterview.witnessName}`,
        description: newInterview.notes || newInterview.keyFindings.join('; ') || 'Interview record added.',
        source: 'WITNESS',
        type: 'INTERVIEW',
        verified: false
      }]
    }));
    addActivity('CASE_UPDATED', `Formal witness deposition logged with ${interview.witnessName}`, interview.caseId);
    showToast(`Interview record saved for ${interview.witnessName}`, 'success');
    return newInterview;
  }, [addActivity, showToast]);

  const updateInterview = useCallback((interview: WitnessInterviewRecord) => {
    setInterviews(prev => prev.map(i => i.id === interview.id ? interview : i));
    const recordedResponse = interview.audioTranscript || interview.notes || interview.keyFindings.join('; ') || 'Interview record created; transcript not provided.';
    setCases(prev => prev.map(c => c.id !== interview.caseId ? c : {
      ...c,
      witnesses: c.witnesses.map(w => w.id !== interview.witnessId ? w : {
        ...w,
        interviewStatus: 'COMPLETED',
        nextInterviewDate: undefined,
        interviewHistory: (w.interviewHistory || []).map(entry => entry.interviewId === interview.id ? {
          ...entry,
          response: recordedResponse,
          timestamp: interview.interviewDate
        } : entry)
      }),
      timeline: c.timeline.map(event => event.id === `tl-${interview.id}` ? {
        ...event,
        time: interview.interviewDate,
        date: interview.interviewDate,
        description: interview.notes || interview.keyFindings.join('; ') || 'Interview record updated.'
      } : event)
    }));
    addActivity('CASE_UPDATED', `Witness interview updated: ${interview.witnessName}`, interview.caseId, interview.id);
    showToast('Interview transcript updated', 'info');
  }, [addActivity, showToast]);

  const deleteInterview = useCallback((interviewId: string) => {
    const target = interviews.find(interview => interview.id === interviewId);
    setInterviews(prev => prev.filter(i => i.id !== interviewId));
    if (target) setCases(prev => prev.map(c => c.id !== target.caseId ? c : {
      ...c,
      witnesses: c.witnesses.map(w => w.id !== target.witnessId ? w : {
        ...w,
        interviewStatus: 'NOT_SCHEDULED',
        interviewHistory: (w.interviewHistory || []).filter(entry => entry.interviewId !== interviewId)
      }),
      timeline: c.timeline.filter(event => event.id !== `tl-${interviewId}`)
    }));
    if (target) addActivity('CASE_UPDATED', `Witness interview removed: ${target.witnessName}`, target.caseId, interviewId);
    showToast('Interview record removed', 'warning');
  }, [interviews, addActivity, showToast]);

  const getCaseInterviews = useCallback((caseId?: string): WitnessInterviewRecord[] => {
    const targetCaseId = caseId || selectedCaseId;
    return targetCaseId ? interviews.filter(i => i.caseId === targetCaseId) : interviews;
  }, [selectedCaseId, interviews]);

  // ===================== NOTES CRUD =====================
  const addNote = useCallback((noteData: Omit<InvestigationNote, 'id' | 'createdAt' | 'updatedAt'>): InvestigationNote => {
    const nowIso = new Date().toISOString();
    const newNote: InvestigationNote = {
      ...noteData,
      id: `note-${Date.now().toString(36)}`,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    setNotes(prev => [newNote, ...prev]);
    addActivity('NOTE_ADDED', `Field Note documented: "${newNote.title}"`, newNote.caseId, newNote.id);
    showToast(`Note "${newNote.title}" saved`, 'success');
    return newNote;
  }, [addActivity, showToast]);

  const updateNote = useCallback((note: InvestigationNote) => {
    const updated = { ...note, updatedAt: new Date().toISOString() };
    setNotes(prev => prev.map(n => (n.id === note.id ? updated : n)));
    addActivity('NOTE_UPDATED', `Field Note updated: "${note.title}"`, note.caseId, note.id);
    showToast('Investigation note saved', 'info');
  }, [addActivity, showToast]);

  const deleteNote = useCallback((noteId: string) => {
    const noteToDelete = notes.find(n => n.id === noteId);
    if (noteToDelete) {
      setUndoAction({
        id: `undo-note-${Date.now()}`,
        description: `Delete note "${noteToDelete.title}"`,
        undo: () => {
          setNotes(prev => [noteToDelete, ...prev]);
        }
      });
    }
    setNotes(prev => prev.filter(n => n.id !== noteId));
    showToast('Note deleted. Click Undo to restore.', 'warning');
  }, [notes, setUndoAction, showToast]);

  const getCaseNotes = useCallback((caseId?: string): InvestigationNote[] => {
    const targetCaseId = caseId || selectedCaseId;
    return targetCaseId ? notes.filter(n => n.caseId === targetCaseId) : notes;
  }, [selectedCaseId, notes]);

  // ===================== TASKS CRUD =====================
  const addTask = useCallback((taskData: Omit<InvestigationTask, 'id' | 'createdDate'>): InvestigationTask => {
    const newTask: InvestigationTask = {
      ...taskData,
      id: `task-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      createdDate: new Date().toISOString().split('T')[0]
    };
    setTasks(prev => [newTask, ...prev]);
    addActivity('CASE_UPDATED', `New investigation task assigned: "${newTask.title}"`, newTask.caseId);
    addNotification({
      title: 'New Task Assigned',
      message: `Task "${newTask.title}" assigned to ${newTask.assignedTo || 'Investigator'}.`,
      type: 'TASK',
      link: '/tasks'
    });
    showToast(`Task "${newTask.title}" added to board`, 'success');
    return newTask;
  }, [addActivity, addNotification, showToast]);

  const updateTask = useCallback((task: InvestigationTask) => {
    setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    addActivity('CASE_UPDATED', `Investigation task updated: ${task.title}`, task.caseId, task.id);
    showToast(`Task "${task.title}" updated`, 'info');
  }, [addActivity, showToast]);

  const deleteTask = useCallback((taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (taskToDelete) {
      setUndoAction({
        id: `undo-task-${Date.now()}`,
        description: `Delete task "${taskToDelete.title}"`,
        undo: () => setTasks(prev => [taskToDelete, ...prev])
      });
    }
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (taskToDelete) addActivity('CASE_UPDATED', `Investigation task removed: ${taskToDelete.title}`, taskToDelete.caseId, taskToDelete.id);
    showToast('Task removed from board. Click Undo to restore.', 'warning');
  }, [tasks, setUndoAction, addActivity, showToast]);

  const updateTaskStatus = useCallback((taskId: string, status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED') => {
    const target = tasks.find(t => t.id === taskId);
    if (target) {
      const prevStatus = target.status;
      setUndoAction({
        id: `undo-status-${Date.now()}`,
        description: `Change task status back to ${prevStatus}`,
        undo: () => setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: prevStatus } : t))
      });
    }
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
    if (target) addActivity('CASE_UPDATED', `Task status updated: ${target.title} → ${status}`, target.caseId, target.id);
    if (status === 'COMPLETED') {
      showToast('Task marked as COMPLETED!', 'success');
    }
  }, [tasks, setUndoAction, addActivity, showToast]);

  const getCaseTasks = useCallback((caseId?: string): InvestigationTask[] => {
    const targetCaseId = caseId || selectedCaseId;
    return targetCaseId ? tasks.filter(t => t.caseId === targetCaseId) : tasks;
  }, [selectedCaseId, tasks]);

  // ===================== CHECKLIST =====================
  const toggleChecklistItem = useCallback((caseId: string, itemId: string) => {
    setCases(prev =>
      prev.map(c => {
        if (c.id === caseId) {
          const currentList = c.checklist || [];
          const updatedChecklist = currentList.map(item =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
          );
          const updated = { ...c, checklist: updatedChecklist };
          updated.progress = calculateCaseProgress(updated);
          return updated;
        }
        return c;
      })
    );
    addActivity('CASE_UPDATED', `Case checklist milestone updated: ${itemId}`, caseId, itemId);
    showToast('Checklist item updated', 'info');
  }, [calculateCaseProgress, addActivity, showToast]);

  const addChecklistItem = useCallback((caseId: string, label: string, category: string = 'PROCEDURAL', required: boolean = false) => {
    setCases(prev =>
      prev.map(c => {
        if (c.id === caseId) {
          const currentList = c.checklist || [];
          const newItem: ChecklistItem = {
            id: `chk-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
            label,
            completed: false,
            category,
            required
          };
          const updatedChecklist = [...currentList, newItem];
          const updated = { ...c, checklist: updatedChecklist };
          updated.progress = calculateCaseProgress(updated);
          return updated;
        }
        return c;
      })
    );
    addActivity('CASE_UPDATED', `Case checklist milestone added: ${label}`, caseId);
    showToast(`Checklist item added to case`, 'success');
  }, [calculateCaseProgress, addActivity, showToast]);

  const getCaseChecklist = useCallback((caseId?: string): ChecklistItem[] => {
    const targetCase = cases.find(c => c.id === (caseId || selectedCaseId));
    return targetCase?.checklist || [];
  }, [cases, selectedCaseId]);

  // ===================== ACTIVITIES =====================
  const getCaseActivities = useCallback((caseId?: string): ActivityRecord[] => {
    const targetCaseId = caseId || selectedCaseId;
    return targetCaseId ? activities.filter(a => a.caseId === targetCaseId) : activities;
  }, [selectedCaseId, activities]);

  // ===================== BOARD & CCTV =====================
  const addBoardNode = useCallback((node: Omit<BoardNode, 'id'>) => {
    const newId = `node-${Date.now().toString(36)}`;
    updateSelectedCase(prev => ({
      ...prev,
      boardNodes: [...prev.boardNodes, { ...node, id: newId }]
    }));
    addActivity('NOTE_ADDED', `Detective blackboard item added: ${node.title}`, selectedCaseId || undefined, newId);
  }, [updateSelectedCase, addActivity, selectedCaseId]);

  const updateBoardNode = useCallback((id: string, changes: Partial<Pick<BoardNode, 'title' | 'type' | 'summary'>>) => {
    updateSelectedCase(prev => ({
      ...prev,
      boardNodes: prev.boardNodes.map(node => node.id === id ? { ...node, ...changes } : node)
    }));
    addActivity('NOTE_UPDATED', `Detective blackboard item updated: ${changes.title || id}`, selectedCaseId || undefined, id);
  }, [updateSelectedCase, addActivity, selectedCaseId]);

  const updateBoardNodePos = useCallback((id: string, x: number, y: number) => {
    updateSelectedCase(prev => ({
      ...prev,
      boardNodes: prev.boardNodes.map(n => (n.id === id ? { ...n, x, y } : n))
    }));
  }, [updateSelectedCase]);

  const deleteBoardNode = useCallback((id: string) => {
    updateSelectedCase(prev => ({
      ...prev,
      boardNodes: prev.boardNodes.filter(n => n.id !== id),
      boardConnections: prev.boardConnections.filter(c => c.fromId !== id && c.toId !== id)
    }));
  }, [updateSelectedCase]);

  const addBoardConnection = useCallback((connection: Omit<BoardConnection, 'id'>) => {
    const newId = `conn-${Date.now().toString(36)}`;
    updateSelectedCase(prev => ({
      ...prev,
      boardConnections: [...prev.boardConnections, { ...connection, id: newId }]
    }));
  }, [updateSelectedCase]);

  const deleteBoardConnection = useCallback((id: string) => {
    updateSelectedCase(prev => ({
      ...prev,
      boardConnections: prev.boardConnections.filter(c => c.id !== id)
    }));
  }, [updateSelectedCase]);

  const addCCTVFeed = useCallback((caseId: string, feed: Omit<CCTVFeed, 'id'>) => {
    const id = `cam-${Date.now().toString(36)}`;
    setCases(prev => prev.map(item => item.id === caseId ? { ...item, cctvFeeds: [...item.cctvFeeds, { ...feed, id }] } : item));
    addActivity('NOTE_ADDED', `CCTV camera configured: ${feed.cameraName || feed.camCode || id}`, caseId, id);
    return id;
  }, [addActivity]);

  const updateCCTVFeed = useCallback((caseId: string, feedId: string, changes: Partial<CCTVFeed>) => {
    setCases(prev => prev.map(item => item.id !== caseId ? item : { ...item, cctvFeeds: item.cctvFeeds.map(feed => feed.id === feedId ? { ...feed, ...changes } : feed) }));
    addActivity('NOTE_UPDATED', `CCTV camera updated: ${feedId}`, caseId, feedId);
  }, [addActivity]);

  const deleteCCTVFeed = useCallback((caseId: string, feedId: string) => {
    setCases(prev => prev.map(item => item.id !== caseId ? item : { ...item, cctvFeeds: item.cctvFeeds.filter(feed => feed.id !== feedId) }));
    addActivity('NOTE_UPDATED', `CCTV camera removed: ${feedId}`, caseId, feedId);
  }, [addActivity]);

  const captureCCTVClue = useCallback((camId: string) => {
    updateSelectedCase(prev => ({
      ...prev,
      cctvFeeds: prev.cctvFeeds.map(f => (f.id === camId ? { ...f, clueCaptured: true } : f))
    }));
    addActivity('EVIDENCE_COLLECTED', `Flagged critical CCTV forensic anomaly from feed ${camId}.`, selectedCaseId || undefined);
    showToast(`Forensic snapshot captured from camera ${camId}`, 'success');
  }, [updateSelectedCase, addActivity, selectedCaseId, showToast]);

  // ===================== WARRANT =====================
  const issueArrestWarrant = useCallback((suspectId: string, probableCauseSummary?: string): { success: boolean; message: string } => {
    if (!selectedCase) {
      return { success: false, message: 'No active case selected.' };
    }

    const suspect = selectedCase.suspects.find(s => s.id === suspectId);
    if (!suspect) {
      return { success: false, message: 'Selected suspect dossier not found.' };
    }

    const warrantNum = `WAR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowIso = new Date().toISOString();

    updateSelectedCase(prev => ({
      ...prev,
      status: 'SOLVED',
      warrantData: {
        ...prev.warrantData,
        eligibleSuspectId: suspectId,
        primeSuspectId: suspectId,
        warrantIssued: true,
        warrantNumber: warrantNum,
        issuedDate: nowIso,
        warrantDate: nowIso.split('T')[0],
        judgeName: 'Hon. Margaret Vance, District Magistrate',
        probableCauseSummary: probableCauseSummary || prev.warrantData.probableCauseSummary || 'Affidavit confirms biometric and timeline correlation.'
      }
    }));

    addActivity('WARRANT_ISSUED', `Judicial Arrest Warrant ${warrantNum} issued for ${suspect.name}.`, selectedCase.id);
    addNotification({
      title: 'Judicial Warrant Executed',
      message: `Arrest warrant ${warrantNum} issued for ${suspect.name}. Case marked SOLVED.`,
      type: 'WARRANT',
      link: `/cases/${selectedCase.id}/warrant`
    });
    showToast(`Arrest Warrant ${warrantNum} signed & sealed by District Magistrate!`, 'success');
    return { success: true, message: `Arrest Warrant ${warrantNum} successfully issued.` };
  }, [selectedCase, updateSelectedCase, addActivity, addNotification, showToast]);

  // ===================== FAVORITES & RECENTLY VIEWED =====================
  const toggleFavoriteCase = useCallback((caseId: string) => {
    setFavoriteCaseIds(prev => {
      const exists = prev.includes(caseId);
      const next = exists ? prev.filter(id => id !== caseId) : [...prev, caseId];
      showToast(exists ? `Removed case ${caseId} from favorites` : `Added case ${caseId} to favorites`, 'info');
      return next;
    });
  }, [showToast]);

  const toggleFavoriteEvidence = useCallback((evidenceId: string) => {
    setFavoriteEvidenceIds(prev => {
      const exists = prev.includes(evidenceId);
      const next = exists ? prev.filter(id => id !== evidenceId) : [...prev, evidenceId];
      showToast(exists ? `Removed exhibit from favorites` : `Saved exhibit to favorites`, 'info');
      return next;
    });
  }, [showToast]);

  const isCaseFavorite = useCallback((caseId: string) => favoriteCaseIds.includes(caseId), [favoriteCaseIds]);
  const isEvidenceFavorite = useCallback((evidenceId: string) => favoriteEvidenceIds.includes(evidenceId), [favoriteEvidenceIds]);

  const trackRecentlyViewed = useCallback((record: Omit<RecentlyViewedRecord, 'viewedAt'>) => {
    const fullRecord: RecentlyViewedRecord = {
      ...record,
      viewedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setRecentlyViewed(prev => {
      const filtered = prev.filter(r => !(r.id === record.id && r.type === record.type));
      return [fullRecord, ...filtered].slice(0, 20);
    });
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([]);
    showToast('Recently viewed history cleared', 'info');
  }, [showToast]);

  // ===================== TAGS =====================
  const addCaseTag = useCallback((caseId: string, tag: string) => {
    const cleanTag = tag.trim().toUpperCase();
    if (!cleanTag) return;
    setCases(prev =>
      prev.map(c => {
        if (c.id === caseId) {
          const currentTags = c.tags || [];
          if (!currentTags.includes(cleanTag)) {
            return { ...c, tags: [...currentTags, cleanTag] };
          }
        }
        return c;
      })
    );
    showToast(`Tag #${cleanTag} added`, 'info');
  }, [showToast]);

  const removeCaseTag = useCallback((caseId: string, tag: string) => {
    setCases(prev =>
      prev.map(c => {
        if (c.id === caseId) {
          return { ...c, tags: (c.tags || []).filter(t => t !== tag) };
        }
        return c;
      })
    );
  }, []);

  const addEvidenceTag = useCallback((caseId: string, evidenceId: string, tag: string) => {
    const cleanTag = tag.trim().toUpperCase();
    if (!cleanTag) return;
    setCases(prev =>
      prev.map(c => {
        if (c.id === caseId) {
          return {
            ...c,
            evidenceList: c.evidenceList.map(e => {
              if (e.id === evidenceId) {
                const currentTags = e.tags || [];
                return currentTags.includes(cleanTag) ? e : { ...e, tags: [...currentTags, cleanTag] };
              }
              return e;
            })
          };
        }
        return c;
      })
    );
  }, []);

  const removeEvidenceTag = useCallback((caseId: string, evidenceId: string, tag: string) => {
    setCases(prev =>
      prev.map(c => {
        if (c.id === caseId) {
          return {
            ...c,
            evidenceList: c.evidenceList.map(e =>
              e.id === evidenceId ? { ...e, tags: (e.tags || []).filter(t => t !== tag) } : e
            )
          };
        }
        return c;
      })
    );
  }, []);

  // ===================== BULK ACTIONS =====================
  const bulkUpdateCaseStatus = useCallback((caseIds: string[], status: CaseStatus) => {
    setCases(prev =>
      prev.map(c => (caseIds.includes(c.id) ? { ...c, status } : c))
    );
    showToast(`Updated status for ${caseIds.length} cases to ${status}`, 'success');
  }, [showToast]);

  const bulkDeleteCases = useCallback((caseIds: string[]) => {
    setCases(prev => prev.filter(c => !caseIds.includes(c.id)));
    showToast(`Deleted ${caseIds.length} case dossiers`, 'warning');
  }, [showToast]);

  const bulkArchiveCases = useCallback((caseIds: string[]) => {
    setCases(prev =>
      prev.map(c => (caseIds.includes(c.id) ? { ...c, isArchived: true } : c))
    );
    showToast(`Archived ${caseIds.length} case dossiers`, 'info');
  }, [showToast]);

  // ===================== CSV IMPORT =====================
  const importCasesFromCsv = useCallback((newCases: Partial<InvestigationCase>[]): { imported: number; skipped: number; errors: string[] } => {
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];
    const validCases: InvestigationCase[] = [];

    newCases.forEach((raw, idx) => {
      const rowNum = idx + 2;
      if (!raw.title || !raw.id) {
        errors.push(`Row ${rowNum}: Missing mandatory Case ID or Title.`);
        skipped++;
        return;
      }

      // Check duplicates
      const isDuplicate = cases.some(c => c.id.toLowerCase() === raw.id?.toLowerCase() || c.title.toLowerCase() === raw.title?.toLowerCase());
      if (isDuplicate) {
        errors.push(`Row ${rowNum}: Case ID ${raw.id} or Title already exists.`);
        skipped++;
        return;
      }

      const fullCase: InvestigationCase = ensureCaseDemoRecords({
        id: raw.id,
        title: raw.title,
        type: raw.type || 'SPECIAL INVESTIGATION',
        location: raw.location || 'Metropolitan Area',
        incidentDate: raw.incidentDate || new Date().toISOString().split('T')[0],
        status: (raw.status as CaseStatus) || 'ACTIVE',
        priority: (raw.priority as Priority) || 'MEDIUM',
        shortDescription: raw.shortDescription || 'Imported case dossier.',
        fullBriefing: raw.fullBriefing || 'Detailed briefing pending intake review.',
        leadInvestigator: raw.leadInvestigator || 'Unassigned',
        progress: 0,
        evidenceCount: 0,
        suspectCount: 0,
        witnessCount: 0,
        themeColor: 'cyan',
        tags: ['CSV-IMPORTED'],
        isArchived: false,
        crimeScene: {
          name: 'Primary Incident Location',
          environmentDescription: 'Secure forensic perimeter established.',
          dimensions: '10m x 10m',
          hotspots: []
        },
        evidenceList: [],
        suspects: [],
        witnesses: [],
        timeline: [],
        cctvFeeds: [],
        forensics: [],
        boardNodes: [],
        boardConnections: [],
        deductionMetrics: {
          evidenceSynthesisScore: 20,
          timelineCoherence: 25,
          suspectCorrelation: 15,
          solvabilityRating: 30,
          primaryHypothesis: 'Intake pending',
          contradictionsCount: 0,
          keyFindings: []
        },
        warrantData: {
          warrantIssued: false
        },
        checklist: [],
        tasks: []
      });

      validCases.push(fullCase);
      imported++;
    });

    if (validCases.length > 0) {
      setCases(prev => [...validCases, ...prev]);
      addActivity('CASE_CREATED', `Imported ${imported} case dossiers via CSV batch upload.`);
      showToast(`Successfully imported ${imported} cases from CSV!`, 'success');
    }

    return { imported, skipped, errors };
  }, [cases, addActivity, showToast]);

  // ===================== PREFERENCES =====================
  const updatePreferences = useCallback((newPrefs: Partial<UserPreferences>) => {
    setPreferences(prev => ({
      ...prev,
      ...newPrefs,
      showWidgets: {
        ...prev.showWidgets,
        ...(newPrefs.showWidgets || {})
      },
      notificationCategories: {
        ...prev.notificationCategories,
        ...(newPrefs.notificationCategories || {})
      }
    }));
    showToast('Display preferences updated', 'info');
  }, [showToast]);

  // ===================== SYSTEM & RESET =====================
  const resetCase = useCallback((caseId?: string) => {
    const targetCaseId = caseId || selectedCaseId;
    if (!targetCaseId) return;

    const initialCase = INITIAL_CASES.find(c => c.id === targetCaseId);
    if (!initialCase) {
      showToast(`Default template for ${targetCaseId} not found in archive`, 'error');
      return;
    }

    const normalizedDefault = normalizeCases([initialCase])[0];
    setCases(prev => prev.map(c => (c.id === targetCaseId ? normalizedDefault : c)));
    setNotes(prev => prev.filter(n => n.caseId !== targetCaseId).concat(INITIAL_NOTES.filter(n => n.caseId === targetCaseId), SAMPLE_CASE_NOTES.filter(n => n.caseId === targetCaseId)));
    setTasks(prev => prev.filter(t => t.caseId !== targetCaseId).concat(INITIAL_TASKS.filter(t => t.caseId === targetCaseId)));

    addActivity('CASE_UPDATED', `Case ${targetCaseId} reset to initial factory state.`, targetCaseId);
    showToast(`Case ${targetCaseId} has been reset to initial state.`, 'info');
  }, [selectedCaseId, addActivity, showToast]);

  const resetAllCasesToDefault = useCallback(() => {
    const seedCaseIds = new Set(INITIAL_CASES.map(c => c.id));
    const userCases = cases.filter(c => !seedCaseIds.has(c.id));
    const userCaseIds = new Set(userCases.map(c => c.id));
    const userEvidenceIds = new Set(userCases.flatMap(c => c.evidenceList.map(e => e.id)));
    const isUserRelatedPath = (link?: string) => !!link && [...userCaseIds].some(id => link.startsWith(`/cases/${id}`));

    setCases([...normalizeCases(INITIAL_CASES), ...userCases]);
    setNotes([...INITIAL_NOTES, ...SAMPLE_CASE_NOTES, ...notes.filter(note => userCaseIds.has(note.caseId))]);
    setTasks([...INITIAL_TASKS, ...tasks.filter(task => userCaseIds.has(task.caseId))]);
    setActivities([...INITIAL_ACTIVITIES, ...activities.filter(activity => userCaseIds.has(activity.caseId) || activity.caseId === 'GENERAL')]);
    setCustodyTransfers([...INITIAL_TRANSFERS, ...custodyTransfers.filter(transfer => userEvidenceIds.has(transfer.evidenceId))]);
    setInterviews([...INITIAL_INTERVIEWS, ...interviews.filter(interview => userCaseIds.has(interview.caseId))]);
    setNotifications([...INITIAL_NOTIFICATIONS, ...notifications.filter(notification => !notification.link || isUserRelatedPath(notification.link))]);
    setFavoriteCaseIds(['NY-2026-0884', ...favoriteCaseIds.filter(id => userCaseIds.has(id))]);
    setFavoriteEvidenceIds(['ev-ny-01', ...favoriteEvidenceIds.filter(id => userEvidenceIds.has(id))]);
    setRecentlyViewed(prev => prev.filter(record => userCaseIds.has(record.id) || userEvidenceIds.has(record.id)));
    setRecentCaseIds(prev => [...prev.filter(id => userCaseIds.has(id)), ...INITIAL_CASES.slice(0, 2).map(c => c.id)]);
    if (!userCaseIds.has(selectedCaseId || '')) setSelectedCaseId('NY-2026-0884');

    showToast(`Fictional demo cases reset. ${userCases.length} user-created case(s) were preserved.`, 'success');
  }, [cases, notes, tasks, activities, custodyTransfers, interviews, notifications, favoriteCaseIds, favoriteEvidenceIds, selectedCaseId, showToast]);

  return (
    <CaseContext.Provider
      value={{
        cases,
        selectedCaseId,
        selectedCase,
        recentCases,
        notes,
        activities,
        tasks,
        custodyTransfers,
        interviews,
        notifications,
        unreadNotificationCount,
        favoriteCaseIds,
        favoriteEvidenceIds,
        recentlyViewed,
        currentUndo,
        preferences,

        selectCase,
        switchCase,

        addCase,
        updateCase,
        deleteCase,
        archiveCase,
        restoreCase,
        resolveCase,

        addEvidence,
        updateEvidence,
        deleteEvidence,
        collectEvidence,
        verifyEvidence,
        inspectHotspot,
        collectHotspot,
        updateEvidenceNote,
        markEvidenceExamined,
        toggleEvidenceReviewStatus,
        addCustodyTransfer,
        getEvidenceCustody,

        reorderTimeline,
        addTimelineEvent,
        updateTimelineEvent,
        toggleTimelineFlag,
        deleteTimelineEvent,

        addSuspect,
        updateSuspect,
        deleteSuspect,
        updateSuspectAlibiStatus,
        updateSuspectNotes,
        updateSuspectStatus,
        setPrimeSuspect,

        addWitness,
        updateWitness,
        deleteWitness,
        interviewWitness,
        updateWitnessVerification,
        verifyWitness,
        flagWitness,
        addWitnessNote,
        addInterview,
        updateInterview,
        deleteInterview,
        getCaseInterviews,

        addNote,
        updateNote,
        deleteNote,
        getCaseNotes,

        addTask,
        updateTask,
        deleteTask,
        updateTaskStatus,
        getCaseTasks,

        toggleChecklistItem,
        addChecklistItem,
        getCaseChecklist,

        addActivity,
        getCaseActivities,

        addBoardNode,
        updateBoardNode,
        updateBoardNodePos,
        deleteBoardNode,
        addBoardConnection,
        deleteBoardConnection,
        addCCTVFeed,
        updateCCTVFeed,
        deleteCCTVFeed,
        captureCCTVClue,

        issueArrestWarrant,

        toggleFavoriteCase,
        toggleFavoriteEvidence,
        isCaseFavorite,
        isEvidenceFavorite,

        trackRecentlyViewed,
        clearRecentlyViewed,

        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,

        setUndoAction,
        triggerUndo,
        dismissUndo,

        addCaseTag,
        removeCaseTag,
        addEvidenceTag,
        removeEvidenceTag,

        bulkUpdateCaseStatus,
        bulkDeleteCases,
        bulkArchiveCases,

        importCasesFromCsv,
        updatePreferences,

        resetCase,
        resetAllCasesToDefault,
        toastMessage,
        toastType,
        showToast,
        hideToast
      }}
    >
      {children}
    </CaseContext.Provider>
  );
};

export const useCase = () => {
  const context = useContext(CaseContext);
  if (!context) {
    throw new Error('useCase must be used within a CaseProvider');
  }
  return context;
};
