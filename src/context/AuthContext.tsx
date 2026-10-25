import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { UserProfile } from '../types';

export interface RegisteredAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  badgeNumber: string;
  rank: string;
  department: string;
  clearanceLevel: string;
  avatar: string;
  createdAt: string;
  stats: {
    casesInvestigated: number;
    casesSolved: number;
    activeCases: number;
    evidenceCollected: number;
  };
}

export interface PendingAuthData {
  mode: 'SIGNUP' | 'SIGNIN';
  name?: string;
  email: string;
  password?: string;
  badgeNumber?: string;
  department?: string;
}

export interface EmailDeliveryInfo {
  delivered: boolean;
  message: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  activeAuthTab: 'signin' | 'signup';
  setActiveAuthTab: (tab: 'signin' | 'signup') => void;
  openAuthModal: (targetCaseId?: string, targetRoute?: string, defaultTab?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  pendingCaseId: string | null;
  setPendingCaseId: (id: string | null) => void;
  targetRedirectRoute: string | null;
  setTargetRedirectRoute: (route: string | null) => void;
  pendingAuthData: PendingAuthData | null;
  isOtpMode: boolean;
  otpRecipientEmail: string | null;
  otpCooldownSeconds: number;
  serverEmailConfigured: boolean;
  checkEmailConfig: () => Promise<void>;
  signInWithEmailPassword: (
    email: string,
    password: string,
    requireOtp?: boolean
  ) => Promise<{ success: boolean; requiresOtp?: boolean; error?: string }>;
  initiateSignUp: (data: {
    name: string;
    email: string;
    password: string;
    badgeNumber?: string;
    department?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  initiateSignInWithOtp: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (enteredCode: string) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  resendOtp: () => Promise<{ success: boolean; error?: string }>;
  cancelOtp: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithCredentials: (name: string, email: string, badge: string) => Promise<void>;
  updateProfile: (updates: Partial<Pick<UserProfile, 'name' | 'badgeNumber' | 'department'>>) => void;
  signOut: () => void;
}

const DEFAULT_ACCOUNTS: RegisteredAccount[] = [
  {
    id: 'usr-7091',
    name: 'Pulkit Gupta',
    email: 'gpulkit1231@gmail.com',
    password: 'password123',
    badgeNumber: 'DET-7091',
    rank: 'Lead Digital Forensic Investigator',
    department: 'Cyber & Special Crimes Division',
    clearanceLevel: 'LEVEL 5 - TOP SECRET // FORENSIC',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    createdAt: '2024-10-15',
    stats: {
      casesInvestigated: 14,
      casesSolved: 9,
      activeCases: 4,
      evidenceCollected: 96
    }
  },
  {
    id: 'usr-1042',
    name: 'Sarah Chen',
    email: 'investigator.chen@casex.gov',
    password: 'password123',
    badgeNumber: 'DET-1042',
    rank: 'Senior Crime Scene Analyst',
    department: 'Forensic Ballistics & Trace Evidence Unit',
    clearanceLevel: 'LEVEL 4 - RESTRICTED',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    createdAt: '2024-11-01',
    stats: {
      casesInvestigated: 8,
      casesSolved: 6,
      activeCases: 2,
      evidenceCollected: 62
    }
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [registeredAccounts, setRegisteredAccounts] = useState<RegisteredAccount[]>(() => {
    try {
      const saved = localStorage.getItem('casex_registered_accounts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_ACCOUNTS;
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('casex_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeAuthTab, setActiveAuthTab] = useState<'signin' | 'signup'>('signin');
  const [pendingCaseId, setPendingCaseId] = useState<string | null>(null);
  const [targetRedirectRoute, setTargetRedirectRoute] = useState<string | null>(null);

  // OTP State
  const [pendingAuthData, setPendingAuthData] = useState<PendingAuthData | null>(null);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otpRecipientEmail, setOtpRecipientEmail] = useState<string | null>(null);
  const [otpCooldownSeconds, setOtpCooldownSeconds] = useState<number>(60);
  const [serverEmailConfigured, setServerEmailConfigured] = useState<boolean>(true);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check email configuration status from backend
  const checkEmailConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/email-config-status');
      if (res.ok) {
        const data = await res.json();
        setServerEmailConfigured(!!data.configured);
      }
    } catch {
      // Backend status fallback
    }
  }, []);

  useEffect(() => {
    checkEmailConfig();
  }, [checkEmailConfig]);

  // Sync registered accounts to storage
  useEffect(() => {
    localStorage.setItem('casex_registered_accounts', JSON.stringify(registeredAccounts));
  }, [registeredAccounts]);

  // Sync active user to storage
  useEffect(() => {
    if (user) {
      localStorage.setItem('casex_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('casex_auth_user');
    }
  }, [user]);

  // OTP Cooldown Timer countdown
  useEffect(() => {
    if (isOtpMode && otpCooldownSeconds > 0) {
      cooldownTimerRef.current = setTimeout(() => {
        setOtpCooldownSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    };
  }, [isOtpMode, otpCooldownSeconds]);

  // Open & Close Modal Handlers
  const openAuthModal = useCallback((targetCaseId?: string, targetRoute?: string, defaultTab?: 'signin' | 'signup') => {
    if (targetCaseId) setPendingCaseId(targetCaseId);
    if (targetRoute) setTargetRedirectRoute(targetRoute);
    if (defaultTab) setActiveAuthTab(defaultTab);
    setIsOtpMode(false);
    setPendingAuthData(null);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setIsOtpMode(false);
    setPendingAuthData(null);
  }, []);

  // 1. Sign In with Email & Password (with optional 2FA OTP)
  const signInWithEmailPassword = async (
    email: string,
    password: string,
    requireOtp = true
  ): Promise<{ success: boolean; requiresOtp?: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      return { success: false, error: 'Please provide both email address and password.' };
    }

    const existingAccount = registeredAccounts.find(
      (acc) => acc.email.toLowerCase() === cleanEmail
    );

    if (!existingAccount) {
      return {
        success: false,
        error: 'No investigator record found with this email. Please click "Create Account" below to register.'
      };
    }

    if (existingAccount.password && existingAccount.password !== cleanPass) {
      return { success: false, error: 'Invalid password. Check your credentials and retry.' };
    }

    // If OTP verification required: Call real backend API /api/auth/send-otp
    if (requireOtp) {
      try {
        const response = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            name: existingAccount.name
          })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          return {
            success: false,
            error: data.error || 'Failed to dispatch verification code to email.'
          };
        }

        setPendingAuthData({
          mode: 'SIGNIN',
          email: cleanEmail,
          name: existingAccount.name
        });
        setOtpRecipientEmail(cleanEmail);
        setOtpCooldownSeconds(data.cooldownSeconds || 60);
        setIsOtpMode(true);

        return { success: true, requiresOtp: true };
      } catch (err: any) {
        return {
          success: false,
          error: `Network / Server error: ${err.message || 'Could not connect to backend authentication server.'}`
        };
      }
    }

    // Direct Login without 2FA
    const userProfile: UserProfile = {
      id: existingAccount.id,
      name: existingAccount.name,
      email: existingAccount.email,
      avatar: existingAccount.avatar,
      badgeNumber: existingAccount.badgeNumber,
      rank: existingAccount.rank,
      department: existingAccount.department,
      clearanceLevel: existingAccount.clearanceLevel,
      joinedDate: existingAccount.createdAt,
      stats: existingAccount.stats
    };

    setUser(userProfile);
    setIsAuthModalOpen(false);
    return { success: true, requiresOtp: false };
  };

  // 2. Initiate Sign Up with Name, Email, Password, Badge & Real Server OTP
  const initiateSignUp = async (data: {
    name: string;
    email: string;
    password: string;
    badgeNumber?: string;
    department?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const cleanName = data.name.trim();
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPass = data.password.trim();

    if (!cleanName) return { success: false, error: 'Investigator Name is required.' };
    if (!cleanEmail || !cleanEmail.includes('@')) return { success: false, error: 'Valid Official Email is required.' };
    if (!cleanPass || cleanPass.length < 6) return { success: false, error: 'Password must be at least 6 characters.' };

    const badge = data.badgeNumber?.trim() || `DET-${Math.floor(1000 + Math.random() * 9000)}`;
    const dept = data.department?.trim() || 'Digital Forensics & Incident Response';

    // Call Real Backend API /api/auth/send-otp
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          name: cleanName,
          badgeNumber: badge,
          department: dept
        })
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        return {
          success: false,
          error: resData.error || 'Failed to dispatch verification code to email.'
        };
      }

      setPendingAuthData({
        mode: 'SIGNUP',
        name: cleanName,
        email: cleanEmail,
        password: cleanPass,
        badgeNumber: badge,
        department: dept
      });

      setOtpRecipientEmail(cleanEmail);
      setOtpCooldownSeconds(resData.cooldownSeconds || 60);
      setIsOtpMode(true);

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: `Network error: ${err.message || 'Could not connect to authentication server.'}`
      };
    }
  };

