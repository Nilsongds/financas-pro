export interface Category {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  percentage: number;
  fixedValue: number;
  description?: string;
  color: string;
}

export interface HistoryRecord {
  id: string;
  date: string;
  salary: number;
  allocations: {
    name: string;
    value: number;
    percentage: number;
  }[];
}

export type TransactionType = 'Entrada' | 'Saída' | 'Aplicação' | 'Resgate' | 'Rendimento' | 'Transferência' | 'Despesa Cartão';

export interface Transaction {
  id: string;
  type: TransactionType;
  value: number;
  date: string;
  category: string;
  budgetCategory?: string;
  description: string;
  account: string;
  toAccount?: string;
  status?: 'Efetivada' | 'Pendente' | 'Vencida';
  createdAt: number;
}

export interface Debt {
  id: string;
  name: string;
  totalValue: number;
  dueDate: string;
  installments: number;
  reminderDays: number;
  paid: boolean;
  paidInstallments: number;
  isRecurring?: boolean;
  createdAt: number;
}

export type TabType = 'dashboard' | 'transactions' | 'accounts' | 'debts' | 'settings' | 'history';

