'use client';

import React, { useState } from 'react';
import { useStore } from '@/store';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { ExpenseList } from '@/components/features/expenses/ExpenseList';
import { useHydrated } from '@/hooks/useHydrated';
import { CURRENCY_SYMBOL } from '@/config/constants';
import { ExpenseDocument } from '@/types/firestore';

export default function CalendarPage() {
  const isHydrated = useHydrated();
  const expenses = useStore((s) => s.expenses);
  const openBottomSheetGlobal = useStore((s) => s.openBottomSheet);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  if (!isHydrated) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-theme-border border-t-theme-accent animate-spin" />
      </div>
    );
  }

  // Calculate grid days (including padding for first/last week)
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const dateFormat = "yyyy-MM-dd";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Map expenses to days
  const expensesByDay = expenses.reduce((acc, expense) => {
    const dayStr = format(expense.date.toDate(), dateFormat);
    if (!acc[dayStr]) acc[dayStr] = { total: 0, count: 0, items: [] };
    acc[dayStr].total += expense.amount;
    acc[dayStr].count += 1;
    acc[dayStr].items.push(expense);
    return acc;
  }, {} as Record<string, { total: number, count: number, items: ExpenseDocument[] }>);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const selectedDateExpenses = selectedDateStr ? expensesByDay[selectedDateStr]?.items || [] : [];

  return (
    <div className="min-h-screen pb-32 flex flex-col items-center">
      <div className="w-full max-w-4xl px-4 md:px-8 py-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-theme-primary flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-indigo-500" />
              Calendar View
            </h1>
          </div>
          <div className="flex items-center gap-4 bg-theme-surface border border-theme-border rounded-xl p-1">
            <button onClick={prevMonth} className="p-2 hover:bg-theme-elevated rounded-lg transition-colors text-theme-secondary">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-semibold text-theme-primary min-w-[120px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <button onClick={nextMonth} className="p-2 hover:bg-theme-elevated rounded-lg transition-colors text-theme-secondary">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-theme-secondary uppercase tracking-wider py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 md:gap-4">
          {days.map((day, idx) => {
            const dayStr = format(day, dateFormat);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isTodayDate = isToday(day);
            const dayData = expensesByDay[dayStr];
            const hasExpenses = !!dayData;

            return (
              <div 
                key={dayStr}
                onClick={() => hasExpenses && setSelectedDateStr(dayStr)}
                className={`
                  relative flex flex-col items-center justify-start p-2 rounded-xl border min-h-[80px] md:min-h-[100px] transition-all cursor-pointer
                  ${isCurrentMonth ? 'bg-theme-surface border-theme-border' : 'bg-transparent border-transparent opacity-40 pointer-events-none'}
                  ${isTodayDate ? 'ring-2 ring-theme-accent border-transparent' : ''}
                  ${hasExpenses ? 'hover:border-theme-accent hover:shadow-md' : 'cursor-default'}
                `}
              >
                <span className={`text-sm font-medium mb-1 ${isTodayDate ? 'text-theme-accent' : 'text-theme-primary'}`}>
                  {format(day, 'd')}
                </span>
                
                {hasExpenses && (
                  <div className="flex flex-col items-center mt-1">
                    <span className="text-xs md:text-sm font-bold text-theme-primary text-center break-all">
                      {CURRENCY_SYMBOL}{dayData.total >= 1000 ? (dayData.total/1000).toFixed(1) + 'k' : dayData.total.toFixed(0)}
                    </span>
                    <span className="text-[10px] text-theme-secondary mt-0.5">
                      {dayData.count} txn{dayData.count > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
                
                {hasExpenses && (
                  <div className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-theme-accent md:hidden"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Expenses Bottom Sheet */}
      <BottomSheet
        isOpen={!!selectedDateStr}
        onClose={() => setSelectedDateStr(null)}
        title={selectedDateStr ? format(new Date(selectedDateStr), 'MMMM do, yyyy') : 'Expenses'}
      >
        <div className="pb-8">
          <ExpenseList 
            onEditExpense={(expense) => {
              setSelectedDateStr(null);
              openBottomSheetGlobal({ editingExpenseId: expense.id, initialCategoryId: expense.categoryId });
            }} 
            expenses={selectedDateExpenses}
          />
        </div>
      </BottomSheet>
    </div>
  );
}