  // 3. Initiate Sign In via OTP only
  const initiateSignInWithOtp = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Valid official email address is required.' };
    }

    const existingAccount = registeredAccounts.find((a) => a.email.toLowerCase() === cleanEmail);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          name: existingAccount?.name
        })
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        return {
          success: false,
          error: resData.error || 'Failed to dispatch verification code.'
        };
      }

      setPendingAuthData({
        mode: 'SIGNIN',
        email: cleanEmail,
        name: existingAccount?.name || 'Investigator'
      });

      setOtpRecipientEmail(cleanEmail);
      setOtpCooldownSeconds(resData.cooldownSeconds || 60);
      setIsOtpMode(true);

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: `Server connection error: ${err.message || 'Unable to request code.'}`
      };
    }
  };

  // 4. Verify Entered OTP with Real Backend POST /api/auth/verify-otp
  const verifyOtp = async (enteredCode: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    const cleanCode = enteredCode.trim().replace(/\D/g, '');

    if (!cleanCode || cleanCode.length !== 6) {
      return { success: false, error: 'Please enter the complete 6-digit verification code.' };
    }

    const targetEmail = pendingAuthData?.email || otpRecipientEmail || '';
    if (!targetEmail) {
      return { success: false, error: 'No active authentication session. Please request a new code.' };
    }

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          otp: cleanCode,
          name: pendingAuthData?.name,
          badgeNumber: pendingAuthData?.badgeNumber,
          department: pendingAuthData?.department
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'Invalid verification code. Please check your email and retry.'
        };
      }

      // Successful verification! Create or sync local record
      if (pendingAuthData?.mode === 'SIGNUP') {
        const newAccount: RegisteredAccount = {
          id: data.user?.id || `usr-${Date.now().toString().slice(-4)}`,
          name: pendingAuthData.name || 'Investigator',
          email: pendingAuthData.email,
          password: pendingAuthData.password || 'password123',
          badgeNumber: pendingAuthData.badgeNumber || `DET-${Math.floor(1000 + Math.random() * 9000)}`,
          rank: 'Special Forensic Investigator',
          department: pendingAuthData.department || 'Digital Forensics & Cyber Intelligence',
          clearanceLevel: 'LEVEL 5 - TOP SECRET // FORENSIC',
          avatar: data.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
          createdAt: new Date().toISOString().split('T')[0],
          stats: {
            casesInvestigated: 0,
            casesSolved: 0,
            activeCases: 1,
            evidenceCollected: 0
          }
        };

        setRegisteredAccounts((prev) => [newAccount, ...prev.filter((a) => a.email.toLowerCase() !== targetEmail)]);
      }

      const verifiedUser: UserProfile = data.user || {
        id: `usr-${Date.now().toString().slice(-4)}`,
        name: pendingAuthData?.name || 'Investigator',
        email: targetEmail,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        badgeNumber: pendingAuthData?.badgeNumber || 'DET-7091',
        rank: 'Special Forensic Investigator',
        department: pendingAuthData?.department || 'Cyber & Special Crimes Division',
        clearanceLevel: 'LEVEL 5 - TOP SECRET // FORENSIC',
        joinedDate: 'October 2024',
        stats: {
          casesInvestigated: 1,
          casesSolved: 0,
          activeCases: 1,
          evidenceCollected: 10
        }
      };

      setUser(verifiedUser);
      setIsOtpMode(false);
      setIsAuthModalOpen(false);
      setPendingAuthData(null);

      return { success: true, user: verifiedUser };
    } catch (err: any) {
      return {
        success: false,
        error: `Verification error: ${err.message || 'Could not verify code with server.'}`
      };
    }
  };

  // 5. Resend OTP with Real Backend POST /api/auth/send-otp
  const resendOtp = async (): Promise<{ success: boolean; error?: string }> => {
    const targetEmail = pendingAuthData?.email || otpRecipientEmail || '';
    if (!targetEmail) {
      return { success: false, error: 'No recipient email specified.' };
    }

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          name: pendingAuthData?.name,
          badgeNumber: pendingAuthData?.badgeNumber,
          department: pendingAuthData?.department
        })
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        return {
          success: false,
          error: resData.error || 'Failed to resend verification code.'
        };
      }

      setOtpCooldownSeconds(resData.cooldownSeconds || 60);
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: `Failed to resend code: ${err.message || 'Network error.'}`
      };
    }
  };

  const cancelOtp = () => {
    setIsOtpMode(false);
    setPendingAuthData(null);
  };

  // 6. Fast Google Sign-in
  const signInWithGoogle = async (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const defaultAccount = registeredAccounts[0] || DEFAULT_ACCOUNTS[0];
        const userProfile: UserProfile = {
          id: defaultAccount.id,
          name: defaultAccount.name,
          email: defaultAccount.email,
          avatar: defaultAccount.avatar,
          badgeNumber: defaultAccount.badgeNumber,
          rank: defaultAccount.rank,
          department: defaultAccount.department,
          clearanceLevel: defaultAccount.clearanceLevel,
          joinedDate: defaultAccount.createdAt,
          stats: defaultAccount.stats
        };
        setUser(userProfile);
        setIsAuthModalOpen(false);
        setIsOtpMode(false);
        resolve();
      }, 400);
    });
  };

  // 7. Custom Badge Credentials
  const signInWithCredentials = async (name: string, email: string, badge: string): Promise<void> => {
    const customUser: UserProfile = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: name || 'Investigator',
      email: email || 'detective@casex.gov',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      badgeNumber: badge || 'DET-7091',
      rank: 'Special Forensic Investigator',
      department: 'Cyber & Special Crimes Division',
      clearanceLevel: 'LEVEL 5 - TOP SECRET // FORENSIC',
      joinedDate: new Date().toISOString().split('T')[0],
      stats: {
        casesInvestigated: 1,
        casesSolved: 0,
        activeCases: 1,
        evidenceCollected: 12
      }
    };
    setUser(customUser);
    setIsAuthModalOpen(false);
    setIsOtpMode(false);
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('casex_auth_user');
  };

  const updateProfile = useCallback((updates: Partial<Pick<UserProfile, 'name' | 'badgeNumber' | 'department'>>) => {
    setUser(current => current ? { ...current, ...updates } : current);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthModalOpen,
        activeAuthTab,
        setActiveAuthTab,
        openAuthModal,
        closeAuthModal,
        pendingCaseId,
        setPendingCaseId,
        targetRedirectRoute,
        setTargetRedirectRoute,
        pendingAuthData,
        isOtpMode,
        otpRecipientEmail,
        otpCooldownSeconds,
        serverEmailConfigured,
        checkEmailConfig,
        signInWithEmailPassword,
        initiateSignUp,
        initiateSignInWithOtp,
        verifyOtp,
        resendOtp,
        cancelOtp,
        signInWithGoogle,
        signInWithCredentials,
        updateProfile,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
