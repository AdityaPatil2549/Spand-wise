'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10" />;
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex items-center justify-between w-full p-4 bg-surface-primary rounded-xl shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-[border-color,transform,box-shadow] active:scale-[0.97]"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-orange-500/10 text-orange-500'}`}>
          {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </div>
        <div className="flex flex-col text-left">
          <span className="font-semibold text-text-primary">
            {isDark ? 'Dark Mode' : 'Light Mode'}
          </span>
          <span className="text-xs text-text-secondary">
            Switch to {isDark ? 'light' : 'dark'} mode
          </span>
        </div>
      </div>
      
      {/* Custom toggle switch */}
      <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${isDark ? 'bg-primary-500' : 'bg-gray-200'}`}>
        <div 
          className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${isDark ? 'translate-x-6' : 'translate-x-0'}`}
        />
      </div>
    </button>
  );
};
