/**
 * Infrastructure - Storage Layer
 * Handles all data persistence (localStorage, sessionStorage, IndexedDB)
 *
 * @module infrastructure/storage
 */

// Storage Adapters
export { LocalStorageAdapter } from './adapters/LocalStorageAdapter';
export { SessionStorageAdapter } from './adapters/SessionStorageAdapter';
export { IndexedDBAdapter } from './adapters/IndexedDBAdapter';

// Storage Manager - Unified storage interface
export { StorageManager } from './StorageManager';
export type { StorageAdapter, StorageOptions, StorageKey, StorageValue } from './types';

// Storage Utilities
export { createStorageKey } from './utils/keys';
export { encryptStorageValue, decryptStorageValue } from './utils/encryption';
export { compressStorageValue, decompressStorageValue } from './utils/compression';

// Hooks
export { useLocalStorage } from './hooks/useLocalStorage';
export { useSessionStorage } from './hooks/useSessionStorage';
export { useIndexedDB } from './hooks/useIndexedDB';
