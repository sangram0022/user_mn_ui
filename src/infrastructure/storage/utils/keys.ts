/**
 * Storage Key Utilities
 * Creates standardized keys for storage
 */

export function createStorageKey(namespace: string, key: string, userId?: string): string {
  const parts = [namespace, key];

  if (userId) {
    parts.push(userId);
  }

  return parts.join(':');
}

export function parseStorageKey(key: string): {
  namespace: string;
  key: string;
  userId?: string;
} {
  const parts = key.split(':');

  if (parts.length < 2) {
    throw new Error(`Invalid storage key format: ${key}`);
  }

  const [namespace, keyName, userId] = parts;

  return {
    namespace,
    key: keyName,
    ...(userId && { userId }),
  };
}

export function isStorageKeyExpired(key: string, ttl: number): boolean {
  const timestamp = localStorage.getItem(`${key}:timestamp`);

  if (!timestamp) {
    return false;
  }

  const created = parseInt(timestamp, 10);
  const now = Date.now();

  return now - created > ttl;
}
