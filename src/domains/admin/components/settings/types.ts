/**
 * Settings Types
 * Type definitions for system settings
 */

export interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  defaultLanguage: string;
  timezone: string;
  dateFormat: string;
  enableRegistration: boolean;
  enableGuestAccess: boolean;
  maintenanceMode: boolean;
}

export interface SecuritySettings {
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSymbols: boolean;
  sessionTimeout: number;
  enableTwoFactor: boolean;
  enableCaptcha: boolean;
  maxLoginAttempts: number;
  lockoutDuration: number;
}

export interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  smtpEncryption: 'none' | 'ssl' | 'tls';
  fromEmail: string;
  fromName: string;
  enableEmailNotifications: boolean;
}

export interface ApiSettings {
  enableApiAccess: boolean;
  rateLimitRequests: number;
  rateLimitWindow: number;
  enableCors: boolean;
  corsOrigins: string[];
  apiVersion: string;
  enableWebhooks: boolean;
}

export interface AllSettings {
  general: GeneralSettings;
  security: SecuritySettings;
  email: EmailSettings;
  api: ApiSettings;
}
