/**
 * Security Types
 */

// Authentication
export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
  issuedAt: number;
}

export interface AuthCredentials {
  username?: string;
  email?: string;
  password: string;
}

export interface AuthSession {
  user: {
    id: string;
    email: string;
    role: string;
    permissions: string[];
  };
  token: AuthToken;
  createdAt: number;
  expiresAt: number;
}

export type AuthProvider = 'local' | 'oauth' | 'saml' | 'jwt';

// Authorization
export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'execute';
  conditions?: Record<string, any>;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  level: number;
}

export interface AccessControl {
  resource: string;
  action: string;
  allowed: boolean;
  reason?: string;
}

export type PermissionCheck = (
  resource: string,
  action: string,
  context?: Record<string, any>
) => boolean | Promise<boolean>;

// Encryption
export type EncryptionAlgorithm = 'AES-256' | 'RSA' | 'ChaCha20';
export type HashAlgorithm = 'SHA-256' | 'SHA-512' | 'bcrypt' | 'argon2';

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  algorithm: EncryptionAlgorithm;
  timestamp: number;
}
