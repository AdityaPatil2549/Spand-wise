'use client';

import { useAuthListener } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/Toaster';
import { PwaServiceWorker } from '@/components/shared/PwaServiceWorker';

export const GlobalProviders = ({ children }: { children: React.ReactNode }) => {
  useAuthListener();
  
  return (
    <>
      {children}
      <PwaServiceWorker />
      <Toaster />
    </>
  );
};

