import { useEffect, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useQueryClient } from '@tanstack/react-query';
import { offlineQueue } from '@/lib/offlineQueue';

export function useNetworkSync() {
  const queryClient = useQueryClient();
  const isSyncing = useRef(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      if (state.isConnected && !isSyncing.current) {
        isSyncing.current = true;
        try {
          const { synced } = await offlineQueue.sync();
          if (synced > 0) {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['monthSummary'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
          }
        } finally {
          isSyncing.current = false;
        }
      }
    });

    return () => unsubscribe();
  }, [queryClient]);
}
