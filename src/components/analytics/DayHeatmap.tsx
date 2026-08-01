'use client';

import { useMemo } from 'react';
import { useStore } from '@/store';
import { formatCurrency } from '@/lib/utils/format';

export const DayHeatmap = () => {
  const expenses = useStore((s) => s.expenses);
  const selectedMonth = useStore((s) => s.selectedMonth); // "YYYY-MM"

  const { calendarDays, maxSpent } = useMemo(() => {
    if (!selectedMonth) return { calendarDays: [], maxSpent: 0 };
    const [year, month] = selectedMonth.split('-').map(Number);
    
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDay = new Date(year, month - 1, 1).getDay(); // 0 = Sun, 1 = Mon...
    
    // Group expenses by day
    const spendingByDay = new Map<number, number>();
    for (const exp of expenses) {
      const date = exp.date.toDate();
      const day = date.getDate();
      spendingByDay.set(day, (spendingByDay.get(day) || 0) + exp.amount);
    }
    
    const maxSpent = Math.max(0, ...Array.from(spendingByDay.values()));
    
    const calendarDays = [];
    
    // Add empty slots for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(null);
    }
    
    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push({
        day: i,
        spent: spendingByDay.get(i) || 0,
      });
    }
    
    return { calendarDays, maxSpent };
  }, [expenses, selectedMonth]);

  if (calendarDays.length === 0) return null;

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={i} className="text-center text-[10px] font-bold text-[var(--text-tertiary)]">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {calendarDays.map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }
          
          // Calculate opacity based on spending intensity
          let opacity = 0.05; // Base color for zero spend
          if (date.spent > 0) {
            // Map to range 0.3 - 1.0
            opacity = 0.3 + (date.spent / maxSpent) * 0.7;
          }
          
          return (
            <div 
              key={date.day}
              title={`${selectedMonth}-${String(date.day).padStart(2, '0')}: ${date.spent > 0 ? formatCurrency(date.spent) : 'No spending'}`}
              className="aspect-square rounded-md transition-opacity duration-200"
              style={{ 
                backgroundColor: date.spent > 0 ? 'var(--color-primary)' : 'var(--surface-secondary)',
                opacity: date.spent > 0 ? opacity : 1 
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
