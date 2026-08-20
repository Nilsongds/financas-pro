import React, { useEffect, useState } from 'react';
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Plus,
  Trash2,
  Repeat,
  AlertCircle
} from 'lucide-react';
import { Debt } from './types';

const DEBTS_KEY = 'fin_debts_v1';

const todayInput = () => new Date().toLocaleDateString('en-CA');

const formatMoney = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

const formatCurrencyInput = (input: string) => {
  const digits = input.replace(/\D/g, '');
  if (!digits) return '';
  return (Number(digits) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const parseCurrencyInput = (input: string) =>
  Number(input.replace(/\./g, '').replace(',', '.'));

const loadList = <T,>(key: string): T[] => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

interface TransactionsProps {
  initialSection?: string;
}

export const Transactions: React.FC<TransactionsProps> = () => {
  const [debts, setDebts] = useState<Debt[]>(() => loadList<Debt>(DEBTS_KEY));

  const [debtName, setDebtName] = useState('');
  const [debtValue, setDebtValue] = useState('');
  const [debtDueDate, setDebtDueDate] = useState(todayInput());
  const [debtInstallments, setDebtInstallments] = useState('1');
  const [isRecurringDebt, setIsRecurringDebt] = useState(false);
  const [reminderDays, setReminderDays] = useState('2');

  useEffect(() => {
    localStorage.setItem(DEBTS_KEY, JSON.stringify(debts));
  }, [debts]);

  const activeDebts = debts.filter(debt => !debt.paid);
  const paidDebts = debts.filter(debt => debt.paid);
  const totalDebt = activeDebts.reduce((sum, debt) => sum + debt.totalValue, 0);

  const reminders = activeDebts
    .map(debt => {
      const due = new Date(debt.dueDate + 'T12:00:00');
      const now = new Date();
      now.setHours(12, 0, 0, 0);
      const days = Math.ceil((due.getTime() - now.getTime()) / 86400000);
      return { debt, days };
    })
    .filter(item => item.days <= item.debt.reminderDays)
    .sort((a, b) => a.days - b.days);

  const addDebt = (event: React.FormEvent) => {
    event.preventDefault();
    const numericValue = parseCurrencyInput(debtValue);
    const installments = isRecurringDebt ? 1 : Math.max(1, Number(debtInstallments) || 1);
    const days = Math.max(0, Number(reminderDays) || 0);

    if (!debtName.trim() || !numericValue || numericValue <= 0 || !debtDueDate) {
      alert('Preencha os campos obrigatórios da dívida.');
      return;
    }

    const newDebt: Debt = {
      id: Date.now().toString(),
      name: debtName.trim(),
      totalValue: numericValue,
      dueDate: debtDueDate,
      installments,
      reminderDays: days,
      paid: false,
      paidInstallments: 0,
      isRecurring: isRecurringDebt,
      createdAt: Date.now()
    };

    setDebts(current => [newDebt, ...current]);
    setDebtName('');
    setDebtValue('');
    setDebtDueDate(todayInput());
    setDebtInstallments('1');
    setIsRecurringDebt(false);
    setReminderDays('2');
  };

  const toggleDebtPaid = (id: string) => {
    setDebts(current => current.map(item => {
      if (item.id !== id) return item;
      const nextPaid = !item.paid;
      return {
        ...item,
        paid: nextPaid,
        paidInstallments: nextPaid ? item.installments : 0
      };
    }));
  };

  const changePaidInstallments = (id: string, delta: number) => {
    setDebts(current => current.map(item => {
      if (item.id !== id) return item;
      const next = Math.max(0, Math.min(item.installments, (item.paidInstallments || 0) + delta));
      return {
        ...item,
        paidInstallments: next,
        paid: next >= item.installments
      };
    }));
  };

  const deleteDebt = (id: string) => {
    if (confirm('Deseja excluir este registro de dívida?')) {
      setDebts(current => current.filter(item => item.id !== id));
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl border border-[#27272a] bg-[#18181b] p-4 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-[#f87171] uppercase tracking-wider">Total em dívidas</p>
          <p className="text-xl font-extrabold text-white">{formatMoney(totalDebt)}</p>
          <p className="text-[10px] text-zinc-400">{activeDebts.length} conta(s) pendente(s)</p>
        </div>
        <div className="rounded-3xl border border-[#27272a] bg-[#18181b] p-4 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-[#4ade80] uppercase tracking-wider">Contas pagas</p>
          <p className="text-xl font-extrabold text-white">{paidDebts.length}</p>
          <p className="text-[10px] text-zinc-400">Total quitado ou regular</p>
        </div>
      </div>

      {/* Lembretes de Vencimento Próximo */}
      {reminders.length > 0 && (
        <div className="rounded-3xl border border-amber-500/30 bg-[#713f12]/20 p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
            <Bell size={16} />
            Lembretes de vencimento próximo
          </div>
          <div className="space-y-1 text-xs text-amber-200">
            {reminders.map(({ debt, days }) => (
              <p key={debt.id} className="flex items-center justify-between">
                <span><strong>{debt.name}</strong> ({formatMoney(debt.totalValue)})</span>
                <span className="font-bold underline">{days <= 0 ? 'Vence HOJE!' : `Vence em ${days} dia(s)`}</span>
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Form Cadastro de Dívida / Recorrência */}
      <form onSubmit={addDebt} className="rounded-3xl border border-[#27272a] bg-[#18181b] p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <CircleDollarSign size={20} className="text-[#f87171]" />
          <h3 className="font-bold text-white text-base">Cadastrar dívida ou recorrência</h3>
        </div>

        {/* Tipo de cobrança: Parcelada vs Recorrente Mensal */}
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-[#121214] p-1 border border-[#27272a]">
          <button
            type="button"
            onClick={() => setIsRecurringDebt(false)}
            className={'rounded-xl py-2 text-xs font-bold transition ' + (!isRecurringDebt ? 'bg-[#27272a] text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200')}
          >
            Parcelada (com parcelas)
          </button>
          <button
            type="button"
            onClick={() => setIsRecurringDebt(true)}
            className={'rounded-xl py-2 text-xs font-bold transition flex items-center justify-center gap-1.5 ' + (isRecurringDebt ? 'bg-[#27272a] text-[#8ab4f8] shadow-sm' : 'text-zinc-400 hover:text-zinc-200')}
          >
            <Repeat size={14} />
            Recorrente (Mensal)
          </button>
        </div>

        <label className="block text-xs font-medium text-zinc-300">
          Nome da dívida ou conta
          <input
            value={debtName}
            onChange={event => setDebtName(event.target.value)}
            placeholder={isRecurringDebt ? "Ex.: Internet, Aluguel, Academia" : "Ex.: Fatura do Cartão, Empréstimo"}
            className="mt-1 w-full rounded-2xl border border-[#27272a] bg-[#121214] text-white p-3 text-sm focus:outline-none focus:border-zinc-500"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs font-medium text-zinc-300">
            {isRecurringDebt ? 'Valor mensal (R$)' : 'Valor total (R$)'}
            <input
              inputMode="decimal"
              value={debtValue}
              onChange={event => setDebtValue(formatCurrencyInput(event.target.value))}
              placeholder="0,00"
              className="mt-1 w-full rounded-2xl border border-[#27272a] bg-[#121214] text-white p-3 text-sm focus:outline-none focus:border-zinc-500 font-bold"
            />
          </label>

          <label className="text-xs font-medium text-zinc-300">
            {isRecurringDebt ? 'Dia do vencimento' : 'Vencimento'}
            <input
              type="date"
              value={debtDueDate}
              onChange={event => setDebtDueDate(event.target.value)}
              className="mt-1 w-full rounded-2xl border border-[#27272a] bg-[#121214] text-white p-3 text-sm focus:outline-none focus:border-zinc-500"
            />
          </label>

          {!isRecurringDebt ? (
            <label className="text-xs font-medium text-zinc-300">
              Quantidade de parcelas
              <input
                type="number"
                min="1"
                value={debtInstallments}
                onChange={event => setDebtInstallments(event.target.value)}
                className="mt-1 w-full rounded-2xl border border-[#27272a] bg-[#121214] text-white p-3 text-sm focus:outline-none focus:border-zinc-500"
              />
            </label>
          ) : (
            <div className="rounded-2xl border border-[#27272a] bg-[#121214] p-2.5 flex items-center gap-2">
              <Repeat size={18} className="text-[#8ab4f8] shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-white leading-tight">Mensal Contínua</p>
                <p className="text-[10px] text-zinc-400 leading-tight">Sem limite de parcelas</p>
              </div>
            </div>
          )}

          <label className="text-xs font-medium text-zinc-300">
            Lembrar antes
            <select
              value={reminderDays}
              onChange={event => setReminderDays(event.target.value)}
              className="mt-1 w-full rounded-2xl border border-[#27272a] bg-[#121214] text-white p-3 text-sm focus:outline-none focus:border-zinc-500"
            >
              <option value="0" className="bg-[#18181b] text-white">No dia do vencimento</option>
              <option value="1" className="bg-[#18181b] text-white">1 dia antes</option>
              <option value="2" className="bg-[#18181b] text-white">2 dias antes</option>
              <option value="3" className="bg-[#18181b] text-white">3 dias antes</option>
              <option value="5" className="bg-[#18181b] text-white">5 dias antes</option>
            </select>
          </label>
        </div>

        <button
          type="submit"
          className="w-full rounded-2xl bg-[#8ab4f8] text-[#0f172a] py-3.5 text-sm font-bold shadow-md hover:bg-[#74a9f7] active:scale-[0.98] transition"
        >
          Cadastrar dívida
        </button>
      </form>

      {/* Lista de Dívidas & Recorrências */}
      <div className="space-y-3">
        <h3 className="font-bold text-white text-base">Minhas dívidas e contas cadastradas</h3>
        {debts.length === 0 ? (
          <div className="rounded-3xl border border-[#27272a] bg-[#18181b] p-8 text-center text-zinc-500 text-xs flex flex-col items-center gap-2">
            <AlertCircle size={24} className="text-zinc-600" />
            <span>Nenhuma dívida ou conta recorrente cadastrada.</span>
          </div>
        ) : (
          debts.map(debt => (
            <div
              key={debt.id}
              className={'rounded-3xl border bg-[#18181b] p-4 shadow-sm transition-all ' + (debt.paid ? 'border-[#27272a] opacity-60' : 'border-[#27272a]')}
            >
              <div className="flex items-start gap-3">
                <div className={'rounded-2xl p-2.5 ' + (debt.paid ? 'bg-[#14532d]/40 text-[#4ade80]' : debt.isRecurring ? 'bg-[#1e3a8a]/40 text-[#8ab4f8]' : 'bg-[#7f1d1d]/40 text-[#f87171]')}>
                  {debt.paid ? <CheckCircle2 size={20} /> : debt.isRecurring ? <Repeat size={20} /> : <CalendarDays size={20} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={'font-bold text-sm ' + (debt.paid ? 'line-through text-zinc-500' : 'text-white')}>
                          {debt.name}
                        </p>
                        {debt.isRecurring && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-[#1e3a8a]/40 text-[#8ab4f8] px-2 py-0.5 rounded-md font-semibold border border-[#3b82f6]/30">
                            <Repeat size={10} /> Recorrente
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Vencimento: {new Date(debt.dueDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white text-sm">{formatMoney(debt.totalValue)}</p>
                      {debt.isRecurring && <span className="text-[10px] text-zinc-400">/mês</span>}
                    </div>
                  </div>

                  {debt.isRecurring ? (
                    <div className="mt-3 flex items-center justify-between text-xs bg-[#121214] p-2.5 rounded-2xl border border-[#27272a]">
                      <span className="text-zinc-400 font-medium flex items-center gap-1">
                        <Repeat size={12} className="text-[#8ab4f8]" /> Cobrança mensal contínua
                      </span>
                      <span className={'font-bold ' + (debt.paid ? 'text-[#4ade80]' : 'text-amber-400')}>
                        {debt.paid ? '✓ Paga este mês' : 'Pendente este mês'}
                      </span>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-zinc-400 mt-2">
                        {debt.installments} parcela(s) · lembrete {debt.reminderDays === 0 ? 'no dia' : debt.reminderDays + ' dia(s) antes'}
                      </p>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-zinc-300 mb-1">
                          <span>{debt.paidInstallments || 0} de {debt.installments} parcela(s) pagas</span>
                          <span>Restante: {formatMoney(debt.totalValue * (1 - (debt.paidInstallments || 0) / debt.installments))}</span>
                        </div>
                        <div className="h-2 rounded-full bg-[#121214] overflow-hidden border border-[#27272a]">
                          <div className="h-full rounded-full bg-[#4ade80]" style={{ width: Math.min(100, ((debt.paidInstallments || 0) / debt.installments) * 100) + '%' }} />
                        </div>
                      </div>
                    </>
                  )}

                  <div className={'mt-3.5 ' + (debt.isRecurring ? 'flex gap-2' : 'grid grid-cols-4 gap-2')}>
                    {debt.isRecurring ? (
                      <>
                        <button
                          type="button"
                          onClick={() => toggleDebtPaid(debt.id)}
                          className={'flex-1 rounded-2xl px-3 py-2.5 text-xs font-bold transition ' + (debt.paid ? 'bg-[#27272a] text-zinc-300' : 'bg-[#14532d]/50 text-[#4ade80] hover:bg-[#14532d]')}
                        >
                          {debt.paid ? 'Reabrir para este mês' : 'Marcar como paga este mês'}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteDebt(debt.id)}
                          className="rounded-2xl bg-[#7f1d1d]/40 text-[#f87171] px-3.5 py-2.5 hover:bg-[#7f1d1d] transition"
                          aria-label="Excluir dívida"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={() => changePaidInstallments(debt.id, -1)} className="rounded-2xl bg-[#27272a] px-2 py-2 text-xs font-bold text-zinc-300 hover:bg-[#3f3f46]" aria-label="Diminuir parcela paga">-1</button>
                        <button type="button" onClick={() => changePaidInstallments(debt.id, 1)} className="rounded-2xl bg-[#14532d]/50 px-2 py-2 text-xs font-bold text-[#4ade80] hover:bg-[#14532d]" aria-label="Adicionar parcela paga">+1 paga</button>
                        <button type="button" onClick={() => toggleDebtPaid(debt.id)} className="rounded-2xl bg-[#1e3a8a]/50 px-2 py-2 text-xs font-bold text-[#8ab4f8] hover:bg-[#1e3a8a]">{debt.paid ? 'Reabrir' : 'Quitar'}</button>
                        <button type="button" onClick={() => deleteDebt(debt.id)} className="rounded-2xl bg-[#7f1d1d]/40 px-2 py-2 text-[#f87171] hover:bg-[#7f1d1d]" aria-label="Excluir dívida"><Trash2 size={16} className="mx-auto" /></button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
