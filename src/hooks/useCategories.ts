import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { CATEGORIES } from '@/types';
import type { Category } from '@/types';

interface CreateCategoryInput {
  key: string;
  label: string;
  icon: string;
  color: string;
}

async function ensureDefaultCategories(userId: string): Promise<void> {
  const { data } = await supabase
    .from('categories')
    .select('id')
    .eq('user_id', userId)
    .eq('is_default', true)
    .limit(1);

  if (data && data.length > 0) return;

  const defaults = CATEGORIES.map((c) => ({
    user_id: userId,
    key: c.key,
    label: c.label,
    icon: c.icon,
    color: c.color,
    is_default: true,
  }));

  await supabase.from('categories').insert(defaults);
}

export function useCategories() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['categories', user?.id],
    queryFn: async (): Promise<Category[]> => {
      if (!user) return [];

      // Ensure defaults exist (no-op if already there)
      await ensureDefaultCategories(user.id);

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as Category[];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (input: CreateCategoryInput) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('categories')
        .insert({ ...input, user_id: user.id, is_default: false })
        .select()
        .single();
      if (error) throw error;
      return data as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('is_default', false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  return {
    categories: listQuery.data ?? [],
    isLoading: listQuery.isLoading,
    create: createMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
  };
}
