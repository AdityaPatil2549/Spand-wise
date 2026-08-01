'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LogOut, Wallet, FileDown, User, Edit2, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAuthGuard } from '@/hooks/useAuth';
import { useStore } from '@/store';
import { signOut } from '@/lib/firebase/auth';
import { setBudgetAmount } from '@/lib/budget/index';
import { MIN_BUDGET_AMOUNT, MAX_BUDGET_AMOUNT, CURRENCY_SYMBOL } from '@/config/constants';

const budgetSchema = z.object({
  budgetAmount: z
    .number()
    .min(MIN_BUDGET_AMOUNT, `Must be at least ${CURRENCY_SYMBOL}${MIN_BUDGET_AMOUNT}`)
    .max(MAX_BUDGET_AMOUNT, 'Amount too large'),
});
type BudgetForm = z.infer<typeof budgetSchema>;

import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { EditProfileForm } from '@/components/shared/EditProfileForm';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { CategoryBudgetsSheet } from '@/components/budget/CategoryBudgetsSheet';
import { SharedBudgetCard } from '@/components/budget/SharedBudgetCard';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthGuard();
  const householdId = useStore((s) => s.householdId);
  const addToast = useStore((s) => s.addToast);
  const budget = useStore((s) => s.budget);
  const setBudgetStore = useStore((s) => s.setBudget);
  const selectedMonth = useStore((s) => s.selectedMonth);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isCategoryBudgetsOpen, setIsCategoryBudgetsOpen] = useState(false);
  const expenses = useStore((s) => s.expenses);

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<BudgetForm>({
    resolver: zodResolver(budgetSchema),
    defaultValues: { budgetAmount: budget?.budgetAmount ?? undefined },
  });

  const watchBudgetAmount = watch('budgetAmount');
  const isBudgetUnchanged = watchBudgetAmount === budget?.budgetAmount || !watchBudgetAmount;

  // Format YYYY-MM to "Month YYYY" (e.g., "July 2026")
  const formattedMonth = useMemo(() => {
    try {
      const [year, month] = selectedMonth.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch {
      return selectedMonth;
    }
  }, [selectedMonth]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.push('/login');
    } catch {
      addToast({ type: 'error', message: 'Sign out failed. Try again.' });
      setIsSigningOut(false);
    }
  };

  const handleBudgetUpdate = async (data: BudgetForm) => {
    if (!user) return;
    try {
      await setBudgetAmount(householdId || user.uid, data.budgetAmount, selectedMonth);
      if (budget) setBudgetStore({ ...budget, budgetAmount: data.budgetAmount });
      addToast({ type: 'success', message: 'Budget updated! ✅' });
    } catch {
      addToast({ type: 'error', message: 'Failed to update budget.' });
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // Lazy-load jsPDF per performance rules — only on user action
      const { jsPDF } = await import('jspdf');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const autoTable = (await import('jspdf-autotable')).default;
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text('SpendWise — Expense Report', 14, 20);
      doc.setFontSize(12);
      doc.text(`Month: ${selectedMonth}`, 14, 30);

      const tableData = expenses.map((e) => [
        e.date.toDate().toLocaleDateString('en-IN'),
        e.categoryId,
        e.note ?? '',
        `₹${e.amount.toLocaleString('en-IN')}`,
      ]);

      autoTable(doc, {
        head: [['Date', 'Category', 'Note', 'Amount']],
        body: tableData,
        startY: 40,
      });

      doc.save(`SpendWise-${selectedMonth}.pdf`);
      addToast({ type: 'success', message: 'PDF exported! 📄' });
    } catch {
      addToast({ type: 'error', message: 'Export failed. Please try again.' });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) return null;

  return (
    <div className="pt-6 pb-6 w-full max-w-5xl mx-auto px-4 md:px-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-[var(--text-primary)]">Settings</h1>
        <ThemeToggle />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="flex flex-col gap-4">
          {/* Profile */}
          <Card padding="md" className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {user?.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="w-6 h-6 text-violet-600" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">{user?.displayName ?? 'User'}</p>
                  <p className="text-sm text-[var(--text-secondary)]">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditProfileOpen(true)}
                className="p-2 rounded-xl shadow-[var(--shadow-3d-button)] hover:shadow-[var(--shadow-3d-button-active)] text-[var(--text-secondary)] transition-all"
                aria-label="Edit Profile"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          </Card>

          <SharedBudgetCard />
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4">
          {/* Budget Setting */}
          <Card padding="md">
            <h2 className="text-base font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-violet-600" />
              Monthly Budget
            </h2>
            <form onSubmit={handleSubmit(handleBudgetUpdate)} className="space-y-3">
              <Input
                prefix={CURRENCY_SYMBOL}
                type="number"
                inputMode="numeric"
                placeholder={String(budget?.budgetAmount ?? 15000)}
                {...register('budgetAmount', { valueAsNumber: true })}
                error={errors.budgetAmount?.message}
                aria-label="Monthly budget amount"
              />
              <Button type="submit" variant="secondary" fullWidth isLoading={isSubmitting} disabled={isBudgetUnchanged}>
                Update Overall Budget
              </Button>
            </form>
            
            <div className="mt-4 pt-4 border-t border-[var(--surface-secondary)]">
              <Button 
                variant="outline" 
                fullWidth 
                onClick={() => setIsCategoryBudgetsOpen(true)}
                className="flex items-center justify-center gap-2"
              >
                <PieChart className="w-4 h-4" />
                Set Category Budgets
              </Button>
            </div>
          </Card>

          {/* Export */}
          <Card padding="md">
            <h2 className="text-base font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <FileDown className="w-5 h-5 text-violet-600" />
              Export Data
            </h2>
            <Button
              variant="outline"
              fullWidth
              onClick={handleExportPDF}
              isLoading={isExporting}
              className="border-violet-500 text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-500/10 shadow-[0_0_15px_rgba(139,92,246,0.2)] dark:text-violet-400"
              id="export-pdf-btn"
            >
              Export as PDF ({formattedMonth})
            </Button>
          </Card>

          {/* Sign Out */}
          <Button
            variant="danger"
            fullWidth
            size="lg"
            onClick={handleSignOut}
            isLoading={isSigningOut}
            id="sign-out-btn"
            className="mt-auto"
          >
            <LogOut className="w-5 h-5" aria-hidden="true" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Edit Profile Bottom Sheet */}
      <BottomSheet
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        title="Edit Profile"
      >
        <EditProfileForm onSuccess={() => setIsEditProfileOpen(false)} />
      </BottomSheet>
      
      {/* Category Budgets Bottom Sheet */}
      <BottomSheet
        isOpen={isCategoryBudgetsOpen}
        onClose={() => setIsCategoryBudgetsOpen(false)}
        title="Category Budgets"
      >
        <CategoryBudgetsSheet onClose={() => setIsCategoryBudgetsOpen(false)} />
      </BottomSheet>
    </div>
  );
}
