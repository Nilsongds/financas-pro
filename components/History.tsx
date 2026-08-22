import React from 'react';
import { HistoryRecord } from '../types';
import { Trash2, Calendar } from 'lucide-react';

interface HistoryProps {
  history: HistoryRecord[];
  onClear: () => void;
  onDelete: (id: string) => void;
  onCloseMonth: () => void;
}

export const History: React.FC<HistoryProps> = ({ history, onClear, onDelete, onCloseMonth }) => {
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

  return (
    <div className="space-y-4 animate-fadeIn pb-10">
      <button onClick={onCloseMonth} className="w-full rounded-xl bg-[#8ab4f8] px-4 py-3 text-sm font-bold text-[#0f172a] transition hover:bg-[#74a9f7]">
        Fechar mês atual
      </button>

      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Histórico de Fechamentos</h2>
        {history.length > 0 && (
          <button onClick={onClear} className="flex items-center gap-1.5 rounded-xl p-2 text-xs font-semibold text-red-400 transition-colors hover:bg-red-950/30">
            <Trash2 size={15} /> Limpar tudo
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-3 rounded-3xl border border-[#27272a] bg-[#18181b] p-10 text-center">
          <Calendar size={42} className="text-zinc-600" />
          <div>
            <p className="text-sm font-bold text-white">Nenhum fechamento registrado</p>
            <p className="mt-1 text-xs text-zinc-400">Feche o mês atual para salvar um resumo permanente.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((record) => (
            <article key={record.id} className="rounded-2xl border border-[#27272a] bg-[#18181b] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-white">{new Date(record.date + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
                  <p className="mt-1 text-xs text-zinc-400">Receitas registradas: {formatCurrency(record.salary)}</p>
                                <p className="mt-1 text-xs text-zinc-400">Despesas registradas: {formatCurrency(record.expenses || 0)}</p>
              <p className="mt-1 text-xs font-semibold text-emerald-400">Saldo final: {formatCurrency(record.balance ?? record.salary - (record.expenses || 0))}</p>
                </div>
                <button onClick={() => onDelete(record.id)} aria-label="Excluir fechamento" className="rounded-lg p-2 text-zinc-500 transition hover:bg-red-950/30 hover:text-red-400">
                  <Trash2 size={16} />
                </button>
              </div>
              {record.allocations.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {record.allocations.map((allocation) => (
                    <div key={allocation.name} className="rounded-lg bg-[#121214] p-2">
                      <p className="truncate text-[11px] text-zinc-400">{allocation.name}</p>
                      <p className="mt-0.5 text-xs font-semibold text-zinc-100">{formatCurrency(allocation.value)}</p>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
