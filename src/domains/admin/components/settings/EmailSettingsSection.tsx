/**
 * EmailSettingsSection Component
 * Email and notification preferences configuration
 */

import type { EmailSettings } from './types';

interface EmailSettingsSectionProps {
  settings: EmailSettings;
  onUpdate: (settings: EmailSettings) => void;
  onTestEmail: () => void;
}

export default function EmailSettingsSection({ 
  settings, 
  onUpdate,
  onTestEmail 
}: EmailSettingsSectionProps) {
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
