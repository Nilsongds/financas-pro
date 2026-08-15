
import React from 'react';
import { LayoutDashboard, Settings as SettingsIcon, History as HistoryIcon, Wallet } from 'lucide-react';
import { TabType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto bg-white shadow-xl">
      {/* Header */}
      <header className="bg-slate-900 text-white p-5 sm:p-6 rounded-b-3xl shadow-lg mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2.5 rounded-xl shadow-md">
              <Wallet size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Finanças Pro</h1>
              <p className="text-slate-400 text-xs">Organização Mensal Simplificada</p>
            </div>
          </div>


        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 pb-24">
        {children}
      </main>

      {/* Navigation - Bottom bar for mobile focus */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-white border-t border-slate-100 flex justify-around p-3 pb-6 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'dashboard' ? 'text-emerald-600' : 'text-slate-400'}`}
        >
          <LayoutDashboard size={24} />
          <span className="text-[10px] font-medium uppercase tracking-wider">Dashboard</span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'settings' ? 'text-emerald-600' : 'text-slate-400'}`}
        >
          <SettingsIcon size={24} />
          <span className="text-[10px] font-medium uppercase tracking-wider">Ajustes</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'history' ? 'text-emerald-600' : 'text-slate-400'}`}
        >
          <HistoryIcon size={24} />
          <span className="text-[10px] font-medium uppercase tracking-wider">Histórico</span>
        </button>
      </nav>


    </div>
  );
};
