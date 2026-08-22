import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Settings } from './components/Settings';
import { History } from './components/History';
import { Transactions } from './untitled';
import { QuickAddModal } from './components/QuickAddModal';
import { Category, HistoryRecord, TabType, Transaction, Debt } from './types';
import { INITIAL_CATEGORIES, INITIAL_SALARY } from './constants';

const TRANSACTIONS_KEY = 'fin_transactions_v1';
const DEBTS_KEY = 'fin_debts_v1';
const ACCOUNTS_KEY = 'fin_accounts_v1';
const SALARY_KEY = 'fin_salary';
const CATEGORIES_KEY = 'fin_categories';
const HISTORY_KEY = 'fin_history';

const loadList = <T,>(key: string, fallback: T[] = []): T[] => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // Data states
  const [salary, setSalary] = useState<number>(() => {
    const s = localStorage.getItem(SALARY_KEY);
    return s ? Number(s) : INITIAL_SALARY;
  });
  const [categories, setCategories] = useState<Category[]>(() =>
    loadList<Category>(CATEGORIES_KEY, INITIAL_CATEGORIES)
  );
  const [history, setHistory] = useState<HistoryRecord[]>(() =>
    loadList<HistoryRecord>(HISTORY_KEY, [])
  );
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    loadList<Transaction>(TRANSACTIONS_KEY, [])
  );
  const [debts, setDebts] = useState<Debt[]>(() =>
    loadList<Debt>(DEBTS_KEY, [])
  );
  const [accounts, setAccounts] = useState<string[]>(() =>
    loadList<string>(ACCOUNTS_KEY, ['Minha Conta Corrente', 'Minha Carteira'])
  );

    useEffect(() => {
    setCategories((previous) => {
      if (previous.some((category) => category.name === 'Investimentos')) return previous;
      return [...previous, {
        id: 'investimentos',
        name: 'Investimentos',
        type: 'percentage',
        percentage: 0,
        fixedValue: 0,
        description: '',
        color: '#8b5cf6',
      }];
    });
  }, []);

