// ========================================
// Admin Domain Localization
// AdminDashboard and related pages
// ========================================

export const admin = {
  // Admin Dashboard
  dashboard: {
    title: 'Admin Dashboard',
    subtitle: 'Manage users and monitor system activity',
    addUser: 'Add User',

    // Stats
    stats: {
      totalUsers: {
        title: 'Total Users',
        change: '+12% from last month',
      },
      activeSessions: {
        title: 'Active Sessions',
        change: '+5% from last month',
      },
      pendingApprovals: {
        title: 'Pending Approvals',
        change: '-8% from last month',
      },
      systemHealth: {
        title: 'System Health',
        change: '+2% from last month',
      },
    },

    // User Management Table
    userManagement: {
      title: 'User Management',
      filter: 'Filter',
      export: 'Export',
      
      table: {
        headers: {
          user: 'User',
          email: 'Email',
          role: 'Role',
          status: 'Status',
          joined: 'Joined',
          actions: 'Actions',
        },
        actions: {
          edit: 'Edit user',
          delete: 'Delete user',
        },
      },

      pagination: {
        showing: 'Showing {{from}}-{{to}} of {{total}} users',
        previous: 'Previous',
        next: 'Next',
      },
    },
  },
} as const;
