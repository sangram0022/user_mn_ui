import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../hooks/useAuth';

export default function ProfilePage() {
  const { t } = useTranslation('profile');
  const { user } = useAuth();

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        {t('profilePage.title')}
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-3xl font-bold text-blue-600 dark:text-blue-400">
            {user?.first_name.charAt(0)}{user?.last_name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user?.first_name} {user?.last_name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('profilePage.fields.role')}
            </label>
            <div className="flex gap-2">
              {user?.roles.map((role) => (
                <span
                  key={role}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('profilePage.fields.status')}
            </label>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              user?.is_active
                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
            }`}>
              {user?.is_active ? t('profilePage.status.active') : t('profilePage.status.inactive')}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('profilePage.fields.emailVerified')}
            </label>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              user?.is_verified
                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
            }`}>
              {user?.is_verified ? t('profilePage.status.verified') : t('profilePage.status.notVerified')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
