'use client';

import { useAuthListener } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/Toaster';

import { ThemeProvider } from 'next-themes';

export const GlobalProviders = ({ children }: { children: React.ReactNode }) => {
  useAuthListener();
  
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      {children}
      <Toaster />
    </ThemeProvider>
  );
};
