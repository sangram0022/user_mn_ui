/**
 * Hashing Service
 * Provides secure hashing functionality for passwords and data integrity
 */

export interface HashingConfig {
  algorithm: string;
  iterations: number;
  saltLength: number;
}

export interface HashedData {
  hash: string;
  salt: string;
  iterations: number;
  algorithm: string;
}

export class HashingService {
  private config: HashingConfig;

  constructor(config?: Partial<HashingConfig>) {
    this.config = {
      algorithm: 'SHA-256',
      iterations: 100000,
      saltLength: 16,
      ...config,
    };
  }

  /**
   * Hash a password using PBKDF2
   */
  async hashPassword(password: string, customSalt?: Uint8Array): Promise<HashedData> {
    try {
      const encoder = new TextEncoder();
      const passwordBuffer = encoder.encode(password);

      // Generate or use provided salt
      const salt = customSalt || this.generateSalt();

      // Import password as key material
      const keyMaterial = await crypto.subtle.importKey('raw', passwordBuffer, 'PBKDF2', false, [
        'deriveBits',
      ]);

      // Derive hash using PBKDF2
      const hashBuffer = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: salt as unknown as ArrayBuffer,
          iterations: this.config.iterations,
          hash: this.config.algorithm,
        },
        keyMaterial,
        256 // 32 bytes
      );

      return {
        hash: this.arrayBufferToBase64(hashBuffer),
        salt: this.arrayBufferToBase64(salt.buffer as ArrayBuffer),
        iterations: this.config.iterations,
        algorithm: this.config.algorithm,
      };
    } catch (error) {
      throw new Error(
        `Password hashing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Verify a password against a hash
   */
  async verifyPassword(password: string, hashedData: HashedData): Promise<boolean> {
    try {
      const salt = new Uint8Array(this.base64ToArrayBuffer(hashedData.salt));

      // Create a temporary config with the stored parameters
      const originalConfig = { ...this.config };
      this.config.iterations = hashedData.iterations;
      this.config.algorithm = hashedData.algorithm;

      // Hash the provided password with the stored salt
      const result = await this.hashPassword(password, salt);

      // Restore original config
      this.config = originalConfig;

      // Compare hashes using constant-time comparison
      return this.constantTimeCompare(result.hash, hashedData.hash);
    } catch (error) {
      throw new Error(
        `Password verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Hash data using SHA-256
   */
  async hashData(data: string | ArrayBuffer): Promise<string> {
    try {
      let buffer: ArrayBuffer;

      if (typeof data === 'string') {
        const encoder = new TextEncoder();
        buffer = encoder.encode(data).buffer;
      } else {
        buffer = data;
      }

      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      return this.arrayBufferToBase64(hashBuffer);
    } catch (error) {
      throw new Error(
        `Data hashing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Hash data using SHA-512
   */
  async hashDataSHA512(data: string | ArrayBuffer): Promise<string> {
    try {
      let buffer: ArrayBuffer;

      if (typeof data === 'string') {
        const encoder = new TextEncoder();
        buffer = encoder.encode(data).buffer;
      } else {
        buffer = data;
      }

      const hashBuffer = await crypto.subtle.digest('SHA-512', buffer);
      return this.arrayBufferToBase64(hashBuffer);
    } catch (error) {
      throw new Error(
        `SHA-512 hashing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generate HMAC for data integrity
   */
  async generateHMAC(data: string, key: CryptoKey): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);

      const signature = await crypto.subtle.sign('HMAC', key, dataBuffer);
      return this.arrayBufferToBase64(signature);
    } catch (error) {
      throw new Error(
        `HMAC generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Verify HMAC
   */
  async verifyHMAC(data: string, signature: string, key: CryptoKey): Promise<boolean> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const signatureBuffer = this.base64ToArrayBuffer(signature);

      return await crypto.subtle.verify('HMAC', key, signatureBuffer, dataBuffer);
    } catch (error) {
      throw new Error(
        `HMAC verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generate HMAC key
   */
  async generateHMACKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: 'HMAC',
        hash: this.config.algorithm,
      },
      true,
      ['sign', 'verify']
    );
  }

  /**
   * Generate random salt
   */
  generateSalt(length?: number): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(length || this.config.saltLength));
  }

  /**
   * Constant-time string comparison to prevent timing attacks
   */
  private constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
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
export const hashingService = new HashingService();
