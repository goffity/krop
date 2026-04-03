import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useCategories } from '@/hooks/useCategories';
import { analyzeSpending, type SpendingInsight } from '@/lib/analytics';
import type { Transaction } from '@/types';

function getPreviousMonth(month: string): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthRange(month: string): { start: string; end: string } {
  const [y, m] = month.split('-').map(Number);
  const start = `${month}-01`;
  const end = new Date(y, m, 0).toISOString().split('T')[0];
  return { start, end };
}

export function useSpendingInsights(currentMonth: string) {
  const { user } = useAuth();
  const { categories } = useCategories();
  const prevMonth = getPreviousMonth(currentMonth);

  return useQuery({
    queryKey: ['spendingInsights', user?.id, currentMonth],
    queryFn: async (): Promise<SpendingInsight[]> => {
      if (!user) return [];

      const current = getMonthRange(currentMonth);
      const previous = getMonthRange(prevMonth);

      const [{ data: currentData }, { data: previousData }] = await Promise.all([
        supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', current.start)
          .lte('date', current.end),
        supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', previous.start)
          .lte('date', previous.end),
      ]);

      return analyzeSpending(
        (currentData ?? []) as Transaction[],
        (previousData ?? []) as Transaction[],
        categories
      );
    },
    enabled: !!user && categories.length > 0,
  });
}
