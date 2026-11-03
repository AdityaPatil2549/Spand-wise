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
  Users
} from 'lucide-react';
import { TextEffect } from '@/components/ui/motion/text-effect';
import { useStore } from '@/store';
import { CURRENCY_SYMBOL } from '@/config/constants';

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
      stat: `${CURRENCY_SYMBOL}${totalBalance.toFixed(2)} Total Reserve`
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
      stat: `${CURRENCY_SYMBOL}${budget?.budgetAmount || 0} Total Budget`
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
      title: 'Themes & Preferences',
      description: 'Personalize themes (Graphite, Sepia, Emerald), manage notifications & profile.',
      href: '/settings',
      icon: Palette,
      iconColor: 'text-pink-500',
      iconBg: 'bg-pink-500/10'
    }
  ];

  return (
    <div className="w-full">
      <main className="flex-1 w-full px-4 sm:px-6 pt-8 pb-32 md:pb-12 max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-theme-accent/10 text-theme-accent text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Workspace & Features</span>
          </div>
          <TextEffect as="h1" preset="fade" className="font-display text-3xl sm:text-4xl md:text-5xl font-medium leading-none tracking-tight text-theme-primary mb-2">
            More Tools & Accounts
          </TextEffect>
          <TextEffect as="p" preset="fade" className="text-base sm:text-lg text-theme-secondary max-w-2xl">
            Access your cumulative savings, calendar timelines, recurring bills, and budget limits all in one centralized hub.
          </TextEffect>
        </div>

        <section className="mb-10">
          <h2 className="text-xs font-bold text-theme-tertiary uppercase tracking-wider mb-4 px-1">
            Core Financial Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRIMARY_TOOLS.map((tool) => (
              <ToolCard key={tool.title} {...tool} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xs font-bold text-theme-tertiary uppercase tracking-wider mb-4 px-1">
            Data, Views & Customization
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SECONDARY_TOOLS.map((tool) => (
              <ToolCard key={tool.title} {...tool} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
