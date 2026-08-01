'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Bot } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useStore } from '@/store';
import { Card } from '@/components/ui/Card';

export const AIPredictionCard = () => {
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const expenses = useStore((s) => s.expenses);
  const budget = useStore((s) => s.budget);
  const addToast = useStore((s) => s.addToast);

  const generateInsight = async () => {
    if (!expenses.length || !budget) {
      addToast({ type: 'error', message: 'Not enough data for AI insights yet.' });
      return;
    }

    setIsLoading(true);
    setInsight(null);

    try {
      const response = await fetch('/api/ai/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expenses, budget }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate insight');
      }

      setInsight(data.insight);
    } catch (error: unknown) {
      console.error('AI Insight Error:', error);
      const msg = error instanceof Error ? error.message : 'Something went wrong.';
      addToast({ type: 'error', message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card padding="md" className="mb-4 relative overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
      
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0 shadow-sm">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-[var(--text-primary)]">AI Insights</h3>
          <p className="text-xs text-[var(--text-secondary)]">Powered by Gemini AI</p>
        </div>
      </div>

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {!insight && !isLoading && (
            <motion.div
              key="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex justify-center py-2"
            >
              {expenses.length === 0 ? (
                <div className="text-center py-2 text-sm text-[var(--text-secondary)] bg-[var(--surface-secondary)] rounded-xl px-4 w-full border border-[var(--border-light)] border-dashed">
                  <p>Log a few expenses first so the AI can analyze your habits!</p>
                </div>
              ) : (
                <Button 
                  onClick={generateInsight} 
                  variant="primary" 
                  className="w-full flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Analyze Spending
                </Button>
              )}
            </motion.div>
          )}

          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-6 text-[var(--text-secondary)]"
            >
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-violet-500" />
              <p className="text-sm font-medium animate-pulse">Analyzing your finances...</p>
            </motion.div>
          )}

          {insight && !isLoading && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[var(--surface-secondary)] rounded-xl p-4 text-sm text-[var(--text-primary)] leading-relaxed border border-[var(--border-light)] shadow-inner"
            >
              <p>{insight}</p>
              
              <div className="mt-4 flex justify-end">
                <Button 
                  onClick={generateInsight} 
                  variant="outline" 
                  size="sm"
                  className="text-xs py-1 h-auto"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Refresh
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};
