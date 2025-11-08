// ========================================
// Settings Page - System Configuration
// ========================================
// Comprehensive system settings with:
// - General application settings
// - Security and authentication config
// - Email and notification preferences
// - API and integration settings
// - System maintenance options
// - Accessibility features
// ========================================

import { useState, useEffect } from 'react';
import { useLiveRegion } from '../../../shared/components/accessibility/AccessibilityEnhancements';
// AWS CloudWatch handles performance monitoring

// ========================================
// Types and Interfaces
// ========================================

interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  defaultLanguage: string;
  timezone: string;
  dateFormat: string;
  enableRegistration: boolean;
  enableGuestAccess: boolean;
  maintenanceMode: boolean;
}

interface SecuritySettings {
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

interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  smtpEncryption: 'none' | 'ssl' | 'tls';
  fromEmail: string;
  fromName: string;
  enableEmailNotifications: boolean;
}

interface ApiSettings {
  enableApiAccess: boolean;
  rateLimitRequests: number;
  rateLimitWindow: number;
  enableCors: boolean;
  corsOrigins: string[];
  apiVersion: string;
  enableWebhooks: boolean;
}

// ========================================
// Mock Data
// ========================================

function getDefaultSettings() {
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
    } as GeneralSettings,
    
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
    } as SecuritySettings,
    
    email: {
      smtpHost: 'smtp.example.com',
      smtpPort: 587,
      smtpUsername: 'noreply@example.com',
      smtpPassword: '',
      smtpEncryption: 'tls' as const,
      fromEmail: 'noreply@example.com',
      fromName: 'User Management System',
      enableEmailNotifications: true,
    } as EmailSettings,
    
    api: {
      enableApiAccess: true,
      rateLimitRequests: 1000,
      rateLimitWindow: 60,
      enableCors: true,
      corsOrigins: ['http://localhost:3000', 'https://app.example.com'],
      apiVersion: 'v1',
      enableWebhooks: false,
    } as ApiSettings,
  };
}

// ========================================
// Setting Section Components
// ========================================