// Modal states
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<'Receita' | 'Despesa' | 'Transferência' | 'Despesa cartão'>('Receita');

  // Auto sync salary as monthly income transaction if salary > 0 and no salary transaction exists for current month
  useEffect(() => {
    if (salary > 0) {
      const currentMonthPrefix = new Date().toLocaleDateString('en-CA').slice(0, 7);
      const defaultAccount = accounts[0] || 'Minha Conta Corrente';

      setTransactions((prev) => {
        const hasSalary = prev.some(
          (t) =>
            t.date.startsWith(currentMonthPrefix) &&
            (t.category.toLowerCase() === 'salário' || t.category.toLowerCase() === 'salario')
        );

        if (!hasSalary) {
          const newSalaryTx: Transaction = {
            id: 'salary-' + currentMonthPrefix,
            type: 'Entrada',
            value: salary,
            date: new Date().toLocaleDateString('en-CA'),
            category: 'Salário',
            description: 'Salário Mensal',
            account: defaultAccount,
            status: 'Efetivada',
            createdAt: Date.now()
          };
          return [newSalaryTx, ...prev];
        }
        return prev;
      });
    }
  }, [salary, accounts]);

  useEffect(() => {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    const handleDebtPayment = (event: Event) => {
      const detail = (event as CustomEvent<{ action: 'add' | 'remove'; id: string; value: number; description: string }>).detail;
      if (!detail?.id) return;

      setTransactions(current => {
        if (detail.action === 'remove') {
          return current.filter(transaction => transaction.id !== detail.id);
        }
        if (current.some(transaction => transaction.id === detail.id)) return current;

        return [{
          id: detail.id,
          type: 'Saída',
          value: detail.value,
          date: new Date().toLocaleDateString('en-CA'),
          category: 'Dívidas',
          description: detail.description,
          account: 'Minha Conta Corrente',
          status: 'Efetivada',
          createdAt: Date.now()
        }, ...current];
      });
    };

    window.addEventListener('fin-debt-payment', handleDebtPayment);
    return () => window.removeEventListener('fin-debt-payment', handleDebtPayment);
  }, []);

  useEffect(() => {
    localStorage.setItem(DEBTS_KEY, JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    const syncDebts = () => setDebts(loadList<Debt>(DEBTS_KEY, []));
    window.addEventListener('fin-debts-changed', syncDebts);
    return () => window.removeEventListener('fin-debts-changed', syncDebts);
  }, []);

  useEffect(() => {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(SALARY_KEY, salary.toString());
  }, [salary]);

  useEffect(() => {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  // Month navigation
  const handlePrevMonth = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  }, []);

  const handleOpenQuickAdd = (type: 'Receita' | 'Despesa' | 'Transferência' | 'Despesa cartão') => {
    setQuickAddType(type);
    setIsQuickAddOpen(true);
  };

  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleUpdateSettings = (newCategories: Category[]) => {
    setCategories(newCategories);
    setActiveTab('dashboard');
  };

  const handleCloseMonth = () => {

  const monthKey = currentDate.toLocaleDateString('en-CA').slice(0, 7);
  const monthItems = transactions.filter((item) => item.date.startsWith(monthKey));
  const receitas = monthItems.filter((item) => item.type === 'Entrada' || item.type === 'Rendimento').reduce((total, item) => total + (Number(item.value) || 0), 0);
  const despesas = monthItems.filter((item) => item.type === 'Saída' || item.type === 'Despesa Cartão').reduce((total, item) => total + (Number(item.value) || 0), 0);
  const record: HistoryRecord = {
    id: `fechamento-${monthKey}`,
    date: `${monthKey}-01`,
    salary: receitas,
            expenses: despesas,
        balance: receitas - despesas,
    allocations: categories.map((category) => ({
      name: category.name,
      value: category.type === 'percentage' ? (receitas * category.percentage) / 100 : category.fixedValue,
      percentage: category.type === 'percentage' ? category.percentage : 0,
    })),
  };
  setHistory((previous) => [record, ...previous.filter((item) => item.id !== record.id)]);
  setActiveTab('history');
};

  useEffect(() => {
    const closePreviousMonthAutomatically = () => {
      const now = new Date();
      const closingDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const monthKey = closingDate.toLocaleDateString('en-CA').slice(0, 7);
      const recordId = `fechamento-${monthKey}`;

      if (history.some((item) => item.id === recordId)) return;

      const monthItems = transactions.filter((item) => item.date.startsWith(monthKey));
      if (monthItems.length === 0) return;

      const receitas = monthItems
        .filter((item) => item.type === 'Entrada' || item.type === 'Rendimento')
        .reduce((total, item) => total + (Number(item.value) || 0), 0);

            const despesas = monthItems
        .filter((item) => item.type === 'Saída' || item.type === 'Despesa Cartão')
        .reduce((total, item) => total + (Number(item.value) || 0), 0);

const record: HistoryRecord = {
        id: recordId,
        date: `${monthKey}-01`,
        salary: receitas,
              expenses: despesas,
      balance: receitas - despesas,
        allocations: categories.map((category) => ({
          name: category.name,
          value: category.type === 'percentage' ? (receitas * category.percentage) / 100 : category.fixedValue,
          percentage: category.type === 'percentage' ? category.percentage : 0,
        })),
      };

      setHistory((previous) =>
        previous.some((item) => item.id === recordId) ? previous : [record, ...previous]
      );
    };

    closePreviousMonthAutomatically();
    const timer = window.setInterval(closePreviousMonthAutomatically, 60 * 1000);
    return () => window.clearInterval(timer);
  }, [transactions, categories, history]);

const handleResetAll = () => {
    // Limpa todas as chaves de armazenamento local do app
    Object.keys(localStorage)
      .filter((key) => key.startsWith('fin_'))
      .forEach((key) => localStorage.removeItem(key));

    const zeroedCategories = INITIAL_CATEGORIES.map((cat) => ({
      ...cat,
      type: 'percentage' as const,
      percentage: 0,
      fixedValue: 0,
      description: ''
    }));

    setSalary(0);
    setCategories(zeroedCategories);
    setTransactions([]);
    setDebts([]);
    setHistory([]);
    setAccounts(['Minha Conta Corrente', 'Minha Carteira']);

    localStorage.setItem(SALARY_KEY, '0');
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(zeroedCategories));
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify([]));
    localStorage.setItem(DEBTS_KEY, JSON.stringify([]));
    localStorage.setItem(HISTORY_KEY, JSON.stringify([]));
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(['Minha Conta Corrente', 'Minha Carteira']));

    setActiveTab('dashboard');
  };

  const deleteHistoryItem = (id: string) => {
    if (confirm('Deseja realmente excluir este registro do histórico?')) {
      setHistory((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const clearHistory = () => {
    if (confirm('Tem certeza que deseja apagar todo o histórico?')) {
      setHistory([]);
    }
  };

  const budgetPlanningCategoryNames = categories.map((c) => c.name);

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onOpenQuickAdd={handleOpenQuickAdd}
    >
      {activeTab === 'dashboard' && (
        <Dashboard
          salary={salary}
          categories={categories}
          transactions={transactions}
          debts={debts}
          accounts={accounts}
          currentDate={currentDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onOpenQuickAdd={handleOpenQuickAdd}
          onNavigateTab={(tab) => setActiveTab(tab)}
        />
      )}

      {activeTab === 'transactions' && (
        <Transactions initialSection="movements" />
      )}

      {activeTab === 'debts' && (
        <Transactions initialSection="debts" />
      )}

      {activeTab === 'settings' && (
        <Settings
          initialSalary={salary}
          initialCategories={categories}
          onSave={handleUpdateSettings}
          onResetAll={handleResetAll}
        />
      )}

      {activeTab === 'history' && (
        <History
          history={history}
          onClear={clearHistory}
          onDelete={deleteHistoryItem}
          onCloseMonth={handleCloseMonth}
        />
      )}

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        initialType={quickAddType}
        onAddTransaction={handleAddTransaction}
        accounts={accounts}
        categories={['Salário', 'Renda extra', 'Mercado', 'Transporte', 'Moradia', 'Contas', 'Lazer', 'Saúde', 'Educação', 'Outros']}
        budgetPlanningCategories={budgetPlanningCategoryNames}
      />
    </Layout>
  );
};

export default App;
