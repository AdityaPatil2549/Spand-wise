'use client';

import { Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10" />;
  }

  return (
    <div
      className="flex items-center justify-between w-full p-4 bg-[#faf5ee] rounded-xl shadow-sm border border-[#d8d0c8]/50"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
          <Sun className="w-5 h-5" />
        </div>
        <div className="flex flex-col text-left">
          <span className="font-semibold text-[#3a302a]">
            Light Mode
          </span>
          <span className="text-xs text-[#78706a]">
            Earthy theme active
          </span>
        </div>
      </div>
      
      {/* Custom toggle switch (disabled/locked state) */}
      <div className="w-12 h-6 rounded-full p-1 bg-gray-200 opacity-50 cursor-not-allowed">
        <div className="w-4 h-4 bg-white rounded-full shadow-md transform translate-x-0" />
      </div>
    </div>
  );
};
