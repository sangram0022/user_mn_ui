/**
 * Storage Encryption Utilities
 * Simple encryption/decryption for sensitive data
 *
 * NOTE: For production use, consider using Web Crypto API
 * or a proper encryption library like crypto-js
 */

/**
 * Simple base64 encoding (NOT SECURE - for demonstration only)
 * In production, use Web Crypto API or a proper encryption library
 */
export function encryptStorageValue(value: string, _key?: string): string {
  try {
    // For production, implement proper encryption using Web Crypto API
    // This is a simple base64 encoding for demonstration
    return btoa(encodeURIComponent(value));
  } catch (error) {
    console.error('Encryption error:', error);
    return value;
  }
}

/**
 * Simple base64 decoding (NOT SECURE - for demonstration only)
 * In production, use Web Crypto API or a proper encryption library
 */
export function decryptStorageValue(encrypted: string, _key?: string): string {
  try {
    // For production, implement proper decryption using Web Crypto API
    // This is a simple base64 decoding for demonstration
    return decodeURIComponent(atob(encrypted));
  } catch (error) {
    console.error('Decryption error:', error);
    return encrypted;
  }
}

/**
 * Production-ready encryption using Web Crypto API
 * Uncomment and use this for production
 */
/*
export async function encryptStorageValue(
  value: string,
  key: CryptoKey
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    data
  );
  
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return btoa(String.fromCharCode(...combined));
}

export async function decryptStorageValue(
  encrypted: string,
  key: CryptoKey
): Promise<string> {
  const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
  
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    data
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}
*/
