/**
 * GeneralSettingsSection Component
 * General application settings configuration
 */

import type { GeneralSettings } from './types';

interface GeneralSettingsSectionProps {
  settings: GeneralSettings;
  onUpdate: (settings: GeneralSettings) => void;
}

export default function GeneralSettingsSection({ 
  settings, 
  onUpdate 
}: GeneralSettingsSectionProps) {
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
