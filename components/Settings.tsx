import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import { Save, AlertCircle, RefreshCcw, Sliders } from 'lucide-react';

interface SettingsProps {
  initialSalary?: number;
  initialCategories: Category[];
  onSave: (categories: Category[]) => void;
  onResetAll?: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ initialCategories, onSave, onResetAll }) => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [totalPercentage, setTotalPercentage] = useState<number>(0);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  useEffect(() => {
    const total = categories
      .filter(cat => cat.type === 'percentage')
      .reduce((acc, cat) => acc + cat.percentage, 0);
    setTotalPercentage(total);
  }, [categories]);

  function formatCurrencyInput(value: number): string {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  const handlePercentageChange = (id: string, value: string) => {
    const numValue = Math.max(0, Math.min(100, Number(value) || 0));
    setCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, percentage: numValue } : cat
    ));
    setSavedSuccess(false);
  };

  const handleFixedValueChange = (id: string, value: string) => {
    const rawValue = value.replace(/\D/g, '');
    const numericValue = Number(rawValue) / 100;
    setCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, fixedValue: numericValue } : cat
    ));
    setSavedSuccess(false);
  };

  const handleDescriptionChange = (id: string, value: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, description: value.slice(0, 200) } : cat
    ));
    setSavedSuccess(false);
  };

  const toggleCategoryType = (id: string) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === id) {
        const newType = cat.type === 'percentage' ? 'fixed' : 'percentage';
        return { ...cat, type: newType };
      }
      return cat;
    }));
    setSavedSuccess(false);
  };

  const handleConfirmReset = () => {
    setIsResetConfirmOpen(false);
    if (onResetAll) {
      onResetAll();
    } else {
      Object.keys(localStorage)
        .filter(key => key.startsWith('fin_'))
        .forEach(key => localStorage.removeItem(key));
      window.location.reload();
    }
  };

  const handleSave = () => {
    onSave(categories);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const hasPercentageCategories = categories.some(cat => cat.type === 'percentage');
  const isValid = !hasPercentageCategories || totalPercentage === 100;

  return (
    <div className="space-y-5 animate-fadeIn pb-10">
      {/* Categories Adjustment */}
      <section className="bg-[#18181b] p-5 rounded-3xl border border-[#27272a] shadow-sm space-y-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sliders size={18} className="text-[#8ab4f8]" />
            <h3 className="text-zinc-300 text-sm font-bold">
              Planejamento de Categorias
            </h3>
          </div>
          <button 
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-xl hover:bg-[#27272a]"
            title="Redefinir tudo"
          >
            <RefreshCcw size={13} /> Redefinir
          </button>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          Defina as porcentagens (%) ou limites fixos (R$) de gastos para cada categoria do seu orçamento mensal.
        </p>

        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat.id} className="space-y-3 p-4 rounded-2xl bg-[#121214] border border-[#27272a]">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                  {cat.name}
                </span>
                
                {/* Toggle Mode */}
                <div className="flex bg-[#27272a] p-0.5 rounded-xl border border-[#3f3f46]">
                  <button 
                    type="button"
                    onClick={() => cat.type !== 'percentage' && toggleCategoryType(cat.id)}
                    className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                      cat.type === 'percentage' ? 'bg-[#8ab4f8] text-[#0f172a] shadow-sm' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    %
                  </button>
                  <button 
                    type="button"
                    onClick={() => cat.type !== 'fixed' && toggleCategoryType(cat.id)}
                    className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                      cat.type === 'fixed' ? 'bg-[#8ab4f8] text-[#0f172a] shadow-sm' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    R$
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {cat.type === 'percentage' ? (
                  <div className="w-full space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-400 font-medium">Porcentagem</span>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={cat.percentage}
                          onChange={(e) => handlePercentageChange(cat.id, e.target.value)}
                          className="w-20 text-right font-bold py-1 pl-2 pr-6 bg-[#18181b] border border-[#27272a] rounded-xl focus:border-[#8ab4f8] outline-none text-white text-sm"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-bold">%</span>
                      </div>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      step="1"
                      value={cat.percentage}
                      onChange={(e) => handlePercentageChange(cat.id, e.target.value)}
                      className="w-full h-2 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-[#8ab4f8]"
                    />
                  </div>
                ) : (
                  <div className="w-full space-y-1.5">
                    <span className="text-xs text-zinc-400 font-medium block">Valor Fixo Mensal</span>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-sm">R$</span>
                      <input 
                        type="text" 
                        inputMode="numeric"
                        value={formatCurrencyInput(cat.fixedValue)}
                        onChange={(e) => handleFixedValueChange(cat.id, e.target.value)}
                        className="w-full font-bold pl-10 pr-4 py-2 bg-[#18181b] border border-[#27272a] rounded-xl focus:border-[#8ab4f8] outline-none text-white text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Description Field */}
              <div className="space-y-1">
                <input 
                  type="text"
                  value={cat.description || ''}
                  onChange={(e) => handleDescriptionChange(cat.id, e.target.value)}
                  placeholder="Descrição ou observação (opcional)"
                  className="w-full text-xs p-2.5 bg-[#18181b] border border-[#27272a] rounded-xl focus:border-[#8ab4f8] outline-none text-zinc-200"
                  maxLength={200}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Validation Alert */}
        <div className="space-y-3">
          {hasPercentageCategories && (
            <div className={`p-3.5 rounded-2xl flex items-center gap-3 transition-all ${
              isValid ? 'bg-[#14532d]/40 text-[#4ade80] border border-[#22c55e]/30' : 'bg-[#7f1d1d]/40 text-[#f87171] border border-[#ef4444]/30'
            }`}>
              <AlertCircle size={18} className="shrink-0" />
              <div className="flex flex-col text-xs">
                <span className="font-bold">
                  {isValid ? `Total de porcentagens: ${totalPercentage}% (Válido)` : `O total das porcentagens deve somar 100%`}
                </span>
                {!isValid && (
                  <span className="opacity-80">
                    Atual: {totalPercentage}% | {totalPercentage < 100 ? `Faltam ${100 - totalPercentage}%` : `Sobram ${totalPercentage - 100}%`}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Save Button */}
      <div className="pt-2 space-y-3">
        {savedSuccess && (
          <div className="p-3 bg-[#14532d]/50 text-[#4ade80] border border-[#22c55e]/30 rounded-2xl text-xs font-bold text-center animate-fadeIn">
            ✓ Ajustes salvos com sucesso!
          </div>
        )}

        <button 
          onClick={handleSave}
          disabled={!isValid}
          className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] ${
            isValid ? 'bg-[#8ab4f8] hover:bg-[#74a9f7] text-[#0f172a]' : 'bg-[#27272a] text-zinc-500 cursor-not-allowed shadow-none'
          }`}
        >
          <Save size={18} />
          Salvar e Aplicar Ajustes
        </button>

        {/* Dedicated Reset All Button */}
        <button
          type="button"
          onClick={() => setIsResetConfirmOpen(true)}
          className="w-full py-3.5 rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 text-red-400 bg-[#7f1d1d]/20 hover:bg-[#7f1d1d]/35 border border-[#ef4444]/30 transition active:scale-[0.98]"
        >
          <RefreshCcw size={15} />
          Redefinir e Zerar Todas as Informações do App
        </button>
      </div>

      {/* Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-[#18181b] border border-[#27272a] rounded-3xl p-6 shadow-2xl space-y-4 animate-slideUp text-center">
            <div className="w-12 h-12 rounded-full bg-[#7f1d1d]/30 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
              <RefreshCcw size={24} />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">Zerar todas as informações?</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Esta ação irá apagar definitivamente todos os lançamentos, dívidas e histórico de fechamentos, restaurando o aplicativo do zero.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="w-1/2 py-3 rounded-xl bg-[#27272a] text-zinc-300 text-xs font-semibold hover:bg-[#3f3f46] transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="w-1/2 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-lg"
              >
                Sim, Zerar Tudo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
