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
import type { ExpenseDocument } from '@/types/firestore';

interface EditExpenseMorphProps {
  children: React.ReactNode;
  expense: ExpenseDocument;
  className?: string;
}

export function EditExpenseMorph({ children, expense, className }: EditExpenseMorphProps) {
  return (
    <MorphingDialog transition={{ type: 'spring', bounce: 0, duration: 0.4 }}>
      <MorphingDialogTrigger className={className}>
        {children}
      </MorphingDialogTrigger>
      
      <MorphingDialogContainer>
        <MorphingDialogContent className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-6 shadow-2xl w-full max-w-md border border-[#d8d0c8]/30">
          <div className="flex justify-between items-center mb-6">
            <MorphingDialogTitle className="text-2xl font-display font-medium text-[#3a302a] dark:text-[#f4ede4]">
              Edit Transaction
            </MorphingDialogTitle>
            <MorphingDialogClose />
          </div>
          
          <ExpenseForm 
            editingExpense={expense}
            onSuccess={() => {
               document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
            }} 
          />
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}
