/**
 * SessionStorage Adapter
 */

import type { StorageAdapter } from '../types';

export class SessionStorageAdapter implements StorageAdapter {
  get(key: string): string | null {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.error('SessionStorage get error:', error);
      return null;
    }
  }

  set(key: string, value: string): void {
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.error('SessionStorage set error:', error);
    }
  }

  remove(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('SessionStorage remove error:', error);
    }
  }

  clear(): void {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('SessionStorage clear error:', error);
    }
  }

  keys(): string[] {
    try {
      return Object.keys(sessionStorage);
    } catch (error) {
      console.error('SessionStorage keys error:', error);
      return [];
    }
  }
}
