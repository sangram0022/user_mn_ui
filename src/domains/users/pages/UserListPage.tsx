import { useTranslation } from 'react-i18next';

export default function UserListPage() {
  const { t } = useTranslation();

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('nav.users')}
        </h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          {t('common.create')} User
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <p className="text-gray-600 dark:text-gray-400 text-center">
          User list coming soon... (Domain implementation in progress)
        </p>
      </div>
    </div>
  );
}
