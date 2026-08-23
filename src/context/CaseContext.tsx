import React, { createContext, useContext, useState, useEffect } from 'react';
import { InvestigationCase, EvidenceItem, TimelineEvent, BoardNode, BoardConnection } from '../types';
import { INITIAL_CASES } from '../data/cases';

interface CaseContextType {
  cases: InvestigationCase[];
  selectedCaseId: string | null;
  selectedCase: InvestigationCase | null;
  recentCases: InvestigationCase[];
  selectCase: (id: string) => void;
  switchCase: (id: string) => void;
  collectEvidence: (evidenceIdOrCode: string) => void;
  inspectHotspot: (hotspotId: string) => void;
  collectHotspot: (hotspotId: string) => void;
  updateEvidenceNote: (evidenceId: string, note: string) => void;
  markEvidenceExamined: (evidenceId: string) => void;
  reorderTimeline: (fromIndex: number, toIndex: number) => void;
  addTimelineEvent: (event: Omit<TimelineEvent, 'id'>) => void;
  toggleTimelineFlag: (eventId: string) => void;
  deleteTimelineEvent: (eventId: string) => void;
  interviewWitness: (witnessId: string, question: string) => string;
  updateWitnessVerification: (witnessId: string, status: 'VERIFIED' | 'UNVERIFIED' | 'FLAGGED') => void;
  updateSuspectAlibiStatus: (suspectId: string, status: 'VERIFIED' | 'QUESTIONABLE' | 'DISPROVEN') => void;
  updateSuspectNotes: (suspectId: string, notes: string) => void;
  updateSuspectStatus: (suspectId: string, status: 'SUSPECT' | 'PERSON OF INTEREST' | 'CLEAR' | 'PRIME SUSPECT') => void;
  setPrimeSuspect: (suspectId: string) => void;
  addBoardNode: (node: Omit<BoardNode, 'id'>) => void;
  updateBoardNodePos: (id: string, x: number, y: number) => void;
  deleteBoardNode: (id: string) => void;
  addBoardConnection: (connection: Omit<BoardConnection, 'id'>) => void;
  deleteBoardConnection: (id: string) => void;
  captureCCTVClue: (camId: string) => void;
  issueArrestWarrant: (suspectId: string, probableCauseSummary?: string) => { success: boolean; message: string };
  toastMessage: string | null;
  showToast: (msg: string) => void;
  hideToast: () => void;
}

const CaseContext = createContext<CaseContextType | undefined>(undefined);

