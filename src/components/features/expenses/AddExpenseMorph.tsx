'use client';

import React from 'react';
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogTitle,
  MorphingDialogClose,
  useMorphingDialog,
} from '@/components/ui/motion/morphing-dialog';
import { ExpenseForm } from '@/components/features/expenses/ExpenseForm';

interface AddExpenseMorphProps {
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

function AddExpenseFormWithClose() {
  const { setIsOpen } = useMorphingDialog();
  return <ExpenseForm onSuccess={() => setIsOpen(false)} />;
}

export function AddExpenseMorph({ children, className, ariaLabel }: AddExpenseMorphProps) {
  return (
    <MorphingDialog transition={{ type: 'spring', bounce: 0, duration: 0.4 }}>
      <MorphingDialogTrigger className={className} ariaLabel={ariaLabel}>
        {children}
      </MorphingDialogTrigger>

      <MorphingDialogContainer>
        <MorphingDialogContent className="bg-theme-surface rounded-3xl p-6 shadow-2xl w-full max-w-md border border-theme-border/60">
          <div className="flex justify-between items-center mb-6">
            <MorphingDialogTitle className="text-2xl font-display font-medium text-theme-primary">
              Add Transaction
            </MorphingDialogTitle>
            <MorphingDialogClose />
          </div>

          <AddExpenseFormWithClose />
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}
