'use client';

import React from 'react';
import Link from 'next/link';
import { 
  PiggyBank, 
  Calendar, 
  Repeat, 
  SlidersHorizontal, 
  Hash, 
  Download, 
  CalendarRange, 
  Palette, 
  ArrowRight,
  Sparkles,
  Target,
  Users,
  Smartphone
} from 'lucide-react';
import { TextEffect } from '@/components/ui/motion/text-effect';
import { useStore } from '@/store';
import { formatCurrency } from '@/lib/utils';
import { useMobileInstall } from '@/hooks/useMobileInstall';

interface ToolCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  iconColor: string;
  iconBg: string;
  stat?: string;
}

const ToolCard = ({
  title,
  description,
  href,
  icon: Icon,
  badge,
  iconColor,
  iconBg,
  stat
}: ToolCardProps) => (
  <Link
    href={href}
    className="group glass-panel p-5 sm:p-6 rounded-3xl border border-theme-border/40 hover:border-theme-accent/40 bg-theme-surface/40 hover:bg-theme-surface/80 transition-all duration-200 flex flex-col justify-between hover-elevate active:scale-[0.99] relative overflow-hidden"
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-2xl ${iconBg} ${iconColor} flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shadow-sm`}>
        <Icon className="w-6 h-6 stroke-[2]" />
      </div>
      {badge && (
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-theme-accent/15 text-theme-accent border border-theme-accent/25">
          {badge}
        </span>
      )}
    </div>

    <div>
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-headline font-bold text-lg text-theme-primary group-hover:text-theme-accent transition-colors">
          {title}
        </h3>
        <ArrowRight className="w-4 h-4 text-theme-tertiary group-hover:text-theme-accent group-hover:translate-x-1 transition-all" />
      </div>
      <p className="text-xs sm:text-sm text-theme-secondary leading-relaxed mb-3">
        {description}
      </p>

      {stat && (
        <div className="pt-3 border-t border-theme-border/20 text-xs font-semibold text-theme-primary flex items-center justify-between">
          <span className="text-theme-tertiary font-normal">Current:</span>
          <span>{stat}</span>
        </div>
      )}
    </div>
  </Link>
);

export default function MoreToolsPage() {
  const accounts = useStore((s) => s.accounts);
  const budget = useStore((s) => s.budget);
  const goals = useStore((s) => s.goals);
  const { isStandalone, openDownloadSheet } = useMobileInstall();
  const totalBalance = accounts.reduce((acc, a) => acc + (a.balance || 0), 0);

  const PRIMARY_TOOLS: ToolCardProps[] = [
    {
      title: 'Savings & Accounts',
      description: 'Manage persistent cash reserves and UPI balances across your lifetime funds.',
      href: '/accounts',
      icon: PiggyBank,
      badge: 'Cumulative',
      iconColor: 'text-emerald-500',
      iconBg: 'bg-emerald-500/10',
      stat: `${formatCurrency(totalBalance)} Total Reserve`
    },
    {
      title: 'Savings Goals',
      description: 'Track student savings targets, textbook funds, and semester milestones.',
      href: '/goals',
      icon: Target,
      badge: 'Milestones',
      iconColor: 'text-theme-accent',
      iconBg: 'bg-theme-accent/10',
      stat: `${goals?.length || 0} Active Goals`
    },
    {
      title: 'Split Expense',
      description: 'Divide shared hostel food, flat rent, or utilities. Generate WhatsApp summary & log your share.',
      href: '/split',
      icon: Users,
      badge: 'Roommates',
      iconColor: 'text-cyan-500',
      iconBg: 'bg-cyan-500/10'
    },
    {
      title: 'Expense Calendar',
      description: 'Track daily transactions, pay dates, and month spending patterns on a calendar.',
      href: '/calendar',
      icon: Calendar,
      badge: 'Interactive',
      iconColor: 'text-indigo-500',
      iconBg: 'bg-indigo-500/10'
    },
    {
      title: 'Recurring Bills',
      description: 'Automate upcoming subscriptions, rent, college fees, and recurring dues.',
      href: '/scheduled',
      icon: Repeat,
      badge: 'Automated',
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-500/10'
    },
    {
      title: 'Budget Limits',
      description: 'Set and adjust monthly spend caps for specific categories like Food and Shopping.',
      href: '/settings/limits',
      icon: SlidersHorizontal,
      badge: 'Cap Control',
      iconColor: 'text-rose-500',
      iconBg: 'bg-rose-500/10',
      stat: `${formatCurrency(budget?.budgetAmount || 0)} Total Budget`
    }
  ];

  const SECONDARY_TOOLS: ToolCardProps[] = [
    {
      title: 'Tags & Labels',
      description: 'Create custom labels to track special events, hostel trips, and projects.',
      href: '/tags',
      icon: Hash,
      iconColor: 'text-purple-500',
      iconBg: 'bg-purple-500/10'
    },
    {
      title: 'Export & Reports',
      description: 'Export all your spending history to Excel spreadsheets, CSVs, or print-ready PDF.',
      href: '/settings/export',
      icon: Download,
      iconColor: 'text-cyan-500',
      iconBg: 'bg-cyan-500/10'
    },
    {
      title: 'Custom Date Range',
      description: 'Filter and inspect financial transactions across any custom date interval.',
      href: '/custom',
      icon: CalendarRange,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-500/10'
    },
    {
      title: 'Themes & Studio',
      description: 'Explore all 20 distinct theme signatures, 60-30-10 color ratios, and typography pairings.',
      href: '/settings',
      icon: Palette,
      iconColor: 'text-pink-500',
      iconBg: 'bg-pink-500/10'
    }
  ];

  return (
    <div className="w-full">
      <div className="flex-1 w-full px-4 sm:px-6 pt-4 sm:pt-6 pb-32 md:pb-12 max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-theme-accent/10 text-theme-accent text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Workspace &amp; Tools</span>
          </div>
          <TextEffect as="h1" preset="fade" className="font-display text-2xl sm:text-3xl md:text-4xl font-bold leading-tight tracking-tight text-theme-primary mb-1.5">
            More Tools &amp; Accounts
          </TextEffect>
          <TextEffect as="p" preset="fade" className="text-sm sm:text-base text-theme-secondary max-w-2xl">
            Manage wallets, roommate bill splits, savings goals, recurring subscriptions, and appearance settings.
          </TextEffect>
        </div>

        {/* Smartphone-Only App Download / Offline Access Spotlight */}
        {!isStandalone && (
          <div className="mb-6 glass-panel p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-theme-accent/15 via-theme-surface to-theme-base border border-theme-accent/40 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-theme-accent text-theme-on-accent flex items-center justify-center shrink-0 shadow-md">
                <Download className="w-6 h-6 stroke-[2.4]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-headline font-bold text-base text-theme-primary">
                    Install SpendWise on Phone
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-theme-positive/15 text-theme-positive border border-theme-positive/20">
                    100% Offline
                  </span>
                </div>
                <p className="text-xs text-theme-secondary mt-0.5 max-w-xl">
                  Download SpendWise directly onto your smartphone home screen. Track spends in Airplane Mode with zero latency and automatic cloud sync.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openDownloadSheet}
              className="px-4 py-2.5 rounded-xl bg-theme-accent hover:bg-theme-accent-hover text-theme-on-accent text-xs font-bold shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer shrink-0 self-stretch sm:self-auto justify-center"
            >
              <Smartphone className="w-4 h-4 stroke-[2.2]" />
              <span>Download App</span>
            </button>
          </div>
        )}

        <section className="mb-8">
          <h2 className="text-xs font-bold text-theme-tertiary uppercase tracking-wider mb-3 px-1">
            Core Financial Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {PRIMARY_TOOLS.map((tool) => (
              <ToolCard key={tool.title} {...tool} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xs font-bold text-theme-tertiary uppercase tracking-wider mb-3 px-1">
            Data, Views &amp; Customization
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {SECONDARY_TOOLS.map((tool) => (
              <ToolCard key={tool.title} {...tool} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
