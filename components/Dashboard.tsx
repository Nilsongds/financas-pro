import React, { useState, useMemo } from 'react';
import {
  Landmark,
  Plus,
  Minus,
  ArrowLeftRight,
  PiggyBank,
  Wallet,
  Building2,
  ChevronRight,
  ExternalLink,
  MoreVertical,
  Search,
  Sparkles,
  BarChart2,
  CheckCircle,
  Clock,
  LayoutGrid,
  Info
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { Category, Transaction, Debt } from '../types';

interface DashboardProps {
  salary: number;
  categories: Category[];
  transactions: Transaction[];
  debts: Debt[];
  accounts: string[];
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onOpenSearch?: () => void;
  onOpenQuickAdd: (type: 'Receita' | 'Despesa' | 'Transferência' | 'Despesa cartão') => void;
  onNavigateTab: (tab: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  salary,
  categories,
  transactions,
  debts,
  accounts,
  currentDate,
  onPrevMonth,
  onNextMonth,
  onOpenSearch,
  onOpenQuickAdd,
  onNavigateTab,
}) => {
  const [selectedBalanceTab, setSelectedBalanceTab] = useState<'inicial' | 'saldo' | 'previsto'>('saldo');
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0);

  const monthYearString = useMemo(() => {
    return currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }, [currentDate]);

  const monthCapitalized = useMemo(() => {
    const m = currentDate.toLocaleDateString('pt-BR', { month: 'long' });
    return m.charAt(0).toUpperCase() + m.slice(1);
  }, [currentDate]);

  const monthPrefix = useMemo(() => {
    return currentDate.toLocaleDateString('en-CA').slice(0, 7);
  }, [currentDate]);

  // Transações do mês selecionado
  const monthTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(monthPrefix));
  }, [transactions, monthPrefix]);

  // Contas saldos reais calculados
  const accountBalances = useMemo(() => {
    const balances: Record<string, number> = {};
    accounts.forEach(acc => {
      balances[acc] = 0;
    });

    transactions.filter(t => t.date <= new Date().toLocaleDateString('en-CA')).forEach(t => {
      const val = Number(t.value) || 0;
      if (t.type === 'Entrada' || t.type === 'Rendimento') {
        balances[t.account] = (balances[t.account] || 0) + val;
      } else if (t.type === 'Saída' || t.type === 'Despesa Cartão') {
        balances[t.account] = (balances[t.account] || 0) - val;
      } else if (t.type === 'Transferência') {
        balances[t.account] = (balances[t.account] || 0) - val;
        if (t.toAccount) {
          balances[t.toAccount] = (balances[t.toAccount] || 0) + val;
        }
      } else if (t.type === 'Aplicação') {
        balances[t.account] = (balances[t.account] || 0) - val;
      } else if (t.type === 'Resgate') {
        balances[t.account] = (balances[t.account] || 0) + val;
      }
    });

    return balances;
  }, [transactions, accounts]);

  const totalContas = useMemo(() => {
    return Object.values(accountBalances).reduce((acc: number, v: number) => acc + v, 0);
  }, [accountBalances]);

  // Receitas e Despesas do mês
  const receitasMes = useMemo(() => {
    const hasSalaryTx = monthTransactions.some(
      t => (t.type === 'Entrada' || t.type === 'Rendimento') &&
           (t.category.toLowerCase() === 'salário' || t.category.toLowerCase() === 'salario')
    );
    const txRevenues = monthTransactions
      .filter(t => t.type === 'Entrada' || t.type === 'Rendimento')
      .reduce((sum, t) => sum + t.value, 0);

    return hasSalaryTx ? txRevenues : txRevenues + (salary || 0);
  }, [monthTransactions, salary]);

      const receitaSalarioMes = useMemo(() => {
    const salarioRegistrado = monthTransactions
      .filter((item) =>
        item.type === 'Entrada' &&
        (item.category || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === 'salario'
      )
      .reduce((total, item) => total + (Number(item.value) || 0), 0);

    return salarioRegistrado > 0 ? salarioRegistrado : (salary || 0);
  }, [monthTransactions, salary]);

const planejamentoPorCategoria = useMemo(() => {
    return categories.map((category) => {
      const value = category.type === 'percentage'
                ? (receitaSalarioMes * category.percentage) / 100
        : category.fixedValue;
      const percentage = category.type === 'percentage'
        ? category.percentage
                : receitaSalarioMes > 0 ? (category.fixedValue / receitaSalarioMes) * 100 : 0;

      return { ...category, value, percentage };
    });
    }, [categories, receitaSalarioMes]);

const despesasMes = useMemo(() => {
    return monthTransactions
      .filter(t => t.type === 'Saída' || t.type === 'Despesa Cartão')
      .reduce((sum, t) => sum + t.value, 0);
  }, [monthTransactions]);

  const balancoTransferencias = useMemo(() => {
    return monthTransactions
      .filter(t => t.type === 'Transferência')
      .reduce((sum, t) => sum + t.value, 0);
  }, [monthTransactions]);

  // Saldo real e previsto
  const saldoAtual = totalContas;
  const saldoInicialMes = Math.max(0, totalContas - (receitasMes - despesasMes));
  const despesasPrevistasMes = useMemo(() => {
    return debts.reduce((sum, debt) => {
      const firstDue = new Date(debt.dueDate + 'T12:00:00');
      const monthDistance = (currentDate.getFullYear() - firstDue.getFullYear()) * 12 + currentDate.getMonth() - firstDue.getMonth();
      if (monthDistance < 0) return sum;

      if (debt.isRecurring) {
        const isCurrentMonth = monthDistance === 0;
        return (!isCurrentMonth || !debt.paid) ? sum + debt.totalValue : sum;
      }

      const paidInstallments = debt.paidInstallments || 0;
      if (monthDistance >= paidInstallments && monthDistance < debt.installments) {
        return sum + debt.totalValue / debt.installments;
      }
      return sum;
    }, 0);
  }, [debts, currentDate]);

  const saldoPrevisto = transactions.reduce((saldo, t) => {
    const valor = Number(t.value) || 0;
    if (t.type === 'Entrada' || t.type === 'Rendimento' || t.type === 'Resgate') return saldo + valor;
    if (t.type === 'Saída' || t.type === 'Despesa Cartão' || t.type === 'Aplicação') return saldo - valor;
    return saldo;
  }, 0) - despesasPrevistasMes;

  // Economia mensal
  const valorEconomizado = Math.max(0, receitasMes - despesasMes);
  const percentualEconomia = receitasMes > 0 ? Math.min(100, Math.round((valorEconomizado / receitasMes) * 100)) : 0;

  // Discriminação das Despesas por status de vencimento
  const despesasDiscrim = useMemo(() => {
    const hojeStr = new Date().toLocaleDateString('en-CA');
    const saidas = monthTransactions.filter(t => t.type === 'Saída' || t.type === 'Despesa Cartão');
    const total = saidas.reduce((acc, t) => acc + t.value, 0);

    let efetivadas = 0;
    let proximo = 0;
    let vencidas = 0;
    let distante = 0;

    saidas.forEach(t => {
      if (t.status === 'Efetivada' || !t.status) {
        efetivadas += t.value;
      } else {
        const diffDays = (new Date(t.date).getTime() - new Date(hojeStr).getTime()) / (1000 * 3600 * 24);
        if (diffDays < 0) vencidas += t.value;
        else if (diffDays <= 3) proximo += t.value;
        else distante += t.value;
      }
    });

    const calcPct = (val: number) => (total > 0 ? Math.round((val / total) * 100) : 0);

    return {
      total,
      efetivadas: { val: efetivadas, pct: calcPct(efetivadas) },
      proximo: { val: proximo, pct: calcPct(proximo) },
      vencidas: { val: vencidas, pct: calcPct(vencidas) },
      distante: { val: distante, pct: calcPct(distante) },
    };
  }, [monthTransactions]);

  // Discriminação das Receitas
  const receitasDiscrim = useMemo(() => {
    const total = receitasMes;
    const efetivadas = total;
    return {
      total,
      efetivadas: { val: efetivadas, pct: total > 0 ? 100 : 0 },
      proximo: { val: 0, pct: 0 },
      vencidas: { val: 0, pct: 0 },
      distante: { val: 0, pct: 0 },
    };
  }, [receitasMes]);

  // Despesas por Categoria para o gráfico de pizza
  const despesasPorCategoria = useMemo(() => {
    const cats: Record<string, number> = {};
    monthTransactions
      .filter(t => t.type === 'Saída' || t.type === 'Despesa Cartão')
      .forEach(t => {
        const c = t.category || 'Outros';
        cats[c] = (cats[c] || 0) + t.value;
      });

    const data = Object.entries(cats).map(([name, value], idx) => ({
      name,
      value,
      color: ['#e4e4e7', '#d4d4d8', '#a1a1aa', '#71717a', '#52525b', '#3f3f46'][idx % 6]
    }));

    if (data.length === 0) {
      return [
        { name: 'Sem despesas', value: 1, color: '#27272a' }
      ];
    }
    return data;
  }, [monthTransactions]);

  // Evolução das despesas (linha do tempo ao longo dos dias do mês)
  const evolucaoDespesasData = useMemo(() => {
    const daysMap: Record<number, number> = { 1: 0, 7: 0, 14: 0, 21: 0, 28: 0 };
    monthTransactions
      .filter(t => t.type === 'Saída' || t.type === 'Despesa Cartão')
      .forEach(t => {
        const day = parseInt(t.date.split('-')[2] || '1', 10);
        let bucket = 1;
        if (day > 21) bucket = 28;
        else if (day > 14) bucket = 21;
        else if (day > 7) bucket = 14;
        else if (day > 1) bucket = 7;
        daysMap[bucket] = (daysMap[bucket] || 0) + t.value;
      });

    return [
      { name: 'Sem 1', value: daysMap[1] || 0 },
      { name: 'Sem 2', value: daysMap[7] || 0 },
      { name: 'Sem 3', value: daysMap[14] || 0 },
      { name: 'Sem 4', value: (daysMap[21] || 0) + (daysMap[28] || 0) },
    ];
  }, [monthTransactions]);

  // Timeline de 7 dias centralizada
  const timelineDays = useMemo(() => {
    const days = [];
    const base = new Date(currentDate);
    const dayOfMonth = base.getDate();

    for (let i = -3; i <= 3; i++) {
      const d = new Date(base);
      d.setDate(dayOfMonth + i);
      const str = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      days.push({
        label: str,
        offset: i,
        isCenter: i === 0,
        dayNumber: d.getDate()
      });
    }
    return days;
  }, [currentDate]);

  const formatMoney = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  return (
    <div className="space-y-4 animate-fadeIn pb-12">
      {/* Top Header: Mês e Indicadores de Saldo */}
      <div className="bg-[#121214] rounded-3xl p-5 border border-[#27272a] shadow-lg space-y-4">
        {/* Navigation Selector */}
        <div className="flex items-center justify-between">
          <button
            onClick={onPrevMonth}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-[#27272a] transition active:scale-95"
            aria-label="Mês anterior"
          >
            <ChevronRight className="rotate-180" size={20} />
          </button>
          
          <h2 className="absolute left-1/2 -translate-x-1/2 text-center text-lg font-bold text-white tracking-wide capitalize">
            {monthCapitalized}
                          <span className="mt-0.5 block text-[10px] font-medium normal-case tracking-normal text-zinc-400">
                {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
          </h2>

          <button
            onClick={onNextMonth}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-[#27272a] transition active:scale-95"
            aria-label="Próximo mês"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* 3 Indicators: Inicial / Saldo / Previsto */}
        <div className="flex items-center justify-between px-2 pt-1">
          {/* Inicial */}
          <button
            onClick={() => setSelectedBalanceTab('inicial')}
            className={`flex flex-col items-center gap-1 transition ${
              selectedBalanceTab === 'inicial' ? 'opacity-100' : 'opacity-60 hover:opacity-90'
            }`}
          >
            <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-medium">
              <CheckCircle size={12} className="text-zinc-500" />
              <span>Inicial</span>
            </div>
            <span className="text-xs font-semibold text-zinc-300">
              {formatMoney(saldoInicialMes)}
            </span>
          </button>

          {/* Saldo Central Destaque */}
          <button
            onClick={() => setSelectedBalanceTab('saldo')}
            className="flex flex-col items-center -mt-2"
          >
            <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-bold mb-0.5">
              <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              <span>Saldo</span>
            </div>
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {formatMoney(saldoAtual)}
            </span>
          </button>

          {/* Previsto */}
          <button
            onClick={() => setSelectedBalanceTab('previsto')}
            className={`flex flex-col items-center gap-1 transition ${
              selectedBalanceTab === 'previsto' ? 'opacity-100' : 'opacity-60 hover:opacity-90'
            }`}
          >
            <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-medium">
              <Clock size={12} className="text-zinc-500" />
              <span>Previsto</span>
            </div>
            <span className="text-xs font-semibold text-zinc-300">
              {formatMoney(saldoPrevisto)}
            </span>
          </button>
        </div>

        {/* Timeline Horizontal de Dias */}
        <div className="pt-2 border-t border-[#27272a]/60">
          <div className="relative flex items-center justify-between px-1">
            {/* Connecting line */}
            <div className="absolute left-4 right-4 top-[7px] h-[1.5px] bg-[#f43f5e]/40 z-0" />

            {timelineDays.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedDayOffset(item.offset)}
                className="relative z-10 flex flex-col items-center group cursor-pointer focus:outline-none"
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full transition-transform ${
                    item.offset === selectedDayOffset
                      ? 'bg-[#f43f5e] ring-4 ring-[#f43f5e]/25 scale-110 shadow-[0_0_10px_#f43f5e]'
                      : 'bg-[#fb7185] hover:scale-110'
                  }`}
                />
                <span className={`text-[10px] mt-1.5 font-medium transition ${
                  item.offset === selectedDayOffset ? 'text-white font-bold' : 'text-zinc-500'
                }`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Card 1: Visão Geral */}
      <div className="bg-[#18181b] rounded-3xl p-5 border border-[#27272a] shadow-sm space-y-4">
        <div className="relative flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Visão geral do mês</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Receitas */}
          <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272a] space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#4ade80]">
              <span className="w-2 h-2 rounded-full bg-[#4ade80]" />
              <span>Receitas</span>
            </div>
            <p className="text-lg sm:text-xl font-extrabold text-white">
              {formatMoney(receitasMes)}
            </p>
            <p className="text-[10px] text-zinc-400">Total recebido no mês</p>
          </div>

          {/* Despesas */}
          <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272a] space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#f87171]">
              <span className="w-2 h-2 rounded-full bg-[#f87171]" />
              <span>Despesas</span>
            </div>
            <p className="text-lg sm:text-xl font-extrabold text-white">
              {formatMoney(despesasMes)}
            </p>
            <p className="text-[10px] text-zinc-400">Total gasto no mês</p>
                  {despesasPrevistasMes > 0 && (
                    <p className="text-[10px] text-amber-400 font-semibold">Parcelas previstas: {formatMoney(despesasPrevistasMes)}</p>
                  )}
          </div>
        </div>
      </div>

      {/* Card 3: Economia Mensal */}
      <div className="bg-[#18181b] rounded-3xl p-5 border border-[#27272a] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Economia mensal</h3>
          <button className="text-zinc-500 hover:text-zinc-300 p-1">
            <MoreVertical size={16} />
          </button>
        </div>

        <div className="flex items-center gap-4 py-2">
          {/* Gauge Circular */}
          <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
              <path
                className="text-[#27272a]"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#22c55e] transition-all duration-700"
                strokeDasharray={`${percentualEconomia}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-xl font-extrabold text-white leading-none">{percentualEconomia}%</span>
              <span className="text-[9px] text-zinc-400 mt-0.5">de economia</span>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-3">
            <div className="cursor-pointer group">
              <p className="text-[11px] text-zinc-400 font-medium">Receitas consideradas</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#4ade80]">{formatMoney(receitasMes)}</span>
                <ChevronRight size={14} className="text-zinc-500 group-hover:text-white transition" />
              </div>
            </div>

            <div className="cursor-pointer group">
              <p className="text-[11px] text-zinc-400 font-medium">Despesas consideradas</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#f87171]">{formatMoney(despesasMes)}</span>
                <ChevronRight size={14} className="text-zinc-500 group-hover:text-white transition" />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-[#27272a]">
          <p className="text-lg font-extrabold text-white">{formatMoney(valorEconomizado)}</p>
          <p className="text-[11px] text-zinc-400">Valor economizado</p>
        </div>
      </div>

                          {/* Card 4: Despesas por Categoria */}
      <div className="hidden bg-[#18181b] rounded-3xl p-5 border border-[#27272a] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Despesas por categoria</h3>
          <div className="flex items-center gap-1 text-zinc-500">
            <button className="p-1 hover:text-zinc-300">
              <ChevronRight className="rotate-90" size={16} />
            </button>
            <button className="p-1 hover:text-zinc-300">
              <ExternalLink size={16} />
            </button>
          </div>
        </div>

        <div className="h-56 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={despesasPorCategoria}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                stroke="#18181b"
                strokeWidth={2}
              >
                {despesasPorCategoria.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: number, name: string) => [formatMoney(val), name]}
                contentStyle={{
                  backgroundColor: '#121214',
                  borderColor: '#27272a',
                  borderRadius: '12px',
                  color: '#ffffff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Card 5: Discriminação das Despesas */}
      <div className="hidden bg-[#18181b] rounded-3xl p-5 border border-[#27272a] shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Discriminação das despesas</h3>
          <button className="text-zinc-500 hover:text-zinc-300 p-1">
            <MoreVertical size={16} />
          </button>
        </div>

        <div className="space-y-2.5">
          {/* Efetivadas */}
          <div className="flex items-center justify-between p-1 cursor-pointer group">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#14532d]/40 text-[#4ade80] border border-[#22c55e]/30">
                {despesasDiscrim.efetivadas.pct}%
              </span>
              <span className="text-sm text-zinc-200 font-medium">Efetivadas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-white">
                {formatMoney(despesasDiscrim.efetivadas.val)}
              </span>
              <ChevronRight size={14} className="text-zinc-500 group-hover:text-white" />
            </div>
          </div>

          {/* Próximo do Vencimento */}
          <div className="flex items-center justify-between p-1 cursor-pointer group">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#713f12]/40 text-[#fde047] border border-[#f59e0b]/30">
                {despesasPrevistasMes > 0 ? 100 : 0}%
              </span>
              <span className="text-sm text-zinc-200 font-medium">{despesasPrevistasMes > 0 ? 'Parcelas previstas' : 'Sem parcelas previstas'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-white">
                {formatMoney(despesasPrevistasMes)}
              </span>
              <ChevronRight size={14} className="text-zinc-500 group-hover:text-white" />
            </div>
          </div>

          {/* Vencidas */}
          <div className="flex items-center justify-between p-1 cursor-pointer group">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#7f1d1d]/40 text-[#fca5a5] border border-[#ef4444]/30">
                {despesasDiscrim.vencidas.pct}%
              </span>
              <span className="text-sm text-zinc-200 font-medium">Vencidas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-white">
                {formatMoney(despesasDiscrim.vencidas.val)}
              </span>
              <ChevronRight size={14} className="text-zinc-500 group-hover:text-white" />
            </div>
          </div>

          {/* Distante do Vencimento */}
          <div className="flex items-center justify-between p-1 cursor-pointer group">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#27272a] text-[#a1a1aa] border border-[#3f3f46]">
                {despesasDiscrim.distante.pct}%
              </span>
              <span className="text-sm text-zinc-200 font-medium">Distante do vencimento</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-white">
                {formatMoney(despesasDiscrim.distante.val)}
              </span>
              <ChevronRight size={14} className="text-zinc-500 group-hover:text-white" />
            </div>
          </div>

          {/* Total Despesa */}
          <div className="pt-2 border-t border-[#27272a] flex items-center justify-between cursor-pointer group">
            <span className="text-sm font-bold text-white">Total despesa</span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold text-white">
                {formatMoney(despesasMes + despesasPrevistasMes)}
              </span>
              <ChevronRight size={14} className="text-zinc-500 group-hover:text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Card 6: Discriminação das Receitas */}
      <div className="hidden bg-[#18181b] rounded-3xl p-5 border border-[#27272a] shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Discriminação das receitas</h3>
          <button className="text-zinc-500 hover:text-zinc-300 p-1">
            <MoreVertical size={16} />
          </button>
        </div>

        <div className="space-y-2.5">
          {/* Efetivadas */}
          <div className="flex items-center justify-between p-1 cursor-pointer group">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#14532d]/40 text-[#4ade80] border border-[#22c55e]/30">
                {receitasDiscrim.efetivadas.pct}%
              </span>
              <span className="text-sm text-zinc-200 font-medium">Efetivadas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-white">
                {formatMoney(receitasDiscrim.efetivadas.val)}
              </span>
              <ChevronRight size={14} className="text-zinc-500 group-hover:text-white" />
            </div>
          </div>

          {/* Próximo do Vencimento */}
          <div className="flex items-center justify-between p-1 cursor-pointer group">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#713f12]/40 text-[#fde047] border border-[#f59e0b]/30">
                0%
              </span>
              <span className="text-sm text-zinc-200 font-medium">Próximo do vencimento</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-white">{formatMoney(0)}</span>
              <ChevronRight size={14} className="text-zinc-500 group-hover:text-white" />
            </div>
          </div>

          {/* Vencidas */}
          <div className="flex items-center justify-between p-1 cursor-pointer group">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#7f1d1d]/40 text-[#fca5a5] border border-[#ef4444]/30">
                0%
              </span>
              <span className="text-sm text-zinc-200 font-medium">Vencidas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-white">{formatMoney(0)}</span>
              <ChevronRight size={14} className="text-zinc-500 group-hover:text-white" />
            </div>
          </div>

          {/* Distante do Vencimento */}
          <div className="flex items-center justify-between p-1 cursor-pointer group">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#27272a] text-[#a1a1aa] border border-[#3f3f46]">
                0%
              </span>
              <span className="text-sm text-zinc-200 font-medium">Distante do vencimento</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-white">{formatMoney(0)}</span>
              <ChevronRight size={14} className="text-zinc-500 group-hover:text-white" />
            </div>
          </div>

          {/* Total Receita */}
          <div className="pt-2 border-t border-[#27272a] flex items-center justify-between cursor-pointer group">
            <span className="text-sm font-bold text-white">Total receita</span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold text-white">
                {formatMoney(receitasDiscrim.total)}
              </span>
              <ChevronRight size={14} className="text-zinc-500 group-hover:text-white" />
            </div>
          </div>
        </div>
      </div>

                                        {/* Orçamento mensal por categoria */}
      <div className="bg-[#18181b] rounded-3xl p-5 border border-[#27272a] shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white">Orçamento por categoria</h3>
                        <p className="mt-1 text-xs text-zinc-400">Divisão do salário recebido no mês</p>
          </div>
                    <span className="text-xs font-semibold text-[#8ab4f8]">{formatMoney(receitaSalarioMes)}</span>
        </div>

                {receitaSalarioMes > 0 ? (
          <>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planejamentoPorCategoria}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="#18181b"
                    strokeWidth={2}
                  >
                    {planejamentoPorCategoria.map((item) => (
                      <Cell key={item.id} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number, name: string) => [formatMoney(val), name]}
                    contentStyle={{ backgroundColor: '#121214', borderColor: '#27272a', borderRadius: '12px', color: '#ffffff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {planejamentoPorCategoria.map((item) => (
                <div key={item.id} className="rounded-xl bg-[#121214] p-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <p className="truncate text-xs font-semibold text-zinc-200">{item.name}</p>
                  </div>
                  <p className="mt-1 text-sm font-bold text-white">{item.percentage.toFixed(0)}%</p>
                  <p className="text-xs text-zinc-400">{formatMoney(item.value)} disponível</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#3f3f46] bg-[#121214] p-5 text-center text-xs text-zinc-400">
            Registre uma receita para visualizar o orçamento deste mês.
          </div>
        )}
      </div>

{/* Card 7: Evolução das Despesas (Line Chart) */}
      <div className="bg-[#18181b] rounded-3xl p-5 border border-[#27272a] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Evolução das despesas</h3>
          <div className="flex items-center gap-1 text-zinc-500">
            <button className="p-1 hover:text-zinc-300">
              <Info size={16} />
            </button>
            <button className="p-1 hover:text-zinc-300">
              <ExternalLink size={16} />
            </button>
          </div>
        </div>

        <div className="h-44 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={evolucaoDespesasData}>
              <XAxis
                dataKey="name"
                stroke="#52525b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis hide />
              <Tooltip
                formatter={(val: number) => [formatMoney(val), 'Despesas']}
                contentStyle={{
                  backgroundColor: '#121214',
                  borderColor: '#27272a',
                  borderRadius: '12px',
                  color: '#ffffff'
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#ffffff"
                strokeWidth={2.5}
                dot={{ fill: '#ffffff', stroke: '#18181b', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, fill: '#8ab4f8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Botão Configurar Resumo */}
      <div className="pt-2 pb-6 flex justify-center">
        <button
          onClick={() => onNavigateTab('settings')}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#18181b]"
        >
          <LayoutGrid size={16} />
          <span>Configurar resumo</span>
        </button>
      </div>
    </div>
  );
};
