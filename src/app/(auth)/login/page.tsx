'use client';

import { useState, useRef, useEffect } from 'react';
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
  Check,
  Sparkles,
  WifiOff,
  Smartphone
} from 'lucide-react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, sendPasswordReset } from '@/lib/firebase/auth';
import { useStore } from '@/store';
import { APP_NAME } from '@/config/constants';
import { isLightTheme } from '@/lib/themes/catalog';
import { activateGuestDemo } from '@/lib/demo/guestData';

interface Roommate {
  id: number;
  name: string;
  avatar: string;
  status: 'paid' | 'pending';
  method: string;
  isSelf?: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const addToast = useStore((s) => s.addToast);
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileTab, setMobileTab] = useState<'auth' | 'demo'>('auth');

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
  // LIVE BILL SPLIT SIMULATOR (TACTILE PREVIEW)
  // =========================================================================
  const [billAmount, setBillAmount] = useState<number>(800);
  const [roommateCount, setRoommateCount] = useState<number>(4);
  const [roommates, setRoommates] = useState<Roommate[]>([
    { id: 1, name: 'You', avatar: 'YOU', status: 'paid', method: 'Paid', isSelf: true },
    { id: 2, name: 'Rohan', avatar: 'RK', status: 'paid', method: 'Settled' },
    { id: 3, name: 'Aarav', avatar: 'AK', status: 'paid', method: 'Settled' },
    { id: 4, name: 'Sneha', avatar: 'SM', status: 'pending', method: 'Pending' },
    { id: 5, name: 'Tanmay', avatar: 'TP', status: 'pending', method: 'Pending' },
    { id: 6, name: 'Pooja', avatar: 'PS', status: 'pending', method: 'Pending' },
  ]);

  const activeRoommates = roommates.slice(0, roommateCount);
  const perPersonAmount = Math.round(billAmount / roommateCount);
  
  const monthlyBudget = 10000;
  const currentTotalSpent = 3400 + billAmount;
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
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-teal-400' };
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

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccessMsg('');
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      addToast({ type: 'success', message: 'Welcome to SpendWise!' });
      router.push('/dashboard');
    } catch (err: unknown) {
      const errorObj = err as { code?: string; message?: string };
      if (errorObj?.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-in was interrupted. Please try again.');
        triggerHapticShake();
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please provide your college or personal email.');
      emailInputRef.current?.focus();
      triggerHapticShake();
      return;
    }

    if (!password) {
      setError('Password is required.');
      triggerHapticShake();
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        triggerHapticShake();
        return;
      }
      if (password.length < 6) {
        setError('Password must contain at least 6 characters.');
        triggerHapticShake();
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        triggerHapticShake();
        return;
      }
    }

    setIsEmailLoading(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(trimmedEmail, password);
        addToast({ type: 'success', message: 'Welcome back to SpendWise!' });
        router.push('/dashboard');
      } else {
        await signUpWithEmail(trimmedEmail, password, name.trim());
        addToast({ type: 'success', message: 'Account established! Welcome aboard.' });
        router.push('/onboarding');
      }
    } catch (err: unknown) {
      const errorObj = err as { code?: string; message?: string };
      const code = errorObj?.code;

      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setError('Invalid email or password combination. Please re-check.');
      } else if (code === 'auth/email-already-in-use') {
        setError('An account already exists with this email. Switch to Sign In.');
      } else if (code === 'auth/too-many-requests') {
        setError('Access temporarily throttled due to multiple failed tries. Please wait a moment.');
      } else {
        setError('Authentication server error. Please try again.');
      }
      triggerHapticShake();
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = resetEmail.trim();
    if (!targetEmail) return;

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

  const handleExploreGuestDemo = () => {
    activateGuestDemo(useStore.getState());
    addToast({ type: 'success', message: 'Loaded Alex Sharma’s Campus Demo Sandbox!' });
    router.push('/dashboard');
  };

  const inputStyle = isDark ? {
    WebkitBoxShadow: '0 0 0 1000px #090d16 inset',
    WebkitTextFillColor: '#f8fafc',
    caretColor: '#10b981',
  } : {
    WebkitBoxShadow: '0 0 0 1000px #f8fafc inset',
    WebkitTextFillColor: '#0f172a',
    caretColor: '#059669',
  };

  return (
    <div className={`min-h-screen w-full font-body relative overflow-x-hidden flex flex-col justify-between selection:bg-emerald-500/30 transition-colors duration-500 ${
      isDark ? 'bg-[#04060a] text-slate-100 selection:text-emerald-300' : 'bg-[#f8fafc] text-slate-900 selection:text-emerald-900'
    }`}>
      
      {/* =========================================================================
          ATMOSPHERIC MESH & ANALOG DEPTH (No more sterile flat void!)
         ========================================================================= */}
      
      {/* Multi-layered soft atmospheric mesh glows */}
      <div 
        className="fixed inset-0 pointer-events-none transition-all duration-700 -z-10"
        style={{
          background: isDark
            ? `
              radial-gradient(ellipse 55% 45% at 15% 15%, rgba(16, 185, 129, 0.12) 0%, transparent 60%),
              radial-gradient(ellipse 50% 50% at 85% 80%, rgba(6, 182, 212, 0.08) 0%, transparent 60%),
              radial-gradient(ellipse 60% 40% at 50% 50%, rgba(99, 102, 241, 0.04) 0%, transparent 70%),
              radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.06) 0%, transparent 50%)
            `
            : `
              radial-gradient(ellipse 55% 45% at 15% 15%, rgba(16, 185, 129, 0.07) 0%, transparent 60%),
              radial-gradient(ellipse 50% 50% at 85% 80%, rgba(6, 182, 212, 0.05) 0%, transparent 60%),
              radial-gradient(ellipse 60% 40% at 50% 50%, rgba(99, 102, 241, 0.03) 0%, transparent 70%)
            `
        }}
      />

      {/* Micro-texture analog grain for high-end physical depth */}
      <div 
        className={`fixed inset-0 pointer-events-none -z-10 transition-opacity duration-500 ${isDark ? 'opacity-[0.035]' : 'opacity-[0.02]'}`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Vignette edge fade */}
      <div 
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 50%, rgba(4, 6, 10, 0.85) 100%)'
            : 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 50%, rgba(248, 250, 252, 0.85) 100%)'
        }}
      />

      {/* =========================================================================
          TOP FLOATING DOCKED NAVBAR (No abandoned floating sun icon!)
         ========================================================================= */}
      <header className="w-full pt-3 px-4 sm:px-6 lg:px-8 relative z-30 shrink-0">
        <div className={`max-w-6xl mx-auto rounded-full px-4 sm:px-5 py-2 backdrop-blur-xl border transition-all duration-300 flex items-center justify-between shadow-sm ${
          isDark 
            ? 'bg-zinc-900/40 border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]' 
            : 'bg-white/70 border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.04)]'
        }`}>
          {/* Brand Logo & Live Status Pill */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1px] shadow-sm flex items-center justify-center">
                <div className={`w-full h-full rounded-[11px] flex items-center justify-center ${isDark ? 'bg-zinc-950' : 'bg-white'}`}>
                  <span className="text-emerald-400 font-black text-sm tracking-tight">S</span>
                </div>
              </div>
              <span className={`font-display text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                SpendWise
              </span>
            </div>

            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
              isDark 
                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Campus Edition · Offline Ready</span>
            </div>
          </div>

          {/* Right Controls: PWA Smartphone pill + Theme Switcher */}
          <div className="flex items-center gap-2.5">
            <div className={`hidden md:flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border ${
              isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}>
              <Smartphone className="w-3 h-3 text-emerald-400" />
              <span>Installable on Phone</span>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className={`w-9 h-9 rounded-full border backdrop-blur-md transition-all shadow-sm active:scale-95 focus:outline-none cursor-pointer flex items-center justify-center ${
                isDark 
                  ? 'bg-zinc-900/80 border-white/10 text-slate-300 hover:text-white hover:border-white/20' 
                  : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300'
              }`}
              aria-label="Toggle visual theme"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-300 transition-transform duration-300 hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 transition-transform duration-300 hover:-rotate-12" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile-Only Segmented Switcher (Zero-Scroll Instant Switch) */}
      <div className="lg:hidden w-full px-4 pt-1 pb-1 relative z-20 shrink-0">
        <div className={`flex items-center justify-center p-1 max-w-[280px] mx-auto rounded-2xl border transition-colors shadow-sm ${
          isDark ? 'bg-zinc-900/80 border-white/10' : 'bg-slate-200/80 border-slate-300'
        }`}>
          <button
            type="button"
            onClick={() => setMobileTab('auth')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              mobileTab === 'auth'
                ? isDark ? 'bg-zinc-800 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm'
                : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In / Register
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('demo')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              mobileTab === 'demo'
                ? isDark ? 'bg-zinc-800 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm'
                : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚡ Live Splitter
          </button>
        </div>
      </div>

      {/* =========================================================================
          MAIN HERO SECTION (Balanced 2-Column Desktop Grid)
         ========================================================================= */}
      <main className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3 my-auto shrink-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* =====================================================================
              LEFT COLUMN: THE TACTILE CAMPUS BILL SPLITTER EXPERIENCE
             ===================================================================== */}
          <motion.div 
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={`lg:col-span-7 flex flex-col justify-center space-y-3 sm:space-y-4 ${
              mobileTab === 'auth' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            
            {/* Authentic Tagline Badge */}
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border shadow-sm ${
                isDark 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                  : 'bg-emerald-50 border-emerald-300 text-emerald-800'
              }`}>
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Zero Awkward Math
              </span>
              <span className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>· Built for Flatmates</span>
            </div>

            {/* High-Impact Hero Headline */}
            <div className="space-y-1.5">
              <h1 className={`font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-black tracking-tight leading-[1.08] ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}>
                Split flat bills.{' '}
                <span className="inline lg:block bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  Keep friendships.
                </span>
              </h1>
              <p className={`text-xs sm:text-sm max-w-lg leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Log a canteen chai run in 3 seconds. Split WiFi, mess bills, and flat groceries without the awkward WhatsApp thread. Track your exact daily semester runway.
              </p>
            </div>

            {/* Tactile Bill Split Glass Widget */}
            <div className={`rounded-3xl backdrop-blur-2xl p-4 sm:p-4.5 shadow-2xl space-y-3 relative overflow-hidden transition-all duration-300 ${
              isDark 
                ? 'bg-zinc-900/60 border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]' 
                : 'bg-white/80 border border-slate-200/90 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.06)]'
            }`}>
              
              {/* Top Specular Edge Highlight (subtle, elegant, not cheap gradient bar) */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />

              {/* Widget Header & Amount Dial */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-300' : 'text-slate-800'}`}>
                      Interactive Bill Splitter
                    </span>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    isDark ? 'bg-zinc-800 border-zinc-700 text-emerald-400' : 'bg-emerald-100 border-emerald-300 text-emerald-900'
                  }`}>
                    Live Math
                  </span>
                </div>

                {/* Amount Slider Container */}
                <div className={`p-3 rounded-2xl border transition-colors flex items-center justify-between gap-3 ${
                  isDark ? 'bg-zinc-950/70 border-white/5' : 'bg-slate-50 border-slate-200/90'
                }`}>
                  <div>
                    <span className={`text-[10px] font-medium ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                      Total Expense
                    </span>
                    <div className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      ₹{billAmount}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      id="demo-bill-amount"
                      name="demoBillAmount"
                      type="range"
                      min="200"
                      max="3000"
                      step="100"
                      value={billAmount}
                      onChange={(e) => setBillAmount(Number(e.target.value))}
                      className="w-28 sm:w-36 accent-emerald-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
                      aria-label="Adjust bill amount"
                    />

                    {/* Flatmates Selector Pills */}
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-xs shrink-0 ${
                      isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-slate-300'
                    }`}>
                      <Users className="w-3 h-3 text-emerald-500" />
                      <span className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>Split:</span>
                      <select
                        id="demo-roommate-count"
                        name="demoRoommateCount"
                        aria-label="Number of flatmates"
                        value={roommateCount}
                        onChange={(e) => setRoommateCount(Number(e.target.value))}
                        className={`bg-transparent text-xs font-bold focus:outline-none cursor-pointer ${
                          isDark ? 'text-emerald-400' : 'text-emerald-800'
                        }`}
                      >
                        {[2, 3, 4, 5, 6].map((num) => (
                          <option key={num} value={num} className={isDark ? 'bg-zinc-900 text-white' : 'bg-white text-slate-900'}>
                            {num}p
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Roommate Cards with Colorful Avatars (Real Life Metaphor) */}
              <div className="space-y-1.5">
                <div className={`flex items-center justify-between text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-700'}`}>
                  <span>Tap any person to toggle settled status:</span>
                  <span className={`font-mono text-xs ${isDark ? 'font-bold text-emerald-400' : 'font-extrabold text-emerald-800'}`}>
                    ₹{perPersonAmount} each
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {activeRoommates.map((rm) => (
                    <motion.button
                      key={rm.id}
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => !rm.isSelf && toggleRoommateStatus(rm.id)}
                      className={`p-2 rounded-2xl border transition-all text-left relative overflow-hidden flex flex-col justify-between ${
                        rm.status === 'paid'
                          ? isDark 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' 
                            : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                          : isDark
                            ? 'bg-zinc-950/60 border-amber-500/25 text-amber-200 hover:border-amber-400/40'
                            : 'bg-amber-50/90 border-amber-300 text-amber-950 hover:border-amber-400'
                      } ${!rm.isSelf ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      <div className="flex items-center justify-between gap-1 w-full">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold ${
                          rm.status === 'paid'
                            ? isDark ? 'bg-emerald-500 text-zinc-950' : 'bg-emerald-600 text-white'
                            : isDark ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-amber-600 text-white'
                        }`}>
                          {rm.avatar}
                        </div>
                        <span className={`text-[9px] font-semibold flex items-center gap-0.5 ${
                          rm.status === 'paid' 
                            ? isDark ? 'text-emerald-400' : 'text-emerald-800 font-bold' 
                            : isDark ? 'text-amber-400' : 'text-amber-800 font-bold'
                        }`}>
                          {rm.status === 'paid' && <Check className="w-2.5 h-2.5" />}
                          {rm.method}
                        </span>
                      </div>

                      <div className="mt-1.5">
                        <div className={`text-[10px] font-medium truncate ${isDark ? 'text-zinc-300' : 'text-slate-800'}`}>
                          {rm.name}
                        </div>
                        <div className={`text-xs font-bold font-mono tracking-tight mt-0.5 ${isDark ? 'text-white' : 'text-slate-950'}`}>
                          ₹{perPersonAmount}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Monthly Safe Allowance Runway Gauge */}
              <div className={`pt-2 border-t space-y-1.5 ${isDark ? 'border-white/5' : 'border-slate-200/80'}`}>
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-medium ${isDark ? 'text-zinc-400' : 'text-slate-700'}`}>
                    Remaining Daily Allowance
                  </span>
                  <span className={`font-mono text-xs ${isDark ? 'font-bold text-emerald-400' : 'font-extrabold text-emerald-800'}`}>
                    ₹{safeDailyRunway} <span className={`font-normal text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>/ day safe</span>
                  </span>
                </div>
                
                <div className={`w-full h-1.5 rounded-full overflow-hidden p-[1px] border flex ${
                  isDark ? 'bg-zinc-950 border-white/5' : 'bg-slate-100 border-slate-200'
                }`}>
                  <motion.div 
                    className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-full"
                    animate={{ width: `${spentPercent}%` }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                </div>

                <div className={`flex items-center justify-between text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <span>{spentPercent}% monthly cap consumed</span>
                  <span>18 days remaining</span>
                </div>
              </div>

            </div>

            {/* Three Tactile Guarantees */}
            <div className="grid grid-cols-3 gap-2 pt-0.5">
              <div className={`p-2 rounded-xl border transition-colors flex items-center gap-2 ${
                isDark ? 'bg-zinc-900/40 border-white/5 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-[11px] font-medium">3s Quick Add</span>
              </div>
              <div className={`p-2 rounded-xl border transition-colors flex items-center gap-2 ${
                isDark ? 'bg-zinc-900/40 border-white/5 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <WifiOff className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span className="text-[11px] font-medium">100% Offline</span>
              </div>
              <div className={`p-2 rounded-xl border transition-colors flex items-center gap-2 ${
                isDark ? 'bg-zinc-900/40 border-white/5 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-[11px] font-medium">No Bank Login</span>
              </div>
            </div>

          </motion.div>

          {/* =====================================================================
              RIGHT COLUMN: CRAFTED LINEAR-GRADE AUTHENTICATION MODAL
             ===================================================================== */}
          <motion.div 
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className={`lg:col-span-5 flex justify-center w-full ${
              mobileTab === 'demo' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <motion.div 
              ref={cardRef}
              onMouseMove={handleCardMouseMove}
              onMouseEnter={() => setIsCardHovered(true)}
              onMouseLeave={() => setIsCardHovered(false)}
              animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
              transition={{ duration: 0.4 }}
              className={`w-full max-w-[420px] rounded-3xl backdrop-blur-2xl p-4 sm:p-5 flex flex-col gap-3.5 relative overflow-hidden transition-all duration-300 shadow-2xl ${
                isDark 
                  ? 'bg-zinc-900/70 border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)]' 
                  : 'bg-white/95 border border-slate-200/90 shadow-[0_25px_50px_-15px_rgba(0,0,0,0.08)]'
              }`}
            >
              
              {/* Dynamic Specular Border Glow on cursor hover */}
              {isCardHovered && (
                <div 
                  className="pointer-events-none absolute inset-0 rounded-3xl opacity-40 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(320px circle at ${mousePos.x}px ${mousePos.y}px, rgba(16, 185, 129, 0.4), transparent 60%)`,
                    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    maskComposite: 'exclude',
                    WebkitMaskComposite: 'xor',
                    padding: '1px',
                  }}
                />
              )}

              {/* Top Specular Edge Highlight */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />

              {/* Brand Header */}
              <div className="text-center space-y-1">
                <div className={`w-10 h-10 rounded-2xl border p-2 shadow-md mx-auto flex items-center justify-center transition-all ${
                  isDark 
                    ? 'bg-gradient-to-b from-zinc-800 to-zinc-900 border-white/10 text-emerald-400' 
                    : 'bg-gradient-to-b from-slate-50 to-slate-100 border-slate-200 text-emerald-600'
                }`}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="14" x="2" y="5" rx="3" />
                    <line x1="2" x2="22" y1="10" y2="10" />
                    <path d="M16 14h2" />
                  </svg>
                </div>
                <div>
                  <h2 className={`font-display text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {APP_NAME}
                  </h2>
                  <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Track your campus spends in 3 seconds.
                  </p>
                </div>
              </div>

              {/* Apple-style Smooth Segmented Switcher */}
              <div className={`grid grid-cols-2 p-1 border rounded-xl relative transition-colors ${
                isDark ? 'bg-zinc-950/80 border-white/5' : 'bg-slate-100 border-slate-200'
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
                        isDark ? 'bg-zinc-800/90 border-white/10' : 'bg-white border-slate-200'
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
                      : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {mode === 'signup' && (
                    <motion.div 
                      layoutId="auth-tab-pill-craft" 
                      className={`absolute inset-0 rounded-lg shadow-sm -z-10 border ${
                        isDark ? 'bg-zinc-800/90 border-white/10' : 'bg-white border-slate-200'
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
                    ? 'bg-zinc-900 hover:bg-zinc-800/90 border-white/10 hover:border-white/20 text-white' 
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

              {/* Semantic Flex Divider */}
              <div className="flex items-center gap-3 my-0.5">
                <div className={`h-px flex-1 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
                <span className={`text-[10px] font-semibold tracking-wider uppercase select-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  or with email
                </span>
                <div className={`h-px flex-1 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
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
                      <label htmlFor="name-input" className={`text-xs font-semibold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                        Full Name
                      </label>
                      <div className="relative flex items-center group">
                        <User className={`w-4 h-4 absolute left-3.5 pointer-events-none transition-colors group-focus-within:text-emerald-400 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
                        <input
                          type="text"
                          name="name"
                          placeholder="e.g. Alex Sharma"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          autoComplete="name"
                          id="name-input"
                          disabled={isAnyLoading}
                          style={inputStyle}
                          className={`w-full h-11 rounded-xl border py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all disabled:opacity-50 ${
                            isDark 
                              ? 'bg-zinc-950/80 text-zinc-100 placeholder:text-zinc-500 border-white/10 focus:border-emerald-400' 
                              : 'bg-slate-100/90 text-slate-900 placeholder:text-slate-400 border-slate-200 focus:border-emerald-500 focus:bg-white'
                          }`}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email Address */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="email-input" className={`text-xs font-semibold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                    College or Personal Email
                  </label>
                  <div className="relative flex items-center group">
                    <Mail className={`w-4 h-4 absolute left-3.5 pointer-events-none transition-colors group-focus-within:text-emerald-400 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
                    <input
                      ref={emailInputRef}
                      type="email"
                      name="email"
                      placeholder="student@college.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      id="email-input"
                      disabled={isAnyLoading}
                      style={inputStyle}
                      className={`w-full h-11 rounded-xl border py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all disabled:opacity-50 ${
                        isDark 
                          ? 'bg-zinc-950/80 text-zinc-100 placeholder:text-zinc-500 border-white/10 focus:border-emerald-400' 
                          : 'bg-slate-100/90 text-slate-900 placeholder:text-slate-400 border-slate-200 focus:border-emerald-500 focus:bg-white'
                      }`}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <label htmlFor="password-input" className={`text-xs font-semibold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                        Password
                      </label>
                      {isCapsLock && (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 animate-pulse">
                          Caps Lock ON
                        </span>
                      )}
                    </div>
                    
                    {/* Clean Label Toolbar */}
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`transition-colors font-medium flex items-center gap-1 focus:outline-none cursor-pointer ${
                          isDark ? 'text-zinc-400 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-700'
                        }`}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{showPassword ? 'Hide' : 'Show'}</span>
                      </button>
                      
                      {mode === 'signin' && (
                        <>
                          <span className={isDark ? 'text-zinc-700' : 'text-slate-300'}>·</span>
                          <button
                            type="button"
                            onClick={() => {
                              setShowResetDialog(true);
                              setResetEmail(email.trim());
                              setError('');
                            }}
                            className={`transition-colors font-medium hover:underline focus:outline-none cursor-pointer ${
                              isDark ? 'text-zinc-400 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-700'
                            }`}
                          >
                            Forgot?
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="relative flex items-center group">
                    <Lock className={`w-4 h-4 absolute left-3.5 pointer-events-none transition-colors group-focus-within:text-emerald-400 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
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
                          ? 'bg-zinc-950/80 text-zinc-100 placeholder:text-zinc-500 border-white/10 focus:border-emerald-400' 
                          : 'bg-slate-100/90 text-slate-900 placeholder:text-slate-400 border-slate-200 focus:border-emerald-500 focus:bg-white'
                      }`}
                    />
                  </div>

                  {/* Password Strength Gauge */}
                  {mode === 'signup' && password.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <div className={`flex gap-1 h-1 w-full rounded-full overflow-hidden ${isDark ? 'bg-zinc-950' : 'bg-slate-100'}`}>
                        <div className={`h-full transition-all duration-300 ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-transparent'} w-1/4`} />
                        <div className={`h-full transition-all duration-300 ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-transparent'} w-1/4`} />
                        <div className={`h-full transition-all duration-300 ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-transparent'} w-1/4`} />
                        <div className={`h-full transition-all duration-300 ${passwordStrength.score >= 4 ? passwordStrength.color : 'bg-transparent'} w-1/4`} />
                      </div>
                      <div className={`flex justify-between text-[10px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
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
                        <label htmlFor="confirm-password-input" className={`text-xs font-semibold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                          Confirm Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className={`text-xs py-1.5 px-1.5 -my-1 transition-colors font-medium flex items-center gap-1 focus:outline-none cursor-pointer ${
                            isDark ? 'text-zinc-400 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-700'
                          }`}
                        >
                          {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{showConfirmPassword ? 'Hide' : 'Show'}</span>
                        </button>
                      </div>
                      <div className="relative flex items-center group">
                        <Lock className={`w-4 h-4 absolute left-3.5 pointer-events-none transition-colors group-focus-within:text-emerald-400 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          autoComplete="new-password"
                          id="confirm-password-input"
                          disabled={isAnyLoading}
                          style={inputStyle}
                          className={`w-full h-11 rounded-xl border py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all disabled:opacity-50 font-mono tracking-wider ${
                            isDark 
                              ? 'bg-zinc-950/80 text-zinc-100 placeholder:text-zinc-500 border-white/10 focus:border-emerald-400' 
                              : 'bg-slate-100/90 text-slate-900 placeholder:text-slate-400 border-slate-200 focus:border-emerald-500 focus:bg-white'
                          }`}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Remember Me Checkbox */}
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`flex items-center gap-2.5 text-xs select-none cursor-pointer group text-left pt-0.5 ${
                      isDark ? 'text-zinc-400 hover:text-zinc-300' : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                      rememberMe 
                        ? 'bg-emerald-500 border-emerald-400 text-zinc-950 shadow-sm' 
                        : isDark 
                          ? 'bg-zinc-950 border-white/10 group-hover:border-white/20' 
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

                {/* Tactile Luminous Primary Submit Button */}
                <button 
                  type="submit" 
                  disabled={isAnyLoading} 
                  id="email-auth-btn"
                  className="w-full h-11 px-5 rounded-xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 text-zinc-950 font-bold text-sm tracking-wide shadow-[0_10px_25px_-5px_rgba(16,185,129,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] hover:shadow-[0_16px_32px_-5px_rgba(16,185,129,0.5)] active:scale-[0.985] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer group mt-1 relative overflow-hidden"
                >
                  {isEmailLoading ? (
                    <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{mode === 'signin' ? 'Sign In to SpendWise' : 'Create Free Student Account'}</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Instant 1-Click Guest Demo Sandbox Access */}
              <div className="relative flex py-1 items-center mt-0.5">
                <div className={`flex-grow border-t ${isDark ? 'border-zinc-800' : 'border-slate-200'}`} />
                <span className={`flex-shrink mx-2 text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                  Instant Preview
                </span>
                <div className={`flex-grow border-t ${isDark ? 'border-zinc-800' : 'border-slate-200'}`} />
              </div>

              <button
                type="button"
                onClick={handleExploreGuestDemo}
                id="guest-demo-btn"
                className={`w-full py-2.5 px-3 rounded-xl border font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer shadow-sm active:scale-[0.985] ${
                  isDark
                    ? 'bg-zinc-800/90 hover:bg-zinc-750 border-zinc-700/80 text-zinc-100 hover:text-white'
                    : 'bg-slate-100 hover:bg-slate-200/90 border-slate-300 text-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform shrink-0" />
                <span>⚡ Explore Live Demo as Guest (Instant Access)</span>
              </button>

              {/* Legal Footnote */}
              <div className={`pt-1 text-center text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <span>By continuing, you agree to our </span>
                <button
                  type="button"
                  onClick={() => setLegalModal('terms')}
                  className={`underline py-1 px-1 inline-flex items-center transition-colors focus:outline-none cursor-pointer ${
                    isDark ? 'text-slate-300 hover:text-emerald-400' : 'text-slate-700 hover:text-emerald-700'
                  }`}
                >
                  Terms of Service
                </button>
                <span> and </span>
                <button
                  type="button"
                  onClick={() => setLegalModal('privacy')}
                  className={`underline py-1 px-1 inline-flex items-center transition-colors focus:outline-none cursor-pointer ${
                    isDark ? 'text-slate-300 hover:text-emerald-400' : 'text-slate-700 hover:text-emerald-700'
                  }`}
                >
                  Privacy Policy
                </button>
              </div>

            </motion.div>
          </motion.div>

        </div>
      </main>

      {/* =========================================================================
          FOOTER (Subtle campus notes & offline reassurance)
         ========================================================================= */}
      <footer className="w-full pb-3 sm:pb-4 px-4 sm:px-6 lg:px-8 relative z-20">
        <div className={`max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs pt-4 border-t ${
          isDark ? 'border-white/5 text-slate-500' : 'border-slate-200 text-slate-400'
        }`}>
          <div className="flex items-center gap-2">
            <span>© 2026 SpendWise</span>
            <span>·</span>
            <span>Designed for college roommates &amp; daily budgets</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Local IndexedDB Sync Active
            </span>
          </div>
        </div>
      </footer>

      {/* Password Reset Modal */}
      <AnimatePresence>
        {showResetDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-sm rounded-3xl border p-6 shadow-2xl space-y-4 relative overflow-hidden ${
                isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
              
              <div className={`flex items-center justify-between pb-2 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
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
                    name="resetEmail"
                    id="reset-email-input"
                    placeholder="student@college.edu"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    autoComplete="email"
                    required
                    style={inputStyle}
                    className={`w-full h-11 rounded-xl border py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/20 ${
                      isDark 
                        ? 'bg-zinc-950 text-white placeholder:text-zinc-500 border-white/10 focus:border-emerald-400' 
                        : 'bg-slate-100 text-slate-900 placeholder:text-slate-400 border-slate-200 focus:border-emerald-500'
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
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-zinc-950 transition-all shadow-md disabled:opacity-50 cursor-pointer"
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
                isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
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

              <div className={`flex justify-end pt-3 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <button
                  type="button"
                  onClick={() => setLegalModal(null)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                    isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
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
