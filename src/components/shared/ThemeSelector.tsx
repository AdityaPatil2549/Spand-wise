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
  ScrollText,
  Crown,
  Terminal,
  Anchor,
  FlaskConical,
  Cpu,
  Check,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useHaptic } from '@/hooks/useHaptic';
import {
  THEME_CATALOG,
  type ThemeDefinition,
  getThemeDefinition,
} from '@/lib/themes/catalog';

const ICONS: Record<ThemeDefinition['iconKey'], React.ComponentType<{ className?: string }>> = {
  sparkles: Sparkles,
  moon: Moon,
  scroll: ScrollText,
  crown: Crown,
  terminal: Terminal,
  zap: Zap,
  anchor: Anchor,
  flask: FlaskConical,
  sun: Sun,
  leaf: Leaf,
  flower: Flower2,
  flame: Flame,
  compass: Compass,
  waves: Waves,
  tree: TreePine,
  cpu: Cpu,
  snowflake: Snowflake,
  gem: Gem,
  sunset: Sunset,
  hexagon: Hexagon,
};

export const ThemeSelector = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [modeFilter, setModeFilter] = useState<'all' | 'light' | 'dark'>('all');
  const haptic = useHaptic();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full bg-theme-surface rounded-2xl border border-theme-border/50 p-5 min-h-[200px] animate-pulse">
        <h4 className="font-semibold text-theme-primary mb-4 text-sm tracking-wide">
          Theme Studio
        </h4>
      </div>
    );
  }

  const currentThemeId = theme === 'system' ? resolvedTheme : theme;
  const activeDef = getThemeDefinition(currentThemeId);
  const filteredThemes = THEME_CATALOG.filter((t) => {
    if (modeFilter === 'light') return !t.isDark;
    if (modeFilter === 'dark') return t.isDark;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header + Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1">
        <div>
          <h4 className="font-bold text-theme-primary text-sm tracking-wide">
            Visual Identity ({THEME_CATALOG.length} Signatures)
          </h4>
          <p className="text-xs text-theme-secondary">
            Each theme has its own color ratio, font pairing, history &amp; spending psychology
          </p>
        </div>

        <div className="inline-flex items-center p-1 rounded-xl bg-theme-elevated/70 border border-theme-border/60 self-start">
          {(
            [
              { id: 'all', label: 'All (20)' },
              { id: 'light', label: 'Day (7)' },
              { id: 'dark', label: 'Night (13)' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setModeFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                modeFilter === tab.id
                  ? 'bg-theme-surface text-theme-primary shadow-sm'
                  : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active Theme Manifesto Spotlight */}
      <div className="rounded-2xl bg-theme-surface border border-theme-accent/40 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-theme-accent text-theme-on-accent">
              Active
            </span>
            <span className="font-display font-bold text-base text-theme-primary">
              {activeDef.name}
            </span>
            <span className="text-xs font-mono text-theme-secondary">
              {activeDef.displayFont} × {activeDef.bodyFont}
            </span>
          </div>
          <p className="text-xs text-theme-secondary leading-relaxed">
            <strong className="text-theme-primary">Ideology:</strong> {activeDef.ideology}
          </p>
          <p className="text-xs text-theme-secondary leading-relaxed">
            <strong className="text-theme-primary">Psychology:</strong> {activeDef.psychology}
          </p>
        </div>

        {/* 60 / 30 / 10 Swatch Bar */}
        <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center bg-theme-base px-2.5 py-2 rounded-xl border border-theme-border/60">
          <span
            className="w-5 h-5 rounded-md border border-theme-border/60"
            style={{ backgroundColor: activeDef.swatches.base }}
            title="60% Canvas"
          />
          <span
            className="w-5 h-5 rounded-md border border-theme-border/60"
            style={{ backgroundColor: activeDef.swatches.surface }}
            title="Surface"
          />
          <span
            className="w-5 h-5 rounded-md border border-theme-border/60"
            style={{ backgroundColor: activeDef.swatches.primary }}
            title="30% Ink"
          />
          <span
            className="w-5 h-5 rounded-md border border-theme-border/60"
            style={{ backgroundColor: activeDef.swatches.accent }}
            title="10% Accent"
          />
        </div>
      </div>

      {/* 20-Theme Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {filteredThemes.map((t) => {
          const Icon = ICONS[t.iconKey];
          const isActive = currentThemeId === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                haptic.light();
                setTheme(t.id);
              }}
              aria-pressed={isActive}
              className={`group flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer active:scale-[0.985] ${
                isActive
                  ? 'border-theme-accent bg-theme-accent/10 shadow-sm ring-1 ring-theme-accent/40'
                  : 'border-theme-border/60 bg-theme-surface hover:bg-theme-surface-hover hover:border-theme-border'
              }`}
            >
              <div className={`p-2.5 rounded-xl ${t.pillClass} flex-shrink-0 mt-0.5`}>
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-semibold text-sm text-theme-primary truncate">
                      {t.name}
                    </span>
                    {isActive && (
                      <Check className="w-3.5 h-3.5 text-theme-accent shrink-0" />
                    )}
                  </div>

                  {/* Mini 60-30-10 Swatch Trio */}
                  <div className="flex items-center gap-1 shrink-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/15"
                      style={{ backgroundColor: t.swatches.base }}
                    />
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/15"
                      style={{ backgroundColor: t.swatches.primary }}
                    />
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/15"
                      style={{ backgroundColor: t.swatches.accent }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-theme-base border border-theme-border/50 text-theme-secondary">
                    {t.badge}
                  </span>
                  <span className="text-[10px] font-mono text-theme-tertiary truncate">
                    {t.displayFont} + {t.bodyFont}
                  </span>
                </div>

                <p className="text-[11px] text-theme-secondary leading-snug line-clamp-2">
                  {t.psychology}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
