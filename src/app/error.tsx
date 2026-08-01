'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--surface-base)] text-[var(--text-primary)]">
      <div className="bg-[var(--surface-primary)] p-6 md:p-8 rounded-2xl shadow-[var(--shadow-card)] max-w-md w-full text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-2">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold">Oops! Something went wrong.</h2>
        <p className="text-[var(--text-secondary)] text-sm">
          We encountered an unexpected error while trying to display this page.
        </p>
        <div className="pt-4 flex gap-3 justify-center">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
          <Button variant="primary" onClick={() => reset()}>
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
