'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getMultipleBudgets } from '@/lib/budget';
import { useStore } from '@/store';
import { getRecentMonths } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils/format';
import { Skeleton } from '@/components/ui/Skeleton';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
 if (!active || !payload?.length) return null;
 const data = payload[0].payload;
 return (
 <div className="bg-[var(--surface-primary)] rounded-xl px-3 py-2 shadow-lg border border-[var(--surface-secondary)]">
 <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">
 {data.label}
 </p>
 <p className="text-sm text-[var(--text-secondary)]">
 Spent: <span className="font-bold text-[var(--text-primary)]">{formatCurrency(data.spent)}</span>
 </p>
 {data.budget > 0 && (
 <p className="text-sm text-[var(--text-secondary)]">
 Budget: <span className="font-bold text-[var(--text-primary)]">{formatCurrency(data.budget)}</span>
 </p>
 )}
 </div>
 );
};

export const MonthComparisonChart = () => {
 const user = useStore((s) => s.user);
 const householdId = useStore((s) => s.householdId);
 const [data, setData] = useState<{ month: string; label: string; spent: number; budget: number }[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [shouldRenderChart, setShouldRenderChart] = useState(false);

 useEffect(() => {
 if (!user) return;
 
 let isMounted = true;
 const fetchBudgets = async () => {
 setIsLoading(true);
 try {
 const recentMonths = getRecentMonths(6).reverse(); // Oldest first for chart left-to-right
 const monthsIds = recentMonths.map(m => m.value);
 
 const budgets = await getMultipleBudgets(householdId || user.uid, monthsIds);
 
 if (isMounted) {
 const chartData = recentMonths.map(m => {
 const b = budgets.find(budget => budget.id === m.value);
 return {
 month: m.value,
 label: m.label.split(' ')[0], // "Jul 2026" -> "Jul"
 spent: b?.totalSpent || 0,
 budget: b?.budgetAmount || 0,
 };
 });
 setData(chartData);
 }
 } catch (error) {
 console.error('Failed to fetch budgets for chart', error);
 } finally {
 if (isMounted) {
 setIsLoading(false);
 // Add a tiny delay to allow the flex container to paint its width before Recharts initializes
 setTimeout(() => setShouldRenderChart(true), 50);
 }
 }
 };
 
 fetchBudgets();
 return () => { isMounted = false; };
 }, [user, householdId]);

 if (isLoading) {
 return <Skeleton className="h-56 w-full rounded-xl" />;
 }

 if (data.every(d => d.spent === 0)) {
 return (
 <div className="flex flex-col items-center justify-center py-12 text-[var(--text-tertiary)]">
 <span className="text-4xl mb-2 opacity-50">📈</span>
 <p className="text-sm">No spending history</p>
 </div>
 );
 }

 // Find max value to give chart some top padding
 const maxSpent = Math.max(...data.map(d => d.spent));

 return (
 <div className="h-56 w-full">
 {shouldRenderChart && (
 <ResponsiveContainer width="99%" height="100%">
 <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
 <XAxis 
 dataKey="label" 
 axisLine={false}
 tickLine={false}
 tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }}
 dy={10}
 />
 <YAxis 
 hide 
 domain={[0, maxSpent * 1.1]} // Add 10% padding to top
 />
 <Tooltip 
 content={<CustomTooltip />} 
 cursor={{ fill: 'var(--surface-secondary)', opacity: 0.5 }} 
 />
 <Bar 
 dataKey="spent" 
 radius={[4, 4, 4, 4]} 
 isAnimationActive={true}
 animationBegin={0}
 animationDuration={800}
 animationEasing="ease-out"
 >
 {data.map((entry, index) => {
 // Highlight the last bar (current month)
 const isCurrent = index === data.length - 1;
 return (
 <Cell 
 key={`cell-${index}`} 
 fill={isCurrent ? 'var(--color-primary)' : 'var(--surface-secondary)'} 
 />
 );
 })}
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 )}
 </div>
 );
};
