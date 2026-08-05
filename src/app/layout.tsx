import type { Metadata, Viewport } from 'next';
import { Alumni_Sans, Albert_Sans } from 'next/font/google';
import { ThemeProvider } from "@/components/ThemeProvider";
import './globals.css';
import { GlobalProviders } from '@/components/layout/GlobalProviders';

const alumniSans = Alumni_Sans({
  subsets: ['latin'],
  variable: '--font-alumni',
  display: 'swap',
});

const albertSans = Albert_Sans({
  subsets: ['latin'],
  variable: '--font-albert',
  display: 'swap',
});

export const metadata: Metadata = {
 title: {
 default: 'SpendWise — Student Expense Tracker',
 template: '%s | SpendWise',
 },
 description:
 'Track your daily college spends in 3 seconds. See your remaining budget instantly. No bank linking required.',
 keywords: ['expense tracker', 'student budget', 'college expenses', 'spending tracker'],
 authors: [{ name: 'SpendWise' }],
 manifest: '/manifest.json',
 appleWebApp: {
 capable: true,
 statusBarStyle: 'black-translucent',
 title: 'SpendWise',
 },
};

export const viewport: Viewport = {
 width: 'device-width',
 initialScale: 1,
 maximumScale: 1,
 userScalable: false,
 themeColor: '#faf5ee',
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
 <html lang="en" suppressHydrationWarning>
 <head>
 <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
 </head>
 <body className={`${alumniSans.variable} ${albertSans.variable} font-sans antialiased bg-theme-base text-theme-primary`}>
 <ThemeProvider 
  attribute="class" 
  defaultTheme="neo-kinpaku-pro" 
  enableSystem={false}
  themes={['light', 'dark', 'ocean', 'forest', 'cyberpunk', 'arctic', 'oled-pro', 'neo-kinpaku-pro']}
 >
 <GlobalProviders>
 {children}
 </GlobalProviders>
 </ThemeProvider>
 </body>
 </html>
 );
}
