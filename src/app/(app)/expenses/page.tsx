'use client';

import Link from 'next/link';
import { useStore } from '@/store';

export default function ExpensesPage() {
  const openBottomSheet = useStore((s) => s.openBottomSheet);
  
  return (
    <div className="bg-[#faf5ee] text-[#3a302a] flex min-h-screen font-body w-full">
      <style dangerouslySetInnerHTML={{__html: `
        .glass-card { background: rgba(246, 240, 232, 0.6); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(216, 208, 200, 0.4); }
        .shadow-ultra-soft { box-shadow: 0 2px 16px rgba(58, 48, 42, 0.04); }
      `}} />
      
      {/* SideNavBar */}
      <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-[#faf5ee] border-r border-[#d8d0c8]/60 shadow-sm py-8 px-6 z-50">
        <div className="mb-12">
          <h1 className="font-headline text-2xl font-bold text-[#c2652a] tracking-tight">SpendWise</h1>
          <p className="font-body text-sm text-[#605850] mt-1">Premium Finance</p>
        </div>
        
        <nav className="flex-1 space-y-1">
          <Link className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#605850] font-medium hover:bg-[#ece6dc] transition-colors duration-200 active:scale-95 transition-transform group" href="/dashboard">
            <span className="material-symbols-outlined text-xl group-hover:text-[#c2652a] transition-colors">dashboard</span>
            <span className="font-body text-sm">Dashboard</span>
          </Link>
          
          <Link className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#c2652a] font-bold border-r-4 border-[#c2652a] bg-[#fbe8d8]/30 active:scale-95 transition-transform" href="/expenses">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
            <span className="font-body text-sm">Expenses</span>
          </Link>
          
          <Link className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#605850] font-medium hover:bg-[#ece6dc] transition-colors duration-200 active:scale-95 transition-transform group" href="/analytics">
            <span className="material-symbols-outlined text-xl group-hover:text-[#c2652a] transition-colors">monitoring</span>
            <span className="font-body text-sm">Analytics</span>
          </Link>
        </nav>
        
        <div className="mt-auto mb-6">
          <button onClick={() => openBottomSheet()} className="w-full bg-[#c2652a] text-[#ffffff] py-3 px-4 rounded-lg font-body text-sm font-medium hover:bg-[#c2652a]/90 transition-colors shadow-sm flex items-center justify-center gap-2 active:scale-95">
            <span className="material-symbols-outlined text-lg">add</span>
            Add Transaction
          </button>
        </div>
        
        <div className="border-t border-[#d8d0c8]/30 pt-4 space-y-1">
          <Link className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#605850] font-medium hover:bg-[#ece6dc] transition-colors duration-200 group active:scale-95" href="/settings">
            <span className="material-symbols-outlined text-xl group-hover:text-[#c2652a] transition-colors">settings</span>
            <span className="font-body text-sm">Settings</span>
          </Link>
        </div>
      </aside>

      {/* TopAppBar */}
      <header className="hidden md:flex fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-[#faf5ee]/80 backdrop-blur-md justify-between items-center px-12 h-20">
        <nav className="flex gap-8">
          <a className="text-[#78706a] hover:text-[#c2652a] transition-colors cursor-pointer font-body text-sm" href="#">Overview</a>
          <a className="text-[#78706a] hover:text-[#c2652a] transition-colors cursor-pointer font-body text-sm" href="#">Reports</a>
          <a className="text-[#78706a] hover:text-[#c2652a] transition-colors cursor-pointer font-body text-sm" href="#">Planning</a>
        </nav>
        <div className="flex items-center gap-6">
          <button className="font-body text-sm font-medium text-[#c2652a] hover:opacity-80 transition-opacity">Upgrade</button>
          <div className="h-6 w-px bg-[#d8d0c8]/50"></div>
          <button className="text-[#78706a] hover:text-[#c2652a] transition-colors cursor-pointer flex items-center">
            <span className="material-symbols-outlined text-xl">notifications</span>
          </button>
          <button className="text-[#78706a] hover:text-[#c2652a] transition-colors cursor-pointer flex items-center">
            <span className="material-symbols-outlined text-3xl text-[#c2652a]">account_circle</span>
          </button>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-1 w-full md:ml-64 pt-24 md:pt-28 px-6 md:px-16 pb-20 overflow-y-auto">
        {/* Page Header & Filters */}
        <div className="max-w-6xl mx-auto mb-12">
          <h1 className="font-headline text-5xl md:text-6xl text-[#3a302a] mb-8 uppercase tracking-widest text-center md:text-left">Expenses</h1>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-[#d8d0c8]/40 pb-6">
            {/* Timeline Filter */}
            <nav className="flex gap-6 overflow-x-auto w-full md:w-auto hide-scrollbar snap-x">
              <button className="snap-start whitespace-nowrap text-[#c2652a] border-b-2 border-[#c2652a] pb-2 font-body text-sm uppercase tracking-wide font-semibold">July 2026</button>
              <button className="snap-start whitespace-nowrap text-[#78706a] hover:text-[#c2652a] transition-colors pb-2 font-body text-sm uppercase tracking-wide">June 2026</button>
              <button className="snap-start whitespace-nowrap text-[#78706a] hover:text-[#c2652a] transition-colors pb-2 font-body text-sm uppercase tracking-wide">May 2026</button>
              <button className="snap-start whitespace-nowrap text-[#78706a] hover:text-[#c2652a] transition-colors pb-2 font-body text-sm uppercase tracking-wide">April 2026</button>
            </nav>
            {/* Search/Category Filter */}
            <div className="relative w-full md:w-72">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#78706a] text-sm">search</span>
              <input className="w-full bg-[#ffffff] border border-[#d8d0c8]/60 rounded-full py-2.5 pl-10 pr-4 font-body text-sm text-[#3a302a] focus:outline-none focus:border-[#c2652a] focus:ring-1 focus:ring-[#c2652a] transition-all shadow-ultra-soft placeholder:text-[#9a9088]" placeholder="Search or filter..." type="text" />
            </div>
          </div>
        </div>

        {/* Bento Grid Context / Summary (High-End Layout) */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="glass-card rounded-2xl p-8 flex flex-col justify-between shadow-ultra-soft relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#fbe8d8]/40 rounded-full blur-3xl group-hover:bg-[#fbe8d8]/60 transition-all duration-700"></div>
            <span className="font-body text-xs text-[#605850] uppercase tracking-widest mb-4">Total Spent</span>
            <span className="font-headline text-5xl text-[#3a302a]">$4,820<span className="text-2xl text-[#78706a]">.50</span></span>
            <div className="mt-6 flex items-center gap-2 text-sm text-[#8c3c3c]">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span className="font-body">+12% from last month</span>
            </div>
          </div>
          
          <div className="glass-card rounded-2xl p-8 flex flex-col justify-between shadow-ultra-soft relative overflow-hidden group">
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-[#eae2da]/40 rounded-full blur-3xl group-hover:bg-[#eae2da]/60 transition-all duration-700"></div>
            <span className="font-body text-xs text-[#605850] uppercase tracking-widest mb-4">Top Category</span>
            <span className="font-headline text-3xl text-[#3a302a] mb-1">Dining Out</span>
            <span className="font-body text-lg text-[#c2652a]">$1,240.00</span>
            <div className="mt-auto pt-6 flex items-center justify-between">
              <div className="w-full bg-[#e6e0d6] rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#c2652a] h-full w-[45%] rounded-full"></div>
              </div>
            </div>
          </div>
          
          {/* Aesthetic Image Block */}
          <div className="rounded-2xl p-8 bg-cover bg-center shadow-ultra-soft relative overflow-hidden min-h-[200px] flex items-end" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuACrBq3mzB3KNbIhNfjJxMjvPG1Um8git0W7hb2Flj45gHRWfuQb1cHJysssenPSQUQRy0XaYiZ4y0Pc3FxrIyvLR_plgQcjvCsveiQrpRo6l0_Ej6tLu71vNYS4XksDCEvgFp7JHxqqDtijfqBEZ_X8uDtdzRL2_-Lw-8ubtxj5KpY1sYpkDtcfLKGFYgZibWy-dDQoEXVrwgRPdbtu-k-ljEbnxNIAfhPQX_EPVVDdL9lJE4G9g')"}}>
            <div className="absolute inset-0 bg-gradient-to-t from-[#3a302a]/80 to-transparent"></div>
            <p className="relative font-headline text-xl text-[#ffffff] italic z-10">"Discipline is the bridge between goals and accomplishment."</p>
          </div>
        </div>

        {/* Transactions List (Curated Editorial Style) */}
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <h3 className="font-headline text-2xl text-[#3a302a]">Recent Activity</h3>
            <div className="h-px flex-1 bg-[#d8d0c8]/30"></div>
          </div>
          
          <div className="space-y-4">
            {/* Date Group Header */}
            <p className="font-body text-xs text-[#78706a] uppercase tracking-widest pl-4 pt-4 pb-2">Today, July 14</p>
            
            {/* Transaction Item (Card Style) */}
            <div className="group bg-[#f6f0e8] hover:bg-[#ece6dc] transition-colors duration-300 rounded-xl p-5 flex items-center gap-6 cursor-pointer border border-transparent hover:border-[#d8d0c8]/40">
              <div className="w-12 h-12 rounded-full bg-[#faf5ee] flex items-center justify-center text-[#c2652a] shadow-sm group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined">restaurant</span>
              </div>
              <div className="flex-1">
                <h4 className="font-headline text-xl text-[#3a302a] mb-0.5">L'Artusi</h4>
                <p className="font-body text-sm text-[#605850]">Dining Out</p>
              </div>
              <div className="text-right">
                <p className="font-body text-lg font-medium text-[#3a302a]">-$145.00</p>
                <p className="font-body text-xs text-[#78706a]">8:30 PM</p>
              </div>
            </div>
            
            <div className="group bg-[#f6f0e8] hover:bg-[#ece6dc] transition-colors duration-300 rounded-xl p-5 flex items-center gap-6 cursor-pointer border border-transparent hover:border-[#d8d0c8]/40">
              <div className="w-12 h-12 rounded-full bg-[#faf5ee] flex items-center justify-center text-[#78706a] shadow-sm group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined">local_taxi</span>
              </div>
              <div className="flex-1">
                <h4 className="font-headline text-xl text-[#3a302a] mb-0.5">Uber</h4>
                <p className="font-body text-sm text-[#605850]">Transport</p>
              </div>
              <div className="text-right">
                <p className="font-body text-lg font-medium text-[#3a302a]">-$24.50</p>
                <p className="font-body text-xs text-[#78706a]">10:15 PM</p>
              </div>
            </div>
            
            {/* Date Group Header */}
            <p className="font-body text-xs text-[#78706a] uppercase tracking-widest pl-4 pt-8 pb-2">Yesterday, July 13</p>
            
            <div className="group bg-[#f6f0e8] hover:bg-[#ece6dc] transition-colors duration-300 rounded-xl p-5 flex items-center gap-6 cursor-pointer border border-transparent hover:border-[#d8d0c8]/40">
              <div className="w-12 h-12 rounded-full bg-[#faf5ee] flex items-center justify-center text-[#c2652a] shadow-sm group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined">shopping_bag</span>
              </div>
              <div className="flex-1">
                <h4 className="font-headline text-xl text-[#3a302a] mb-0.5">Whole Foods Market</h4>
                <p className="font-body text-sm text-[#605850]">Groceries</p>
              </div>
              <div className="text-right">
                <p className="font-body text-lg font-medium text-[#3a302a]">-$182.30</p>
                <p className="font-body text-xs text-[#78706a]">4:45 PM</p>
              </div>
            </div>
            
            <div className="group bg-[#f6f0e8] hover:bg-[#ece6dc] transition-colors duration-300 rounded-xl p-5 flex items-center gap-6 cursor-pointer border border-transparent hover:border-[#d8d0c8]/40">
              <div className="w-12 h-12 rounded-full bg-[#faf5ee] flex items-center justify-center text-[#8c3c3c] shadow-sm group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined">category</span>
              </div>
              <div className="flex-1">
                <h4 className="font-headline text-xl text-[#3a302a] mb-0.5">Apple Subscription</h4>
                <p className="font-body text-sm text-[#605850]">Miscellaneous</p>
              </div>
              <div className="text-right">
                <p className="font-body text-lg font-medium text-[#3a302a]">-$14.99</p>
                <p className="font-body text-xs text-[#78706a]">8:00 AM</p>
              </div>
            </div>
          </div>
          
          {/* Load More */}
          <div className="mt-12 flex justify-center">
            <button className="px-8 py-3 rounded-full border border-[#d8d0c8]/60 font-body text-sm text-[#3a302a] hover:bg-[#ece6dc] transition-colors duration-200">View Older Transactions</button>
          </div>
        </div>
      </main>
    </div>
  );
}