const normalizeCases = (rawCases: InvestigationCase[]): InvestigationCase[] => {
  return rawCases.map((c) => ({
    ...c,
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

export const CaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cases, setCases] = useState<InvestigationCase[]>(() => {
    try {
      const saved = localStorage.getItem('casex_cases_v2');
      return saved ? normalizeCases(JSON.parse(saved)) : normalizeCases(INITIAL_CASES);
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

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const hideToast = () => setToastMessage(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('casex_cases_v2', JSON.stringify(cases));
    } catch (e) {
      console.error('Error saving cases', e);
    }
  }, [cases]);

  useEffect(() => {
    if (selectedCaseId) {
      localStorage.setItem('casex_selected_case_id', selectedCaseId);
      // update recent cases
      setRecentCaseIds(prev => {
        const next = [selectedCaseId, ...prev.filter(id => id !== selectedCaseId)].slice(0, 5);
        try {
          localStorage.setItem('casex_recent_case_ids', JSON.stringify(next));
        } catch { /* no-op */ }
        return next;
      });
    }
  }, [selectedCaseId]);

  const selectedCase = cases.find(c => c.id === selectedCaseId) || cases[0] || null;

  const recentCases = recentCaseIds
    .map(id => cases.find(c => c.id === id))
    .filter((c): c is InvestigationCase => !!c);

  const selectCase = (id: string) => {
    setSelectedCaseId(id);
  };

  const switchCase = (id: string) => {
    const target = cases.find(c => c.id === id);
    if (target) {
      setSelectedCaseId(id);
      showToast(`Switched active investigation to ${target.title} (${target.id})`);
    }
  };

  const calculateCaseProgress = (c: InvestigationCase): number => {
    const totalEvidence = c.evidenceList.length || 1;
    const collectedCount = c.evidenceList.filter(e => e.status === 'COLLECTED').length;
    const inspectedCount = c.evidenceList.filter(e => e.status === 'INSPECTED').length;
    const evidenceScore = ((collectedCount * 1.0 + inspectedCount * 0.5) / totalEvidence) * 40;

    const totalWitnesses = c.witnesses.length || 1;
    const verifiedWitnesses = c.witnesses.filter(w => w.verificationStatus === 'VERIFIED').length;
    const witnessScore = (verifiedWitnesses / totalWitnesses) * 20;

    const totalCCTV = c.cctvFeeds.length || 1;
    const capturedCCTV = c.cctvFeeds.filter(feed => feed.clueCaptured).length;
    const cctvScore = (capturedCCTV / totalCCTV) * 20;

    const warrantScore = c.warrantData.warrantIssued ? 20 : 0;

    const total = Math.min(100, Math.round(evidenceScore + witnessScore + cctvScore + warrantScore));
    return total;
  };

  const updateSelectedCase = (updater: (prevCase: InvestigationCase) => InvestigationCase) => {
    if (!selectedCaseId) return;
    setCases(prev =>
      prev.map(c => {
        if (c.id === selectedCaseId) {
          const updated = updater(c);
          updated.progress = calculateCaseProgress(updated);
          return updated;
        }
        return c;
      })
    );
  };

  const inspectHotspot = (hotspotId: string) => {
    updateSelectedCase(curr => {
      const updatedHotspots = curr.crimeScene.hotspots.map(h =>
        h.id === hotspotId ? { ...h, inspected: true } : h
      );
      return {
        ...curr,
        crimeScene: {
          ...curr.crimeScene,
          hotspots: updatedHotspots
        }
      };
    });
    showToast('Crime scene hotspot inspected and logged.');
  };

  const collectHotspot = (hotspotId: string) => {
    updateSelectedCase(curr => {
      const targetHotspot = curr.crimeScene.hotspots.find(h => h.id === hotspotId);
      const updatedHotspots = curr.crimeScene.hotspots.map(h =>
        h.id === hotspotId ? { ...h, collected: true, inspected: true } : h
      );

      // Check if matching evidence exists or add it
      let updatedEvidence = [...curr.evidenceList];
      const matchIndex = updatedEvidence.findIndex(e => e.title.toLowerCase().includes(targetHotspot?.name.toLowerCase() || ''));
      if (matchIndex >= 0) {
        updatedEvidence[matchIndex] = {
          ...updatedEvidence[matchIndex],
          status: 'COLLECTED'
        };
      }

      return {
        ...curr,
        crimeScene: {
          ...curr.crimeScene,
          hotspots: updatedHotspots
        },
        evidenceList: updatedEvidence
      };
    });
    showToast('Evidence securely packaged and sent to Evidence Locker!');
  };

  const collectEvidence = (evidenceIdOrCode: string) => {
    updateSelectedCase(curr => {
      const updatedEvidence = curr.evidenceList.map(e =>
        e.id === evidenceIdOrCode || e.code === evidenceIdOrCode
          ? { ...e, status: 'COLLECTED' as const, collectedAt: new Date().toISOString() }
          : e
      );
      return {
        ...curr,
        evidenceList: updatedEvidence
      };
    });
    showToast('Evidence cataloged into Case Evidence Locker.');
  };

  const markEvidenceExamined = (evidenceId: string) => {
    updateSelectedCase(curr => {
      const updatedEvidence = curr.evidenceList.map(e =>
        e.id === evidenceId
          ? {
              ...e,
              status: (e.status === 'UNINSPECTED' ? 'INSPECTED' : e.status) as any,
              analysisResults: e.analysisResults || {
                matchRate: 95,
                technician: 'Forensic Unit Examiner',
                details: 'Complete spectroscopic and micro-residue breakdown verified in lab.',
                verified: true
              }
            }
          : e
      );
      return {
        ...curr,
        evidenceList: updatedEvidence
      };
    });
    showToast('Evidence marked as examined with forensic report attached.');
  };

  const updateEvidenceNote = (evidenceId: string, note: string) => {
    updateSelectedCase(curr => ({
      ...curr,
      evidenceList: curr.evidenceList.map(e => (e.id === evidenceId ? { ...e, userNotes: note } : e))
    }));
    showToast('Investigator note attached to evidence file.');
  };

  const reorderTimeline = (fromIndex: number, toIndex: number) => {
    updateSelectedCase(curr => {
      const items = [...curr.timeline];
      const [removed] = items.splice(fromIndex, 1);
      items.splice(toIndex, 0, removed);
      return { ...curr, timeline: items };
    });
  };

  const addTimelineEvent = (eventData: Omit<TimelineEvent, 'id'>) => {
    const newEvent: TimelineEvent = {
      ...eventData,
      id: `tl-${Date.now()}`
    };
    updateSelectedCase(curr => ({
      ...curr,
      timeline: [...curr.timeline, newEvent]
    }));
    showToast('New sequence event recorded on Case Timeline.');
  };

  const toggleTimelineFlag = (eventId: string) => {
    updateSelectedCase(curr => ({
      ...curr,
      timeline: curr.timeline.map(t => (t.id === eventId ? { ...t, flagged: !t.flagged } : t))
    }));
  };

  const deleteTimelineEvent = (eventId: string) => {
    updateSelectedCase(curr => ({
      ...curr,
      timeline: curr.timeline.filter(t => t.id !== eventId)
    }));
    showToast('Timeline event removed.');
  };

  const interviewWitness = (witnessId: string, question: string): string => {
    let generatedResponse = 'I have stated everything I observed during the incident window.';
    const qLower = question.toLowerCase();

    if (qLower.includes('see') || qLower.includes('saw') || qLower.includes('look')) {
      generatedResponse = 'I clearly remember observing anomalous movement near the restricted corridor shortly before the alarm was suppressed.';
    } else if (qLower.includes('who') || qLower.includes('suspect') || qLower.includes('name')) {
      generatedResponse = 'The silhouette possessed specialized technical gear and appeared intimately familiar with the layout and security keypads.';
    } else if (qLower.includes('time') || qLower.includes('when') || qLower.includes('clock')) {
      generatedResponse = 'It happened precisely within the 10-minute window before the external power disruption.';
    } else if (qLower.includes('poison') || qLower.includes('drink') || qLower.includes('bottle') || qLower.includes('flute')) {
      generatedResponse = 'The beverage was offered cordially under the guise of an impromptu celebration.';
    } else {
      generatedResponse = `Regarding "${question}": I noticed distinct nervousness and an attempt to avoid the direct optical sensors on the hallway entrance.`;
    }

    updateSelectedCase(curr => ({
      ...curr,
      witnesses: curr.witnesses.map(w => {
        if (w.id === witnessId) {
          return {
            ...w,
            interviewHistory: [
              ...w.interviewHistory,
              {
                question,
                response: generatedResponse,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]
          };
        }
        return w;
      })
    }));

    return generatedResponse;
  };

  const updateWitnessVerification = (witnessId: string, status: 'VERIFIED' | 'UNVERIFIED' | 'FLAGGED') => {
    updateSelectedCase(curr => ({
      ...curr,
      witnesses: curr.witnesses.map(w => (w.id === witnessId ? { ...w, verificationStatus: status } : w))
    }));
    showToast(`Witness statement marked as ${status}.`);
  };

  const updateSuspectAlibiStatus = (suspectId: string, status: 'VERIFIED' | 'QUESTIONABLE' | 'DISPROVEN') => {
    updateSelectedCase(curr => ({
      ...curr,
      suspects: curr.suspects.map(s => (s.id === suspectId ? { ...s, alibiStatus: status } : s))
    }));
    showToast(`Suspect alibi status updated to ${status}.`);
  };

  const updateSuspectNotes = (suspectId: string, notes: string) => {
    updateSelectedCase(curr => ({
      ...curr,
      suspects: curr.suspects.map(s => (s.id === suspectId ? { ...s, notes, interrogationNotes: notes } : s))
    }));
    showToast('Suspect interrogation notes saved to dossier.');
  };

  const updateSuspectStatus = (suspectId: string, status: 'SUSPECT' | 'PERSON OF INTEREST' | 'CLEAR' | 'PRIME SUSPECT') => {
    updateSelectedCase(curr => ({
      ...curr,
      suspects: curr.suspects.map(s => (s.id === suspectId ? { ...s, status } : s))
    }));
    showToast(`Suspect classification set to ${status}.`);
  };

  const setPrimeSuspect = (suspectId: string) => {
    updateSelectedCase(curr => ({
      ...curr,
      suspects: curr.suspects.map(s => ({
        ...s,
        status: s.id === suspectId ? 'PRIME SUSPECT' : s.status === 'PRIME SUSPECT' ? 'SUSPECT' : s.status
      })),
      warrantData: {
        ...curr.warrantData,
        eligibleSuspectId: suspectId
      }
    }));
    showToast('Suspect flagged as Prime Target for judicial warrant.');
  };

  const addBoardNode = (nodeData: Omit<BoardNode, 'id'>) => {
    const newNode: BoardNode = {
      ...nodeData,
      id: `bn-${Date.now()}`
    };
    updateSelectedCase(curr => ({
      ...curr,
      boardNodes: [...curr.boardNodes, newNode]
    }));
    showToast('Investigation clue node pinned to Detective Board.');
  };

  const updateBoardNodePos = (id: string, x: number, y: number) => {
    updateSelectedCase(curr => ({
      ...curr,
      boardNodes: curr.boardNodes.map(n => (n.id === id ? { ...n, x, y } : n))
    }));
  };

  const deleteBoardNode = (id: string) => {
    updateSelectedCase(curr => ({
      ...curr,
      boardNodes: curr.boardNodes.filter(n => n.id !== id),
      boardConnections: curr.boardConnections.filter(c => c.fromId !== id && c.toId !== id)
    }));
    showToast('Board element removed.');
  };

  const addBoardConnection = (connData: Omit<BoardConnection, 'id'>) => {
    const newConn: BoardConnection = {
      ...connData,
      id: `bc-${Date.now()}`
    };
    updateSelectedCase(curr => ({
      ...curr,
      boardConnections: [...curr.boardConnections, newConn]
    }));
    showToast('Evidence link thread tied.');
  };

  const deleteBoardConnection = (id: string) => {
    updateSelectedCase(curr => ({
      ...curr,
      boardConnections: curr.boardConnections.filter(c => c.id !== id)
    }));
  };

  const captureCCTVClue = (camId: string) => {
    updateSelectedCase(curr => ({
      ...curr,
      cctvFeeds: curr.cctvFeeds.map(f => (f.id === camId ? { ...f, clueCaptured: true } : f))
    }));
    showToast('Surveillance anomaly snapshot logged to Evidence Repository.');
  };

  const issueArrestWarrant = (suspectId: string, probableCauseSummary?: string): { success: boolean; message: string } => {
    if (!selectedCase) return { success: false, message: 'No active case selected.' };

    const suspect = selectedCase.suspects.find(s => s.id === suspectId);
    if (!suspect) return { success: false, message: 'Invalid suspect ID.' };

    const isCorrectSuspect = selectedCase.warrantData.eligibleSuspectId === suspectId;
    const collectedEvCount = selectedCase.evidenceList.filter(e => e.status === 'COLLECTED').length;

    if (collectedEvCount < selectedCase.warrantData.minimumEvidenceRequired) {
      return {
        success: false,
        message: `Insufficient verified evidence! Minimum ${selectedCase.warrantData.minimumEvidenceRequired} items required to satisfy probable cause.`
      };
    }

    if (!isCorrectSuspect) {
      return {
        success: false,
        message: `Warrant Denied: Forensic data does not support probable cause for ${suspect.name}. Contradictory alibi or insufficient biometric link.`
      };
    }

    updateSelectedCase(curr => ({
      ...curr,
      status: 'SOLVED',
      progress: 100,
      warrantData: {
        ...curr.warrantData,
        warrantIssued: true,
        warrantDate: new Date().toLocaleString(),
        probableCauseSummary: probableCauseSummary || curr.warrantData.legalCriteria?.join('. ') || 'Direct forensic physical match and disproven alibi.'
      }
    }));

    showToast(`JUDICIAL ARREST WARRANT APPROVED FOR ${suspect.name.toUpperCase()}! CASE SOLVED.`);
    return {
      success: true,
      message: `Arrest warrant successfully issued for ${suspect.name}. Probable cause established with 100% forensic certitude.`
    };
  };

  return (
    <CaseContext.Provider
      value={{
        cases,
        selectedCaseId,
        selectedCase,
        recentCases,
        selectCase,
        switchCase,
        collectEvidence,
        inspectHotspot,
        collectHotspot,
        updateEvidenceNote,
        markEvidenceExamined,
        reorderTimeline,
        addTimelineEvent,
        toggleTimelineFlag,
        deleteTimelineEvent,
        interviewWitness,
        updateWitnessVerification,
        updateSuspectAlibiStatus,
        updateSuspectNotes,
        updateSuspectStatus,
        setPrimeSuspect,
        addBoardNode,
        updateBoardNodePos,
        deleteBoardNode,
        addBoardConnection,
        deleteBoardConnection,
        captureCCTVClue,
        issueArrestWarrant,
        toastMessage,
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