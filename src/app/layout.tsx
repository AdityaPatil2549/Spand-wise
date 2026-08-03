import type { Metadata, Viewport } from 'next';
import { Outfit, EB_Garamond, Hanken_Grotesk } from 'next/font/google';
import './globals.css';
import { GlobalProviders } from '@/components/layout/GlobalProviders';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-eb-garamond',
  display: 'swap',
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-hanken-grotesk',
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
    <html lang="en" className="light">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${outfit.variable} ${ebGaramond.variable} ${hankenGrotesk.variable} font-sans antialiased`}>
        <GlobalProviders>
          {children}
        </GlobalProviders>
      </body>
    </html>
  );
}
