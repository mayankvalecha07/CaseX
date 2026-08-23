export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type CaseStatus = 'ACTIVE' | 'UNDER INVESTIGATION' | 'COLD CASE' | 'SOLVED' | 'RESTRICTED';
export type EvidenceType = 'PHYSICAL' | 'BIOLOGICAL' | 'DIGITAL' | 'TRACE' | 'BALLISTICS' | 'DOCUMENT';
export type EvidenceStatus = 'UNINSPECTED' | 'INSPECTED' | 'COLLECTED';
export type Importance = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  badgeNumber: string; // e.g. DET-7091
  rank: string;
  department: string;
  clearanceLevel: string;
  joinedDate: string;
  stats: {
    casesInvestigated: number;
    casesSolved: number;
    activeCases: number;
    evidenceCollected: number;
  };
}

export interface CrimeSceneHotspot {
  id: string;
  name: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  type: EvidenceType;
  importance: Importance;
  description: string;
  details: string;
  uvOnly?: boolean;
  irOnly?: boolean;
  discoveredAt: string;
  collected: boolean;
  inspected: boolean;
  iconName?: string;
}

export interface EvidenceItem {
  id: string;
  code: string;
  title: string;
  category: EvidenceType;
  importance: Importance;
  locationFound: string;
  timestamp: string;
  description: string;
  forensicNotes: string;
  status: EvidenceStatus;
  userNotes?: string;
  collectedAt?: string;
  tags: string[];
  imageUrl?: string;
  analysisResults?: {
    matchRate?: number;
    technician: string;
    details: string;
    verified: boolean;
  };
}

export interface Suspect {
  id: string;
  name: string;
  alias?: string;
  age: number;
  occupation: string;
  avatar: string;
  motive: string;
  alibi: string;
  alibiStatus: 'VERIFIED' | 'QUESTIONABLE' | 'DISPROVEN';
  riskScore?: number; // 0-100
  threatScore?: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  fingerprintMatch?: number; // 0-100
  fingerprintMatchRate?: number;
  dnaMatch?: number; // 0-100
  dnaMatchRate?: number;
  cyberFootprint: string;
  evidenceLinks?: string[]; // evidence IDs
  linkedEvidence?: string[];
  status: 'SUSPECT' | 'PERSON OF INTEREST' | 'CLEAR' | 'PRIME SUSPECT';
  notes?: string;
  interrogationNotes?: string;
}

export interface Witness {
  id: string;
  name: string;
  occupation: string;
  avatar?: string;
  credibility?: number; // 0-100
  credibilityScore?: number;
  relationship: string;
  statement: string;
  verificationStatus: 'VERIFIED' | 'UNVERIFIED' | 'FLAGGED';
  interviewHistory?: {
    question: string;
    response: string;
    timestamp: string;
  }[];
  keyClues?: string[];
  notes?: string;
}

export interface CCTVFeed {
  id: string;
  camCode?: string; // e.g. CAM-01
  cameraName?: string;
  location?: string;
  locationName?: string;
  timestamp?: string;
  recordedTime?: string;
  resolution?: string;
  details?: string;
  status?: 'ONLINE' | 'INTERFERENCE' | 'ARCHIVED' | 'CORRUPTED';
  anomalyDetected?: boolean;
  anomalyDescription?: string;
  snapshotUrl?: string;
  playbackDuration?: number; // seconds
  anomaliesAtTime?: number[]; // seconds e.g. [12, 45]
  clueCaptured?: boolean;
}

export interface TimelineEvent {
  id: string;
  time: string;
  date?: string;
  title: string;
  description: string;
  source: string; // 'CCTV' | 'WITNESS' | 'DISPATCH' | 'CELL TOWER' | 'BIO-LOG'
  type: string;
  verified?: boolean;
  flagged?: boolean;
  flaggedInconsistency?: boolean;
}

export interface ForensicReport {
  id: string;
  category?: 'FINGERPRINT' | 'DNA' | 'TOXICOLOGY' | 'BALLISTICS' | 'CYBER' | 'SPECTRAL' | string;
  type?: string;
  title: string;
  status: 'COMPLETED' | 'IN_ANALYSIS' | 'PENDING' | string;
  matchConfidence?: number; // 0-100
  confidenceScore?: number;
  sampleId?: string;
  findings: string;
  conclusion?: string;
  keyConclusions?: string;
  examiner: string;
  dateCompleted?: string;
  completedDate?: string;
  dataPoints?: { label: string; value: string | number }[];
}

export interface BoardNode {
  id: string;
  type: 'EVIDENCE' | 'SUSPECT' | 'WITNESS' | 'TIMELINE' | 'NOTE' | 'MOTIVE' | string;
  title: string;
  subtitle?: string;
  summary?: string;
  color?: string;
  x: number;
  y: number;
  refId?: string;
}

export interface BoardConnection {
  id: string;
  fromId?: string;
  fromNodeId?: string;
  toId?: string;
  toNodeId?: string;
  label?: string;
  color?: string;
}

export interface InvestigationCase {
  id: string; // e.g. NY-2026-0884
  title: string;
  type: string;
  location: string;
  incidentDate: string;
  status: CaseStatus;
  priority: Priority;
  shortDescription: string;
  fullBriefing: string;
  leadInvestigator: string;
  progress: number; // 0-100
  evidenceCount: number;
  suspectCount: number;
  witnessCount: number;
  lastAccessed?: string;
  coverImage?: string;
  themeColor: string; // accent color like cyan, red, amber
  
  // Detailed modules data
  crimeScene: {
    name: string;
    environmentDescription: string;
    dimensions: string;
    hotspots: CrimeSceneHotspot[];
  };
  evidenceList: EvidenceItem[];
  suspects: Suspect[];
  witnesses: Witness[];
  timeline: TimelineEvent[];
  cctvFeeds: CCTVFeed[];
  forensics: ForensicReport[];
  boardNodes: BoardNode[];
  boardConnections: BoardConnection[];
  deductionMetrics: {
    evidenceSynthesisScore: number;
    timelineCoherence: number;
    suspectCorrelation: number;
    solvabilityRating: number;
    primaryHypothesis: string;
    contradictionsCount: number;
    keyFindings: string[];
  };
  warrantData: {
    eligibleSuspectId?: string;
    primeSuspectId?: string;
    minimumEvidenceRequired?: number;
    legalCriteria?: string[];
    warrantIssued?: boolean;
    warrantNumber?: string;
    issuedDate?: string;
    warrantDate?: string;
    judgeName?: string;
    probableCauseSummary?: string;
  };
}
