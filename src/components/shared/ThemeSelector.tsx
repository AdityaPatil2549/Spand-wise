'use client';

import {
  Moon,
  Sun,
  Waves,
  TreePine,
  Zap,
  Snowflake,
  Sparkles,
  Sunset,
  Hexagon,
  Leaf,
  Flower2,
  Flame,
  Compass,
  Gem,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useHaptic } from '@/hooks/useHaptic';

export interface ThemeOption {
  id: string;
  name: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}

const THEMES: ThemeOption[] = [
  {
    id: 'earthy',
    name: 'Earthy Warmth',
    badge: 'Artisan',
    icon: Sun,
    color: 'bg-amber-600/10 text-amber-600',
    description: 'Warm paper cream & cozy terracotta clay',
  },
  {
    id: 'light',
    name: 'Porcelain Luxury',
    badge: 'Minimal',
    icon: Sparkles,
    color: 'bg-zinc-900/10 text-zinc-900 dark:text-zinc-100',
    description: 'Crisp Swiss porcelain & deep obsidian slate',
  },
  {
    id: 'dark',
    name: 'Midnight',
    badge: 'Pro Dark',
    icon: Moon,
    color: 'bg-slate-800 text-slate-200',
    description: 'Deep obsidian canvas & pure titanium hairlines',
  },
  {
    id: 'matcha',
    name: 'Kyoto Matcha',
    badge: 'Zen',
    icon: Leaf,
    color: 'bg-emerald-700/10 text-emerald-700 dark:text-emerald-400',
    description: 'Ceremonial jade, bamboo & roasted kinako gold',
  },
  {
    id: 'sakura',
    name: 'Tokyo Sakura',
    badge: 'Blossom',
    icon: Flower2,
    color: 'bg-pink-500/10 text-pink-500',
    description: 'Twilight plum obsidian & luminous sakura pink',
  },
  {
    id: 'solaris',
    name: 'Solaris Amber',
    badge: 'Golden Hour',
    icon: Flame,
    color: 'bg-amber-500/10 text-amber-500',
    description: 'Warm desert dunes & radiant sunburst bronze',
  },
  {
    id: 'aurora',
    name: 'Nordic Aurora',
    badge: 'Fjord',
    icon: Compass,
    color: 'bg-teal-500/10 text-teal-400',
    description: 'Glacial fjord navy & aurora borealis teal',
  },
  {
    id: 'oled-pro',
    name: 'OLED Pro',
    badge: 'High-Tech',
    icon: Gem,
    color: 'bg-emerald-500/10 text-emerald-500',
    description: 'Pure black slate & rich emerald accents',
  },
  {
    id: 'ocean',
    name: 'Ocean Breeze',
    badge: 'Deep Sea',
    icon: Waves,
    color: 'bg-blue-500/10 text-blue-500',
    description: 'Deep marine navy & electric cyan highlights',
  },
  {
    id: 'forest',
    name: 'Pine Forest',
    badge: 'Nordic',
    icon: TreePine,
    color: 'bg-green-600/10 text-green-600 dark:text-green-400',
    description: 'Dark olive, damp moss & lime gold accents',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    badge: 'Synth',
    icon: Zap,
    color: 'bg-fuchsia-500/10 text-fuchsia-500',
    description: 'Deepest purple amethyst & electric neon magenta',
  },
  {
    id: 'arctic',
    name: 'Arctic Frost',
    badge: 'Glacial',
    icon: Snowflake,
    color: 'bg-cyan-500/10 text-cyan-500',
    description: 'Crisp snow white & frosty pale ice blue',
  },
  {
    id: 'neon-sunset',
    name: 'Neon Sunset',
    badge: 'Retro',
    icon: Sunset,
    color: 'bg-rose-500/10 text-rose-500',
    description: 'Synthwave twilight lavender & coral glow',
  },
  {
    id: 'graphite',
    name: 'Graphite',
    badge: 'Industrial',
    icon: Hexagon,
    color: 'bg-gray-500/10 text-gray-400',
    description: 'Monochromatic industrial slate & high-contrast white',
  },
];

export const ThemeSelector = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const haptic = useHaptic();

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full bg-theme-surface rounded-2xl border border-theme-border/50 p-5 min-h-[160px] animate-pulse">
        <h4 className="font-semibold text-theme-primary mb-4 text-sm tracking-wide">
          Aesthetic Themes
        </h4>
      </div>
    );
  }

  const currentTheme = theme === 'system' ? resolvedTheme : theme;

  return (
    <div className="w-full bg-theme-surface rounded-[28px] border border-theme-border/60 p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-theme-border/30">
        <div>
          <h4 className="font-extrabold text-theme-primary text-base tracking-tight font-display">
            Aesthetic Themes & Color Theory
          </h4>
          <p className="text-xs text-theme-secondary mt-0.5">
            Artisan crafted palettes calibrated for eye comfort and distinct moods
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-theme-secondary px-2.5 py-1 rounded-full bg-theme-base border border-theme-border/40">
          {THEMES.length} Palettes
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {THEMES.map((t) => {
          const isActive = currentTheme === t.id;
          const Icon = t.icon;

          return (
            <button
              key={t.id}
              onClick={() => {
                haptic.light();
                setTheme(t.id);
              }}
              type="button"
              className={`flex items-start gap-3 p-3.5 rounded-2xl transition-all border text-left cursor-pointer active:scale-[0.98] ${
                isActive
                  ? 'border-theme-accent bg-theme-accent/10 shadow-sm ring-1 ring-theme-accent/30'
                  : 'border-theme-border/40 hover:border-theme-accent/40 hover:bg-theme-elevated/70'
              }`}
            >
              <div className={`p-2.5 rounded-xl ${t.color} flex-shrink-0 mt-0.5 shadow-2xs`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`text-xs sm:text-sm font-bold truncate ${
                      isActive ? 'text-theme-accent' : 'text-theme-primary'
                    }`}
                  >
                    {t.name}
                  </span>
                  {t.badge && (
                    <span className="text-[9px] font-mono uppercase font-bold px-1.5 py-0.2 rounded-md bg-theme-base border border-theme-border/30 text-theme-secondary">
                      {t.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-theme-secondary leading-tight mt-1 line-clamp-1">
                  {t.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
