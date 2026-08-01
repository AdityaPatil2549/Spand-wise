'use client';

import Link from 'next/link';
import { useStore } from '@/store';

export default function DashboardPage() {
  const openBottomSheet = useStore((s) => s.openBottomSheet);
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-[#faf5ee] text-[#3a302a] font-body">
      <style dangerouslySetInnerHTML={{__html: `
        .glass-panel {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.5);
        }
        .hover-elevate {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-elevate:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }
      `}} />
      <header className="flex items-center justify-between whitespace-nowrap border-b border-[#d8d0c8]/30 px-10 py-4 glass-panel sticky top-0 z-50">
        <div className="flex items-center gap-4 text-[#3a302a]">
          <div className="w-6 h-6 text-[#c2652a]">
            <span className="material-symbols-outlined text-[24px]">account_balance_wallet</span>
          </div>
          <h2 className="text-[#3a302a] text-[24px] font-display font-medium tracking-tight">SpendWise</h2>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-[16px] font-medium text-[#605850]">
          <Link className="text-[#c2652a] border-b-2 border-[#c2652a] pb-1" href="/dashboard">Home</Link>
          <Link className="hover:text-[#c2652a] transition-colors" href="/expenses">Budget</Link>
          <Link className="hover:text-[#c2652a] transition-colors" href="/analytics">Analytics</Link>
          <Link className="hover:text-[#c2652a] transition-colors" href="/settings">Settings</Link>
        </nav>
        <div className="flex items-center gap-6">
          <button className="text-[#605850] hover:text-[#c2652a] transition-colors">
            <span className="material-symbols-outlined text-[24px]">notifications</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-[16px] font-medium text-[#3a302a] leading-tight">Aditya</span>
              <span className="text-[12px] tracking-[0.1em] font-bold text-[#605850] uppercase">Premium Plan</span>
            </div>
            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 h-10 border border-[#d8d0c8]" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCx6vV3HLVTeo1b-cCxp78fXhTZyHxnMlC1piv7RHPkgV97XGcdAVLXTeQtuRrv2NvbD8ZueCBwWmiiBE31aFVuiAaYmrQuAvdWjZHgLSaPZGjjKGNNrYRdKosF0ykDh-O5eq8n1H8Nzrm_dtC02qVSdDXvVDO218gcb71YjsyVDevhJOMvoZ0G-H08SPhxhdOx6mxffG5eAMoJ-TwVNtJP30sjmFWd7AYY2IPIKr7G5H2SB4Nc1w")'}}></div>
          </div>
        </div>
      </header>
      <main className="flex h-full grow flex-col px-[20px] md:px-[64px] py-[48px]">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-[24px] mb-16 lg:items-center">
          <div className="lg:col-span-7 flex flex-col gap-8 pr-0 lg:pr-12">
            <div className="space-y-4">
              <p className="text-[12px] tracking-[0.1em] font-bold text-[#c2652a] uppercase mb-2">Overview • July 2026</p>
              <h1 className="font-display text-[64px] md:text-[88px] leading-[0.9] font-medium text-[#3a302a] tracking-[-0.03em]">Your budget is <span className="text-[#c0392b] italic">strained.</span></h1>
              <p className="text-[18px] text-[#605850] max-w-lg mt-8">You have significantly exceeded your planned expenditure for this period. A detailed review of recent transactions is recommended to recalibrate your financial trajectory.</p>
              <button onClick={() => openBottomSheet()} className="mt-12 bg-[#c2652a] text-[#ffffff] px-8 py-4 rounded-full flex items-center gap-3 hover-elevate transition-all font-medium text-[20px] shadow-lg shadow-[#c2652a]/20">
                <span className="material-symbols-outlined text-[28px]">add</span>
                <span className="">Add Expense</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <Link href="/analytics" className="hover-elevate glass-panel p-6 rounded-2xl flex flex-col items-start gap-4 border border-[#d8d0c8]/30 text-left group">
                <div className="w-12 h-12 rounded-full bg-[#f2ece4] flex items-center justify-center text-[#c2652a] group-hover:bg-[#c2652a] group-hover:text-[#ffffff] transition-colors">
                  <span className="material-symbols-outlined">analytics</span>
                </div>
                <div>
                  <h3 className="text-[16px] font-medium text-[#3a302a]">View Analysis</h3>
                  <p className="text-sm text-[#605850]">Deep dive into spending</p>
                </div>
              </Link>
              <Link href="/settings" className="hover-elevate glass-panel p-6 rounded-2xl flex flex-col items-start gap-4 border border-[#d8d0c8]/30 text-left group">
                <div className="w-12 h-12 rounded-full bg-[#f2ece4] flex items-center justify-center text-[#c2652a] group-hover:bg-[#c2652a] group-hover:text-[#ffffff] transition-colors">
                  <span className="material-symbols-outlined">edit_note</span>
                </div>
                <div>
                  <h3 className="text-[16px] font-medium text-[#3a302a]">Adjust Limits</h3>
                  <p className="text-sm text-[#605850]">Rebalance categories</p>
                </div>
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 w-full mt-12 lg:mt-0">
            <div className="relative w-full rounded-[32px] overflow-hidden hover-elevate group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#fce4e0] via-[#ece6dc] to-[#faf5ee] opacity-90 z-0"></div>
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#c0392b] opacity-10 rounded-full blur-3xl"></div>
              <div className="relative z-10 p-8 md:p-12 h-full flex flex-col justify-between min-h-[400px]">
                <div className="flex justify-between items-center">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c0392b]/10 text-[#7a1a10] text-sm font-medium">
                    <span className="material-symbols-outlined text-[16px]">warning</span>
                    Over budget
                  </span>
                  <span className="material-symbols-outlined text-[#605850]">more_horiz</span>
                </div>
                <div className="space-y-2 mt-12">
                  <p className="text-[16px] text-[#605850] font-medium">Current Balance</p>
                  <h2 className="font-display text-[56px] leading-none text-[#3a302a] tracking-tight">-6,420</h2>
                </div>
                <div className="mt-12 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#605850]">Spent: <strong className="text-[#3a302a]">14,420</strong></span>
                    <span className="text-[#605850]">Budget: <strong className="text-[#3a302a]">8,000</strong></span>
                  </div>
                  <div className="w-full h-2 bg-[#e6e0d6] rounded-full overflow-hidden">
                    <div className="h-full bg-[#c0392b] w-full rounded-full relative">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBoNDBWMHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-50"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="mt-8">
          <div className="flex justify-between items-end mb-8 border-b border-[#d8d0c8]/30 pb-4">
            <h3 className="font-display text-[32px] font-medium text-[#3a302a]">Recent Expenses</h3>
            <Link href="/expenses" className="text-[#c2652a] text-[16px] font-medium hover:underline flex items-center gap-1">
              See all <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel rounded-2xl p-6 border border-[#d8d0c8]/30 hover-elevate flex flex-col justify-between h-48 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#e08850]/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <div className="flex justify-between items-start">
                <div className="p-3 bg-[#f2ece4] rounded-xl text-[#c2652a]">
                  <span className="material-symbols-outlined">shopping_cart</span>
                </div>
                <span className="text-[12px] tracking-[0.1em] font-bold text-[#605850] uppercase">Today</span>
              </div>
              <div>
                <p className="text-[16px] text-[#605850] mb-1">Groceries</p>
                <p className="font-display text-[24px] font-medium text-[#3a302a]">8,000</p>
              </div>
            </div>
            <div className="glass-panel rounded-2xl p-6 border border-[#d8d0c8]/30 hover-elevate flex flex-col justify-between h-48 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#eae2da]/20 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <div className="flex justify-between items-start">
                <div className="p-3 bg-[#f2ece4] rounded-xl text-[#78706a]">
                  <span className="material-symbols-outlined">restaurant</span>
                </div>
                <span className="text-[12px] tracking-[0.1em] font-bold text-[#605850] uppercase">Yesterday</span>
              </div>
              <div>
                <p className="text-[16px] text-[#605850] mb-1">Dining Out</p>
                <p className="font-display text-[24px] font-medium text-[#3a302a]">6,420</p>
              </div>
            </div>
            <div className="glass-panel rounded-2xl p-6 border border-[#d8d0c8]/30 hover-elevate flex flex-col justify-between h-48 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#d47070]/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <div className="flex justify-between items-start">
                <div className="p-3 bg-[#f2ece4] rounded-xl text-[#8c3c3c]">
                  <span className="material-symbols-outlined">category</span>
                </div>
                <span className="text-[12px] tracking-[0.1em] font-bold text-[#605850] uppercase">Jul 24</span>
              </div>
              <div>
                <p className="text-[16px] text-[#605850] mb-1">Miscellaneous</p>
                <p className="font-display text-[24px] font-medium text-[#3a302a]">5,433</p>
              </div>
            </div>
            <div className="glass-panel rounded-2xl p-6 border border-[#d8d0c8]/30 hover-elevate flex flex-col justify-between h-48 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#ece6dc]/50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <div className="flex justify-between items-start">
                <div className="p-3 bg-[#f2ece4] rounded-xl text-[#605850]">
                  <span className="material-symbols-outlined">local_cafe</span>
                </div>
                <span className="text-[12px] tracking-[0.1em] font-bold text-[#605850] uppercase">Jul 23</span>
              </div>
              <div>
                <p className="text-[16px] text-[#605850] mb-1">Coffee</p>
                <p className="font-display text-[24px] font-medium text-[#3a302a]">99</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
