'use client';

import { useAuthListener } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/Toaster';

export const GlobalProviders = ({ children }: { children: React.ReactNode }) => {
 useAuthListener();
 
 return (
 <>
 {children}
 <Toaster />
 </>
 );
};
