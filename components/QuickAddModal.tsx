import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, ArrowLeftRight, CreditCard, Calendar, Tag, Wallet, Layers } from 'lucide-react';
import { Transaction, TransactionType } from '../types';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType: 'Receita' | 'Despesa' | 'Transferência' | 'Despesa cartão';
  onAddTransaction: (transaction: Transaction) => void;
  accounts: string[];
  categories: string[];
  budgetPlanningCategories: string[];
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  initialType,
  onAddTransaction,
  accounts,
  categories,
  budgetPlanningCategories,
}) => {
  const [selectedType, setSelectedType] = useState<'Receita' | 'Despesa' | 'Transferência' | 'Despesa cartão'>(initialType);
  const [value, setValue] = useState('');
  const [date, setDate] = useState(() => new Date().toLocaleDateString('en-CA'));
  const [account, setAccount] = useState(() => accounts[0] || 'Minha Conta Corrente');
  const [toAccount, setToAccount] = useState(() => accounts[1] || accounts[0] || 'Minha Carteira');
  const [category, setCategory] = useState('');
  const [budgetCategory, setBudgetCategory] = useState('');
  const [description, setDescription] = useState('');

  const incomeCategories = ['Salário', 'Dividendos', 'Juros e rendimentos', 'Renda extra', 'Freelance', 'Aluguel recebido', 'Reembolso', 'Venda', 'Prêmios', 'Outros'];
  const expenseCategories = ['Moradia', 'Contas e serviços', 'Mercado', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Assinaturas', 'Impostos', 'Dívidas', 'Investimentos', 'Outros'];
  const categoryOptions = selectedType === 'Receita' ? incomeCategories : expenseCategories;
  const categoryLabel = selectedType === 'Receita' ? 'Origem da receita' : 'Categoria da despesa';
  const detailLabel = selectedType === 'Receita' && category === 'Dividendos'
    ? 'Ativo pagador (opcional)'
    : selectedType === 'Receita' && category === 'Juros e rendimentos'
      ? 'Instituição ou ativo (opcional)'
      : '{detailLabel}';
  const detailPlaceholder = selectedType === 'Receita' && category === 'Dividendos'
    ? 'Ex.: ITUB4, HGLG11 ou ETF'
    : selectedType === 'Receita' && category === 'Juros e rendimentos'
      ? 'Ex.: 99Pay, CDB Banco X ou Tesouro Direto'
      : 'Ex.: Compras da semana no mercado';

  useEffect(() => {
    if (isOpen) {
      setSelectedType(initialType);
      setValue('');
      setDescription('');
      setDate(new Date().toLocaleDateString('en-CA'));
      if (initialType === 'Receita') {
        setCategory('Salário');
      } else if (initialType === 'Despesa' || initialType === 'Despesa cartão') {
        setCategory('Mercado');
      }
    }
  }, [isOpen, initialType]);

  if (!isOpen) return null;

  const formatCurrencyInput = (input: string) => {
    const digits = input.replace(/\D/g, '');
    if (!digits) return '';
    return (Number(digits) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(formatCurrencyInput(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawVal = Number(value.replace(/\./g, '').replace(',', '.'));
    if (!rawVal || rawVal <= 0) return;

    let finalType: TransactionType = 'Saída';
    if (selectedType === 'Receita') finalType = 'Entrada';
    else if (selectedType === 'Transferência') finalType = 'Transferência';
    else if (selectedType === 'Despesa cartão') finalType = 'Despesa Cartão';

    const newTx: Transaction = {
      id: Date.now().toString(),
      type: finalType,
      value: rawVal,
      date: date || new Date().toLocaleDateString('en-CA'),
      account: account || 'Minha Conta Corrente',
      toAccount: selectedType === 'Transferência' ? toAccount : undefined,
      category: selectedType === 'Transferência' ? 'Transferência' : (category || 'Outros'),
      budgetCategory: budgetCategory || undefined,
      description: description.trim(),
      status: 'Efetivada',
      createdAt: Date.now()
    };

    onAddTransaction(newTx);
    onClose();
  };

  const getTypeTheme = () => {
    switch (selectedType) {
      case 'Receita':
        return {
          title: 'Nova Receita',
          icon: <ArrowDownRight className="text-[#4ade80]" size={20} />,
          badgeColor: 'bg-[#14532d]/40 text-[#4ade80] border-[#22c55e]/30',
          btnColor: 'bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold'
        };
      case 'Despesa':
        return {
          title: 'Nova Despesa',
          icon: <ArrowUpRight className="text-[#f87171]" size={20} />,
          badgeColor: 'bg-[#7f1d1d]/40 text-[#f87171] border-[#ef4444]/30',
          btnColor: 'bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold'
        };
      case 'Transferência':
        return {
          title: 'Nova Transferência',
          icon: <ArrowLeftRight className="text-[#fbbf24]" size={20} />,
          badgeColor: 'bg-[#713f12]/40 text-[#fbbf24] border-[#f59e0b]/30',
          btnColor: 'bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold'
        };
      case 'Despesa cartão':
        return {
          title: 'Despesa no Cartão',
          icon: <CreditCard className="text-[#60a5fa]" size={20} />,
          badgeColor: 'bg-[#1e3a8a]/40 text-[#60a5fa] border-[#3b82f6]/30',
          btnColor: 'bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold'
        };
    }
  };

  const theme = getTypeTheme();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm animate-fadeIn p-0 sm:p-4">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#18181b] border border-[#27272a] shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#27272a]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#27272a]">
              {theme.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{theme.title}</h3>
              <p className="text-xs text-zinc-400">Preencha os detalhes do lançamento</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-[#27272a] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Type selector tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#121214] rounded-2xl border border-[#27272a]">
          <button
            type="button"
            onClick={() => setSelectedType('Receita')}
            className={`py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              selectedType === 'Receita'
                ? 'bg-[#14532d] text-[#4ade80] shadow-sm border border-[#22c55e]/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ArrowDownRight size={16} />
            Receita (Entrada)
          </button>
          <button
            type="button"
            onClick={() => setSelectedType('Despesa')}
            className={`py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              selectedType === 'Despesa' || selectedType === 'Despesa cartão'
                ? 'bg-[#7f1d1d] text-[#f87171] shadow-sm border border-[#ef4444]/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ArrowUpRight size={16} />
            Despesa (Gasto)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Big Currency Value Input */}
          <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272a] text-center space-y-1">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Valor do Lançamento</span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-bold text-zinc-400">R$</span>
              <input
                autoFocus
                type="text"
                inputMode="numeric"
                value={value}
                onChange={handleValueChange}
                placeholder="0,00"
                className="w-48 text-3xl font-extrabold text-white bg-transparent outline-none text-center placeholder-zinc-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Calendar size={14} className="text-zinc-400" /> Data
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#121214] border border-[#27272a] text-white rounded-xl p-3 text-sm focus:outline-none focus:border-zinc-500"
              />
            </div>

            {/* Account */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Wallet size={14} className="text-zinc-400" />
                {selectedType === 'Transferência' ? 'Conta de Origem' : 'Conta'}
              </label>
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full bg-[#121214] border border-[#27272a] text-white rounded-xl p-3 text-sm focus:outline-none focus:border-zinc-500"
              >
                {accounts.map((acc) => (
                  <option key={acc} value={acc} className="bg-[#18181b] text-white">
                    {acc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedType === 'Transferência' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Wallet size={14} className="text-[#fbbf24]" /> Conta de Destino
              </label>
              <select
                value={toAccount}
                onChange={(e) => setToAccount(e.target.value)}
                className="w-full bg-[#121214] border border-[#27272a] text-white rounded-xl p-3 text-sm focus:outline-none focus:border-zinc-500"
              >
                {accounts.filter(a => a !== account).map((acc) => (
                  <option key={acc} value={acc} className="bg-[#18181b] text-white">
                    {acc}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedType !== 'Transferência' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Tag size={14} className="text-zinc-400" /> {categoryLabel}
                </label>
                <input
                  list="category-suggestions"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Ex: Mercado, Salário, Lazer"
                  className="w-full bg-[#121214] border border-[#27272a] text-white rounded-xl p-3 text-sm focus:outline-none focus:border-zinc-500"
                />
                <datalist id="category-suggestions">
                  {categoryOptions.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
                  <select
                    value=""
                    onChange={(e) => { if (e.target.value) setCategory(e.target.value); }}
                    className="w-full bg-[#18181b] border border-[#27272a] text-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-500"
                  >
                    <option value="">Escolha uma sugestão</option>
                    {categoryOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
              </div>

              {/* Budget Category for Salário Planning */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Layers size={14} className="text-zinc-400" /> Destino no planejamento (opcional)
                </label>
                <select
                  value={budgetCategory}
                    disabled={selectedType === 'Receita'}
                  onChange={(e) => setBudgetCategory(e.target.value)}
                  className="w-full bg-[#121214] border border-[#27272a] text-white rounded-xl p-3 text-sm focus:outline-none focus:border-zinc-500"
                >
                  <option value="" className="bg-[#18181b] text-zinc-400">Sem categoria planejada</option>
                  {budgetPlanningCategories.map((bp) => (
                    <option key={bp} value={bp} className="bg-[#18181b] text-white">
                      {bp}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              {detailLabel}
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={detailPlaceholder}
              className="w-full bg-[#121214] border border-[#27272a] text-white rounded-xl p-3 text-sm focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 rounded-xl bg-[#27272a] hover:bg-[#3f3f46] text-zinc-300 text-sm font-semibold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`flex-1 py-3 rounded-xl text-sm transition shadow-lg active:scale-98 ${theme.btnColor}`}
            >
              Confirmar Lançamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
