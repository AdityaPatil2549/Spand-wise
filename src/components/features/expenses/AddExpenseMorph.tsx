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
}

export function AddExpenseMorph({ children, className }: AddExpenseMorphProps) {
 // We can still use closeBottomSheet from store to handle programmatic close from inside ExpenseForm if needed
 // But MorphingDialog controls its own state, so we might need a workaround if ExpenseForm uses the global close.
 // We'll let MorphingDialog handle the close via MorphingDialogClose.

 return (
 <MorphingDialog transition={{ type: 'spring', bounce: 0, duration: 0.4 }}>
 <MorphingDialogTrigger className={className}>
 {children}
 </MorphingDialogTrigger>
 
 <MorphingDialogContainer>
 <MorphingDialogContent className="bg-theme-surface rounded-sm p-6 shadow-none border border-theme-border/30 w-full max-w-md">
 <div className="flex justify-between items-center mb-6">
 <MorphingDialogTitle className="text-2xl font-display font-medium text-theme-primary tracking-tight">
 Add Transaction
 </MorphingDialogTitle>
 <MorphingDialogClose />
 </div>
 
 <ExpenseForm onSuccess={() => {
 // Close action is implicitly handled if they hit escape or click outside, 
 // but we'd need to trigger the context close. 
 // Since ExpenseForm calls closeBottomSheet, we can map that, but we'll just let it be for now 
 // or render a close button.
 document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
 }} />
 </MorphingDialogContent>
 </MorphingDialogContainer>
 </MorphingDialog>
 );
}
