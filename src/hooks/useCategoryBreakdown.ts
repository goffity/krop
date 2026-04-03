import { useMemo } from 'react';
import type { Transaction, Category } from '@/types';

interface CategoryBreakdown {
  label: string;
  value: number;
  color: string;
  icon: string;
}

export function useCategoryBreakdown(transactions: Transaction[], categories: Category[]): CategoryBreakdown[] {
  return useMemo(() => {
    const expenses = transactions.filter((t) => t.type === 'expense');
    const totals = new Map<string, number>();

    for (const tx of expenses) {
      totals.set(tx.category, (totals.get(tx.category) ?? 0) + Number(tx.amount));
    }

    return Array.from(totals.entries())
      .map(([key, value]) => {
        const cat = categories.find((c) => c.key === key);
        return {
          label: cat?.label ?? key,
          value,
          color: cat?.color ?? '#8888aa',
          icon: cat?.icon ?? '📂',
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [transactions, categories]);
}
