import React from 'react';
import { AnimatedNumber } from '@/components/ui/motion/animated-number';

import { Tilt } from '@/components/ui/motion/tilt';
import { Spotlight } from '@/components/ui/motion/spotlight';
import { CURRENCY_SYMBOL } from '@/config/constants';

export interface DashboardExpenseCardProps {
 id: string;
 title: string;
 amount: number;
 timeLabel: string;
 icon: string;
 iconColor?: string;
 bgGradientClass: string;
}

export function DashboardExpenseCard({
 title,
 amount,
 timeLabel,
 icon,
 iconColor,
 bgGradientClass,
}: DashboardExpenseCardProps) {
 return (
 <Tilt rotationFactor={6} isRevese>
 <div className="glass-panel rounded-2xl p-6 border border-theme-border/30 hover-elevate flex flex-col justify-between h-48 relative overflow-hidden group">
 <Spotlight className="z-10 from-white/40 via-white/10 to-transparent blur-md" size={150} />
 <div className={`absolute top-0 right-0 w-32 h-32 ${bgGradientClass} rounded-bl-full -z-10 transition-transform group-hover:scale-110`}></div>
 <div className="flex justify-between items-start relative z-20">
 <div className="p-3 bg-theme-surface rounded-xl" style={{ color: iconColor }}>
 <span className="material-symbols-outlined">{icon}</span>
 </div>
 <span className="text-[12px] tracking-[0.1em] font-bold text-theme-secondary uppercase">{timeLabel}</span>
 </div>
 <div className="relative z-20">
 <p className="text-[16px] text-theme-secondary mb-1">{title}</p>
 <p className="font-display text-[24px] font-medium text-theme-primary flex items-center gap-[1px]">
 {CURRENCY_SYMBOL}<AnimatedNumber value={Math.floor(amount)} />
 {amount % 1 !== 0 ? (amount % 1).toFixed(2).substring(1) : ''}
 </p>
 </div>
 </div>
 </Tilt>
 );
}
