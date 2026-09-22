'use client';

import React, { useState } from 'react';
import { useAuthGuard } from '@/hooks/useAuth';
import { useStore } from '@/store';
import { signOut } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import { 
  Settings as SettingsIcon, 
  LogOut, 
  Users, 
  Star, 
  MessageSquare, 
  HelpCircle, 
  Info,
  Calendar,
  LayoutGrid,
  List,
  Crown,
  Hash,
  Download,
  Palette,
  CalendarRange
} from 'lucide-react';
import { ThemeSelector } from '@/components/shared/ThemeSelector';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { CategoryBudgetsSheet } from '@/components/features/budget/CategoryBudgetsSheet';

export default function MorePage() {
  const { user, isLoading } = useAuthGuard();
  const router = useRouter();
  const addToast = useStore((s) => s.addToast);
  const expenses = useStore((s) => s.expenses);
  const categories = useStore((s) => s.categories);
  const [isThemesExpanded, setIsThemesExpanded] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch {
      addToast({ type: 'error', message: 'Sign out failed.' });
    }
  };

  if (isLoading) return null;

  return (
    <div className="bg-theme-base text-theme-primary flex flex-col min-h-screen font-body w-full pb-32">
      <div className="px-6 md:px-8 pt-24 pb-8 md:max-w-4xl md:mx-auto w-full flex-1">
        
        {/* Profile Section */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-theme-accent/20 flex items-center justify-center text-theme-accent text-2xl font-bold shadow-sm">
            {user?.displayName ? user.displayName[0].toUpperCase() : 'U'}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-theme-primary">{user?.displayName || 'User'}</h1>
            <p className="text-theme-secondary text-sm">{user?.email}</p>
          </div>
        </div>

        {/* Backup Warning Section */}
        <div className="bg-theme-surface border border-theme-border rounded-2xl p-4 flex items-center justify-between mb-8 shadow-sm">
          <div className="flex items-center gap-3 text-theme-primary">
            <Download className="w-5 h-5 text-indigo-500" />
            <span className="font-medium text-sm">Download your data</span>
          </div>
          <button onClick={() => router.push('/settings/export')} className="text-sm font-bold text-indigo-500 hover:text-indigo-600 transition-colors">
            Download
          </button>
        </div>

        {/* Top Actions Grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <button 
            onClick={() => router.push('/tags')}
            className="bg-theme-surface border border-theme-border rounded-2xl p-3 flex flex-col items-center justify-center gap-2 hover:bg-theme-elevated transition-colors"
          >
            <Hash className="w-5 h-5 text-indigo-400" />
            <span className="font-medium text-[10px] sm:text-xs">Tags</span>
          </button>
          <button 
            onClick={() => router.push('/transactions')}
            className="bg-theme-surface border border-theme-border rounded-2xl p-3 flex flex-col items-center justify-center gap-2 hover:bg-theme-elevated transition-colors"
          >
            <List className="w-5 h-5 text-indigo-400" />
            <span className="font-medium text-[10px] sm:text-xs">History</span>
          </button>
          <button 
            onClick={() => router.push('/scheduled')}
            className="bg-theme-surface border border-theme-border rounded-2xl p-3 flex flex-col items-center justify-center gap-2 hover:bg-theme-elevated transition-colors"
          >
            <Calendar className="w-5 h-5 text-indigo-400" />
            <span className="font-medium text-[10px] sm:text-xs">Scheduled</span>
          </button>
        </div>

        {/* Views Section */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-theme-secondary mb-4 uppercase tracking-wider">Views</h2>
          <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={() => router.push('/day')}
              className="bg-theme-surface border border-theme-border rounded-2xl py-4 flex flex-col items-center gap-2 hover:bg-theme-elevated transition-colors"
            >
              <List className="w-5 h-5 text-theme-primary" />
              <span className="text-xs font-medium text-theme-primary">Day</span>
            </button>
            <button 
              onClick={() => router.push('/calendar')}
              className="bg-theme-surface border border-theme-border rounded-2xl py-4 flex flex-col items-center gap-2 hover:bg-theme-elevated transition-colors"
            >
              <Calendar className="w-5 h-5 text-theme-primary" />
              <span className="text-xs font-medium text-theme-primary">Calendar</span>
            </button>
            <button 
              onClick={() => router.push('/custom')}
              className="bg-theme-surface border border-theme-border rounded-2xl py-4 flex flex-col items-center gap-2 hover:bg-theme-elevated transition-colors"
            >
              <CalendarRange className="w-5 h-5 text-theme-primary" />
              <span className="text-xs font-medium text-theme-primary text-center leading-tight">Date<br/>Range</span>
            </button>
          </div>
        </div>



        {/* More Options List */}
        <div>
          <h2 className="text-sm font-semibold text-theme-secondary mb-4 uppercase tracking-wider">More options</h2>
          <div className="space-y-1">
            <button 
              onClick={() => setIsThemesExpanded(!isThemesExpanded)} 
              className="w-full flex items-center justify-between p-4 hover:bg-theme-surface rounded-2xl transition-colors group"
            >
              <div className="flex items-center gap-4 text-theme-primary">
                <Palette className="w-5 h-5 text-theme-secondary group-hover:text-theme-primary transition-colors" />
                <span className="font-medium">Theme</span>
              </div>
              <ChevronRightIcon className={`transition-transform duration-300 ${isThemesExpanded ? 'rotate-90' : ''}`} />
            </button>

            {isThemesExpanded && (
              <div className="p-4 bg-theme-surface/30 rounded-2xl mb-2 animate-fade-in">
                <ThemeSelector />
              </div>
            )}

            <button 
              onClick={() => router.push('/settings/categories')} 
              className="w-full flex items-center justify-between p-4 hover:bg-theme-surface rounded-2xl transition-colors group"
            >
              <div className="flex items-center gap-4 text-theme-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-theme-secondary group-hover:text-theme-primary transition-colors"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                <span className="font-medium">Manage Categories</span>
              </div>
              <ChevronRightIcon className={`transition-transform duration-300`} />
            </button>

            <button 
              onClick={() => router.push('/settings/limits')} 
              className="w-full flex items-center justify-between p-4 hover:bg-theme-surface rounded-2xl transition-colors group"
            >
              <div className="flex items-center gap-4 text-theme-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-theme-secondary group-hover:text-theme-primary transition-colors"><line x1="4" x2="20" y1="21" y2="21"/><line x1="4" x2="20" y1="14" y2="14"/><line x1="4" x2="20" y1="7" y2="7"/><polyline points="14 11 18 7 22 11"/><polyline points="2 18 6 14 10 18"/></svg>
                <span className="font-medium">Adjust Category Limits</span>
              </div>
              <ChevronRightIcon className={`transition-transform duration-300`} />
            </button>
            
            <div className="h-px bg-theme-border my-2"></div>
            
            <button 
              onClick={async () => {
                const { getAuth, signOut } = await import('firebase/auth');
                const auth = getAuth();
                await signOut(auth);
                const { useStore } = await import('@/store');
                useStore.getState().setUser(null);
                useStore.getState().setHouseholdId(null);
                window.location.href = '/login';
              }}
              className="w-full flex items-center justify-between p-4 hover:bg-theme-danger/10 rounded-2xl transition-colors group mt-4"
            >
              <div className="flex items-center gap-4 text-theme-danger">
                <LogOut className="w-5 h-5 group-hover:text-theme-danger transition-colors" />
                <span className="font-medium">Sign out</span>
              </div>
              <ChevronRightIcon className="text-theme-danger opacity-50" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

const ChevronRightIcon = ({ className = "text-theme-secondary opacity-50" }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={`w-5 h-5 ${className}`}
  >
    <path d="m9 18 6-6-6-6"/>
  </svg>
);
