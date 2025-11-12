// ========================================
// User Management Types
// ========================================

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'user' | 'manager';
  status: 'active' | 'inactive' | 'pending';
  lastLogin: Date | null;
  createdAt: Date;
  avatar?: string;
}

export interface UserFilters {
  search: string;
  role: string;
  status: string;
  sortBy: 'name' | 'email' | 'lastLogin' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}
