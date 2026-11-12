'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/store';
import { Hash } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { ExpenseList } from '@/components/features/expenses/ExpenseList';
import { useHydrated } from '@/hooks/useHydrated';
import { CURRENCY_SYMBOL } from '@/config/constants';
import type { ExpenseDocument } from '@/types/firestore';

export default function TagsPage() {
  const isHydrated = useHydrated();
  const expenses = useStore((s) => s.expenses);
  const openBottomSheetGlobal = useStore((s) => s.openBottomSheet);
  
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract tags from all expenses
  const tagsData = useMemo(() => {
    const map = new Map<string, { total: number; count: number; items: ExpenseDocument[] }>();
    
    expenses.forEach(expense => {
      if (!expense.note) return;
      const tags = expense.note.match(/#[\w-]+/g) || [];
      const uniqueTags = Array.from(new Set(tags.map(t => t.toLowerCase()))); // Deduplicate tags within the same expense
      
      uniqueTags.forEach(tag => {
        const existing = map.get(tag) || { total: 0, count: 0, items: [] };
        existing.total += expense.amount;
        existing.count += 1;
        existing.items.push(expense);
        map.set(tag, existing);
      });
    });

    return Array.from(map.entries())
      .map(([tag, data]) => ({ tag, ...data }))
      .sort((a, b) => b.total - a.total); // Sort by highest spend
  }, [expenses]);

  if (!isHydrated) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-theme-border border-t-theme-accent animate-spin" />
      </div>
    );
  }

  const selectedTagExpenses = selectedTag ? tagsData.find(t => t.tag === selectedTag)?.items || [] : [];

  return (
    <div className="min-h-screen pb-32 animate-fade-in">
      <div className="px-4 py-6 md:px-8 max-w-4xl mx-auto">
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-theme-primary flex items-center gap-2.5 tracking-tight font-sans">
            <div className="w-8 h-8 rounded-xl bg-theme-accent/10 flex items-center justify-center text-theme-accent">
              <Hash className="w-4 h-4 stroke-[2.2]" />
            </div>
            Tags Overview
          </h1>
          <p className="text-xs text-theme-secondary mt-1">
            Hashtags added in notes (e.g. #trip, #birthday) are automatically aggregated here.
          </p>
        </div>

        {tagsData.length === 0 ? (
          <div className="text-center py-12 bg-theme-surface/70 border border-theme-border/60 rounded-3xl p-8 shadow-sm">
            <Hash className="w-10 h-10 text-theme-tertiary mx-auto mb-3" />
            <h3 className="text-base font-semibold text-theme-primary mb-1">No tags found</h3>
            <p className="text-theme-secondary text-xs max-w-sm mx-auto">
              Add a hashtag in any expense note (e.g. &ldquo;Dinner #canteen&rdquo;) to automatically track grouped spends here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {tagsData.map((data) => (
              <div 
                key={data.tag}
                onClick={() => setSelectedTag(data.tag)}
                className="bg-theme-surface/70 border border-theme-border/60 rounded-2xl p-5 cursor-pointer hover:border-theme-accent/50 hover:bg-theme-surface transition-all active:scale-[0.98] group shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-theme-accent/15 text-theme-accent font-semibold text-xs border border-theme-accent/20">
                    {data.tag}
                  </div>
                  <span className="text-[11px] font-semibold text-theme-secondary bg-theme-base/80 border border-theme-border/40 px-2 py-0.5 rounded-md">
                    {data.count} txns
                  </span>
                </div>
                <div className="text-2xl font-bold text-theme-primary tracking-tight font-mono tabular-nums">
                  {CURRENCY_SYMBOL}&nbsp;{data.total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      <BottomSheet
        isOpen={!!selectedTag}
        onClose={() => setSelectedTag(null)}
        title={`Expenses for ${selectedTag}`}
      >
        <div className="pb-8">
          <ExpenseList 
            onEditExpense={(expense) => {
              setSelectedTag(null);
              openBottomSheetGlobal({ editingExpenseId: expense.id, initialCategoryId: expense.categoryId });
            }} 
            expenses={selectedTagExpenses}
          />
        </div>
      </BottomSheet>
    </div>
  );
}
