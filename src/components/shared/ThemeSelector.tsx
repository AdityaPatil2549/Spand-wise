'use client';

import { Moon, Sun, Waves, TreePine, Zap, Snowflake, Sparkles } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const THEMES = [
  { id: 'light', name: 'Earthy', icon: Sun, color: 'bg-orange-500/10 text-orange-500' },
  { id: 'dark', name: 'Midnight', icon: Moon, color: 'bg-slate-800 text-slate-200' },
  { id: 'oled-pro', name: 'OLED Pro', icon: Sparkles, color: 'bg-emerald-500/10 text-emerald-500' },
  { id: 'ocean', name: 'Ocean', icon: Waves, color: 'bg-blue-500/10 text-blue-500' },
  { id: 'forest', name: 'Forest', icon: TreePine, color: 'bg-green-500/10 text-green-500' },
  { id: 'cyberpunk', name: 'Cyberpunk', icon: Zap, color: 'bg-fuchsia-500/10 text-fuchsia-500' },
  { id: 'arctic', name: 'Arctic', icon: Snowflake, color: 'bg-cyan-500/10 text-cyan-500' },
];

export const ThemeSelector = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full bg-theme-surface rounded-xl border border-theme-border/50 p-4 min-h-[140px]">
        <h4 className="font-medium text-theme-primary mb-4">Aesthetic Theme</h4>
      </div>
    );
  }

  const currentTheme = theme === 'system' ? resolvedTheme : theme;

  return (
    <div className="w-full bg-theme-surface rounded-xl border border-theme-border/50 p-4">
      <h4 className="font-medium text-theme-primary mb-4">Aesthetic Theme</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {THEMES.map((t) => {
          const isActive = currentTheme === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all border ${
                isActive 
                  ? 'border-theme-accent bg-theme-accent/10 shadow-sm' 
                  : 'border-theme-border/30 hover:border-theme-accent/50 hover:bg-theme-elevated'
              }`}
            >
              <div className={`p-2 rounded-lg ${t.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-sm font-medium ${isActive ? 'text-theme-accent' : 'text-theme-secondary'}`}>
                {t.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
