import React from 'react';
import Breadcrumb from './Breadcrumb';

const SettingsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumb />
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          </div>
          
          <div className="px-6 py-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Account Settings</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your account preferences and security settings.
                </p>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Configure your notification preferences.
                </p>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900">Privacy</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Control your privacy settings and data preferences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
