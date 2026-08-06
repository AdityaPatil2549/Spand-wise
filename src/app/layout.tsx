import type { Metadata, Viewport } from 'next';
import { Nunito, Pacifico, Inter, Outfit, Work_Sans, Comfortaa, Merriweather, Fraunces, JetBrains_Mono, Orbitron, DM_Sans, Cinzel, Space_Grotesk, Syne, Rubik, Bungee, Manrope, Anton } from 'next/font/google';
import { ThemeProvider } from "@/components/ThemeProvider";
import './globals.css';
import { GlobalProviders } from '@/components/layout/GlobalProviders';

const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito', display: 'swap' });
const pacifico = Pacifico({ weight: '400', subsets: ['latin'], variable: '--font-pacifico', display: 'swap' });

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap' });

const workSans = Work_Sans({ subsets: ['latin'], variable: '--font-work-sans', display: 'swap' });
const comfortaa = Comfortaa({ subsets: ['latin'], variable: '--font-comfortaa', display: 'swap' });

const merriweather = Merriweather({ weight: ['300', '400', '700', '900'], subsets: ['latin'], variable: '--font-merriweather', display: 'swap' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap' });

const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono', display: 'swap' });
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron', display: 'swap' });

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' });
const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-cinzel', display: 'swap' });

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk', display: 'swap' });
const syne = Syne({ subsets: ['latin'], variable: '--font-syne', display: 'swap' });

const rubik = Rubik({ subsets: ['latin'], variable: '--font-rubik', display: 'swap' });
const bungee = Bungee({ weight: '400', subsets: ['latin'], variable: '--font-bungee', display: 'swap' });

const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' });
const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-anton', display: 'swap' });

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
 <body className={`${nunito.variable} ${pacifico.variable} ${inter.variable} ${outfit.variable} ${workSans.variable} ${comfortaa.variable} ${merriweather.variable} ${fraunces.variable} ${jetbrainsMono.variable} ${orbitron.variable} ${dmSans.variable} ${cinzel.variable} ${spaceGrotesk.variable} ${syne.variable} ${rubik.variable} ${bungee.variable} ${manrope.variable} ${anton.variable} font-sans antialiased`}>
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
