import type { Metadata, Viewport } from 'next';
import { Quicksand, Caveat, Space_Grotesk, Syne, Space_Mono, Orbitron, Inter, Outfit } from 'next/font/google';
import { ThemeProvider } from "@/components/ThemeProvider";
import './globals.css';
import { GlobalProviders } from '@/components/layout/GlobalProviders';

const quicksand = Quicksand({ subsets: ['latin'], variable: '--font-quicksand', display: 'swap' });
const caveat = Caveat({ subsets: ['latin'], variable: '--font-caveat', display: 'swap' });

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk', display: 'swap' });
const syne = Syne({ subsets: ['latin'], variable: '--font-syne', display: 'swap' });

const spaceMono = Space_Mono({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-space-mono', display: 'swap' });
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron', display: 'swap' });

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap' });

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
 <body className={`${quicksand.variable} ${caveat.variable} ${spaceGrotesk.variable} ${syne.variable} ${spaceMono.variable} ${orbitron.variable} ${inter.variable} ${outfit.variable} font-sans antialiased`}>
 <ThemeProvider 
  attribute="class" 
  defaultTheme="oled-pro" 
  enableSystem={false}
  themes={['light', 'dark', 'ocean', 'forest', 'cyberpunk', 'arctic', 'oled-pro', 'neon-sunset', 'graphite']}
 >
 <GlobalProviders>
 {children}
 </GlobalProviders>
 </ThemeProvider>
 </body>
 </html>
 );
}
