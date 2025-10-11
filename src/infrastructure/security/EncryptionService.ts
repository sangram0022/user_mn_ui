/**
 * Encryption Service
 * Provides encryption and decryption functionality for sensitive data
 */

export interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  ivLength: number;
}

export interface EncryptedData {
  data: string;
  iv: string;
  tag?: string;
}

export class EncryptionService {
  private config: EncryptionConfig;

  constructor(config?: Partial<EncryptionConfig>) {
    this.config = {
      algorithm: 'AES-GCM',
      keyLength: 256,
      ivLength: 12,
      ...config,
    };
  }

  /**
   * Encrypt data using Web Crypto API
   */
  async encrypt(data: string, key: CryptoKey): Promise<EncryptedData> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);

      // Generate random IV
      const iv = crypto.getRandomValues(new Uint8Array(this.config.ivLength));

      // Encrypt the data
      const encrypted = await crypto.subtle.encrypt(
        {
          name: this.config.algorithm,
          iv: iv,
        },
        key,
        dataBuffer
      );

      return {
        data: this.arrayBufferToBase64(encrypted),
        iv: this.arrayBufferToBase64(iv.buffer),
      };
    } catch (error) {
      throw new Error(
        `Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Decrypt data using Web Crypto API
   */
  async decrypt(encryptedData: EncryptedData, key: CryptoKey): Promise<string> {
    try {
      const dataBuffer = this.base64ToArrayBuffer(encryptedData.data);
      const ivBuffer = this.base64ToArrayBuffer(encryptedData.iv);

      const decrypted = await crypto.subtle.decrypt(
        {
          name: this.config.algorithm,
          iv: ivBuffer,
        },
        key,
        dataBuffer
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      throw new Error(
        `Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generate encryption key
   */
  async generateKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: this.config.algorithm,
        length: this.config.keyLength,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Import key from raw data
   */
  async importKey(keyData: ArrayBuffer): Promise<CryptoKey> {
    return await crypto.subtle.importKey(
      'raw',
      keyData,
      {
        name: this.config.algorithm,
        length: this.config.keyLength,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Export key to raw data
   */
  async exportKey(key: CryptoKey): Promise<ArrayBuffer> {
    return await crypto.subtle.exportKey('raw', key);
  }

  /**
   * Generate key from password using PBKDF2
   */
  async deriveKeyFromPassword(
    password: string,
    salt: Uint8Array,
    iterations: number = 100000
  ): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey('raw', passwordBuffer, 'PBKDF2', false, [
      'deriveKey',
    ]);

    // Derive key using PBKDF2
    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as ArrayBuffer,
        iterations: iterations,
        hash: 'SHA-256',
      },
      keyMaterial,
      {
        name: this.config.algorithm,
        length: this.config.keyLength,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Generate random salt
   */
  generateSalt(length: number = 16): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(length));
  }

  /**
   * Convert ArrayBuffer to Base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert Base64 string to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

// Export singleton instance
export const encryptionService = new EncryptionService();
