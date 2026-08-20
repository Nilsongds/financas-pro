import React, { useState } from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  SlidersHorizontal,
  History as HistoryIcon,
  Menu,
  MoreVertical,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  X
} from 'lucide-react';
import { TabType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenQuickAdd: (type: 'Receita' | 'Despesa' | 'Transferência' | 'Despesa cartão') => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  onOpenQuickAdd
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);

  const handleSelectQuickAction = (type: 'Receita' | 'Despesa' | 'Transferência' | 'Despesa cartão') => {
    setIsFabMenuOpen(false);
    onOpenQuickAdd(type);
  };

  const navClass = (tab: TabType) =>
    `flex min-w-0 flex-1 flex-col items-center gap-1 transition-all py-1 rounded-xl ${
      activeTab === tab
        ? 'text-[#8ab4f8] font-bold'
        : 'text-zinc-500 hover:text-zinc-300'
    }`;

  const getScreenTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Minhas Finanças';
      case 'transactions':
      case 'debts':
        return 'Dívidas & Recorrências';
      case 'settings':
        return 'Ajustes de Orçamento';
      case 'history':
        return 'Histórico Financeiro';
      default:
        return 'Minhas Finanças';
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto bg-[#0c0c0e] text-zinc-100 relative selection:bg-[#8ab4f8] selection:text-black">
      {/* Backdrop para fechar o menu do botão azul quando aberto */}
      {isFabMenuOpen && (
        <div
          onClick={() => setIsFabMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] animate-fadeIn"
        />
      )}

      {/* Top Mobile Bar */}
      <header className={`sticky top-0 bg-[#0c0c0e]/95 backdrop-blur-md px-4 py-3 border-b border-[#27272a]/60 flex items-center justify-between ${isFabMenuOpen ? 'z-50' : 'z-30'}`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-[#18181b] transition active:scale-95"
            aria-label="Abrir menu"
          >
            <Menu size={22} />
          </button>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">{getScreenTitle()}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 relative">
          {/* Botão Azul de Lançamento no topo direito */}
          <button
            type="button"
            onClick={() => setIsFabMenuOpen(curr => !curr)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#8ab4f8] hover:bg-[#74a9f7] text-[#0f172a] font-bold text-xs shadow-lg shadow-[#8ab4f8]/20 active:scale-95 transition-all duration-200 ${
              isFabMenuOpen ? 'ring-2 ring-white bg-[#74a9f7]' : ''
            }`}
            title="Novo lançamento de Receita ou Despesa"
            aria-label="Novo lançamento"
          >
            <Plus size={16} strokeWidth={2.5} className={`transition-transform duration-200 ${isFabMenuOpen ? 'rotate-45' : ''}`} />
            <span>Novo</span>
          </button>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-[#18181b] transition"
            aria-label="Opções"
          >
            <MoreVertical size={20} />
          </button>

          {/* Menu Dropdown do Botão Azul */}
          {isFabMenuOpen && (
            <div className="absolute right-0 top-12 z-50 flex flex-col items-end gap-2 animate-slideUp">
              <div className="bg-[#18181b] border border-[#3f3f46] rounded-2xl shadow-2xl p-2 min-w-[220px] space-y-1.5 ring-1 ring-white/10">
                {/* Receita (Entrada) */}
                <button
                  type="button"
                  onClick={() => handleSelectQuickAction('Receita')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-100 hover:text-white hover:bg-[#22c55e]/20 border border-transparent hover:border-[#22c55e]/40 transition active:scale-98 text-sm font-semibold text-left group cursor-pointer"
                >
                  <div className="p-2 rounded-xl bg-[#14532d] text-[#4ade80] group-hover:scale-110 transition-transform">
                    <ArrowDownRight size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold">Nova Receita</span>
                    <span className="text-[11px] text-zinc-400 font-normal">Recebimento / Entrada</span>
                  </div>
                </button>

                {/* Despesa (Saída) */}
                <button
                  type="button"
                  onClick={() => handleSelectQuickAction('Despesa')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-100 hover:text-white hover:bg-[#ef4444]/20 border border-transparent hover:border-[#ef4444]/40 transition active:scale-98 text-sm font-semibold text-left group cursor-pointer"
                >
                  <div className="p-2 rounded-xl bg-[#7f1d1d] text-[#f87171] group-hover:scale-110 transition-transform">
                    <ArrowUpRight size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold">Nova Despesa</span>
                    <span className="text-[11px] text-zinc-400 font-normal">Gasto / Pagamento</span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content View */}
      <main className="flex-1 overflow-y-auto px-4 pt-3 pb-24">
        {children}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-[#121214]/95 backdrop-blur-md border-t border-[#27272a] flex justify-around px-3 pt-2 pb-5 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        <button onClick={() => setActiveTab('dashboard')} className={navClass('dashboard')}>
          <LayoutDashboard size={20} />
          <span className="text-[10px]">Início</span>
        </button>

        <button onClick={() => setActiveTab('debts')} className={activeTab === 'debts' || activeTab === 'transactions' ? navClass(activeTab) : navClass('debts')}>
          <CalendarDays size={20} />
          <span className="text-[10px]">Dívidas</span>
        </button>

        <button onClick={() => setActiveTab('settings')} className={navClass('settings')}>
          <SlidersHorizontal size={20} />
          <span className="text-[10px]">Ajustes</span>
        </button>

        <button onClick={() => setActiveTab('history')} className={navClass('history')}>
          <HistoryIcon size={20} />
          <span className="text-[10px]">Histórico</span>
        </button>
      </nav>

      {/* Lateral Drawer Menu */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex animate-fadeIn">
          {/* Backdrop */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Drawer content */}
          <div className="relative w-4/5 max-w-xs bg-[#18181b] border-r border-[#27272a] h-full shadow-2xl p-5 flex flex-col justify-between z-10 animate-slideUp">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#27272a]">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-[#8ab4f8] text-[#0f172a]">
                    <Wallet size={24} />
                  </div>
                  <div>
                    <h2 className="font-bold text-white text-base">Minhas Finanças</h2>
                    <p className="text-xs text-zinc-400">Controle Pessoal</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#27272a]"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="space-y-1.5">
                {[
                  { id: 'dashboard', label: 'Visão Geral / Início', icon: LayoutDashboard },
                  { id: 'debts', label: 'Dívidas & Recorrências', icon: CalendarDays },
                  { id: 'settings', label: 'Ajustes & Categorias', icon: SlidersHorizontal },
                  { id: 'history', label: 'Histórico de Meses', icon: HistoryIcon },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id || (item.id === 'debts' && activeTab === 'transactions');
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as TabType);
                        setIsDrawerOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold transition ${
                        isActive
                          ? 'bg-[#8ab4f8] text-[#0f172a] shadow-md'
                          : 'text-zinc-300 hover:bg-[#27272a] hover:text-white'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
