
import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Category } from '../types';
import { TrendingUp, PlusCircle, Info, X } from 'lucide-react';

interface DashboardProps {
  salary: number;
  categories: Category[];
  onLogMonth: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ salary, categories, onLogMonth }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const fixedSum = categories.filter(c => c.type === 'fixed').reduce((acc, c) => acc + c.fixedValue, 0);
  const remainingSalary = Math.max(0, salary - fixedSum);

  const chartData = categories.map(cat => {
    const amount = cat.type === 'fixed' 
      ? cat.fixedValue 
      : (remainingSalary * cat.percentage) / 100;
    
    return {
      name: cat.name,
      value: amount, // Valor real para o gráfico
      realPercentage: salary > 0 ? (amount / salary) * 100 : 0,
      amount: amount,
      color: cat.color,
      type: cat.type,
      configValue: cat.type === 'fixed' ? cat.fixedValue : cat.percentage,
      id: cat.id // Adicionado para facilitar a busca no clique
    };
  }).filter(item => item.amount > 0); // Não mostrar categorias zeradas no gráfico

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handlePieClick = (data: any) => {
    const category = categories.find(c => c.id === data.id);
    if (category) {
      setSelectedCategory(category);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Salary Overview Card */}
      <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex justify-between items-center">
        <div>
          <p className="text-emerald-700 text-sm font-medium">Salário Planejado</p>
          <h2 className="text-3xl font-bold text-emerald-900">{formatCurrency(salary)}</h2>
          {fixedSum > 0 && (
            <p className="text-emerald-600 text-[10px] mt-1 font-medium">
              Restante após fixos: {formatCurrency(remainingSalary)}
            </p>
          )}
        </div>
        <button 
          onClick={onLogMonth}
          className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2"
          title="Registrar mês no histórico"
        >
          <PlusCircle size={20} />
          <span className="hidden sm:inline font-medium">Registrar Mês</span>
        </button>
      </div>

      {/* Calculation Summary Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
        <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-widest">Resumo do Cálculo</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase font-bold">Salário Total</p>
            <p className="text-lg font-bold text-slate-700">{formatCurrency(salary)}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase font-bold">Total Fixo (-)</p>
            <p className="text-lg font-bold text-amber-600">{formatCurrency(fixedSum)}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <p className="text-[10px] text-emerald-600 uppercase font-bold">Saldo p/ % (=)</p>
            <p className="text-lg font-bold text-emerald-700">{formatCurrency(remainingSalary)}</p>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 italic px-1">
          * As categorias em porcentagem são calculadas sobre o <strong>Saldo p/ %</strong>.
        </p>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
        <h3 className="text-slate-500 text-sm font-semibold mb-2 self-start uppercase tracking-widest">Divisão de Gastos</h3>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
                onClick={handlePieClick}
                className="cursor-pointer outline-none"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string, props: any) => [
                  `${formatCurrency(value)} (${props.payload.realPercentage.toFixed(1)}%)`, 
                  name
                ]}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] text-slate-400 mt-2 italic">Dica: Clique em uma fatia ou item da lista para ver detalhes.</p>
      </div>

      {/* List Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-widest">Detalhes</h3>
          <TrendingUp size={16} className="text-slate-400" />
        </div>
        
        {categories.map((cat, idx) => {
          const amount = cat.type === 'fixed' 
            ? cat.fixedValue 
            : (remainingSalary * cat.percentage) / 100;
          const realPercentage = salary > 0 ? (amount / salary) * 100 : 0;

          return (
            <div 
              key={idx} 
              onClick={() => setSelectedCategory(cat)}
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.99] group"
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-3 h-10 rounded-full" 
                  style={{ backgroundColor: cat.color }} 
                />
                <div>
                  <p className="font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors flex items-center gap-2">
                    {cat.name}
                    {cat.description && <Info size={12} className="text-slate-300" />}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase ${cat.type === 'fixed' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                      {cat.type === 'fixed' ? 'Fixo' : `${cat.percentage}%`}
                    </span>
                    <p className="text-slate-400 text-[10px] font-medium">{realPercentage.toFixed(1)}% do total</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900">{formatCurrency(amount)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Detail Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: selectedCategory.color }}></div>
                  <h4 className="text-xl font-bold text-slate-800">{selectedCategory.name}</h4>
                </div>
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Valor Atual</p>
                    <p className="text-lg font-bold text-slate-800">
                      {formatCurrency(
                        selectedCategory.type === 'fixed' 
                          ? selectedCategory.fixedValue 
                          : (remainingSalary * selectedCategory.percentage) / 100
                      )}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Configuração</p>
                    <p className="text-lg font-bold text-emerald-600">
                      {selectedCategory.type === 'fixed' ? 'Fixo' : `${selectedCategory.percentage}%`}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] text-slate-400 uppercase font-bold px-1">Descrição</p>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 min-h-[100px]">
                    {selectedCategory.description ? (
                      <p className="text-sm text-slate-600 leading-relaxed">{selectedCategory.description}</p>
                    ) : (
                      <p className="text-sm text-slate-300 italic">Nenhuma descrição informada para esta categoria.</p>
                    )}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedCategory(null)}
                className="w-full py-3 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-900 transition-all active:scale-95"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
