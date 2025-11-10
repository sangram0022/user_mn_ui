import { Button } from '../components';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { CanAccess } from '../domains/rbac/components/CanAccess';
import { RoleBasedButton } from '../domains/rbac/components/RoleBasedButton';
import { animationUtils } from '../design-system/variants';

// Dummy data - Single source of truth
const statsData = [
  { title: 'Total Users', value: '1,234', trend: '+12%', trendUp: true, icon: '👥' },
  { title: 'Active Users', value: '987', trend: '+8%', trendUp: true, icon: '✅' },
  { title: 'New This Month', value: '143', trend: '+23%', trendUp: true, icon: '🆕' },
  { title: 'Pending Approval', value: '12', trend: '-5%', trendUp: false, icon: '⏳' },
];

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
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users and monitor system activity</p>
        </div>
        <CanAccess requiredRole="admin">
          <RoleBasedButton 
            requiredRole="admin"
            variant="primary" 
            size="md"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add User
          </RoleBasedButton>
        </CanAccess>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat, index) => (
          <Card key={stat.title} hover className={animationUtils.withStagger('animate-scale-in', index)}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">{stat.icon}</div>
              <span className={`text-sm font-medium ${stat.trendUp ? 'text-semantic-success' : 'text-semantic-error'}`}>
                {stat.trend} {stat.trendUp ? '↑' : '↓'}
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
            <p className="text-gray-600 text-sm">{stat.title}</p>
          </Card>
        ))}
      </div>

      {/* User Management Table */}
      <Card className="animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">User Management</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">User</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Joined</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {userData.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-linear-to-br ${user.color} rounded-full flex items-center justify-center text-white font-semibold`}>
                        {user.initials}
                      </div>
                      <span className="font-medium text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <Badge variant={roleVariant[user.role]}>{user.role}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={statusVariant[user.status]}>{user.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.joined}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <RoleBasedButton
                        requiredRole="admin"
                        variant="outline"
                        size="sm"
                        className="p-2 text-brand-primary hover:bg-blue-50 rounded-lg transition-colors"
                        aria-label="Edit user"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </RoleBasedButton>
                      <RoleBasedButton
                        requiredRole="super_admin"
                        variant="outline"
                        size="sm"
                        className="p-2 text-semantic-error hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Delete user"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </RoleBasedButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">Showing 1-5 of 1,234 users</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
