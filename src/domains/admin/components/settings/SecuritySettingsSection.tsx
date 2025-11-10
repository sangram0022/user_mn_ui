/**
 * SecuritySettingsSection Component
 * Security and authentication configuration
 */

import type { SecuritySettings } from './types';

interface SecuritySettingsSectionProps {
  settings: SecuritySettings;
  onUpdate: (settings: SecuritySettings) => void;
}

export default function SecuritySettingsSection({ 
  settings, 
  onUpdate 
}: SecuritySettingsSectionProps) {
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
