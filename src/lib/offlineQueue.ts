import { mmkvStorage } from '@/lib/mmkv';
import { supabase } from '@/lib/supabase';

const QUEUE_KEY = 'offline_queue';

type QueueAction = 'insert' | 'update' | 'delete';

interface QueueItem {
  id: string;
  table: string;
  action: QueueAction;
  payload: Record<string, unknown>;
  createdAt: string;
}

export const offlineQueue = {
  add(table: string, action: QueueAction, payload: Record<string, unknown>): void {
    const queue = this.getAll();
    const item: QueueItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      table,
      action,
      payload,
      createdAt: new Date().toISOString(),
    };
    queue.push(item);
    mmkvStorage.setItem(QUEUE_KEY, queue);
  },

  getAll(): QueueItem[] {
    return mmkvStorage.getItem<QueueItem[]>(QUEUE_KEY) ?? [];
  },

  clear(): void {
    mmkvStorage.removeItem(QUEUE_KEY);
  },

  async sync(): Promise<{ synced: number; failed: number }> {
    const queue = this.getAll();
    if (queue.length === 0) return { synced: 0, failed: 0 };

    let synced = 0;
    let failed = 0;
    const remaining: QueueItem[] = [];

    for (const item of queue) {
      try {
        switch (item.action) {
          case 'insert': {
            const { error } = await supabase.from(item.table).insert(item.payload);
            if (error) throw error;
            break;
          }
          case 'update': {
            const { id, ...rest } = item.payload;
            const { error } = await supabase.from(item.table).update(rest).eq('id', id);
            if (error) throw error;
            break;
          }
          case 'delete': {
            const { error } = await supabase.from(item.table).delete().eq('id', item.payload.id);
            if (error) throw error;
            break;
          }
        }
        synced++;
      } catch {
        failed++;
        remaining.push(item);
      }
    }

    mmkvStorage.setItem(QUEUE_KEY, remaining);
    return { synced, failed };
  },

  get pendingCount(): number {
    return this.getAll().length;
  },
};
