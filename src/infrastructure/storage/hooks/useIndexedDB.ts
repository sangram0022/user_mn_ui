/**
 * useIndexedDB Hook
 * React hook for IndexedDB with type safety and reactivity
 *
 * React 19: No memoization needed - React Compiler handles optimization
 */

import { useEffect, useState } from 'react';
import { IndexedDBAdapter } from '../adapters/IndexedDBAdapter';

const defaultAdapter = new IndexedDBAdapter();

export function useIndexedDB<T>(
  key: string,
  initialValue: T,
  adapter: IndexedDBAdapter = defaultAdapter
): [T | null, (value: T) => Promise<void>, () => Promise<void>, boolean, Error | null] {
  const [storedValue, setStoredValue] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Load initial value from IndexedDB
  useEffect(() => {
    const loadValue = async (): Promise<void> => {
      try {
        setLoading(true);
        const item = await adapter.get(key);

        if (item) {
          setStoredValue(JSON.parse(item) as T);
        } else {
          setStoredValue(initialValue);
        }
        setError(null);
      } catch (err) {
        console.warn(`Error reading IndexedDB key "${key}":`, err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setStoredValue(initialValue);
      } finally {
        setLoading(false);
      }
    };

    void loadValue();
  }, [key, initialValue, adapter]);

  // Set value in IndexedDB
  const setValue = async (value: T): Promise<void> => {
    try {
      setLoading(true);
      await adapter.set(key, JSON.stringify(value));
      setStoredValue(value);
      setError(null);
    } catch (err) {
      console.warn(`Error setting IndexedDB key "${key}":`, err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Remove value from IndexedDB
  const removeValue = async (): Promise<void> => {
    try {
      setLoading(true);
      await adapter.remove(key);
      setStoredValue(initialValue);
      setError(null);
    } catch (err) {
      console.warn(`Error removing IndexedDB key "${key}":`, err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return [storedValue, setValue, removeValue, loading, error];
}
