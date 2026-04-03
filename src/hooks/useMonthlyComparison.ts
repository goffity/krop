import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { getShortMonth } from '@/components/BarChart';

interface MonthlyData {
  label: string;
  income: number;
  expense: number;
}

function getLast6Months(currentMonth: string): string[] {
  const [y, m] = currentMonth.split('-').map(Number);
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(y, m - 1 - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
}

export function useMonthlyComparison(currentMonth: string) {
  const { user } = useAuth();
  const months = getLast6Months(currentMonth);

  return useQuery({
    queryKey: ['monthlyComparison', user?.id, currentMonth],
    queryFn: async (): Promise<MonthlyData[]> => {
      if (!user) return [];

      const startDate = `${months[0]}-01`;
      const [y, m] = months[5].split('-').map(Number);
      const endDate = new Date(y, m, 0).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('transactions')
        .select('type, amount, date')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) throw error;

      return months.map((month) => {
        const monthTxs = (data ?? []).filter((t) => t.date.startsWith(month));
        return {
          label: getShortMonth(month),
          income: monthTxs
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0),
          expense: monthTxs
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0),
        };
      });
    },
    enabled: !!user,
  });
}
