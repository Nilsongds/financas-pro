import React from 'react';
import { HistoryRecord } from '../types';
import { Trash2, Calendar, ChevronRight } from 'lucide-react';

interface HistoryProps {
  history: HistoryRecord[];
  onClear: () => void;
  onDelete: (id: string) => void;
}

export const History: React.FC<HistoryProps> = ({ history, onClear, onDelete }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-10">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Histórico de Fechamentos</h2>
        {history.length > 0 && (
          <button 
            onClick={onClear}
            className="text-red-400 hover:bg-red-950/30 p-2 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <Trash2 size={15} /> Limpar Tudo
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="bg-[#18181b] p-10 rounded-3xl border border-[#27272a] flex flex-col items-center justify-center text-center space-y-3">
          <Calendar size={42} className="text-zinc-600" />
          <div>
            <p className="text-white font-bold text-sm">Nenhum fechamento registrado</p>
            <p className="text-zinc-400 text-xs mt-1">Seus fechamentos mensais salvos aparecerão aqui organizados.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((record) => (
            <div key={record.id} className="bg-[#18181b] rounded-3xl border border-[#27272a] shadow-sm overflow-hidden transition-all hover:border-zinc-700">
              <div className="bg-[#121214] p-4 flex justify-between items-center border-b border-[#27272a]">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white capitalize text-sm">{record.date}</span>
                  <button 
                    onClick={() => onDelete(record.id)}
                    className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                    title="Excluir este registro"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <span className="text-[#4ade80] font-bold text-sm">{formatCurrency(record.salary)}</span>
              </div>
              <div className="p-4 space-y-2">
                {record.allocations.map((alloc, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <ChevronRight size={13} className="text-zinc-600" />
                      {alloc.name}
                    </span>
                    <div className="text-right">
                      <span className="text-zinc-500 mr-2">{alloc.percentage}%</span>
                      <span className="font-semibold text-zinc-200">{formatCurrency(alloc.value)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
