import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '../../../core/routing/routes';
import Button from '../../../shared/components/ui/Button';
import Card from '../../../shared/components/ui/Card';
import Badge from '../../../shared/components/ui/Badge';
import { animationUtils } from '../../../design-system/variants';
import { VirtualTable } from '../../../shared/components/VirtualTable';

// Dummy data - Single source of truth
const userData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active', joined: '2024-01-15', initials: 'JD', color: 'from-blue-500 to-purple-500' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', status: 'Active', joined: '2024-02-20', initials: 'JS', color: 'from-purple-500 to-pink-500' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Active', joined: '2024-03-10', initials: 'BJ', color: 'from-green-500 to-teal-500' },
  { id: 4, name: 'Alice Williams', email: 'alice@example.com', role: 'User', status: 'Inactive', joined: '2024-01-05', initials: 'AW', color: 'from-orange-500 to-red-500' },
  { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', role: 'Editor', status: 'Active', joined: '2024-04-12', initials: 'CB', color: 'from-cyan-500 to-blue-500' },
];

const roleVariant: Record<string, 'secondary' | 'primary' | 'gray'> = {
  'Admin': 'secondary',
  'Editor': 'primary',
  'User': 'gray',
};

const statusVariant: Record<string, 'success' | 'gray'> = {
  'Active': 'success',
  'Inactive': 'gray',
};

export default function AdminDashboard() {
  const { t } = useTranslation('admin');

  const statsData = [
    { title: t('dashboard.stats.totalUsers.title'), value: '1,234', trend: '+12%', trendUp: true, icon: '👥', change: t('dashboard.stats.totalUsers.change') },
    { title: t('dashboard.stats.activeSessions.title'), value: '567', trend: '+5%', trendUp: true, icon: '✅', change: t('dashboard.stats.activeSessions.change') },
    { title: t('dashboard.stats.pendingApprovals.title'), value: '23', trend: '-8%', trendUp: false, icon: '⏳', change: t('dashboard.stats.pendingApprovals.change') },
    { title: t('dashboard.stats.systemHealth.title'), value: '98%', trend: '+2%', trendUp: true, icon: '🏥', change: t('dashboard.stats.systemHealth.change') },
  ];

  const quickLinks = [
    { label: t('common:nav.users'), path: ROUTE_PATHS.USERS_LIST, icon: '👥' },
    { label: t('common:nav.roles'), path: ROUTE_PATHS.ROLES_LIST, icon: '🔑' },
    { label: t('common:nav.audit'), path: ROUTE_PATHS.AUDIT_LOGS, icon: '📋' },
    { label: t('common:nav.monitoring'), path: ROUTE_PATHS.MONITORING_HEALTH, icon: '🏥' },
  ];

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2">{t('dashboard.title')}</h1>
          <p className="text-gray-600">{t('dashboard.subtitle')}</p>
        </div>
        <Button variant="primary" size="md">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {t('dashboard.addUser')}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <Card key={index} hover className={animationUtils.withStagger('animate-scale-in', index)}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">{stat.icon}</div>
              <span className={`text-sm font-medium ${stat.trendUp ? 'text-semantic-success' : 'text-semantic-error'}`}>
                {stat.trend} {stat.trendUp ? '↑' : '↓'}
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-1 text-gray-900">{stat.value}</h3>
            <p className="text-gray-600 text-sm mb-2">{stat.title}</p>
            <p className={`text-xs ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
              {stat.change}
            </p>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickLinks.map((link, index) => (
          <Link
            key={link.path}
            to={link.path}
            className={animationUtils.withStagger('animate-slide-up', index)}
          >
            <Card hover className="text-center group">
              <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                {link.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand-primary transition-colors">
                {link.label}
              </h3>
            </Card>
          </Link>
        ))}
      </div>

      {/* User Management Table - Virtual Scrolling for Performance */}
      <Card className="animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{t('dashboard.userManagement.title')}</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {t('dashboard.userManagement.filter')}
            </Button>
            <Button variant="outline" size="sm">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {t('dashboard.userManagement.export')}
            </Button>
          </div>
        </div>

        {/* Virtual Table with high performance - renders only visible rows */}
        <VirtualTable
          columns={['User', 'Email', 'Role', 'Status', 'Joined', 'Actions']}
          data={userData}
          rowHeight={60}
          maxHeight={600}
          renderCell={(value, key, rowIndex) => {
            const user = userData[rowIndex ?? 0];

            // Custom rendering for User column (with avatar and name)
            if (key === 'User') {
              return (
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-linear-to-br ${user.color} rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0`}>
                    {user.initials}
                  </div>
                  <span className="font-medium text-gray-900">{user.name}</span>
                </div>
              );
            }

            // Custom rendering for Role column
            if (key === 'Role') {
              return <Badge variant={roleVariant[user.role]}>{user.role}</Badge>;
            }

            // Custom rendering for Status column
            if (key === 'Status') {
              return <Badge variant={statusVariant[user.status]}>{user.status}</Badge>;
            }

            // Custom rendering for Actions column
            if (key === 'Actions') {
              return (
                <div className="flex gap-2">
                  <button
                    className="p-2 text-brand-primary hover:bg-blue-50 rounded-lg transition-colors"
                    aria-label={t('dashboard.userManagement.table.actions.edit')}
                    type="button"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    className="p-2 text-semantic-error hover:bg-red-50 rounded-lg transition-colors"
                    aria-label={t('dashboard.userManagement.table.actions.delete')}
                    type="button"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              );
            }

            return value;
          }}
        />

        {/* Pagination Info */}
        <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">{t('dashboard.userManagement.pagination.showing', { from: 1, to: userData.length, total: 1234 })}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              {t('dashboard.userManagement.pagination.previous')}
            </Button>
            <Button variant="outline" size="sm">
              {t('dashboard.userManagement.pagination.next')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
