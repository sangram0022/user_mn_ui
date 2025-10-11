/**
 * IndexedDB Adapter
 * Provides asynchronous storage for larger datasets
 */

import type { StorageAdapter } from '../types';

export class IndexedDBAdapter implements StorageAdapter {
  private dbName: string;
  private storeName: string;
  private version: number;
  private db: IDBDatabase | null = null;

  constructor(dbName = 'app-storage', storeName = 'keyval', version = 1) {
    this.dbName = dbName;
    this.storeName = storeName;
    this.version = version;
  }

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }

  async get(key: string): Promise<string | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(key);

        request.onsuccess = () => {
          resolve(request.result ?? null);
        };

        request.onerror = () => {
          reject(new Error('Failed to get value from IndexedDB'));
        };
      });
    } catch (error) {
      console.error('IndexedDB get error:', error);
      return null;
    }
  }

  async set(key: string, value: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.put(value, key);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(new Error('Failed to set value in IndexedDB'));
        };
      });
    } catch (error) {
      console.error('IndexedDB set error:', error);
    }
  }

  async remove(key: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(key);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(new Error('Failed to remove value from IndexedDB'));
        };
      });
    } catch (error) {
      console.error('IndexedDB remove error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.clear();

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(new Error('Failed to clear IndexedDB'));
        };
      });
    } catch (error) {
      console.error('IndexedDB clear error:', error);
    }
  }

  async keys(): Promise<string[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.getAllKeys();

        request.onsuccess = () => {
          resolve(request.result.map(String));
        };

        request.onerror = () => {
          reject(new Error('Failed to get keys from IndexedDB'));
        };
      });
    } catch (error) {
      console.error('IndexedDB keys error:', error);
      return [];
    }
  }
}
