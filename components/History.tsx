
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
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h2 className="text-slate-500 text-sm font-semibold uppercase tracking-widest">Registros Passados</h2>
        {history.length > 0 && (
          <button 
            onClick={onClear}
            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-medium"
          >
            <Trash2 size={16} /> Limpar Tudo
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-4">
          <Calendar size={48} className="text-slate-200" />
          <div>
            <p className="text-slate-800 font-semibold">Nenhum registro ainda</p>
            <p className="text-slate-400 text-sm">Salve seu planejamento mensal na aba Dashboard clicando em 'Registrar Mês'.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((record) => (
            <div key={record.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:border-emerald-200">
              <div className="bg-slate-50 p-4 flex justify-between items-center border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-800 capitalize">{record.date}</span>
                  <button 
                    onClick={() => onDelete(record.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                    title="Excluir este registro"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <span className="text-emerald-700 font-bold">{formatCurrency(record.salary)}</span>
              </div>
              <div className="p-4 space-y-2">
                {record.allocations.map((alloc, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 flex items-center gap-2">
                      <ChevronRight size={14} className="text-slate-300" />
                      {alloc.name}
                    </span>
                    <div className="text-right">
                      <span className="text-slate-400 text-xs mr-2">{alloc.percentage}%</span>
                      <span className="font-medium text-slate-700">{formatCurrency(alloc.value)}</span>
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
