import React from 'react';
import { LayoutDashboard, Settings as SettingsIcon, History as HistoryIcon, Wallet, ReceiptText } from 'lucide-react';
import { TabType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const navClass = (tab: TabType) =>
    'flex min-w-0 flex-1 flex-col items-center gap-1 transition-colors ' +
    (activeTab === tab ? 'text-emerald-600' : 'text-slate-400');

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto bg-white shadow-xl">
      <header className="bg-slate-900 text-white p-5 sm:p-6 rounded-b-3xl shadow-lg mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2.5 rounded-xl shadow-md">
            <Wallet size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Finanças Pro</h1>
            <p className="text-slate-400 text-xs">Organização Mensal Simplificada</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-24">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-white border-t border-slate-100 flex justify-around px-2 pt-3 pb-6 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <button onClick={() => setActiveTab('dashboard')} className={navClass('dashboard')}>
          <LayoutDashboard size={22} />
          <span className="text-[9px] font-medium">Início</span>
        </button>
        <button onClick={() => setActiveTab('transactions')} className={navClass('transactions')}>
          <ReceiptText size={22} />
          <span className="text-[9px] font-medium">Lançamentos</span>
        </button>
        <button onClick={() => setActiveTab('settings')} className={navClass('settings')}>
          <SettingsIcon size={22} />
          <span className="text-[9px] font-medium">Ajustes</span>
        </button>
        <button onClick={() => setActiveTab('history')} className={navClass('history')}>
          <HistoryIcon size={22} />
          <span className="text-[9px] font-medium">Histórico</span>
        </button>
      </nav>
    </div>
  );
};
