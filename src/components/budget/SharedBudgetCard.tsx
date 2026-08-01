'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Users, Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useStore } from '@/store';
import { joinHousehold } from '@/lib/firebase/auth';

const joinSchema = z.object({
  householdId: z.string().min(5, 'Invalid household ID'),
});

type JoinForm = z.infer<typeof joinSchema>;

export const SharedBudgetCard = () => {
  const user = useStore((s) => s.user);
  const householdId = useStore((s) => s.householdId);
  const addToast = useStore((s) => s.addToast);
  const setHouseholdId = useStore((s) => s.setHouseholdId);
  const [isCopied, setIsCopied] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<JoinForm>({
    resolver: zodResolver(joinSchema),
  });

  const handleCopyId = () => {
    if (!householdId) return;
    navigator.clipboard.writeText(householdId);
    setIsCopied(true);
    addToast({ type: 'success', message: 'Household ID copied!' });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const onJoin = async (data: JoinForm) => {
    if (!user) return;
    if (data.householdId === householdId) {
      addToast({ type: 'error', message: 'You are already in this household.' });
      return;
    }
    
    try {
      await joinHousehold(user.uid, data.householdId);
      setHouseholdId(data.householdId);
      addToast({ type: 'success', message: 'Successfully joined household! 🎉' });
      reset();
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'household-not-found') {
        addToast({ type: 'error', message: 'Household not found. Please check the ID.' });
      } else {
        addToast({ type: 'error', message: 'Failed to join household.' });
      }
    }
  };

  return (
    <div className="bg-[var(--surface-primary)] rounded-2xl p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3 mb-4">
         <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
           <Users className="w-5 h-5 text-violet-600" />
         </div>
         <div>
           <h3 className="font-bold text-[var(--text-primary)]">Shared Budget</h3>
           <p className="text-xs text-[var(--text-secondary)]">Collaborate with family</p>
         </div>
      </div>
      
      <div className="mb-5">
        <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">Your Household ID</label>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-[var(--surface-secondary)] text-[var(--text-primary)] text-sm font-mono p-3 rounded-xl overflow-hidden text-ellipsis whitespace-nowrap">
            {householdId || 'Loading...'}
          </div>
          <button 
            onClick={handleCopyId}
            disabled={!householdId}
            className="w-11 h-11 flex items-center justify-center shrink-0 bg-[var(--surface-secondary)] hover:bg-[var(--surface-tertiary)] rounded-xl transition-colors text-[var(--text-secondary)]"
            aria-label="Copy Household ID"
          >
            {isCopied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="pt-4 border-t border-[var(--surface-secondary)]">
        <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Join a Household</h4>
        <form onSubmit={handleSubmit(onJoin)} className="flex items-start gap-2">
          <div className="flex-1">
            <Input 
              placeholder="Paste ID here" 
              {...register('householdId')}
              error={errors.householdId?.message}
            />
          </div>
          <div className="shrink-0 mt-1">
            <Button type="submit" variant="secondary" isLoading={isSubmitting}>
              Join
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
