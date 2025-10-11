/**
 * Storage Types
 */

export interface StorageAdapter {
  get(key: string): Promise<string | null> | string | null;
  set(key: string, value: string): Promise<void> | void;
  remove(key: string): Promise<void> | void;
  clear(): Promise<void> | void;
  keys(): Promise<string[]> | string[];
}

export interface StorageOptions {
  prefix?: string;
  encrypt?: boolean;
  compress?: boolean;
  ttl?: number; // Time to live in milliseconds
}

export type StorageKey = string;
export type StorageValue = unknown;

export interface StorageItem<T = unknown> {
  value: T;
  timestamp: number;
  ttl?: number;
  metadata?: Record<string, unknown>;
}
