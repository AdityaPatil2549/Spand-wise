'use client';

import { motion } from 'framer-motion';
import { Wallet, TrendingDown } from 'lucide-react';
import { useStore } from '@/store';
import { formatCurrency } from '@/lib/utils/format';
import { BudgetHeroSkeleton } from '@/components/ui/Skeleton';
import { useCountUp } from '@/hooks/useCountUp';
import type { BudgetState } from '@/types/ui';

const HERO_GRADIENTS: Record<BudgetState, string> = {
 safe: 'var(--gradient-hero)',
 warning: 'var(--gradient-hero-warning)',
 critical: 'var(--gradient-hero-danger)',
};

const HERO_GLOWS: Record<BudgetState, string> = {
 safe: '0 12px 40px -10px rgba(124, 58, 237, 0.5)',
 warning: '0 12px 40px -10px rgba(245, 158, 11, 0.5)',
 critical: '0 12px 40px -10px rgba(239, 68, 68, 0.5)',
};

const HERO_LABELS: Record<BudgetState, string> = {
 safe: 'Left to spend',
 warning: 'Running low!',
 critical: 'Over budget',
};

/**
 * BudgetHeroCard — the primary dashboard card.
 * Shows remaining budget with dynamic color state and animated count-up.
 */
export const BudgetHeroCard = () => {
 const budget = useStore((s) => s.budget);
 const isLoading = useStore((s) => s.isBudgetLoading);
 const getBudgetState = useStore((s) => s.getBudgetState);
 const getBudgetRemaining = useStore((s) => s.getBudgetRemaining);
 const getBudgetRemainingPercent = useStore((s) => s.getBudgetRemainingPercent);

 const remaining = getBudgetRemaining();
 const spent = budget?.totalSpent || 0;
 
 // Use our new hook for both numbers
 const animatedRemaining = useCountUp(Math.abs(remaining));
 const animatedSpent = useCountUp(spent);

 if (isLoading) return <BudgetHeroSkeleton />;
 if (!budget) return null;

 const budgetState = getBudgetState();
 const remainingPercent = getBudgetRemainingPercent();
 const spentPercent = Math.min(100, (1 - remainingPercent) * 100);

 return (
 <motion.div
 layout
 className="rounded-2xl p-6 text-theme-inverse overflow-hidden relative mx-4 shadow-2xl"
 style={{ 
 background: HERO_GRADIENTS[budgetState],
 boxShadow: HERO_GLOWS[budgetState],
 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 initial={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
 >
 {/* Background decoration for glass effect */}
 <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay">
 <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-theme-white blur-3xl" />
 <div className="absolute -left-10 bottom-0 w-32 h-32 rounded-full bg-theme-white blur-2xl" />
 </div>

 <div className="relative z-10">
 {/* Label */}
 <div className="flex items-center gap-2 mb-1">
 <Wallet className="w-5 h-5 opacity-90 drop-shadow-sm" aria-hidden="true" />
 <span className="text-sm font-medium opacity-90 tracking-wide text-theme-inverse/90">
 {HERO_LABELS[budgetState]}
 </span>
 {budgetState === 'warning' && (
 <motion.div
 animate={{ opacity: [1, 0.5, 1] }}
 transition={{ duration: 1.5, repeat: Infinity }}
 >
 <TrendingDown className="w-4 h-4 text-amber-200" />
 </motion.div>
 )}
 </div>

 {/* Amount */}
 <div className="text-5xl font-black mb-6 tracking-tighter drop-shadow-md">
 <span className="text-3xl opacity-80 font-bold mr-1">₹</span>
 {remaining < 0 ? '−' : ''}{animatedRemaining}
 </div>

 {/* Progress bar */}
 <div className="mb-2">
 <div className="flex justify-between text-sm font-medium opacity-90 mb-2">
 <span>₹{animatedSpent} spent</span>
 <span>of {formatCurrency(budget.budgetAmount)}</span>
 </div>
 <div className="h-2 bg-black/20 rounded-full overflow-hidden shadow-inner backdrop-blur-sm">
 <motion.div
 className="h-full rounded-full bg-theme-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
 initial={{ width: 0 }}
 animate={{ width: `${spentPercent}%` }}
 transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
 />
 </div>
 </div>
 </div>
 </motion.div>
 );
};
