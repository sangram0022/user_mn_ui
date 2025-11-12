// Types for Roles page
export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
}

export interface Role {
  id: string;
  name: string;
  description: string;
  level: number;
  color: string;
  permissions: Permission[];
  userCount: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
