import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCase } from '../../context/CaseContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import {
  Lock,
  User,
  Mail,
  Award,
  Eye,
  EyeOff,
  Building,
  KeyRound,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Fingerprint,
  ShieldCheck
} from 'lucide-react';

interface AuthModalProps {
  onSuccess?: (targetRoute?: string | null) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess }) => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    activeAuthTab,
    setActiveAuthTab,
    pendingCaseId,
    setPendingCaseId,
    targetRedirectRoute,
    setTargetRedirectRoute,
    pendingAuthData,
    isOtpMode,
    otpRecipientEmail,
    otpCooldownSeconds,
    serverEmailConfigured,
    signInWithEmailPassword,
    initiateSignUp,
    verifyOtp,
    resendOtp,
    cancelOtp,
    signInWithGoogle
  } = useAuth();

  const { switchCase, showToast } = useCase();

  // Form states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sign In inputs
  const [signInEmail, setSignInEmail] = useState('gpulkit1231@gmail.com');
  const [signInPassword, setSignInPassword] = useState('password123');
  const [useOtpOnSignIn, setUseOtpOnSignIn] = useState(true);

  // Create Account inputs
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpBadge, setSignUpBadge] = useState('');
  const [signUpDept, setSignUpDept] = useState('Cyber & Special Crimes Division');

  // 6-Digit OTP input array
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Clear errors and generate badge prefix when switching tabs
  useEffect(() => {
    setErrorMessage(null);
    if (!signUpBadge) {
      setSignUpBadge(`DET-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  }, [activeAuthTab, isAuthModalOpen]);

  // Reset digits & focus on first input when entering OTP mode
  useEffect(() => {
    if (isOtpMode) {
      setOtpDigits(['', '', '', '', '', '']);
      setErrorMessage(null);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOtpMode]);

  // Handle OTP digit changes
  const handleOtpChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);
    setErrorMessage(null);

    // Auto-advance to next input
    if (cleanVal && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pastedData[i] || '';
    }
    setOtpDigits(newDigits);

    const nextIndex = Math.min(pastedData.length, 5);
    otpInputRefs.current[nextIndex]?.focus();
  };

  // 1. Submit Sign In
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await signInWithEmailPassword(signInEmail, signInPassword, useOtpOnSignIn);
      if (!res.success) {
        setErrorMessage(res.error || 'Authentication failed. Please check credentials.');
      } else if (!res.requiresOtp) {
        // Direct sign-in completed
        completeAuthentication();
      } else {
        showToast(`Verification code sent to ${signInEmail}`, 'info');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit Create Account
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!signUpName.trim()) {
      setErrorMessage('Please enter investigator full name.');
      return;
    }
    if (!signUpEmail.trim() || !signUpEmail.includes('@')) {
      setErrorMessage('Please provide a valid official email address.');
      return;
    }
    if (signUpPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);
    try {
      const res = await initiateSignUp({
        name: signUpName,
        email: signUpEmail,
        password: signUpPassword,
        badgeNumber: signUpBadge,
        department: signUpDept
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Failed to dispatch verification code.');
      } else {
        showToast(`Verification code dispatched to ${signUpEmail}`, 'info');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Submit OTP Verification
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('');

    if (fullOtp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await verifyOtp(fullOtp);
      if (!res.success) {
        setErrorMessage(res.error || 'Invalid verification code. Please check your email and retry.');
      } else {
        showToast(`Identity verified. Clearance granted to ${res.user?.name}.`, 'success');
        completeAuthentication();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification error.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Resend OTP Handler
  const handleResendOtp = async () => {
    if (otpCooldownSeconds > 0) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await resendOtp();
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to resend code.');
      } else {
        setOtpDigits(['', '', '', '', '', '']);
        otpInputRefs.current[0]?.focus();
        showToast('Fresh verification code sent to your email.', 'info');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  // Complete Authentication & Redirect to Case Library
  const completeAuthentication = () => {
    if (pendingCaseId) {
      switchCase(pendingCaseId);
      setPendingCaseId(null);
    }

    const routeToRedirect = targetRedirectRoute || '/cases';
    setTargetRedirectRoute(null);

    if (onSuccess) {
      onSuccess(routeToRedirect);
    }
  };

  // Quick Google Sign-In
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      showToast('Authenticated via Google Single Sign-On.', 'success');
      completeAuthentication();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={closeAuthModal}
      title={isOtpMode ? 'CRYPTOGRAPHIC OTP VERIFICATION' : 'INVESTIGATOR AUTHENTICATION'}
      subtitle="CASEX DIGITAL FORENSIC NETWORK // CLASSIFIED ACCESS"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* ========================================================================= */}
        {/* VIEW 1: OTP VERIFICATION MODE                                             */}
        {/* ========================================================================= */}
        {isOtpMode ? (
          <form onSubmit={handleVerifyOtpSubmit} className="space-y-6 text-center">
            {/* Lock / Key Graphic */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.25)]">
                  <KeyRound className="w-8 h-8 animate-pulse" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0a0a0a] border border-cyan-400 flex items-center justify-center text-cyan-400">
                  <Fingerprint className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Explanatory Header */}
            <div className="space-y-2">
              <h4 className="text-base sm:text-lg font-bold font-hud text-white tracking-wide">
                ENTER 6-DIGIT VERIFICATION CODE
              </h4>
              <p className="text-xs font-mono text-slate-300 max-w-sm mx-auto leading-relaxed">
                A secure one-time authorization code has been dispatched to your email address:
              </p>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/40 text-cyan-300 font-mono text-xs font-semibold shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold">{otpRecipientEmail || pendingAuthData?.email}</span>
              </div>
            </div>

            {/* DIRECT EMAIL DISPATCH NOTIFICATION */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 text-left relative overflow-hidden space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                    EMAIL DISPATCHED TO INBOX
                  </span>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 uppercase">
                  10-MIN EXPIRATION
                </span>
              </div>

              <p className="text-[11px] font-mono text-slate-300 leading-normal">
                Check your inbox (and spam folder) for the <strong>CaseX Verification Code</strong> email and enter the 6 digits below.
              </p>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 6 Segmented Input Boxes */}
            <div className="flex justify-center items-center gap-2 sm:gap-3 my-4">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpInputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  onPaste={handleOtpPaste}
                  className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-mono font-bold rounded-xl border bg-black/60 text-white transition-all focus:outline-none ${
                    digit
                      ? 'border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] bg-cyan-950/20'
                      : 'border-white/20 focus:border-cyan-400 focus:bg-white/5'
                  }`}
                  required
                />
              ))}
            </div>

            {/* Expiry Timer & Resend */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>
                  {otpCooldownSeconds > 0 ? (
                    <>
                      Resend available in: <strong className="text-white">{otpCooldownSeconds}s</strong>
                    </>
                  ) : (
                    <span className="text-emerald-400">Resend is now ready</span>
                  )}
                </span>
              </div>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading || otpCooldownSeconds > 0}
                className="text-cyan-400 hover:text-cyan-200 underline flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Resend Code</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                icon={<CheckCircle2 className="w-4 h-4" />}
                className="w-full text-xs sm:text-sm uppercase tracking-wider py-3.5 shadow-[0_0_25px_rgba(6,182,212,0.4)]"
              >
                VERIFY OTP & ENTER INVESTIGATION
              </Button>

              <button
                type="button"
                onClick={cancelOtp}
                className="text-[11px] font-mono text-slate-400 hover:text-white pt-2 cursor-pointer"
              >
                ← Back to Edit Credentials
              </button>
            </div>
          </form>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: SIGN IN / CREATE ACCOUNT TABS                                     */
          /* ========================================================================= */
          <div className="space-y-5">
            {/* Tab Selection Header */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-white/5 border border-white/10 font-mono text-xs">
              <button
                type="button"
                onClick={() => {
                  setActiveAuthTab('signin');
                  setErrorMessage(null);
                }}
                className={`py-2.5 rounded-xl font-bold tracking-wider transition-all cursor-pointer ${
                  activeAuthTab === 'signin'
                    ? 'bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                SIGN IN
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveAuthTab('signup');
                  setErrorMessage(null);
                }}
                className={`py-2.5 rounded-xl font-bold tracking-wider transition-all cursor-pointer ${
                  activeAuthTab === 'signup'
                    ? 'bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                CREATE ACCOUNT
              </button>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* SUB-VIEW 2A: SIGN IN TAB                                       */}
            {/* ------------------------------------------------------------- */}
            {activeAuthTab === 'signin' ? (
              <form onSubmit={handleSignInSubmit} className="space-y-4 text-left">
                {/* Email input */}
                <div>
                  <label className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider block mb-1.5">
                    Official Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="email"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      placeholder="investigator@agency.gov"
                      className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:bg-white/5 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Password input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider">
                      Terminal Password
                    </label>
                    <span className="text-[10px] font-mono text-slate-500">Demo: password123</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:bg-white/5 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 2FA OTP Option Checkbox */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={useOtpOnSignIn}
                      onChange={(e) => setUseOtpOnSignIn(e.target.checked)}
                      className="rounded border-white/20 bg-black/40 text-cyan-500 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-slate-300">Enable 2-Step Email OTP Security Check</span>
                  </label>
                  <span className="text-[10px] text-cyan-400 font-bold">RECOMMENDED</span>
                </div>

                {/* Submit Sign In Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                  className="w-full text-xs sm:text-sm uppercase tracking-wider py-3.5 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                >
                  {useOtpOnSignIn ? 'SEND OTP & PROCEED TO 2FA' : 'SIGN IN TO TERMINAL'}
                </Button>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-3">
                  <div className="border-t border-white/10 w-full" />
                  <span className="bg-[#0a0a0a] px-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest absolute">
                    OR
                  </span>
                </div>

                {/* Alternate Quick Google SSO Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-mono text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>CONTINUE WITH GOOGLE SSO</span>
                </button>

                {/* Footer Switcher */}
                <div className="text-center pt-2">
                  <span className="text-xs font-mono text-slate-400">
                    Don't have an investigator profile?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveAuthTab('signup')}
                      className="text-cyan-400 hover:text-cyan-200 underline font-bold cursor-pointer"
                    >
                      Create Account
                    </button>
                  </span>
                </div>
              </form>
            ) : (
              /* ------------------------------------------------------------- */
              /* SUB-VIEW 2B: CREATE ACCOUNT (SIGN UP) TAB                     */
              /* ------------------------------------------------------------- */
              <form onSubmit={handleSignUpSubmit} className="space-y-3.5 text-left">
                {/* Full Name */}
                <div>
                  <label className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider block mb-1">
                    Investigator Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      placeholder="e.g. Detective John Vance"
                      className="w-full pl-10 pr-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:bg-white/5"
                      required
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider block mb-1">
                    Official Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="email"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      placeholder="name@investigations.gov"
                      className="w-full pl-10 pr-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:bg-white/5"
                      required
                    />
                  </div>
                </div>

                {/* Badge Number & Department Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider block mb-1">
                      Badge / Shield ID
                    </label>
                    <div className="relative">
                      <Award className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="text"
                        value={signUpBadge}
                        onChange={(e) => setSignUpBadge(e.target.value)}
                        placeholder="DET-8092"
                        className="w-full pl-10 pr-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:bg-white/5"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider block mb-1">
                      Assigned Division
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <select
                        value={signUpDept}
                        onChange={(e) => setSignUpDept(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-cyan-400 focus:bg-white/5"
                      >
                        <option value="Cyber & Special Crimes Division">Cyber & Special Crimes</option>
                        <option value="Homicide & Major Case Squad">Homicide Squad</option>
                        <option value="Forensic Pathology & Bio-Analysis">Forensic Pathology</option>
                        <option value="Digital Intelligence & Ballistics">Digital Intelligence</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Password & Confirm Password Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider block mb-1">
                      Create Password (Min 6)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-8 py-2 bg-black/40 border border-white/10 rounded-xl text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:bg-white/5"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider block mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={signUpConfirmPassword}
                        onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-8 py-2 bg-black/40 border border-white/10 rounded-xl text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:bg-white/5"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Sign Up Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                  className="w-full text-xs sm:text-sm uppercase tracking-wider py-3.5 shadow-[0_0_20px_rgba(6,182,212,0.3)] mt-2"
                >
                  CREATE ACCOUNT & SEND 2FA OTP
                </Button>

                {/* Footer Switcher */}
                <div className="text-center pt-1">
                  <span className="text-xs font-mono text-slate-400">
                    Already an authorized investigator?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveAuthTab('signin')}
                      className="text-cyan-400 hover:text-cyan-200 underline font-bold cursor-pointer"
                    >
                      Sign In
                    </button>
                  </span>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
