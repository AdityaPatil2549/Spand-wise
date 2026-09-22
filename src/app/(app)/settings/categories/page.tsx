'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { CategoryManager } from '@/components/features/settings/CategoryManager';

export default function CategoriesPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full bg-theme-base animate-fade-in relative z-10">
      <header className="flex-none px-4 py-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-xl hover:bg-theme-surface transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-theme-primary" />
          </button>
          <h1 className="text-2xl font-bold font-headline text-theme-primary">Manage Categories</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-20 custom-scrollbar">
        <div className="max-w-3xl mx-auto bg-theme-surface p-6 rounded-3xl border border-theme-border shadow-sm">
          <p className="text-theme-secondary text-sm mb-6">
            Create custom categories to organize your transactions exactly how you want.
          </p>
          <CategoryManager />
        </div>
      </main>
    </div>
  );
}
