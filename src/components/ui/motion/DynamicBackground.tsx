'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store';

export function DynamicBackground() {
  const budget = useStore((s) => s.budget);

  const totalSpent = budget?.totalSpent || 0;
  const budgetAmount = budget?.budgetAmount || 1;
  const ratio = totalSpent / budgetAmount;

  // Determine colors based on spend ratio (works best in dark mode, but ok in light)
  let color1 = '#7c3aed'; // violet
  let color2 = '#4f46e5'; // indigo
  let color3 = '#0ea5e9'; // sky
  
  if (ratio > 1) {
    color1 = '#e11d48'; // rose
    color2 = '#be123c'; // dark rose
    color3 = '#f43f5e'; // light rose
  } else if (ratio > 0.8) {
    color1 = '#ea580c'; // orange
    color2 = '#c2410c'; // dark orange
    color3 = '#f97316'; // light orange
  } else if (ratio < 0.3) {
    color1 = '#059669'; // emerald
    color2 = '#047857'; // dark emerald
    color3 = '#10b981'; // light emerald
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-theme-base transition-colors duration-1000">
      <motion.div
        initial={false}
        animate={{
          background: `radial-gradient(circle at 50% 50%, ${color1} 0%, transparent 60%), 
                       radial-gradient(circle at 100% 0%, ${color2} 0%, transparent 50%),
                       radial-gradient(circle at 0% 100%, ${color3} 0%, transparent 50%)`
        }}
        transition={{ duration: 2, ease: "easeInOut" }}
        className="absolute inset-0 opacity-10 dark:opacity-20 mix-blend-screen"
      />
      <motion.div
        initial={false}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, 0],
          x: [0, 30, 0],
          y: [0, -30, 0]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear"
        }}
        className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] md:w-[40vw] md:h-[40vw] rounded-full blur-[120px]"
        style={{
          background: `radial-gradient(circle, ${color1} 0%, transparent 70%)`,
          opacity: 0.2
        }}
      />
      <motion.div
        initial={false}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, -5, 0],
          x: [0, -40, 0],
          y: [0, 40, 0]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear"
        }}
        className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] md:w-[35vw] md:h-[35vw] rounded-full blur-[120px]"
        style={{
          background: `radial-gradient(circle, ${color3} 0%, transparent 70%)`,
          opacity: 0.15
        }}
      />
    </div>
  );
}
