import { Platform } from 'react-native';

interface Storage {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
  remove(key: string): void;
  clearAll(): void;
}

function createStorage(): Storage {
  if (Platform.OS === 'web') {
    return {
      getString(key: string) {
        const v = localStorage.getItem(key);
        return v ?? undefined;
      },
      set(key: string, value: string) {
        localStorage.setItem(key, value);
      },
      remove(key: string) {
        localStorage.removeItem(key);
      },
      clearAll() {
        localStorage.clear();
      },
    };
  }

  // Native: use MMKV
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMMKV } = require('react-native-mmkv');
  return createMMKV({ id: 'krop-storage' });
}

let _storage: Storage | null = null;

function getStorage(): Storage {
  if (!_storage) {
    _storage = createStorage();
  }
  return _storage;
}

export const mmkvStorage = {
  getItem<T>(key: string): T | null {
    const value = getStorage().getString(key);
    if (value === undefined) return null;
    return JSON.parse(value) as T;
  },

  setItem<T>(key: string, value: T): void {
    getStorage().set(key, JSON.stringify(value));
  },

  removeItem(key: string): void {
    getStorage().remove(key);
  },

  clearAll(): void {
    getStorage().clearAll();
  },
};
