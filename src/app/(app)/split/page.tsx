'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/store';
import { CURRENCY_SYMBOL } from '@/config/constants';
import { TextEffect } from '@/components/ui/motion/text-effect';
import { 
  Users, 
  Calculator, 
  Share2, 
  Plus, 
  Trash2, 
  Check, 
  Copy, 
  Receipt, 
  ArrowRight,
  Sparkles,
  PieChart
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { addExpense } from '@/lib/expenses/index';
import { dateToInputValue } from '@/lib/utils/date';
import { DEFAULT_CATEGORY_ID } from '@/config/categories';

export default function SplitBillsPage() {
  const user = useStore((s) => s.user);
  const householdId = useStore((s) => s.householdId);
  const categoriesMap = useStore((s) => s.categoriesMap);
  const addToast = useStore((s) => s.addToast);
  const addExpenseOptimistic = useStore((s) => s.addExpenseOptimistic);
  const adjustTotalSpentOptimistic = useStore((s) => s.adjustTotalSpentOptimistic);

  const [billName, setBillName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [extraFees, setExtraFees] = useState('');
  const [peopleCount, setPeopleCount] = useState<number>(3);
  const [customPeople, setCustomPeople] = useState<string[]>(['You', 'Roommate 1', 'Roommate 2']);
  const [newPersonName, setNewPersonName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(DEFAULT_CATEGORY_ID);
  const [copied, setCopied] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  // Sync custom people count
  const handleAddPerson = () => {
    if (!newPersonName.trim()) return;
    setCustomPeople([...customPeople, newPersonName.trim()]);
    setPeopleCount(customPeople.length + 1);
    setNewPersonName('');
  };

  const handleRemovePerson = (index: number) => {
    if (customPeople.length <= 2) {
      addToast({ type: 'warning', message: 'A split requires at least 2 people.' });
      return;
    }
    const updated = customPeople.filter((_, i) => i !== index);
    setCustomPeople(updated);
    setPeopleCount(updated.length);
  };

  // Calculations
  const calculations = useMemo(() => {
    const rawBill = Math.max(0, parseFloat(totalAmount) || 0);
    const fees = Math.max(0, parseFloat(extraFees) || 0);
    const grandTotal = rawBill + fees;
    const count = Math.max(1, customPeople.length);
    const perPersonShare = grandTotal / count;

    return {
      rawBill,
      fees,
      grandTotal,
      perPersonShare,
      count,
    };
  }, [totalAmount, extraFees, customPeople]);

  // Generate WhatsApp / Telegram Share Message
  const shareText = useMemo(() => {
    const title = billName.trim() || 'Shared Expense';
    const lines = [
      `💸 *Bill Split: ${title}*`,
      `💰 Total: ${CURRENCY_SYMBOL}${calculations.grandTotal.toFixed(2)}`,
      `👥 Split between ${calculations.count} people:`,
      ...customPeople.map(p => `  • ${p}: ${CURRENCY_SYMBOL}${calculations.perPersonShare.toFixed(2)}`),
      ``,
      `👉 *Your Share: ${CURRENCY_SYMBOL}${calculations.perPersonShare.toFixed(2)}*`,
      `Sent via SpendWise ✨`
    ];
    return lines.join('\n');
  }, [billName, calculations, customPeople]);

  const handleCopyShare = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      addToast({ type: 'success', message: 'Share summary copied to clipboard!' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast({ type: 'error', message: 'Failed to copy to clipboard.' });
    }
  };

  const handleLogMyShare = async () => {
    if (calculations.perPersonShare <= 0) {
      addToast({ type: 'error', message: 'Enter a valid bill amount first.' });
      return;
    }
    if (!user || !householdId) {
      addToast({ type: 'error', message: 'Please sign in to log this expense.' });
      return;
    }

    setIsLogging(true);
    try {
      const title = billName.trim() 
        ? `${billName.trim()} (My Share / ${calculations.count} people)` 
        : `Bill Split Share (${calculations.count} people)`;

      const shareAmount = Math.round(calculations.perPersonShare * 100) / 100;
      const dateStr = dateToInputValue(new Date());

      const created = await addExpense(householdId, user.uid, {
        amount: shareAmount,
        categoryId: selectedCategory,
        note: title,
        date: dateStr,
        type: 'expense',
        accountId: 'cash',
      });

      addExpenseOptimistic(created);
      adjustTotalSpentOptimistic(shareAmount);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });

      addToast({ 
        type: 'success', 
        message: `Logged ${CURRENCY_SYMBOL}${shareAmount.toFixed(2)} into your SpendWise expenses!` 
      });
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', message: 'Failed to log share.' });
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="w-full">
      <main className="flex-1 w-full px-4 sm:px-6 pt-8 pb-32 md:pb-12 max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-theme-accent/10 text-theme-accent text-xs font-semibold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Roommate & Hostel Utilities</span>
          </div>
          <TextEffect as="h1" preset="fade" className="font-display text-3xl sm:text-4xl md:text-5xl font-medium leading-none tracking-tight text-theme-primary mb-2">
            Split Expense
          </TextEffect>
          <TextEffect as="p" preset="fade" className="text-base sm:text-lg text-theme-secondary max-w-2xl">
            Quickly divide hostel food deliveries, flat WiFi, and shared outings. Share directly to WhatsApp and log only your exact share.
          </TextEffect>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form Inputs (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-theme-border/30 space-y-5">
              <h2 className="font-headline font-bold text-xl text-theme-primary flex items-center gap-2">
                <Receipt className="w-5 h-5 text-theme-accent" />
                Bill Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-theme-secondary block mb-1.5">
                    What was this expense for?
                  </label>
                  <input
                    type="text"
                    value={billName}
                    onChange={(e) => setBillName(e.target.value)}
                    placeholder="e.g. Late Night Swiggy, Flat Electricity, Uber to Station"
                    className="w-full px-4 py-3 rounded-2xl bg-theme-surface/60 border border-theme-border/40 text-theme-primary text-sm outline-none focus:border-theme-accent transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-theme-secondary block mb-1.5">
                      Bill Total ({CURRENCY_SYMBOL})
                    </label>
                    <input
                      type="number"
                      value={totalAmount}
                      onChange={(e) => setTotalAmount(e.target.value)}
                      placeholder="e.g. 1200"
                      className="w-full px-4 py-3 rounded-2xl bg-theme-surface/60 border border-theme-border/40 text-theme-primary text-base font-bold outline-none focus:border-theme-accent transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-theme-secondary block mb-1.5">
                      Delivery / Tip ({CURRENCY_SYMBOL}) <span className="font-normal text-theme-tertiary">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      value={extraFees}
                      onChange={(e) => setExtraFees(e.target.value)}
                      placeholder="e.g. 50"
                      className="w-full px-4 py-3 rounded-2xl bg-theme-surface/60 border border-theme-border/40 text-theme-primary text-sm outline-none focus:border-theme-accent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-theme-secondary block mb-1.5">
                    Category Tag
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-theme-surface/60 border border-theme-border/40 text-theme-primary text-sm outline-none focus:border-theme-accent transition-all"
                  >
                    {Array.from(categoriesMap.entries()).map(([id, cat]) => (
                      <option key={id} value={id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* People List */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-theme-border/30 space-y-5">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-headline font-bold text-lg text-theme-primary">
                    Splitting with ({customPeople.length} people)
                  </h3>
                  <p className="text-xs text-theme-secondary">Add roommates or friends to itemize shares</p>
                </div>
              </div>

              {/* Add friend row */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddPerson()}
                  placeholder="Enter name (e.g. Rahul, Priya)..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-theme-surface/60 border border-theme-border/40 text-theme-primary text-sm outline-none focus:border-theme-accent"
                />
                <button
                  onClick={handleAddPerson}
                  className="px-4 py-2.5 rounded-xl bg-theme-accent text-white font-semibold text-xs flex items-center gap-1 hover:opacity-90 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>

              {/* People chips */}
              <div className="flex flex-wrap gap-2 pt-2">
                {customPeople.map((name, index) => (
                  <div 
                    key={index}
                    className="px-3.5 py-2 rounded-2xl bg-theme-surface border border-theme-border/40 flex items-center gap-2 text-xs font-semibold text-theme-primary shadow-sm"
                  >
                    <span>{name}</span>
                    <span className="text-[11px] font-bold text-theme-accent bg-theme-accent/10 px-2 py-0.5 rounded-full">
                      {CURRENCY_SYMBOL}{calculations.perPersonShare.toFixed(0)}
                    </span>
                    {customPeople.length > 2 && (
                      <button 
                        onClick={() => handleRemovePerson(index)}
                        className="text-theme-tertiary hover:text-rose-500 transition-colors ml-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary & Sharing (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Split Result Card */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-theme-border/30 relative overflow-hidden space-y-6">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-theme-accent/15 rounded-full blur-3xl pointer-events-none" />

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-theme-tertiary block mb-1">
                  Each Person's Share
                </span>
                <div className="font-display text-5xl sm:text-6xl font-extrabold text-theme-primary flex items-baseline">
                  {CURRENCY_SYMBOL}{calculations.perPersonShare.toFixed(2)}
                </div>
                <p className="text-xs text-theme-secondary mt-2">
                  Total of {CURRENCY_SYMBOL}{calculations.grandTotal.toFixed(2)} divided equally among {calculations.count} people.
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-theme-border/20">
                <button
                  onClick={handleLogMyShare}
                  disabled={isLogging || calculations.perPersonShare <= 0}
                  className="w-full py-3.5 rounded-2xl bg-theme-accent text-white font-bold text-sm hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-theme-accent/25 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isLogging ? 'Logging...' : 'Log My Share to SpendWise'}</span>
                </button>

                <button
                  onClick={handleCopyShare}
                  className="w-full py-3 rounded-2xl bg-theme-surface/80 border border-theme-border/50 text-theme-primary font-semibold text-xs sm:text-sm hover:bg-theme-surface active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy WhatsApp Summary'}</span>
                </button>
              </div>

              {/* Message Preview */}
              <div className="p-4 rounded-2xl bg-theme-surface/50 border border-theme-border/30">
                <span className="text-[11px] font-bold text-theme-tertiary uppercase tracking-wider block mb-2">
                  WhatsApp Message Preview
                </span>
                <pre className="text-xs text-theme-secondary font-sans whitespace-pre-wrap leading-relaxed select-all">
                  {shareText}
                </pre>
              </div>
            </div>

            {/* Student Tip Card */}
            <div className="p-5 rounded-2xl bg-theme-surface/40 border border-theme-border/30 text-xs text-theme-secondary space-y-2">
              <span className="font-bold text-theme-primary flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-theme-accent" />
                Student Finance Tip
              </span>
              <p>
                Logging only your portion ({CURRENCY_SYMBOL}{calculations.perPersonShare.toFixed(2)}) prevents skewed analytics, so your monthly burn velocity stays 100% accurate.
              </p>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
