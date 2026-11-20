'use client';

import React, { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/react-query';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { useAuthListener } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/Toaster';
import { PwaServiceWorker } from '@/components/shared/PwaServiceWorker';

export const GlobalProviders = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => getQueryClient());
  useAuthListener();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={200}>
        {children}
        <PwaServiceWorker />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

