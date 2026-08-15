import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Bell,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Landmark,
  Plus,
  ReceiptText,
  Trash2,
  WalletCards,
  Pencil,
  Download,
  Upload,
  BarChart3,
  X,
  Save
} from 'lucide-react';

type TransactionType = 'Entrada' | 'Saída' | 'Aplicação' | 'Resgate' | 'Rendimento';
type AccountType = string;
type FinanceSection = 'movements' | 'investments' | 'debts';
const PLANNING_CATEGORIES = ['Lazer', 'Gastos Fixos', 'Investimentos', 'Dívidas'];

interface Transaction {
  id: string;
  type: TransactionType;
  value: number;
  date: string;
  category: string;
  budgetCategory?: string;
  description: string;
  account: AccountType;
  createdAt: number;
}

interface Debt {
  id: string;
  name: string;
  totalValue: number;
  dueDate: string;
  installments: number;
  reminderDays: number;
  paid: boolean;
  paidInstallments: number;
  createdAt: number;
}

const TRANSACTIONS_KEY = 'fin_transactions_v1';
const DEBTS_KEY = 'fin_debts_v1';
const ACCOUNTS_KEY = 'fin_accounts_v1';
const DEFAULT_CATEGORIES = ['Salário', 'Renda extra', 'Dividendos', 'CDB', 'Rendimento', 'Mercado', 'Transporte', 'Moradia', 'Contas', 'Lazer', 'Saúde', 'Educação', 'Dívidas', 'Investimentos', 'Reembolso', 'Outros'];

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

