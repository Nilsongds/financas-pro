
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

export type TabType = 'dashboard' | 'settings' | 'history';
