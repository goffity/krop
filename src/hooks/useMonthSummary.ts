import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { MonthSummary } from '@/types';

export function useMonthSummary(month: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['monthSummary', user?.id, month],
    queryFn: async (): Promise<MonthSummary> => {
      if (!user) return { income: 0, expense: 0, balance: 0 };

      const startDate = `${month}-01`;
      const [y, m] = month.split('-').map(Number);
      const endDate = new Date(y, m, 0).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('transactions')
        .select('type, amount')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) throw error;

      const income = (data ?? [])
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const expense = (data ?? [])
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return { income, expense, balance: income - expense };
    },
    enabled: !!user,
  });
}
