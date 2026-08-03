'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatedBackground } from '@/components/ui/motion/animated-background';

const NAV_LINKS = [
 { label: 'Home', path: '/dashboard' },
 { label: 'Budget', path: '/expenses' },
 { label: 'Analytics', path: '/analytics' },
 { label: 'Settings', path: '/settings' },
];

export function DashboardHeader() {
 const pathname = usePathname();

 return (
 <header className="flex items-center justify-between whitespace-nowrap border-b border-theme-border/30 px-10 py-4 glass-panel sticky top-0 z-50">
 <div className="flex items-center gap-4 text-theme-primary">
 <div className="w-6 h-6 text-theme-accent">
 <span className="material-symbols-outlined text-[24px]">account_balance_wallet</span>
 </div>
 <h2 className="text-theme-primary text-[24px] font-display font-medium tracking-tight">SpendWise</h2>
 </div>
 
 <nav className="hidden md:flex items-center gap-2 text-[16px] font-medium text-theme-secondary">
 <AnimatedBackground
 defaultValue={pathname}
 className="rounded-lg bg-theme-surface-hover/80"
 transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
 >
 {NAV_LINKS.map((link) => (
 <Link 
 key={link.path}
 href={link.path}
 data-id={link.path}
 className={`px-4 py-2 transition-colors ${pathname === link.path ? 'text-theme-accent' : 'hover:text-theme-accent'}`}
 >
 {link.label}
 </Link>
 ))}
 </AnimatedBackground>
 </nav>
 
 <div className="flex items-center gap-6">
 <button className="text-theme-secondary hover:text-theme-accent transition-colors">
 <span className="material-symbols-outlined text-[24px]">notifications</span>
 </button>
 <div className="flex items-center gap-3">
 <div className="flex flex-col items-end hidden sm:flex">
 <span className="text-[16px] font-medium text-theme-primary leading-tight">Aditya</span>
 <span className="text-[12px] tracking-[0.1em] font-bold text-theme-secondary uppercase">Premium Plan</span>
 </div>
 <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 h-10 border border-theme-border" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCx6vV3HLVTeo1b-cCxp78fXhTZyHxnMlC1piv7RHPkgV97XGcdAVLXTeQtuRrv2NvbD8ZueCBwWmiiBE31aFVuiAaYmrQuAvdWjZHgLSaPZGjjKGNNrYRdKosF0ykDh-O5eq8n1H8Nzrm_dtC02qVSdDXvVDO218gcb71YjsyVDevhJOMvoZ0G-H08SPhxhdOx6mxffG5eAMoJ-TwVNtJP30sjmFWd7AYY2IPIKr7G5H2SB4Nc1w")'}}></div>
 </div>
 </div>
 </header>
 );
}
