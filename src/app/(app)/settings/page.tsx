'use client';

import React, { useState } from 'react';
import { useAuthGuard } from '@/hooks/useAuth';
import { useStore } from '@/store';
import { signOut } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import { ExpensesSidebar } from '@/components/layout/ExpensesSidebar';
import { TransitionPanel } from '@/components/ui/motion/transition-panel';
import { AnimatedBackground } from '@/components/ui/motion/animated-background';
import { TextEffect } from '@/components/ui/motion/text-effect';
import { useTheme } from 'next-themes';
import { CategoryManager } from '@/components/features/settings/CategoryManager';

export default function SettingsPage() {
  const { user, isLoading } = useAuthGuard();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const addToast = useStore((s) => s.addToast);
  const [activeTab, setActiveTab] = useState(0);

  const TABS = ['Account', 'Preferences', 'Categories', 'Export'];

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch {
      addToast({ type: 'error', message: 'Sign out failed.' });
    }
  };

  const downloadCSV = () => {
    // Need to import format from date-fns or use native
    const expensesList = useStore.getState().expenses;
    if (!expensesList || expensesList.length === 0) {
      addToast({ type: 'info', message: 'No transactions to export.' });
      return;
    }

    const headers = ['Date', 'Amount', 'Category', 'Note'];
    const rows = expensesList.map(e => [
      e.date.toDate().toLocaleDateString(),
      e.amount.toString(),
      e.categoryId,
      `"${e.note?.replace(/"/g, '""') || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `spendwise_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addToast({ type: 'success', message: 'Export generated successfully!' });
  };

  if (isLoading) return null;

  return (
    <div className="bg-[#faf5ee] text-[#3a302a] flex min-h-screen font-body w-full">
      <ExpensesSidebar />
      <main className="flex-1 md:ml-64 relative min-h-screen overflow-x-hidden w-full max-w-4xl mx-auto px-6 md:px-12 pt-8 pb-24">
        <TextEffect as="h1" preset="fade" className="font-display text-[48px] font-medium leading-none tracking-tight text-[#3a302a] mb-8">
          Settings
        </TextEffect>

        <div className="glass-panel p-8 rounded-3xl border border-[#d8d0c8]/30 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#c2652a]/5 rounded-full blur-3xl -z-10"></div>
          
          <div className="flex space-x-2 mb-8 bg-[#eae2da]/50 p-1.5 rounded-xl w-fit">
            <AnimatedBackground
              defaultValue={TABS[0]}
              className="rounded-lg bg-[#ffffff] shadow-sm"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
            >
              {TABS.map((tab, index) => (
                <button
                  key={tab}
                  data-id={tab}
                  onClick={() => setActiveTab(index)}
                  className={`px-6 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none ${activeTab === index ? 'text-[#3a302a]' : 'text-[#78706a] hover:text-[#3a302a]'}`}
                >
                  {tab}
                </button>
              ))}
            </AnimatedBackground>
          </div>

          <div className="relative">
            <TransitionPanel
              activeIndex={activeTab}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              variants={{
                enter: { opacity: 0, y: 10, filter: 'blur(4px)' },
                center: { opacity: 1, y: 0, filter: 'blur(0px)' },
                exit: { opacity: 0, y: -10, filter: 'blur(4px)' },
              }}
              className="w-full"
            >
              {/* Account Tab */}
              <div className="py-2">
                <h3 className="font-headline text-2xl text-[#3a302a] mb-6">Account Details</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[#78706a] mb-2 uppercase tracking-widest">Email Address</label>
                    <div className="w-full bg-[#f2ece4] px-4 py-3 rounded-xl text-[#3a302a] font-medium border border-[#d8d0c8]/50">
                      {user?.email}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#78706a] mb-2 uppercase tracking-widest">Display Name</label>
                    <div className="w-full bg-[#f2ece4] px-4 py-3 rounded-xl text-[#3a302a] font-medium border border-[#d8d0c8]/50">
                      {user?.displayName || 'Not set'}
                    </div>
                  </div>
                  <div className="pt-6 border-t border-[#d8d0c8]/30">
                    <button onClick={handleSignOut} className="px-6 py-3 bg-[#c0392b]/10 text-[#c0392b] font-medium rounded-xl hover:bg-[#c0392b]/20 transition-colors flex items-center gap-2">
                      <span className="material-symbols-outlined">logout</span>
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>

              {/* Preferences Tab */}
              <div className="py-2">
                <h3 className="font-headline text-2xl text-[#3a302a] mb-6">Preferences</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-[#f2ece4] rounded-xl border border-[#d8d0c8]/50">
                    <div>
                      <h4 className="font-medium text-[#3a302a]">Theme</h4>
                      <p className="text-sm text-[#78706a]">Choose your preferred appearance</p>
                    </div>
                    <div className="flex bg-[#e6e0d6] rounded-lg p-1">
                      <button 
                        onClick={() => setTheme('light')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${theme !== 'dark' ? 'bg-white shadow-sm text-[#3a302a]' : 'text-[#78706a]'}`}
                      >
                        Light
                      </button>
                      <button 
                        onClick={() => setTheme('dark')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${theme === 'dark' ? 'bg-white shadow-sm text-[#3a302a]' : 'text-[#78706a]'}`}
                      >
                        Dark
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[#f2ece4] rounded-xl border border-[#d8d0c8]/50">
                    <div>
                      <h4 className="font-medium text-[#3a302a]">Notifications</h4>
                      <p className="text-sm text-[#78706a]">Budget alerts and summaries</p>
                    </div>
                    <button className="w-12 h-6 bg-[#10b981] rounded-full relative transition-colors cursor-pointer">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Categories Tab */}
              <div className="py-2">
                <h3 className="font-headline text-2xl text-[#3a302a] mb-6">Manage Categories</h3>
                <CategoryManager />
              </div>

              {/* Export Tab */}
              <div className="py-2">
                <h3 className="font-headline text-2xl text-[#3a302a] mb-6">Data & Privacy</h3>
                <div className="space-y-6">
                  <div className="p-6 border border-[#c2652a]/20 bg-[#c2652a]/5 rounded-2xl flex flex-col items-start gap-4">
                    <div className="w-12 h-12 bg-[#c2652a]/10 text-[#c2652a] rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined">download</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-[#3a302a] text-lg">Export Data</h4>
                      <p className="text-[#605850] text-sm max-w-md mt-1">Download all your transaction history and budget configurations as a CSV file.</p>
                    </div>
                    <button 
                      onClick={downloadCSV}
                      className="px-6 py-2.5 bg-[#c2652a] text-white font-medium rounded-xl hover:bg-[#c2652a]/90 transition-colors shadow-sm"
                    >
                      Generate Export
                    </button>
                  </div>
                </div>
              </div>

            </TransitionPanel>
          </div>
        </div>
      </main>
    </div>
  );
}