export const Transactions: React.FC = () => {
  const [section, setSection] = useState<FinanceSection>('movements');
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadList<Transaction>(TRANSACTIONS_KEY));
  const [debts, setDebts] = useState<Debt[]>(() => loadList<Debt>(DEBTS_KEY));
  const [accounts, setAccounts] = useState<string[]>(() => {
    const saved = loadList<string>(ACCOUNTS_KEY);
    return saved.length ? saved : ['Conta Principal', 'CDB / 99Pay'];
  });
  const [newAccount, setNewAccount] = useState('');
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [filterMonth, setFilterMonth] = useState(todayInput().slice(0, 7));
  const [filterCategory, setFilterCategory] = useState('Todas');

  const [type, setType] = useState<TransactionType>('Entrada');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(todayInput());
  const [category, setCategory] = useState('');
  const [budgetCategory, setBudgetCategory] = useState('');
  const [description, setDescription] = useState('');
  const [account, setAccount] = useState<AccountType>('Conta Principal');

  const [debtName, setDebtName] = useState('');
  const [debtValue, setDebtValue] = useState('');
  const [debtDueDate, setDebtDueDate] = useState(todayInput());
  const [debtInstallments, setDebtInstallments] = useState('1');
  const [reminderDays, setReminderDays] = useState('2');

  useEffect(() => {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(DEBTS_KEY, JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  }, [accounts]);

  const monthPrefix = todayInput().slice(0, 7);

  const summary = useMemo(() => {
    const monthItems = transactions.filter(item => item.date.startsWith(monthPrefix));
    const entradas = monthItems
      .filter(item => item.type === 'Entrada')
      .reduce((sum, item) => sum + item.value, 0);
    const saidas = monthItems
      .filter(item => item.type === 'Saída')
      .reduce((sum, item) => sum + item.value, 0);
    const rendimentos = monthItems
      .filter(item => item.type === 'Rendimento')
      .reduce((sum, item) => sum + item.value, 0);

    const totalEntradas = transactions
      .filter(item => item.type === 'Entrada' || item.type === 'Rendimento')
      .reduce((sum, item) => sum + item.value, 0);
    const totalSaidas = transactions
      .filter(item => item.type === 'Saída')
      .reduce((sum, item) => sum + item.value, 0);
    const investimentos = transactions.reduce((sum, item) => {
      if (item.type === 'Aplicação') return sum + item.value;
      if (item.type === 'Rendimento') return sum + item.value;
      if (item.type === 'Resgate') return sum - item.value;
      return sum;
    }, 0);

    return {
      entradas,
      saidas,
      rendimentos,
      saldoTotal: totalEntradas - totalSaidas,
      investimentos: Math.max(0, investimentos)
    };
  }, [transactions, monthPrefix]);

  const sortedTransactions = useMemo(
    () => [...transactions].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt),
    [transactions]
  );

  const categoriesAvailable = useMemo(() =>
    Array.from(new Set(transactions.map(item => item.category))).sort(),
    [transactions]
  );

  const filteredTransactions = sortedTransactions.filter(item =>
    (!filterMonth || item.date.startsWith(filterMonth)) &&
    (filterCategory === 'Todas' || item.category === filterCategory)
  );

  const investmentTransactions = filteredTransactions.filter(item =>
    item.type === 'Aplicação' || item.type === 'Resgate' || item.type === 'Rendimento'
  );

  const expenseChart = useMemo(() => {
    const totals: Record<string, number> = {};
    transactions
      .filter(item => item.type === 'Saída' && (!filterMonth || item.date.startsWith(filterMonth)))
      .forEach(item => { totals[item.category] = (totals[item.category] || 0) + item.value; });
    const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    const max = Math.max(1, ...entries.map(([, amount]) => amount));
    return entries.map(([name, amount]) => ({ name, amount, width: (amount / max) * 100 }));
  }, [transactions, filterMonth]);

  const activeDebts = debts.filter(debt => !debt.paid);
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

  const resetTransactionForm = () => {
    setValue('');
    setCategory('');
    setBudgetCategory('');
    setDescription('');
    setDate(todayInput());
  };

  const addTransaction = (event: React.FormEvent) => {
    event.preventDefault();
    const numericValue = parseCurrencyInput(value);

    if (!numericValue || numericValue <= 0 || !date || !category.trim() || (type === 'Saída' && !budgetCategory)) {
      alert(type === 'Saída' ? 'Preencha valor, data, categoria e categoria do planejamento.' : 'Preencha valor, data e categoria.');
      return;
    }

    if (editingTransactionId) {
      setTransactions(current => current.map(item =>
        item.id === editingTransactionId
          ? { ...item, type, value: numericValue, date, category: category.trim(), budgetCategory: type === 'Saída' ? budgetCategory : undefined, description: description.trim(), account }
          : item
      ));
      setEditingTransactionId(null);
    } else {
      const newTransaction: Transaction = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        type,
        value: numericValue,
        date,
        category: category.trim(),
        budgetCategory: type === 'Saída' ? budgetCategory : undefined,
        description: description.trim(),
        account,
        createdAt: Date.now()
      };
      setTransactions(current => [newTransaction, ...current]);
    }

    resetTransactionForm();
  };

  const editTransaction = (item: Transaction) => {
    setSection(item.type === 'Aplicação' || item.type === 'Resgate' || item.type === 'Rendimento' ? 'investments' : 'movements');
    setEditingTransactionId(item.id);
    setType(item.type);
    setValue(formatCurrencyInput(item.value.toFixed(2)));
    setDate(item.date);
    setCategory(item.category);
    setBudgetCategory(item.budgetCategory || '');
    setDescription(item.description);
    setAccount(item.account);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelTransactionEdit = () => {
    setEditingTransactionId(null);
    setType('Entrada');
    setAccount(accounts[0] || 'Conta Principal');
    resetTransactionForm();
  };

  const addAccount = () => {
    const name = newAccount.trim();
    if (!name) return;
    if (accounts.some(item => item.toLowerCase() === name.toLowerCase())) {
      alert('Essa conta já está cadastrada.');
      return;
    }
    setAccounts(current => [...current, name]);
    setAccount(name);
    setNewAccount('');
  };

  const deleteTransaction = (id: string) => {
    if (confirm('Deseja realmente excluir este lançamento?')) {
      setTransactions(current => current.filter(item => item.id !== id));
    }
  };

  const addDebt = (event: React.FormEvent) => {
    event.preventDefault();
    const numericValue = parseCurrencyInput(debtValue);
    const installments = Math.max(1, Number(debtInstallments) || 1);
    const days = Math.max(0, Number(reminderDays) || 0);

    if (!debtName.trim() || !numericValue || numericValue <= 0 || !debtDueDate) {
      alert('Preencha o nome, o valor e o vencimento da dívida.');
      return;
    }

    const newDebt: Debt = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      name: debtName.trim(),
      totalValue: numericValue,
      dueDate: debtDueDate,
      installments,
      reminderDays: days,
      paid: false,
      paidInstallments: 0,
      createdAt: Date.now()
    };

    setDebts(current => [newDebt, ...current]);
    setDebtName('');
    setDebtValue('');
    setDebtDueDate(todayInput());
    setDebtInstallments('1');
    setReminderDays('2');
  };

  const toggleDebtPaid = (id: string) => {
    setDebts(current => current.map(debt => {
      if (debt.id !== id) return debt;
      const nextPaid = !debt.paid;
      return {
        ...debt,
        paid: nextPaid,
        paidInstallments: nextPaid ? debt.installments : Math.min(debt.paidInstallments || 0, Math.max(0, debt.installments - 1))
      };
    }));
  };

  const changePaidInstallments = (id: string, change: number) => {
    setDebts(current => current.map(debt => {
      if (debt.id !== id) return debt;
      const paidInstallments = Math.max(0, Math.min(debt.installments, (debt.paidInstallments || 0) + change));
      return { ...debt, paidInstallments, paid: paidInstallments >= debt.installments };
    }));
  };

  const deleteDebt = (id: string) => {
    if (confirm('Deseja realmente excluir esta dívida?')) {
      setDebts(current => current.filter(debt => debt.id !== id));
    }
  };

  const exportBackup = () => {
    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      transactions,
      debts,
      accounts
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'financas-pro-backup-' + todayInput() + '.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const backup = JSON.parse(String(reader.result || '{}'));
        if (!Array.isArray(backup.transactions) || !Array.isArray(backup.debts)) {
          throw new Error('Formato inválido');
        }
        if (!confirm('Restaurar este backup substituirá os lançamentos e dívidas atuais. Deseja continuar?')) {
          return;
        }
        setTransactions(backup.transactions);
        setDebts(backup.debts);
        if (Array.isArray(backup.accounts) && backup.accounts.length) {
          setAccounts(backup.accounts);
          setAccount(backup.accounts[0]);
        }
        alert('Backup restaurado com sucesso!');
      } catch {
        alert('Não foi possível ler este arquivo de backup.');
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const transactionAccent = (itemType: TransactionType) => {
    if (itemType === 'Entrada' || itemType === 'Rendimento') return 'text-emerald-600 bg-emerald-50';
    if (itemType === 'Saída') return 'text-rose-600 bg-rose-50';
    return 'text-blue-600 bg-blue-50';
  };

  const amountSignal = (itemType: TransactionType) =>
    itemType === 'Saída' || itemType === 'Aplicação' ? '- ' : '+ ';

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <section>
        <h2 className="text-2xl font-bold text-slate-800">Controle Financeiro</h2>
        <p className="text-sm text-slate-500 mt-1">
          Registre tudo que entra, sai, é investido ou precisa ser pago.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="col-span-2 rounded-2xl bg-slate-900 text-white p-5 shadow-lg">
          <p className="text-xs uppercase tracking-wider text-slate-400">Saldo registrado</p>
          <p className="text-3xl font-bold mt-1">{formatMoney(summary.saldoTotal)}</p>
          <p className="text-xs text-slate-400 mt-2">
            O salário planejado só entra aqui quando for registrado como Entrada.
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-xs text-emerald-700">Entradas do mês</p>
          <p className="font-bold text-emerald-700 mt-1">{formatMoney(summary.entradas)}</p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
          <p className="text-xs text-rose-700">Saídas do mês</p>
          <p className="font-bold text-rose-700 mt-1">{formatMoney(summary.saidas)}</p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-xs text-blue-700">Em investimentos</p>
          <p className="font-bold text-blue-700 mt-1">{formatMoney(summary.investimentos)}</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-xs text-amber-700">Rendimentos do mês</p>
          <p className="font-bold text-amber-700 mt-1">{formatMoney(summary.rendimentos)}</p>
        </div>
      </section>

      <section className="grid grid-cols-3 rounded-2xl bg-slate-100 p-1 gap-1">
        <button
          onClick={() => setSection('movements')}
          className={'rounded-xl px-2 py-3 text-xs font-semibold transition ' + (section === 'movements' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500')}
        >
          Lançamentos
        </button>
        <button
          onClick={() => { setSection('investments'); setType('Aplicação'); setAccount('CDB / 99Pay'); }}
          className={'rounded-xl px-2 py-3 text-xs font-semibold transition ' + (section === 'investments' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500')}
        >
          Investimentos
        </button>
        <button
          onClick={() => setSection('debts')}
          className={'rounded-xl px-2 py-3 text-xs font-semibold transition ' + (section === 'debts' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500')}
        >
          Dívidas
        </button>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <button onClick={exportBackup} className="rounded-2xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-700 shadow-sm flex items-center justify-center gap-2"><Download size={18} /> Fazer backup</button>
        <label className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-700 shadow-sm flex items-center justify-center gap-2"><Upload size={18} /> Restaurar backup<input type="file" accept="application/json,.json" onChange={importBackup} className="hidden" /></label>
      </section>

      {(section === 'movements' || section === 'investments') && (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <WalletCards size={19} className="text-blue-600" />
              <h3 className="font-bold text-slate-800">Minhas contas</h3>
            </div>
            <div className="flex gap-2">
              <input value={newAccount} onChange={event => setNewAccount(event.target.value)} placeholder="Nome da nova conta" className="min-w-0 flex-1 rounded-xl border border-slate-200 p-3 text-sm" />
              <button type="button" onClick={addAccount} className="rounded-xl bg-blue-600 px-4 text-white" aria-label="Adicionar conta"><Plus size={18} /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {accounts.map(item => <span key={item} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-600">{item}</span>)}
            </div>
          </section>

          <form onSubmit={addTransaction} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Plus size={20} className="text-emerald-600" />
              <h3 className="font-bold text-slate-800 flex-1">
                {editingTransactionId ? 'Editar lançamento' : section === 'investments' ? 'Registrar investimento' : 'Novo lançamento'}
              </h3>
              {editingTransactionId && <button type="button" onClick={cancelTransactionEdit} className="rounded-lg p-2 text-slate-400" aria-label="Cancelar edição"><X size={18} /></button>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-medium text-slate-600">
                Tipo
                <select
                  value={type}
                  onChange={event => {
                    const nextType = event.target.value as TransactionType;
                    setType(nextType);
                    if (nextType === 'Aplicação' || nextType === 'Resgate' || nextType === 'Rendimento') {
                      setAccount('CDB / 99Pay');
                    }
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"
                >
                  {section === 'movements' && <option>Entrada</option>}
                  {section === 'movements' && <option>Saída</option>}
                  <option>Aplicação</option>
                  <option>Resgate</option>
                  <option>Rendimento</option>
                </select>
              </label>

              <label className="text-xs font-medium text-slate-600">
                Valor (R$)
                <input
                  inputMode="decimal"
                  value={value}
                  onChange={event => setValue(formatCurrencyInput(event.target.value))}
                  placeholder="0,00"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm"
                />
              </label>

              <label className="text-xs font-medium text-slate-600">
                Data
                <input
                  type="date"
                  value={date}
                  onChange={event => setDate(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm"
                />
              </label>

              <label className="text-xs font-medium text-slate-600">
                Conta
                <select
                  value={account}
                  onChange={event => setAccount(event.target.value as AccountType)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"
                >
                  {accounts.map(item => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>

              <label className="col-span-2 text-xs font-medium text-slate-600">
                Categoria
                <select
                  value={category}
                  onChange={event => setCategory(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"
                >
                  <option value="">Selecione a categoria</option>
                  {DEFAULT_CATEGORIES.map(item => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
            </div>

            {type === 'Saída' && (
              <label className="block text-xs font-medium text-slate-600">
                Categoria do planejamento
                <select
                  value={budgetCategory}
                  onChange={event => setBudgetCategory(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"
                >
                  <option value="">Escolha onde este gasto será descontado</option>
                  {PLANNING_CATEGORIES.map(item => <option key={item} value={item}>{item}</option>)}
                </select>
                <span className="mt-1 block text-[10px] text-slate-400">Este valor reduzirá o limite disponível na tela inicial.</span>
              </label>
            )}

            <label className="block text-xs font-medium text-slate-600">
              Descrição opcional
              <input
                value={description}
                onChange={event => setDescription(event.target.value)}
                placeholder="Acrescente um detalhe"
                className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm"
              />
            </label>

            <button className="w-full rounded-xl bg-emerald-600 p-3.5 font-bold text-white shadow-sm active:scale-[0.99] flex items-center justify-center gap-2">
              {editingTransactionId ? <Save size={18} /> : <Plus size={18} />}
              {editingTransactionId ? 'Salvar alterações' : 'Adicionar lançamento'}
            </button>
          </form>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2"><BarChart3 size={19} className="text-violet-600" /><h3 className="font-bold text-slate-800">Filtros e gastos por categoria</h3></div>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-medium text-slate-600">Mês<input type="month" value={filterMonth} onChange={event => setFilterMonth(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm" /></label>
              <label className="text-xs font-medium text-slate-600">Categoria<select value={filterCategory} onChange={event => setFilterCategory(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"><option>Todas</option>{categoriesAvailable.map(item => <option key={item}>{item}</option>)}</select></label>
            </div>
            {expenseChart.length === 0 ? <p className="text-xs text-slate-400">Nenhuma saída registrada neste mês.</p> : (
              <div className="space-y-2">{expenseChart.slice(0, 6).map(item => <div key={item.name}><div className="flex justify-between text-xs text-slate-600 mb-1"><span>{item.name}</span><span>{formatMoney(item.amount)}</span></div><div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full bg-violet-500" style={{ width: item.width + '%' }} /></div></div>)}</div>
            )}
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800">
                {section === 'investments' ? 'Histórico de investimentos' : 'Movimentações'}
              </h3>
              <span className="text-xs text-slate-400">
                {(section === 'investments' ? investmentTransactions : filteredTransactions).length} registro(s)
              </span>
            </div>

            {(section === 'investments' ? investmentTransactions : filteredTransactions).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                <ReceiptText className="mx-auto text-slate-300" size={34} />
                <p className="text-sm text-slate-500 mt-3">Nenhum lançamento registrado.</p>
              </div>
            ) : (
              (section === 'investments' ? investmentTransactions : filteredTransactions).map(item => (
                <article key={item.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className={'rounded-xl p-2 ' + transactionAccent(item.type)}>
                      {item.type === 'Saída' || item.type === 'Aplicação'
                        ? <ArrowDownCircle size={20} />
                        : <ArrowUpCircle size={20} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-3">
                        <div>
                          <p className="font-bold text-slate-800">{item.category}</p>
                          <p className="text-xs text-slate-500">{item.type} · {item.account}</p>
                        </div>
                        <p className={'font-bold whitespace-nowrap ' + (item.type === 'Saída' || item.type === 'Aplicação' ? 'text-rose-600' : 'text-emerald-600')}>
                          {amountSignal(item.type)}{formatMoney(item.value)}
                        </p>
                      </div>
                      <div className="mt-2 flex items-end justify-between gap-3">
                        <div>
                          <p className="text-xs text-slate-400">
                            {new Date(item.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                          </p>
                          {item.description && <p className="text-xs text-slate-500 mt-1">{item.description}</p>}
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => editTransaction(item)} className="rounded-lg p-2 text-slate-300 hover:bg-blue-50 hover:text-blue-500" aria-label="Editar lançamento"><Pencil size={17} /></button>
                          <button onClick={() => deleteTransaction(item.id)} className="rounded-lg p-2 text-slate-300 hover:bg-rose-50 hover:text-rose-500" aria-label="Excluir lançamento"><Trash2 size={17} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </section>
        </>
      )}

      {section === 'debts' && (
        <>
          {reminders.length > 0 && (
            <section className="space-y-2">
              {reminders.map(({ debt, days }) => (
                <div key={debt.id} className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
                  <Bell size={20} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm">{debt.name}</p>
                    <p className="text-xs mt-1">
                      {days < 0
                        ? 'Vencida há ' + Math.abs(days) + ' dia(s).'
                        : days === 0
                          ? 'Vence hoje.'
                          : 'Vence em ' + days + ' dia(s).'}
                    </p>
                  </div>
                </div>
              ))}
            </section>
          )}

          <section className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-rose-50 border border-rose-100 p-4">
              <p className="text-xs text-rose-700">Total em dívidas</p>
              <p className="font-bold text-rose-700 mt-1">{formatMoney(totalDebt)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <p className="text-xs text-slate-600">Dívidas em aberto</p>
              <p className="font-bold text-slate-800 mt-1">{activeDebts.length}</p>
            </div>
          </section>

          <form onSubmit={addDebt} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <CircleDollarSign size={20} className="text-rose-500" />
              <h3 className="font-bold text-slate-800">Cadastrar dívida</h3>
            </div>

            <label className="block text-xs font-medium text-slate-600">
              Nome ou credor
              <input
                value={debtName}
                onChange={event => setDebtName(event.target.value)}
                placeholder="Ex.: Cartão, empréstimo, loja"
                className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-medium text-slate-600">
                Valor total (R$)
                <input
                  inputMode="decimal"
                  value={debtValue}
                  onChange={event => setDebtValue(formatCurrencyInput(event.target.value))}
                  placeholder="0,00"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm"
                />
              </label>

              <label className="text-xs font-medium text-slate-600">
                Vencimento
                <input
                  type="date"
                  value={debtDueDate}
                  onChange={event => setDebtDueDate(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm"
                />
              </label>

              <label className="text-xs font-medium text-slate-600">
                Quantidade de parcelas
                <input
                  type="number"
                  min="1"
                  value={debtInstallments}
                  onChange={event => setDebtInstallments(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm"
                />
              </label>

              <label className="text-xs font-medium text-slate-600">
                Lembrar antes
                <select
                  value={reminderDays}
                  onChange={event => setReminderDays(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"
                >
                  <option value="0">No dia</option>
                  <option value="1">1 dia antes</option>
                  <option value="2">2 dias antes</option>
                  <option value="3">3 dias antes</option>
                  <option value="5">5 dias antes</option>
                  <option value="7">7 dias antes</option>
                </select>
              </label>
            </div>

            <button className="w-full rounded-xl bg-slate-900 p-3.5 font-bold text-white shadow-sm active:scale-[0.99]">
              Salvar dívida
            </button>

            <p className="text-[11px] text-slate-400 text-center">
              O aviso já aparecerá nesta tela. A notificação do Android será ativada no APK final.
            </p>
          </form>

          <section className="space-y-3">
            <h3 className="font-bold text-slate-800">Minhas dívidas</h3>
            {debts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                <Landmark className="mx-auto text-slate-300" size={34} />
                <p className="text-sm text-slate-500 mt-3">Nenhuma dívida cadastrada.</p>
              </div>
            ) : (
              [...debts].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).map(debt => (
                <article
                  key={debt.id}
                  className={'rounded-2xl border bg-white p-4 shadow-sm ' + (debt.paid ? 'border-emerald-100 opacity-70' : 'border-slate-100')}
                >
                  <div className="flex items-start gap-3">
                    <div className={'rounded-xl p-2 ' + (debt.paid ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600')}>
                      {debt.paid ? <CheckCircle2 size={20} /> : <CalendarDays size={20} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between gap-3">
                        <div>
                          <p className={'font-bold ' + (debt.paid ? 'line-through text-slate-400' : 'text-slate-800')}>
                            {debt.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            Vence em {new Date(debt.dueDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <p className="font-bold text-slate-800">{formatMoney(debt.totalValue)}</p>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        {debt.installments} parcela(s) · lembrete {debt.reminderDays === 0 ? 'no dia' : debt.reminderDays + ' dia(s) antes'}
                      </p>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-slate-600 mb-1">
                          <span>{debt.paidInstallments || 0} de {debt.installments} parcela(s) pagas</span>
                          <span>Restante: {formatMoney(debt.totalValue * (1 - (debt.paidInstallments || 0) / debt.installments))}</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: Math.min(100, ((debt.paidInstallments || 0) / debt.installments) * 100) + '%' }} />
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-4 gap-2">
                        <button onClick={() => changePaidInstallments(debt.id, -1)} className="rounded-xl bg-slate-100 px-2 py-2 text-xs font-bold text-slate-600" aria-label="Diminuir parcela paga">-1</button>
                        <button onClick={() => changePaidInstallments(debt.id, 1)} className="rounded-xl bg-emerald-50 px-2 py-2 text-xs font-bold text-emerald-700" aria-label="Adicionar parcela paga">+1 paga</button>
                        <button onClick={() => toggleDebtPaid(debt.id)} className="rounded-xl bg-blue-50 px-2 py-2 text-xs font-bold text-blue-700">{debt.paid ? 'Reabrir' : 'Quitar'}</button>
                        <button onClick={() => deleteDebt(debt.id)} className="rounded-xl bg-rose-50 px-2 py-2 text-rose-600" aria-label="Excluir dívida"><Trash2 size={17} className="mx-auto" /></button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </section>
        </>
      )}
    </div>
  );
};
