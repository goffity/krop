import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { Budget } from '@/types';

interface CreateBudgetInput {
  category: string;
  amount: number;
  month: string;
}

export function useBudgets(month: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['budgets', user?.id, month],
    queryFn: async (): Promise<Budget[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', month)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as Budget[];
    },
    enabled: !!user,
  });

  const upsertMutation = useMutation({
    mutationFn: async (input: CreateBudgetInput) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('budgets')
        .upsert(
          { ...input, user_id: user.id },
          { onConflict: 'user_id,category,month' }
        )
        .select()
        .single();
      if (error) throw error;
      return data as Budget;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('budgets').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  return {
    budgets: listQuery.data ?? [],
    isLoading: listQuery.isLoading,
    upsert: upsertMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    isUpserting: upsertMutation.isPending,
  };
}
