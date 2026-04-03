import { create } from 'zustand';

interface FinanceState {
  selectedMonth: string; // format: '2026-04'
  setSelectedMonth: (month: string) => void;
}

const getCurrentMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const useFinanceStore = create<FinanceState>((set) => ({
  selectedMonth: getCurrentMonth(),
  setSelectedMonth: (month) => set({ selectedMonth: month }),
}));
