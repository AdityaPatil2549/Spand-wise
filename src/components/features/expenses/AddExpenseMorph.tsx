'use client';

import React from 'react';
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogTitle,
  MorphingDialogClose,
} from '@/components/ui/motion/morphing-dialog';
import { ExpenseForm } from '@/components/expense/ExpenseForm';
import { useStore } from '@/store';

interface AddExpenseMorphProps {
  children: React.ReactNode;
  className?: string;
  transactionType?: 'expense' | 'income';
}

export function AddExpenseMorph({ children, className, transactionType = 'expense' }: AddExpenseMorphProps) {
  const isIncome = transactionType === 'income';
  const title = isIncome ? 'Add Income' : 'Add Expense';

  return (
    <MorphingDialog transition={{ type: 'spring', bounce: 0, duration: 0.4 }}>
      <MorphingDialogTrigger className={className}>
        {children}
      </MorphingDialogTrigger>
      
      <MorphingDialogContainer>
        <MorphingDialogContent className="bg-theme-white rounded-3xl p-6 shadow-2xl w-full max-w-md border border-theme-border/30">
          <div className="flex justify-between items-center mb-6">
            <MorphingDialogTitle className="text-2xl font-display font-medium text-theme-primary">
              {title}
            </MorphingDialogTitle>
            <MorphingDialogClose />
          </div>
          
          <ExpenseForm
            transactionType={transactionType}
            onSuccess={() => {
              document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
            }}
          />
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}
