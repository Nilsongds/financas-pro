
import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import { Save, AlertCircle, RefreshCcw, Smartphone, Download, CheckCircle2 } from 'lucide-react';
import { InstallModal } from './InstallModal';

interface SettingsProps {
  initialSalary: number;
  initialCategories: Category[];
  onSave: (salary: number, categories: Category[]) => void;
}

export const Settings: React.FC<SettingsProps> = ({ initialSalary, initialCategories, onSave }) => {
  // Estado para o valor numérico puro
  const [salary, setSalary] = useState<number>(initialSalary);
  // Estado para o texto exibido no input (formatado)
  const [salaryInput, setSalaryInput] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [totalPercentage, setTotalPercentage] = useState<number>(0);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);
  }, []);

  // Inicializa o input formatado ao carregar
  useEffect(() => {
    setSalaryInput(formatCurrencyInput(initialSalary));
  }, [initialSalary]);

  useEffect(() => {
    const total = categories
      .filter(cat => cat.type === 'percentage')
      .reduce((acc, cat) => acc + cat.percentage, 0);
    setTotalPercentage(total);
  }, [categories]);

  // Função para formatar número para padrão brasileiro R$ (sem o prefixo R$)
  function formatCurrencyInput(value: number): string {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // Função para lidar com a mudança no input de salário (máscara de dinheiro)
  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
    const numericValue = Number(value) / 100; // Converte para decimal
    
    setSalary(numericValue);
    setSalaryInput(formatCurrencyInput(numericValue));
  };

  const handlePercentageChange = (id: string, value: string) => {
    const numValue = Math.max(0, Math.min(100, Number(value) || 0));
    setCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, percentage: numValue } : cat
    ));
  };

  const handleFixedValueChange = (id: string, value: string) => {
    let rawValue = value.replace(/\D/g, '');
    const numericValue = Number(rawValue) / 100;
    setCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, fixedValue: numericValue } : cat
    ));
  };

  const handleDescriptionChange = (id: string, value: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, description: value.slice(0, 200) } : cat
    ));
  };

  const toggleCategoryType = (id: string) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === id) {
        const newType = cat.type === 'percentage' ? 'fixed' : 'percentage';
        return { ...cat, type: newType };
      }
      return cat;
    }));
  };

  const handleReset = () => {
    const zeroedCategories = initialCategories.map(cat => ({
      ...cat,
      type: 'percentage',
      percentage: 0,
      fixedValue: 0,
      description: ''
    }));
    setSalary(0);
    setSalaryInput(formatCurrencyInput(0));
    setCategories(zeroedCategories);
    onSave(0, zeroedCategories);
  };

  const hasPercentageCategories = categories.some(cat => cat.type === 'percentage');
  const isValid = !hasPercentageCategories || totalPercentage === 100;
  const fixedSum = categories.filter(c => c.type === 'fixed').reduce((acc, c) => acc + c.fixedValue, 0);
  const isSalaryEnough = salary >= fixedSum;

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Salary Input Section */}
      <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="block">
          <span className="text-slate-500 text-sm font-semibold uppercase tracking-widest mb-3 block">Salário Mensal (R$)</span>
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl transition-colors group-focus-within:text-emerald-500">R$</span>
            <input 
              type="text" 
              inputMode="numeric"
              value={salaryInput}
              onChange={handleSalaryChange}
              placeholder="0,00"
              className="w-full text-2xl font-bold pl-14 pr-4 py-4 bg-slate-50 rounded-xl border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all text-slate-800"
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-2 px-1 italic">Digite os números e os centavos serão ajustados automaticamente.</p>
        </div>
      </section>

      {/* Categories Adjustment */}
      <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-widest">Configuração de Categorias</h3>
          <button 
            onClick={handleReset}
            className="text-slate-400 hover:text-emerald-600 transition-colors flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg hover:bg-slate-50"
          >
            <RefreshCcw size={14} /> 
          </button>
        </div>

        <div className="space-y-6">
          {categories.map((cat) => (
            <div key={cat.id} className="space-y-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100">
              <div className="flex justify-between items-start">
                <span className="text-sm font-semibold text-slate-700 flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></span>
                  {cat.name}
                </span>
                
                {/* Toggle Mode */}
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button 
                    onClick={() => cat.type !== 'percentage' && toggleCategoryType(cat.id)}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${cat.type === 'percentage' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                  >
                    %
                  </button>
                  <button 
                    onClick={() => cat.type !== 'fixed' && toggleCategoryType(cat.id)}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${cat.type === 'fixed' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                  >
                    R$
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {cat.type === 'percentage' ? (
                  <div className="w-full space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">Porcentagem do restante</span>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={cat.percentage}
                          onChange={(e) => handlePercentageChange(cat.id, e.target.value)}
                          className="w-20 text-right font-bold py-1.5 pl-2 pr-6 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-800"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
                      </div>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      step="1"
                      value={cat.percentage}
                      onChange={(e) => handlePercentageChange(cat.id, e.target.value)}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500 transition-all hover:bg-slate-300"
                    />
                  </div>
                ) : (
                  <div className="w-full space-y-2">
                    <span className="text-xs text-slate-400 font-medium block">Valor Fixo Mensal</span>
                    <div className="relative group">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
                      <input 
                        type="text" 
                        inputMode="numeric"
                        value={formatCurrencyInput(cat.fixedValue)}
                        onChange={(e) => handleFixedValueChange(cat.id, e.target.value)}
                        className="w-full font-bold pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-800"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Description Field */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase px-1">Descrição (Opcional)</label>
                <textarea 
                  value={cat.description || ''}
                  onChange={(e) => handleDescriptionChange(cat.id, e.target.value)}
                  placeholder="Ex: Aluguel, Internet, Luz..."
                  rows={2}
                  className="w-full text-xs p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-700 resize-none"
                  maxLength={200}
                />
                <div className="flex justify-end">
                  <span className="text-[9px] text-slate-300">{(cat.description || '').length}/200</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Validation Alert */}
        <div className="space-y-3">
          {hasPercentageCategories && (
            <div className={`p-4 rounded-xl flex items-center gap-3 transition-all duration-300 ${isValid ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
              {isValid ? (
                <div className="flex items-center gap-3 w-full">
                  <div className="bg-emerald-500 p-1 rounded-full text-white">
                    <Save size={14} strokeWidth={3} />
                  </div>
                  <span className="text-sm font-bold">Total das porcentagens: {totalPercentage}% (Válido!)</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 w-full">
                  <AlertCircle size={20} className="shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">O total das porcentagens deve ser 100%</span>
                    <span className="text-xs opacity-80">
                      Atual: {totalPercentage}% | {totalPercentage < 100 ? `Faltam ${100 - totalPercentage}%` : `Sobram ${totalPercentage - 100}%`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {!isSalaryEnough && (
            <div className="p-4 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center gap-3">
              <AlertCircle size={20} className="shrink-0" />
              <div className="flex flex-col">
                <span className="text-sm font-bold">Atenção: Valores fixos excedem o salário</span>
                <span className="text-xs opacity-80">
                  Total fixo: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(fixedSum)}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* PWA & App Installation Card */}
      

      {/* Save Button */}
      <div className="sticky bottom-4 z-10 px-2">
        <button 
          onClick={() => onSave(salary, categories)}
          disabled={!isValid || !isSalaryEnough}
          className={`w-full p-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl active:scale-[0.98] ${(isValid && isSalaryEnough) ? 'bg-emerald-600 hover:bg-emerald-700 text-white transform hover:-translate-y-1' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}
        >
          <Save size={20} />
          Salvar e Aplicar
        </button>
      </div>

      {/* Install PWA Modal */}
      <InstallModal 
        isOpen={isInstallModalOpen} 
        onClose={() => setIsInstallModalOpen(false)} 
      />
    </div>
  );
};
