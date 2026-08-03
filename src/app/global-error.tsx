'use client';

import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
 error,
 reset,
}: {
 error: Error & { digest?: string };
 reset: () => void;
}) {
 return (
 <html lang="en">
 <body>
 <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0f0a1e] text-[#f8fafc]">
 <div className="bg-[#1a1528] p-6 md:p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-4">
 <div className="w-16 h-16 mx-auto bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-2">
 <AlertTriangle className="w-8 h-8" />
 </div>
 <h2 className="text-2xl font-bold">Fatal App Error</h2>
 <p className="text-gray-400 text-sm">
 We encountered a critical error. {error?.message}
 </p>
 <div className="pt-4 flex gap-3 justify-center">
 <Button variant="primary" onClick={() => reset()}>
 Try Again
 </Button>
 </div>
 </div>
 </div>
 </body>
 </html>
 );
}