function GeneralSettingsSection({ 
  settings, 
  onUpdate 
}: { 
  settings: GeneralSettings;
  onUpdate: (settings: GeneralSettings) => void;
}) {
  const updateSetting = <K extends keyof GeneralSettings>(
    key: K, 
    value: GeneralSettings[K]
  ) => {
    onUpdate({ ...settings, [key]: value });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">General Settings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-2">
            Site Name
          </label>
          <input
            id="siteName"
            type="text"
            value={settings.siteName}
            onChange={(e) => updateSetting('siteName', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="defaultLanguage" className="block text-sm font-medium text-gray-700 mb-2">
            Default Language
          </label>
          <select
            id="defaultLanguage"
            value={settings.defaultLanguage}
            onChange={(e) => updateSetting('defaultLanguage', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 mb-2">
            Site Description
          </label>
          <textarea
            id="siteDescription"
            rows={3}
            value={settings.siteDescription}
            onChange={(e) => updateSetting('siteDescription', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            id="timezone"
            value={settings.timezone}
            onChange={(e) => updateSetting('timezone', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
          </select>
        </div>

        <div>
          <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700 mb-2">
            Date Format
          </label>
          <select
            id="dateFormat"
            value={settings.dateFormat}
            onChange={(e) => updateSetting('dateFormat', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={settings.enableRegistration}
            onChange={(e) => updateSetting('enableRegistration', e.target.checked)}
            className="rounded text-blue-600 focus:ring-blue-500"
          />
          <div>
            <div className="font-medium text-gray-900">Enable User Registration</div>
            <div className="text-sm text-gray-500">Allow new users to create accounts</div>
          </div>
        </label>

        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={settings.enableGuestAccess}
            onChange={(e) => updateSetting('enableGuestAccess', e.target.checked)}
            className="rounded text-blue-600 focus:ring-blue-500"
          />
          <div>
            <div className="font-medium text-gray-900">Enable Guest Access</div>
            <div className="text-sm text-gray-500">Allow anonymous users to browse</div>
          </div>
        </label>

        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={settings.maintenanceMode}
            onChange={(e) => updateSetting('maintenanceMode', e.target.checked)}
            className="rounded text-red-600 focus:ring-red-500"
          />
          <div>
            <div className="font-medium text-red-600">Maintenance Mode</div>
            <div className="text-sm text-red-500">Disable site access for maintenance</div>
          </div>
        </label>
      </div>
    </div>
  );
}

function SecuritySettingsSection({ 
  settings, 
  onUpdate 
}: { 
  settings: SecuritySettings;
  onUpdate: (settings: SecuritySettings) => void;
}) {
  const updateSetting = <K extends keyof SecuritySettings>(
    key: K, 
    value: SecuritySettings[K]
  ) => {
    onUpdate({ ...settings, [key]: value });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h2>
      
      <div className="space-y-6">
        {/* Password Requirements */}
        <div>
          <h3 className="font-medium text-gray-900 mb-4">Password Requirements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="passwordMinLength" className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Length
              </label>
              <input
                id="passwordMinLength"
                type="number"
                min="6"
                max="50"
                value={settings.passwordMinLength}
                onChange={(e) => updateSetting('passwordMinLength', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-4 space-y-3">
            {[
              { key: 'passwordRequireUppercase', label: 'Require uppercase letters' },
              { key: 'passwordRequireLowercase', label: 'Require lowercase letters' },
              { key: 'passwordRequireNumbers', label: 'Require numbers' },
              { key: 'passwordRequireSymbols', label: 'Require symbols (!@#$%^&*)' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings[key as keyof SecuritySettings] as boolean}
                  onChange={(e) => updateSetting(key as keyof SecuritySettings, e.target.checked as never)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Session Settings */}
        <div>
          <h3 className="font-medium text-gray-900 mb-4">Session Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (minutes)
              </label>
              <input
                id="sessionTimeout"
                type="number"
                min="5"
                max="1440"
                value={settings.sessionTimeout}
                onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="maxLoginAttempts" className="block text-sm font-medium text-gray-700 mb-2">
                Max Login Attempts
              </label>
              <input
                id="maxLoginAttempts"
                type="number"
                min="3"
                max="20"
                value={settings.maxLoginAttempts}
                onChange={(e) => updateSetting('maxLoginAttempts', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="lockoutDuration" className="block text-sm font-medium text-gray-700 mb-2">
                Lockout Duration (minutes)
              </label>
              <input
                id="lockoutDuration"
                type="number"
                min="1"
                max="1440"
                value={settings.lockoutDuration}
                onChange={(e) => updateSetting('lockoutDuration', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Security Features */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">Security Features</h3>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.enableTwoFactor}
              onChange={(e) => updateSetting('enableTwoFactor', e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <div>
              <div className="font-medium text-gray-900">Two-Factor Authentication</div>
              <div className="text-sm text-gray-500">Require 2FA for all users</div>
            </div>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.enableCaptcha}
              onChange={(e) => updateSetting('enableCaptcha', e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <div>
              <div className="font-medium text-gray-900">CAPTCHA Protection</div>
              <div className="text-sm text-gray-500">Enable CAPTCHA on login forms</div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}

function EmailSettingsSection({ 
  settings, 
  onUpdate,
  onTestEmail 
}: { 
  settings: EmailSettings;
  onUpdate: (settings: EmailSettings) => void;
  onTestEmail: () => void;
}) {
  const updateSetting = <K extends keyof EmailSettings>(
    key: K, 
    value: EmailSettings[K]
  ) => {
    onUpdate({ ...settings, [key]: value });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Email Settings</h2>
        <button
          onClick={onTestEmail}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors text-sm"
        >
          Test Email
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="smtpHost" className="block text-sm font-medium text-gray-700 mb-2">
            SMTP Host
          </label>
          <input
            id="smtpHost"
            type="text"
            value={settings.smtpHost}
            onChange={(e) => updateSetting('smtpHost', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700 mb-2">
            SMTP Port
          </label>
          <input
            id="smtpPort"
            type="number"
            value={settings.smtpPort}
            onChange={(e) => updateSetting('smtpPort', parseInt(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="smtpUsername" className="block text-sm font-medium text-gray-700 mb-2">
            SMTP Username
          </label>
          <input
            id="smtpUsername"
            type="text"
            value={settings.smtpUsername}
            onChange={(e) => updateSetting('smtpUsername', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="smtpPassword" className="block text-sm font-medium text-gray-700 mb-2">
            SMTP Password
          </label>
          <input
            id="smtpPassword"
            type="password"
            value={settings.smtpPassword}
            onChange={(e) => updateSetting('smtpPassword', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="smtpEncryption" className="block text-sm font-medium text-gray-700 mb-2">
            Encryption
          </label>
          <select
            id="smtpEncryption"
            value={settings.smtpEncryption}
            onChange={(e) => updateSetting('smtpEncryption', e.target.value as EmailSettings['smtpEncryption'])}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="none">None</option>
            <option value="ssl">SSL</option>
            <option value="tls">TLS</option>
          </select>
        </div>

        <div>
          <label htmlFor="fromEmail" className="block text-sm font-medium text-gray-700 mb-2">
            From Email
          </label>
          <input
            id="fromEmail"
            type="email"
            value={settings.fromEmail}
            onChange={(e) => updateSetting('fromEmail', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="fromName" className="block text-sm font-medium text-gray-700 mb-2">
            From Name
          </label>
          <input
            id="fromName"
            type="text"
            value={settings.fromName}
            onChange={(e) => updateSetting('fromName', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={settings.enableEmailNotifications}
            onChange={(e) => updateSetting('enableEmailNotifications', e.target.checked)}
            className="rounded text-blue-600 focus:ring-blue-500"
          />
          <div>
            <div className="font-medium text-gray-900">Enable Email Notifications</div>
            <div className="text-sm text-gray-500">Send system notifications via email</div>
          </div>
        </label>
      </div>
    </div>
  );
}

// ========================================
// Main Settings Page
// ========================================

export default function SettingsPage() {
  const [settings, setSettings] = useState(getDefaultSettings);
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  
  // AWS CloudWatch records metrics automatically
  const { announce, LiveRegion } = useLiveRegion();

  useEffect(() => {
    document.title = 'System Settings - Admin';
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    // AWS CloudWatch monitors performance automatically
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      announce('Settings saved successfully');
    } catch {
      announce('Failed to save settings');
    } finally {
      setIsSaving(false);
      // AWS CloudWatch tracks performance and metrics automatically
    }
  };

  const handleTestEmail = async () => {
    announce('Sending test email...');
    // Simulate test email
    await new Promise(resolve => setTimeout(resolve, 2000));
    announce('Test email sent successfully');
  };

  const tabs = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'email', name: 'Email', icon: '📧' },
    { id: 'api', name: 'API', icon: '🔌' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <LiveRegion />

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
              <p className="text-sm text-gray-500">
                Configure system-wide settings and preferences
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSettings(getDefaultSettings())}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Reset to Defaults
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {activeTab === 'general' && (
            <GeneralSettingsSection
              settings={settings.general}
              onUpdate={(general) => setSettings(prev => ({ ...prev, general }))}
            />
          )}

          {activeTab === 'security' && (
            <SecuritySettingsSection
              settings={settings.security}
              onUpdate={(security) => setSettings(prev => ({ ...prev, security }))}
            />
          )}

          {activeTab === 'email' && (
            <EmailSettingsSection
              settings={settings.email}
              onUpdate={(email) => setSettings(prev => ({ ...prev, email }))}
              onTestEmail={handleTestEmail}
            />
          )}

          {activeTab === 'api' && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">API Settings</h2>
              <div className="text-gray-500">API configuration panel - Coming soon</div>
            </div>
          )}
        </div>

        {/* Performance Info */}
        {import.meta.env.MODE === 'development' && (
          <div className="mt-8 bg-gray-900 text-white p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Settings Status</h3>
            <div className="text-sm">
              <div>Active Tab: {activeTab}</div>
              <div>Saving State: {isSaving ? 'Saving...' : 'Idle'}</div>
              <div>Maintenance Mode: {settings.general.maintenanceMode ? 'ON' : 'OFF'}</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}