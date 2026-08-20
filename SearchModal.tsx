import React, { useState, useMemo } from 'react';
import { Search, X, ArrowDownRight, ArrowUpRight, ArrowLeftRight, Sparkles, CreditCard } from 'lucide-react';
import { Transaction, Debt } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  debts: Debt[];
  onSelectTransaction?: (tx: Transaction) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  transactions,
  debts,
  onSelectTransaction,
}) => {
  const [query, setQuery] = useState('');

  const filteredResults = useMemo(() => {
    if (!query.trim()) return { transactions: transactions.slice(0, 10), debts: debts.slice(0, 5) };
    const q = query.toLowerCase();

    const txs = transactions.filter((t) =>
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.account.toLowerCase().includes(q) ||
      (t.budgetCategory && t.budgetCategory.toLowerCase().includes(q)) ||
      t.value.toString().includes(q)
    );

    const dbs = debts.filter((d) =>
      d.name.toLowerCase().includes(q) ||
      d.totalValue.toString().includes(q)
    );

    return { transactions: txs, debts: dbs };
  }, [query, transactions, debts]);

  if (!isOpen) return null;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm p-4 pt-12 sm:pt-20 animate-fadeIn">
      <div className="w-full max-w-xl bg-[#18181b] border border-[#27272a] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-slideUp">
        {/* Search input bar */}
        <div className="p-4 border-b border-[#27272a] flex items-center gap-3 bg-[#121214]">
          <Search size={20} className="text-zinc-400" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar despesas, receitas, contas, categorias..."
            className="flex-1 bg-transparent text-white text-base outline-none placeholder-zinc-500"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-zinc-400 hover:text-white p-1"
            >
              <X size={18} />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#27272a] text-zinc-300 hover:bg-[#3f3f46]"
          >
            Fechar
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Lançamentos ({filteredResults.transactions.length})
              </span>
              <Sparkles size={14} className="text-amber-400" />
            </div>

            {filteredResults.transactions.length === 0 ? (
              <p className="text-xs text-zinc-500 italic p-3 text-center">Nenhum lançamento encontrado.</p>
            ) : (
              <div className="space-y-1.5">
                {filteredResults.transactions.map((tx) => {
                  const isIncome = tx.type === 'Entrada' || tx.type === 'Rendimento';
                  const isTransfer = tx.type === 'Transferência';
                  const isCard = tx.type === 'Despesa Cartão';

                  return (
                    <div
                      key={tx.id}
                      onClick={() => {
                        if (onSelectTransaction) onSelectTransaction(tx);
                      }}
                      className="p-3 bg-[#121214] hover:bg-[#202024] rounded-2xl border border-[#27272a] flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${
                          isIncome
                            ? 'bg-[#14532d]/40 text-[#4ade80]'
                            : isTransfer
                            ? 'bg-[#713f12]/40 text-[#fbbf24]'
                            : isCard
                            ? 'bg-[#1e3a8a]/40 text-[#60a5fa]'
                            : 'bg-[#7f1d1d]/40 text-[#f87171]'
                        }`}>
                          {isIncome ? <ArrowDownRight size={16} /> : isTransfer ? <ArrowLeftRight size={16} /> : isCard ? <CreditCard size={16} /> : <ArrowUpRight size={16} />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {tx.description || tx.category || 'Sem descrição'}
                          </p>
                          <p className="text-xs text-zinc-400">
                            {tx.account} · {new Date(tx.date + 'T12:00:00').toLocaleDateString('pt-BR')} {tx.budgetCategory ? `· ${tx.budgetCategory}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className={`text-sm font-bold ${
                        isIncome ? 'text-[#4ade80]' : isTransfer ? 'text-[#fbbf24]' : 'text-zinc-200'
                      }`}>
                        {isIncome ? '+' : '-'} {formatCurrency(tx.value)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {filteredResults.debts.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-2 mb-2 block">
                Dívidas & Contas a Pagar ({filteredResults.debts.length})
              </span>
              <div className="space-y-1.5">
                {filteredResults.debts.map((d) => (
                  <div
                    key={d.id}
                    className="p-3 bg-[#121214] rounded-2xl border border-[#27272a] flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{d.name}</p>
                      <p className="text-xs text-zinc-400">
                        Vence em {new Date(d.dueDate + 'T12:00:00').toLocaleDateString('pt-BR')} · {d.isRecurring ? 'Recorrente Mensal' : `${d.paidInstallments}/${d.installments} parcelas`}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-[#f87171]">
                      {formatCurrency(d.totalValue)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
