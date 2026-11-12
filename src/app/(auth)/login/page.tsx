'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Zap, 
  Users, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  KeyRound, 
  X, 
  Sun, 
  Moon, 
  Check
} from 'lucide-react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, sendPasswordReset } from '@/lib/firebase/auth';
import { useStore } from '@/store';
import { APP_NAME, APP_TAGLINE } from '@/config/constants';
import { isLightTheme } from '@/lib/themes/catalog';

interface Roommate {
  id: number;
  name: string;
  status: 'paid' | 'pending';
  method: string;
  isSelf?: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const addToast = useStore((s) => s.addToast);
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // True theme state across all 20 registered themes
  const isLight = mounted && isLightTheme(resolvedTheme || theme);
  const isDark = !isLight;

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };
  
  // Element Refs
  const emailInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Form State
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isCapsLock, setIsCapsLock] = useState(false);

  // Motion & Specular Physics
  const [mousePos, setMousePos] = useState({ x: 200, y: 200 });
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [shake, setShake] = useState(false);

  // Network & Loading
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const isAnyLoading = isGoogleLoading || isEmailLoading || isResetLoading;

  // Alerts & Modals
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | null>(null);

  // =========================================================================
  // LIVE BILL SPLIT CALCULATOR (INTERACTIVE PREVIEW)
  // =========================================================================
  const [billAmount, setBillAmount] = useState<number>(600);
  const [roommateCount, setRoommateCount] = useState<number>(4);
  const [roommates, setRoommates] = useState<Roommate[]>([
    { id: 1, name: 'You', status: 'paid', method: 'Paid', isSelf: true },
    { id: 2, name: 'Friend 1', status: 'paid', method: 'Settled' },
    { id: 3, name: 'Friend 2', status: 'paid', method: 'Settled' },
    { id: 4, name: 'Friend 3', status: 'pending', method: 'Pending' },
    { id: 5, name: 'Friend 4', status: 'pending', method: 'Pending' },
    { id: 6, name: 'Friend 5', status: 'pending', method: 'Pending' },
  ]);

  const activeRoommates = roommates.slice(0, roommateCount);
  const perPersonAmount = Math.round(billAmount / roommateCount);
  
  const monthlyBudget = 8000;
  const currentTotalSpent = 2800 + billAmount;
  const safeDailyRunway = Math.max(0, Math.round((monthlyBudget - currentTotalSpent) / 18));
  const spentPercent = Math.min(100, Math.round((currentTotalSpent / monthlyBudget) * 100));

  const toggleRoommateStatus = (id: number) => {
    setRoommates(prev => prev.map(r => {
      if (r.id === id) {
        const nextStatus = r.status === 'paid' ? 'pending' : 'paid';
        return {
          ...r,
          status: nextStatus,
          method: nextStatus === 'paid' ? 'Settled' : 'Pending'
        };
      }
      return r;
    }));
  };

  // Password Strength Meter
  const getPasswordStrength = (pass: string): { score: number; label: string; color: string } => {
    if (!pass) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/\d/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score++;
    
    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-400' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-cyan-400' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-400' };
  };

  const passwordStrength = getPasswordStrength(password);

  const triggerHapticShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (emailInputRef.current && window.innerWidth >= 768) {
        emailInputRef.current.focus();
      }
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const navigateAfterAuth = useCallback(() => {
    const { isOnboardingComplete } = useStore.getState();
    router.push(isOnboardingComplete ? '/dashboard' : '/onboarding');
  }, [router]);

  const handleGoogleSignIn = async () => {
    if (isAnyLoading) return;
    setIsGoogleLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await signInWithGoogle();
      navigateAfterAuth();
    } catch (err: unknown) {
      triggerHapticShake();
      const errorObj = err as { code?: string; message?: string };
      if (errorObj?.code === 'auth/popup-closed-by-user') {
        setError('Sign in window was closed. Please try again.');
      } else {
        setError('Google sign-in could not be completed. Check your connection.');
        console.error('[Login/Google]', err);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnyLoading) return;

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail) {
      triggerHapticShake();
      setError('Please provide your college or personal email.');
      emailInputRef.current?.focus();
      return;
    }
    if (!emailRegex.test(cleanEmail)) {
      triggerHapticShake();
      setError('Please enter a valid email format (e.g. name@college.edu).');
      emailInputRef.current?.focus();
      return;
    }
    if (!cleanPassword) {
      triggerHapticShake();
      setError('Please enter your password.');
      return;
    }
    if (cleanPassword.length < 6) {
      triggerHapticShake();
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (mode === 'signup') {
      if (cleanPassword !== confirmPassword) {
        triggerHapticShake();
        setError('Passwords do not match. Please verify both fields.');
        return;
      }
      if (name.trim().length > 0 && name.trim().length < 2) {
        triggerHapticShake();
        setError('Please enter a valid name (at least 2 characters).');
        return;
      }
    }

    setIsEmailLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (mode === 'signin') {
        await signInWithEmail(cleanEmail, cleanPassword);
      } else {
        await signUpWithEmail(cleanEmail, cleanPassword, name.trim() || undefined);
        addToast({ type: 'info', message: 'Account verified! Welcome to SpendWise.' });
      }
      navigateAfterAuth();
    } catch (err: unknown) {
      triggerHapticShake();
      const errorObj = err as { code?: string; message?: string };
      const code = errorObj?.code;
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Incorrect email or password. Please re-check your credentials.');
      } else if (code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Sign in instead.');
      } else if (code === 'auth/weak-password') {
        setError('Password is too weak. Please include letters and numbers.');
      } else if (code === 'auth/network-request-failed') {
        setError('Network timeout. Please check your internet connection.');
      } else {
        setError('Authentication failed. Please verify your details.');
      }
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isResetLoading) return;

    const targetEmail = (resetEmail || email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!targetEmail || !emailRegex.test(targetEmail)) {
      setError('Please enter a valid email address to receive the recovery link.');
      return;
    }

    setIsResetLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await sendPasswordReset(targetEmail);
      setSuccessMsg(`Encrypted reset link sent to ${targetEmail}. Check your inbox.`);
      setShowResetDialog(false);
    } catch (err: unknown) {
      const errorObj = err as { code?: string };
      if (errorObj?.code === 'auth/user-not-found') {
        setError('No account exists with this email address.');
      } else {
        setError('Failed to transmit recovery email. Please try again shortly.');
      }
    } finally {
      setIsResetLoading(false);
    }
  };

  // Reusable styles to permanently stop browser yellow autofill in dark & light modes
  const inputStyle = isDark ? {
    WebkitBoxShadow: '0 0 0 1000px #0b0f19 inset',
    WebkitTextFillColor: '#f8fafc',
    caretColor: '#f8fafc',
  } : {
    WebkitBoxShadow: '0 0 0 1000px #f1f5f9 inset',
    WebkitTextFillColor: '#0f172a',
    caretColor: '#0f172a',
  };

  return (
    <div className={`min-h-screen w-full font-body relative overflow-x-hidden flex items-center justify-center pt-16 pb-10 sm:py-8 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500/30 transition-colors duration-300 ${
      isDark ? 'bg-[#05070E] text-slate-100 selection:text-emerald-200' : 'bg-[#f8fafc] text-slate-900 selection:text-emerald-800'
    }`}>
      
      {/* Precision Micro-Grid with Smooth Vignette */}
      <div 
        className={`fixed inset-0 pointer-events-none transition-opacity duration-300 ${isDark ? 'opacity-20' : 'opacity-[0.08]'}`}
        style={{
          backgroundImage: isDark 
            ? 'radial-gradient(rgba(148, 163, 184, 0.28) 1px, transparent 1px)' 
            : 'radial-gradient(rgba(15, 23, 42, 0.28) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse 65% 65% at 50% 50%, #000 45%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 65% 65% at 50% 50%, #000 45%, transparent 100%)',
        }}
      />

      {/* Lightweight Ambient Radial Gradient */}
      <div 
        className="fixed inset-0 pointer-events-none transition-all duration-300"
        style={{
          background: isDark
            ? 'radial-gradient(circle at 18% 25%, rgba(16, 185, 129, 0.08) 0%, transparent 42%), radial-gradient(circle at 82% 75%, rgba(6, 182, 212, 0.07) 0%, transparent 45%)'
            : 'radial-gradient(circle at 18% 25%, rgba(16, 185, 129, 0.05) 0%, transparent 42%), radial-gradient(circle at 82% 75%, rgba(6, 182, 212, 0.04) 0%, transparent 45%)'
        }}
      />

      {/* Functional Theme Switcher (Working & Responsive) */}
      <div className="absolute top-3.5 right-4 sm:top-5 sm:right-5 z-40 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className={`w-11 h-11 rounded-full border backdrop-blur-md transition-all shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 cursor-pointer flex items-center justify-center ${
            isDark 
              ? 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700' 
              : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300'
          }`}
          aria-label="Toggle visual theme"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700 transition-transform duration-300 -rotate-12 hover:rotate-0" />
          )}
        </button>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
        
        {/* =======================================================================
            LEFT COLUMN: THE INTERACTIVE BILL SPLIT SANDBOX (DESKTOP)
           ======================================================================= */}
        <motion.div 
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:flex lg:col-span-7 flex-col justify-center space-y-6 pr-2"
        >
          
          {/* Editorial label — no pills, no sparkles, no neon outlines */}
          <div className="flex items-center gap-3">
            <div className={`h-px w-8 ${isDark ? 'bg-emerald-500/60' : 'bg-emerald-600/50'}`} />
            <span className={`text-[11px] font-bold uppercase tracking-[0.18em] ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              Expense Tracking &amp; Bill Splitting
            </span>
          </div>

          <div className="space-y-4">
            <h1 className={`font-display text-4xl xl:text-5xl font-black tracking-tight leading-[1.1] ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Your money,{' '}
              <span className="relative">
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  finally clear.
                </span>
              </span>
            </h1>
            <p className={`text-base max-w-md leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Log a canteen run in 3 seconds. Split a flat bill without the awkward WhatsApp thread. Know your exact daily runway, every day.
            </p>
          </div>

          {/* Interactive Split Card */}
          <div className={`rounded-3xl backdrop-blur-2xl p-6 shadow-xl max-w-lg space-y-5 relative overflow-hidden transition-all duration-300 ${
            isDark ? 'bg-slate-950/80 border border-slate-800/90 shadow-[0_20px_50px_rgba(0,0,0,0.6)]' : 'bg-white/95 border border-slate-200/90 shadow-lg'
          }`}>
            
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]`} />
                  <span className={`text-[11px] font-semibold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Bill Split Calculator</span>
                </div>
                <span className={`text-[10px] font-medium ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                  interactive preview
                </span>
              </div>

              <div className={`flex items-center justify-between p-3 rounded-2xl border transition-colors ${
                isDark ? 'bg-slate-900/90 border-slate-800/80' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Flat Bill</div>
                  <div className={`text-xl font-black font-mono tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    ₹{billAmount}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="200"
                    max="2000"
                    step="50"
                    value={billAmount}
                    onChange={(e) => setBillAmount(Number(e.target.value))}
                    className="w-32 accent-emerald-500 cursor-pointer"
                    aria-label="Adjust bill amount"
                  />
                  
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-xl border text-xs ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Flatmates:</span>
                    <select
                      value={roommateCount}
                      onChange={(e) => setRoommateCount(Number(e.target.value))}
                      className="bg-transparent text-emerald-500 font-bold focus:outline-none cursor-pointer"
                    >
                      <option value={2} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>2</option>
                      <option value={3} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>3</option>
                      <option value={4} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>4</option>
                      <option value={5} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>5</option>
                      <option value={6} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>6</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Roommates Grid */}
            <div className="space-y-1.5">
              <div className={`flex items-center justify-between text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <span>Roommate Split Calculation:</span>
                <span className="text-emerald-500 font-bold font-mono">₹{perPersonAmount} each</span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {activeRoommates.map((rm) => (
                  <button
                    key={rm.id}
                    type="button"
                    onClick={() => !rm.isSelf && toggleRoommateStatus(rm.id)}
                    className={`p-2 rounded-xl border transition-all text-left relative group/rm ${
                      rm.status === 'paid'
                        ? isDark 
                          ? 'bg-slate-900/90 border-emerald-500/30 text-emerald-300' 
                          : 'bg-emerald-50/80 border-emerald-300 text-emerald-800'
                        : isDark
                          ? 'bg-slate-900/40 border-amber-500/30 text-amber-300 hover:border-amber-400/50'
                          : 'bg-amber-50/80 border-amber-300 text-amber-800 hover:border-amber-400'
                    } ${!rm.isSelf ? 'cursor-pointer active:scale-95' : 'cursor-default'}`}
                  >
                    <div className={`text-[10px] font-medium truncate ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{rm.name}</div>
                    <div className={`text-xs font-bold font-mono mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{perPersonAmount}</div>
                    <div className={`text-[9px] font-semibold mt-0.5 flex items-center gap-1 ${
                      rm.status === 'paid' ? 'text-emerald-500' : 'text-amber-500'
                    }`}>
                      {rm.status === 'paid' ? <Check className="w-2.5 h-2.5" /> : null}
                      <span>{rm.method}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Monthly Allowance Gauge */}
            <div className={`space-y-2 pt-2 border-t ${isDark ? 'border-slate-800/60' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between text-xs">
                <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Safe Allowance Velocity</span>
                <span className={`font-bold font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{safeDailyRunway} / day safe limit</span>
              </div>
              
              <div className={`w-full h-2.5 rounded-full overflow-hidden p-[1px] border flex ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}>
                <motion.div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                  animate={{ width: `${spentPercent}%` }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              </div>

              <div className={`flex items-center justify-between text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <span>{spentPercent}% spent so far</span>
                <span>18 days remaining in month</span>
              </div>
            </div>

          </div>

          {/* Genuine Guarantees — editorial style, no pill borders */}
          <div className={`flex flex-col gap-2.5 pt-1 pl-1 border-l-2 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className={`flex items-center gap-2.5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <Zap className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span>Add any expense in under 3 seconds</span>
            </div>
            <div className={`flex items-center gap-2.5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <Users className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0" />
              <span>Split bills evenly — no manual math</span>
            </div>
            <div className={`flex items-center gap-2.5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <ShieldCheck className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
              <span>Free forever · No bank link · No ads · No trackers</span>
            </div>
          </div>

        </motion.div>

        {/* =======================================================================
            RIGHT COLUMN: CRAFTED AUTHENTICATION CARD
           ======================================================================= */}
        <motion.div 
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="w-full col-span-1 lg:col-span-5 flex justify-center"
        >
          <motion.div 
            ref={cardRef}
            onMouseMove={handleCardMouseMove}
            onMouseEnter={() => setIsCardHovered(true)}
            onMouseLeave={() => setIsCardHovered(false)}
            animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
            transition={{ duration: 0.4 }}
            className={`w-full max-w-[420px] rounded-3xl backdrop-blur-2xl p-7 flex flex-col gap-5 relative overflow-hidden transition-all duration-300 ${
              isDark 
                ? 'bg-slate-950/90 border border-slate-800/90 shadow-[0_20px_60px_rgba(0,0,0,0.85)]' 
                : 'bg-white/95 border border-slate-200/90 shadow-[0_20px_50px_rgba(0,0,0,0.08)]'
            }`}
          >
            
            {/* Dynamic Specular Border Glow */}
            {isCardHovered && (
              <div 
                className="pointer-events-none absolute inset-0 rounded-3xl opacity-50 transition-opacity duration-300"
                style={{
                  background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, rgba(16, 185, 129, 0.35), transparent 60%)`,
                  mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  maskComposite: 'exclude',
                  WebkitMaskComposite: 'xor',
                  padding: '1px',
                }}
              />
            )}

            {/* Mobile Header */}
            <div className={`lg:hidden pb-3 border-b flex items-center gap-3 text-[11px] ${
              isDark ? 'border-slate-800/60 text-slate-500' : 'border-slate-200 text-slate-400'
            }`}>
              <div className={`h-px w-5 ${isDark ? 'bg-emerald-500/50' : 'bg-emerald-600/40'}`} />
              <span className={`font-bold uppercase tracking-[0.16em] ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>SpendWise</span>
              <span>·</span>
              <span>Free &amp; Private</span>
            </div>

            {/* Brand Header */}
            <div className="text-center space-y-2 pt-0.5">
              <div className={`w-12 h-12 rounded-2xl border p-2.5 shadow-md mx-auto flex items-center justify-center ${
                isDark 
                  ? 'bg-gradient-to-b from-slate-800 to-slate-900 border-slate-700/60' 
                  : 'bg-gradient-to-b from-slate-50 to-slate-100 border-slate-200'
              }`}>
                <svg className="w-6 h-6 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="14" x="2" y="5" rx="3" />
                  <line x1="2" x2="22" y1="10" y2="10" />
                  <path d="M16 14h2" />
                </svg>
              </div>
              <div>
                <h2 className={`font-display text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {APP_NAME}
                </h2>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {APP_TAGLINE}
                </p>
              </div>
            </div>

            {/* Clean Segmented Control */}
            <div className={`grid grid-cols-2 p-1 border rounded-xl relative transition-colors ${
              isDark ? 'bg-slate-900/80 border-slate-800/80' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(''); setSuccessMsg(''); }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all relative z-10 cursor-pointer ${
                  mode === 'signin' 
                    ? isDark ? 'text-white' : 'text-slate-900' 
                    : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {mode === 'signin' && (
                  <motion.div 
                    layoutId="auth-tab-pill-craft" 
                    className={`absolute inset-0 rounded-lg shadow-sm -z-10 border ${
                      isDark ? 'bg-slate-800/90 border-slate-700/50' : 'bg-white border-slate-200'
                    }`} 
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
                  />
                )}
                Sign In
              </button>
              
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(''); setSuccessMsg(''); }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all relative z-10 cursor-pointer ${
                  mode === 'signup' 
                    ? isDark ? 'text-white' : 'text-slate-900' 
                    : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {mode === 'signup' && (
                  <motion.div 
                    layoutId="auth-tab-pill-craft" 
                    className={`absolute inset-0 rounded-lg shadow-sm -z-10 border ${
                      isDark ? 'bg-slate-800/90 border-slate-700/50' : 'bg-white border-slate-200'
                    }`} 
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
                  />
                )}
                Create Account
              </button>
            </div>

            {/* Google Auth Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isAnyLoading}
              id="google-signin-btn"
              className={`w-full h-11 px-4 rounded-xl border font-medium text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-sm active:scale-[0.985] disabled:opacity-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400/30 ${
                isDark 
                  ? 'bg-slate-900/90 hover:bg-slate-850 border-slate-800 hover:border-slate-700 text-white' 
                  : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800'
              }`}
            >
              {!isGoogleLoading ? (
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              ) : (
                <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              )}
              <span>Continue with Google</span>
            </button>

            {/* Semantic Flex Divider (Zero Overlap) */}
            <div className="flex items-center gap-3 my-0.5">
              <div className={`h-px flex-1 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
              <span className={`text-[11px] font-medium tracking-wider uppercase select-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                or continue with email
              </span>
              <div className={`h-px flex-1 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            </div>

            {/* Form */}
            <form onSubmit={handleEmailAuth} className="flex flex-col gap-3.5" noValidate>
              
              {/* Full Name (Sign Up only) */}
              <AnimatePresence mode="wait">
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-1"
                  >
                    <label htmlFor="name-input" className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Full Name</label>
                    <div className="relative flex items-center group">
                      <User className={`w-4 h-4 absolute left-3.5 pointer-events-none transition-colors group-focus-within:text-emerald-500 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                      <input
                        type="text"
                        placeholder="e.g. Alex Sharma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                        id="name-input"
                        disabled={isAnyLoading}
                        style={inputStyle}
                        className={`w-full h-11 rounded-xl border py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all disabled:opacity-50 ${
                          isDark 
                            ? 'bg-[#0b0f19] text-slate-100 placeholder:text-slate-400 border-slate-800 focus:border-emerald-400' 
                            : 'bg-slate-100/90 text-slate-900 placeholder:text-slate-600 border-slate-200 focus:border-emerald-500 focus:bg-white'
                        }`}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Address with Permanent Dark Autofill Style */}
              <div className="flex flex-col gap-1">
                <label htmlFor="email-input" className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>College or Personal Email</label>
                <div className="relative flex items-center group">
                  <Mail className={`w-4 h-4 absolute left-3.5 pointer-events-none transition-colors group-focus-within:text-emerald-500 ${isDark ? 'text-slate-500' : 'text-slate-500'}`} />
                  <input
                    ref={emailInputRef}
                    type="email"
                    placeholder="student@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    id="email-input"
                    disabled={isAnyLoading}
                    style={inputStyle}
                    className={`w-full h-11 rounded-xl border py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all disabled:opacity-50 ${
                      isDark 
                        ? 'bg-[#0b0f19] text-slate-100 placeholder:text-slate-400 border-slate-800 focus:border-emerald-400' 
                        : 'bg-slate-100/90 text-slate-900 placeholder:text-slate-600 border-slate-200 focus:border-emerald-500 focus:bg-white'
                    }`}
                  />
                </div>
              </div>

              {/* Password Field with External Show/Hide Button */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label htmlFor="password-input" className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Password</label>
                    {isCapsLock && (
                      <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 animate-pulse">
                        Caps Lock ON
                      </span>
                    )}
                  </div>
                  
                  {/* Clean Label Toolbar */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`text-xs py-1.5 px-1.5 -my-1 transition-colors font-medium flex items-center gap-1 focus:outline-none cursor-pointer ${
                        isDark ? 'text-slate-300 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-700'
                      }`}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showPassword ? 'Hide' : 'Show'}</span>
                    </button>
                    
                    {mode === 'signin' && (
                      <>
                        <span className={isDark ? 'text-slate-700' : 'text-slate-300'}>·</span>
                        <button
                          type="button"
                          onClick={() => {
                            setShowResetDialog(true);
                            setResetEmail(email.trim());
                            setError('');
                          }}
                          className={`text-xs py-1.5 px-1.5 -my-1 transition-colors font-medium hover:underline focus:outline-none cursor-pointer ${
                            isDark ? 'text-slate-300 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-700'
                          }`}
                        >
                          Forgot?
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="relative flex items-center group">
                  <Lock className={`w-4 h-4 absolute left-3.5 pointer-events-none transition-colors group-focus-within:text-emerald-500 ${isDark ? 'text-slate-500' : 'text-slate-500'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => setIsCapsLock(e.getModifierState('CapsLock'))}
                    onKeyUp={(e) => setIsCapsLock(e.getModifierState('CapsLock'))}
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    id="password-input"
                    disabled={isAnyLoading}
                    style={inputStyle}
                    className={`w-full h-11 rounded-xl border py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all disabled:opacity-50 font-mono tracking-wider ${
                      isDark 
                        ? 'bg-[#0b0f19] text-slate-100 placeholder:text-slate-400 border-slate-800 focus:border-emerald-400' 
                        : 'bg-slate-100/90 text-slate-900 placeholder:text-slate-600 border-slate-200 focus:border-emerald-500 focus:bg-white'
                    }`}
                  />
                </div>

                {/* Password Strength Gauge */}
                {mode === 'signup' && password.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className={`flex gap-1 h-1 w-full rounded-full overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`}>
                      <div className={`h-full transition-all duration-300 ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-transparent'} w-1/4`} />
                      <div className={`h-full transition-all duration-300 ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-transparent'} w-1/4`} />
                      <div className={`h-full transition-all duration-300 ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-transparent'} w-1/4`} />
                      <div className={`h-full transition-all duration-300 ${passwordStrength.score >= 4 ? passwordStrength.color : 'bg-transparent'} w-1/4`} />
                    </div>
                    <div className={`flex justify-between text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      <span>Strength: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{passwordStrength.label}</strong></span>
                      <span>Min 6 characters</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password (Sign Up Only) */}
              <AnimatePresence mode="wait">
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <label htmlFor="confirm-password-input" className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Confirm Password</label>
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className={`text-xs py-1.5 px-1.5 -my-1 transition-colors font-medium flex items-center gap-1 focus:outline-none cursor-pointer ${
                          isDark ? 'text-slate-300 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-700'
                        }`}
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{showConfirmPassword ? 'Hide' : 'Show'}</span>
                      </button>
                    </div>
                    <div className="relative flex items-center group">
                      <Lock className={`w-4 h-4 absolute left-3.5 pointer-events-none transition-colors group-focus-within:text-emerald-500 ${isDark ? 'text-slate-500' : 'text-slate-500'}`} />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        id="confirm-password-input"
                        disabled={isAnyLoading}
                        style={inputStyle}
                        className={`w-full h-11 rounded-xl border py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all disabled:opacity-50 font-mono tracking-wider ${
                          isDark 
                            ? 'bg-[#0b0f19] text-slate-100 placeholder:text-slate-400 border-slate-800 focus:border-emerald-400' 
                            : 'bg-slate-100/90 text-slate-900 placeholder:text-slate-600 border-slate-200 focus:border-emerald-500 focus:bg-white'
                        }`}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Custom Styled Checkbox */}
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`flex items-center gap-2.5 text-xs select-none cursor-pointer group text-left pt-0.5 ${
                    isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                    rememberMe 
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950' 
                      : isDark 
                        ? 'bg-slate-900 border-slate-700 group-hover:border-slate-600' 
                        : 'bg-white border-slate-300 group-hover:border-slate-400'
                  }`}>
                    {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span>Remember this device for 30 days</span>
                </button>
              )}

              {/* Accessible Alerts */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-start gap-2 shadow-sm" 
                  role="alert"
                  aria-live="polite"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
                  <span>{error}</span>
                </motion.div>
              )}

              {successMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-2 shadow-sm" 
                  role="status"
                  aria-live="polite"
                >
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
                  <span>{successMsg}</span>
                </motion.div>
              )}

              {/* Master Tactile Submit Button */}
              <button 
                type="submit" 
                disabled={isAnyLoading} 
                id="email-auth-btn"
                className="w-full h-11 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm tracking-wide shadow-[0_2px_12px_rgba(16,185,129,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)] active:scale-[0.985] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer group mt-1"
              >
                {isEmailLoading ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{mode === 'signin' ? 'Sign In to SpendWise' : 'Create Free Student Account'}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            {/* Legal Footnote with Real Modals */}
            <div className={`pt-1 text-center text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <span>By continuing, you agree to our </span>
              <button
                type="button"
                onClick={() => setLegalModal('terms')}
                className={`underline py-1.5 px-1 inline-flex items-center transition-colors focus:outline-none cursor-pointer ${
                  isDark ? 'text-slate-300 hover:text-emerald-400' : 'text-slate-700 hover:text-emerald-700'
                }`}
              >
                Terms of Service
              </button>
              <span> and </span>
              <button
                type="button"
                onClick={() => setLegalModal('privacy')}
                className={`underline py-1.5 px-1 inline-flex items-center transition-colors focus:outline-none cursor-pointer ${
                  isDark ? 'text-slate-300 hover:text-emerald-400' : 'text-slate-700 hover:text-emerald-700'
                }`}
              >
                Privacy Policy
              </button>
            </div>

          </motion.div>
        </motion.div>

      </div>

      {/* Password Reset Modal */}
      <AnimatePresence>
        {showResetDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-sm rounded-3xl border p-6 shadow-2xl space-y-4 relative overflow-hidden ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500" />
              
              <div className={`flex items-center justify-between pb-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Reset Password</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowResetDialog(false)}
                  className={`p-1 rounded-lg transition-colors cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Enter your registered email address. We will send you a secure link to reset your password.
              </p>

              <form onSubmit={handlePasswordReset} className="space-y-3.5">
                <div className="relative flex items-center">
                  <Mail className={`w-4 h-4 absolute left-3.5 pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    type="email"
                    placeholder="student@college.edu"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    autoComplete="email"
                    required
                    style={inputStyle}
                    className={`w-full h-11 rounded-xl border py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/20 ${
                      isDark 
                        ? 'bg-[#0b0f19] text-white placeholder:text-slate-400 border-slate-800 focus:border-emerald-400' 
                        : 'bg-slate-100 text-slate-900 placeholder:text-slate-600 border-slate-200 focus:border-emerald-500'
                    }`}
                  />
                </div>

                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setShowResetDialog(false)}
                    className={`px-3 py-2 text-xs font-medium rounded-xl transition-colors cursor-pointer ${
                      isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isResetLoading}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {isResetLoading ? 'Sending...' : 'Send Link'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Legal & Privacy Modal */}
      <AnimatePresence>
        {legalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-3xl border p-6 shadow-2xl space-y-4 relative ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {legalModal === 'terms' ? 'SpendWise Terms of Service' : 'SpendWise Privacy Policy'}
                </h3>
                <button
                  type="button"
                  onClick={() => setLegalModal(null)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className={`text-xs space-y-3 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {legalModal === 'terms' ? (
                  <>
                    <p className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>1. Acceptance of Terms</p>
                    <p>SpendWise provides personal and shared expense tracking tools for university students and general users. By accessing SpendWise, you agree to these standard terms.</p>
                    <p className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>2. Campus Split Responsibilities</p>
                    <p>Bill splits logged on SpendWise are personal records between you and your roommates. SpendWise does not act as a banking custodian or financial escrow.</p>
                    <p className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>3. User Conduct &amp; Account Security</p>
                    <p>You are responsible for maintaining the confidentiality of your credentials. You agree to use the service only for lawful personal budgeting purposes.</p>
                  </>
                ) : (
                  <>
                    <p className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>1. Data Ownership &amp; Privacy</p>
                    <p>SpendWise is built with privacy-first principles. Your financial logs, expense notes, and split balances are encrypted in transit and securely stored in Firebase Auth and Firestore.</p>
                    <p className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>2. No Ad-Tracking or Data Selling</p>
                    <p>We do not sell, rent, or trade your financial or personal data to third-party ad networks or data brokers.</p>
                    <p className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>3. Account Deletion</p>
                    <p>You may request deletion of your account and all associated expense logs at any time from your SpendWise profile settings.</p>
                  </>
                )}
              </div>

              <div className={`flex justify-end pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <button
                  type="button"
                  onClick={() => setLegalModal(null)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                    isDark ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
