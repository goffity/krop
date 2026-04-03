import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { SavingsGoal } from '@/types';

interface CreateGoalInput {
  name: string;
  target: number;
  icon?: string;
  color?: string;
}

interface AddSavingsInput {
  id: string;
  amount: number;
}

export function useSavingsGoals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['savingsGoals', user?.id],
    queryFn: async (): Promise<SavingsGoal[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as SavingsGoal[];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (input: CreateGoalInput) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('savings_goals')
        .insert({ ...input, user_id: user.id, current: 0 })
        .select()
        .single();
      if (error) throw error;
      return data as SavingsGoal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savingsGoals'] });
    },
  });

  const addSavingsMutation = useMutation({
    mutationFn: async ({ id, amount }: AddSavingsInput) => {
      // Get current value first
      const { data: current, error: fetchError } = await supabase
        .from('savings_goals')
        .select('current')
        .eq('id', id)
        .single();
      if (fetchError) throw fetchError;

      const newAmount = Number(current.current) + amount;
      const { data, error } = await supabase
        .from('savings_goals')
        .update({ current: newAmount })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as SavingsGoal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savingsGoals'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('savings_goals').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savingsGoals'] });
    },
  });

  return {
    goals: listQuery.data ?? [],
    isLoading: listQuery.isLoading,
    create: createMutation.mutateAsync,
    addSavings: addSavingsMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isAdding: addSavingsMutation.isPending,
  };
}
