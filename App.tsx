import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Settings } from './components/Settings';
import { History } from './components/History';
import { Transactions } from './untitled';
import { Category, HistoryRecord, TabType } from './types';
import { INITIAL_CATEGORIES, INITIAL_SALARY } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [salary, setSalary] = useState<number>(INITIAL_SALARY);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  useEffect(() => {
    const savedSalary = localStorage.getItem('fin_salary');
    const savedCategories = localStorage.getItem('fin_categories');
    const savedHistory = localStorage.getItem('fin_history');

    if (savedSalary) setSalary(Number(savedSalary));
    if (savedCategories) setCategories(JSON.parse(savedCategories));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  const handleUpdateSettings = (newSalary: number, newCategories: Category[]) => {
    setSalary(newSalary);
    setCategories(newCategories);
    localStorage.setItem('fin_salary', newSalary.toString());
    localStorage.setItem('fin_categories', JSON.stringify(newCategories));
    setActiveTab('dashboard');
  };

  const handleLogMonth = () => {
    const fixedSum = categories.filter(c => c.type === 'fixed').reduce((acc, c) => acc + c.fixedValue, 0);
    const remainingSalary = Math.max(0, salary - fixedSum);

    const newRecord: HistoryRecord = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
      salary,
      allocations: categories.map(cat => {
        const value = cat.type === 'fixed'
          ? cat.fixedValue
          : (remainingSalary * cat.percentage) / 100;
        const realPercentage = salary > 0 ? (value / salary) * 100 : 0;

        return {
          name: cat.name,
          percentage: Number(realPercentage.toFixed(1)),
          value
        };
      })
    };

    const updatedHistory = [newRecord, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('fin_history', JSON.stringify(updatedHistory));
    alert('Mês registrado no histórico com sucesso!');
  };

  const deleteHistoryItem = (id: string) => {
    if (confirm('Deseja realmente excluir este registro?')) {
      const updatedHistory = history.filter(item => item.id !== id);
      setHistory(updatedHistory);
      localStorage.setItem('fin_history', JSON.stringify(updatedHistory));
    }
  };

  const clearHistory = () => {
    if (confirm('Tem certeza que deseja apagar todo o histórico?')) {
      setHistory([]);
      localStorage.removeItem('fin_history');
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && (
        <Dashboard
          salary={salary}
          categories={categories}
          onLogMonth={handleLogMonth}
        />
      )}
      {activeTab === 'transactions' && <Transactions />}
      {activeTab === 'settings' && (
        <Settings
          initialSalary={salary}
          initialCategories={categories}
          onSave={handleUpdateSettings}
        />
      )}
      {activeTab === 'history' && (
        <History
          history={history}
          onClear={clearHistory}
          onDelete={deleteHistoryItem}
        />
      )}
    </Layout>
  );
};

export default App;
