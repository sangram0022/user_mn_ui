/**
 * Storage Manager - Unified Storage Interface
 * 
 * Provides a consistent API for different storage mechanisms
 */

import type { StorageAdapter, StorageOptions } from './types';

export class StorageManager<T = any> {
  private adapter: StorageAdapter;
  private options: StorageOptions;

  constructor(adapter: StorageAdapter, options: StorageOptions = {}) {
    this.adapter = adapter;
    this.options = {
      prefix: options.prefix || 'app',
      encrypt: options.encrypt || false,
      compress: options.compress || false,
      ttl: options.ttl,
    };
  }

  /**
   * Get value from storage
   */
  async get(key: string): Promise<T | null> {
    const fullKey = this.getFullKey(key);
    const value = await this.adapter.get(fullKey);
    
    if (!value) return null;

    // Check TTL
    if (this.options.ttl && this.isExpired(value)) {
      await this.remove(key);
      return null;
    }

    return this.deserialize(value);
  }

  /**
   * Set value in storage
   */
  async set(key: string, value: T): Promise<void> {
    const fullKey = this.getFullKey(key);
    const serialized = this.serialize(value);
    await this.adapter.set(fullKey, serialized);
  }

  /**
   * Remove value from storage
   */
  async remove(key: string): Promise<void> {
    const fullKey = this.getFullKey(key);
    await this.adapter.remove(fullKey);
  }

  /**
   * Clear all storage
   */
  async clear(): Promise<void> {
    await this.adapter.clear();
  }

  /**
   * Get all keys
   */
  async keys(): Promise<string[]> {
    return this.adapter.keys();
  }

  private getFullKey(key: string): string {
    return `${this.options.prefix}:${key}`;
  }

  private serialize(value: T): string {
    const data = {
      value,
      timestamp: Date.now(),
      ttl: this.options.ttl,
    };
    return JSON.stringify(data);
  }

  private deserialize(str: string): T {
    const data = JSON.parse(str);
    return data.value;
  }

  private isExpired(str: string): boolean {
    try {
      const data = JSON.parse(str);
      if (!data.ttl) return false;
      return Date.now() > data.timestamp + data.ttl;
    } catch {
      return false;
    }
  }
}
