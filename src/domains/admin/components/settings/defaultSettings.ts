/**
 * Default Settings Configuration
 * Default values for system settings
 */

import type { AllSettings } from './types';

export function getDefaultSettings(): AllSettings {
  return {
    general: {
      siteName: 'User Management System',
      siteDescription: 'Modern user management platform with advanced features',
      defaultLanguage: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      enableRegistration: true,
      enableGuestAccess: false,
      maintenanceMode: false,
    },
    
    security: {
      passwordMinLength: 8,
      passwordRequireUppercase: true,
      passwordRequireLowercase: true,
      passwordRequireNumbers: true,
      passwordRequireSymbols: false,
      sessionTimeout: 30,
      enableTwoFactor: true,
      enableCaptcha: true,
      maxLoginAttempts: 5,
      lockoutDuration: 15,
    },
    
    email: {
      smtpHost: 'smtp.example.com',
      smtpPort: 587,
      smtpUsername: 'noreply@example.com',
      smtpPassword: '',
      smtpEncryption: 'tls',
      fromEmail: 'noreply@example.com',
      fromName: 'User Management System',
      enableEmailNotifications: true,
    },
    
    api: {
      enableApiAccess: true,
      rateLimitRequests: 100,
      rateLimitWindow: 60,
      enableCors: true,
      corsOrigins: ['http://localhost:3000'],
      apiVersion: 'v1',
      enableWebhooks: false,
    },
  };
}
