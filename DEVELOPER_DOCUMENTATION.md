# Developer Documentation - User Management System
**Complete Guide for New Developers**

**Version:** 1.0.0  
**Last Updated:** November 12, 2025  
**Framework:** React 19.1.1 + TypeScript + Vite 6.0.1

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Architecture Overview](#2-architecture-overview)
3. [Core Concepts](#3-core-concepts)
4. [Standard Patterns](#4-standard-patterns)
5. [Complete Use Case Implementation](#5-complete-use-case-implementation)
6. [Validation Framework](#6-validation-framework)
7. [Error Handling](#7-error-handling)
8. [API Integration](#8-api-integration)
9. [State Management](#9-state-management)
10. [UI Components](#10-ui-components)
11. [Testing Guidelines](#11-testing-guidelines)
12. [Best Practices](#12-best-practices)

---

## 1. Getting Started

### 1.1 Prerequisites

```bash
# Required versions
Node.js: >= 18.0.0
npm: >= 9.0.0
```

### 1.2 Installation

```bash
# Clone repository
git clone <repository-url>
cd usermn1

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start development server
npm run dev
```

### 1.3 Project Structure

```
src/
├── app/              # Application root (providers, layout)
├── core/             # Cross-cutting concerns (SSOT)
│   ├── api/          # API client, helpers, types
│   ├── config/       # Centralized configuration
│   ├── error/        # Error handling framework
│   ├── localization/ # i18n setup
│   ├── logging/      # RFC 5424 compliant logger
│   ├── monitoring/   # Health checks, metrics
│   ├── routing/      # Centralized routes config
│   └── validation/   # Validation framework
├── domains/          # Feature domains (DDD)
│   ├── admin/        # Admin features
│   ├── auth/         # Authentication
│   ├── user/         # User features
│   └── rbac/         # Role-based access
├── shared/           # Shared components & utilities
├── services/         # API services layer
├── design-system/    # Design tokens, variants
└── pages/            # Page components
```

---

## 2. Architecture Overview

### 2.1 Architecture Pattern

**Domain-Driven Design (DDD) + Feature-Sliced Design**

**Dependency Flow (Unidirectional):**
```
Pages → Domains → Services → Core → External APIs
```

**Key Principles:**
- ✅ Single Source of Truth (SSOT) for all concerns
- ✅ Unidirectional data flow
- ✅ Separation of concerns
- ✅ No circular dependencies
- ✅ Service → Hook → Component pattern

### 2.2 Domain Structure

Each domain is self-contained:

```
domain/
├── components/    # Domain-specific UI components
├── hooks/         # Domain-specific React hooks
├── pages/         # Domain page components
├── services/      # Domain API services
├── types/         # Domain TypeScript types
└── utils/         # Domain utility functions
```

**Example: Admin Domain**
```typescript
domains/admin/
├── components/
│   └── UserCard.tsx
├── hooks/
│   └── useAdminUsers.hooks.ts
├── pages/
│   └── UsersPage.tsx
├── services/
│   └── adminService.ts
└── types/
    └── index.ts
```

---

## 3. Core Concepts

### 3.1 Single Source of Truth (SSOT)

**All shared code MUST come from core modules:**

```typescript
// ❌ DON'T: Hard-code or duplicate
const API_URL = 'https://api.example.com';
console.log('User logged in');

// ✅ DO: Import from SSOT
import { config } from '@/core/config';
import { logger } from '@/core/logging';
import { API_PREFIXES } from '@/core/api';

const apiUrl = config.api.baseUrl;
logger().info('User logged in', { userId });
```

### 3.2 Service → Hook → Component Pattern

**Standard Data Flow:**

```
API Service → React Hook → React Component
   (core)       (domain)        (UI)
```

**Example:**
```typescript
// 1. Service (src/domains/admin/services/adminService.ts)
export const createUser = async (data: CreateUserRequest) => {
  return apiPost<CreateUserResponse>('/api/v1/admin/users', data);
};

// 2. Hook (src/domains/admin/hooks/useAdminUsers.hooks.ts)
export const useCreateUser = () => {
  return useMutation({
    mutationFn: adminService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
};

// 3. Component (src/domains/admin/pages/CreateUserPage.tsx)
const CreateUserPage = () => {
  const createUser = useCreateUser();
  
  const onSubmit = async (data) => {
    await createUser.mutateAsync(data);
  };
};
```

---

## 4. Standard Patterns

### 4.1 Logging Pattern

**ALWAYS use centralized logger:**

```typescript
import { logger } from '@/core/logging';

// ❌ NEVER use console.log in production code
console.log('User created'); // BAD

// ✅ Use structured logging
logger().info('User created successfully', { 
  userId: user.id,
  email: user.email,
  timestamp: Date.now()
});

// Log levels
logger().debug('Debug information', { data });  // Development only
logger().info('Informational message', { data }); // General info
logger().warn('Warning message', { data });      // Warnings
logger().error('Error occurred', error, { data }); // Errors
```

### 4.2 Error Handling Pattern

**ALWAYS use useStandardErrorHandler hook:**

```typescript
import { useStandardErrorHandler } from '@/shared/hooks/useStandardErrorHandler';
import { useToast } from '@/hooks/useToast';

const MyComponent = () => {
  const handleError = useStandardErrorHandler();
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      toast.success('User created successfully!');
    },
    onError: (error) => {
      // Standard error handler:
      // - Shows toast notification
      // - Logs error with context
      // - Extracts field errors
      // - Handles 401 redirects
      handleError(error, {
        context: { operation: 'createUser' },
        customMessage: 'Failed to create user',
      });
    },
  });
};
```

### 4.3 Validation Pattern

**Use Zod schemas for forms:**

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userCreateSchema } from '@/core/validation/schemas';

const MyForm = () => {
  const form = useForm({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
    },
  });

  const onSubmit = async (data) => {
    // Data is validated by Zod before reaching here
    await createUser(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input
        {...form.register('email')}
        error={form.formState.errors.email?.message}
      />
    </form>
  );
};
```

### 4.4 API Call Pattern

**Use TanStack Query + centralized services:**

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryKeys } from '@/services/api/queryKeys';
import { adminService } from '@/domains/admin/services';

// Query (GET)
const { data, isLoading, error } = useQuery({
  queryKey: queryKeys.users.list({ status: 'active' }),
  queryFn: () => adminService.listUsers({ status: 'active' }),
});

// Mutation (POST/PUT/DELETE)
const mutation = useMutation({
  mutationFn: adminService.createUser,
  onSuccess: () => {
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.users.lists() 
    });
  },
});
```

---

## 5. Complete Use Case Implementation

### Use Case: Create Lead Management Feature

**Scenario:** You need to implement a complete lead management feature:
1. Create lead form with validation
2. Save lead to database via API
3. Show real-time validation errors
4. Display toast messages
5. Show leads list with pagination

**Step-by-Step Implementation:**

#### Step 1: Define Types

**File:** `src/domains/leads/types/index.ts`

```typescript
/**
 * Lead Management Types
 */

export interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company?: string;
  source: 'website' | 'referral' | 'social' | 'other';
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLeadRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company?: string;
  source: Lead['source'];
  notes?: string;
}

export interface CreateLeadResponse {
  success: boolean;
  data: Lead;
  message: string;
}

export interface ListLeadsFilters {
  status?: Lead['status'];
  source?: Lead['source'];
  search?: string;
  page?: number;
  page_size?: number;
  sort_by?: 'created_at' | 'first_name' | 'last_name';
  sort_order?: 'asc' | 'desc';
}

export interface ListLeadsResponse {
  success: boolean;
  data: {
    leads: Lead[];
    pagination: {
      page: number;
      page_size: number;
      total_items: number;
      total_pages: number;
    };
  };
}
```

#### Step 2: Create Validation Schema

**File:** `src/domains/leads/validation/schemas.ts`

```typescript
import { z } from 'zod';
import { 
  emailSchema, 
  phoneSchema, 
  nameSchema 
} from '@/core/validation/schemas';

/**
 * Lead creation schema
 */
export const createLeadSchema = z.object({
  first_name: nameSchema,
  last_name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  company: z.string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  source: z.enum(['website', 'referral', 'social', 'other'], {
    errorMap: () => ({ message: 'Please select a lead source' }),
  }),
  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional(),
});

export type CreateLeadFormData = z.infer<typeof createLeadSchema>;
```

#### Step 3: Create API Service

**File:** `src/domains/leads/services/leadsService.ts`

```typescript
import { apiGet, apiPost, apiPut, apiDelete } from '@/core/api/apiHelpers';
import type {
  Lead,
  CreateLeadRequest,
  CreateLeadResponse,
  ListLeadsFilters,
  ListLeadsResponse,
} from '../types';

const API_PREFIX = '/api/v1/leads';

/**
 * Create new lead
 */
export const createLead = async (
  data: CreateLeadRequest
): Promise<CreateLeadResponse> => {
  return apiPost<CreateLeadResponse>(API_PREFIX, data);
};

/**
 * List leads with filters
 */
export const listLeads = async (
  filters?: ListLeadsFilters
): Promise<ListLeadsResponse> => {
  return apiGet<ListLeadsResponse>(
    API_PREFIX, 
    filters as Record<string, unknown>
  );
};

/**
 * Get single lead
 */
export const getLead = async (leadId: string): Promise<Lead> => {
  return apiGet<Lead>(`${API_PREFIX}/${leadId}`);
};

/**
 * Update lead
 */
export const updateLead = async (
  leadId: string,
  data: Partial<CreateLeadRequest>
): Promise<Lead> => {
  return apiPut<Lead>(`${API_PREFIX}/${leadId}`, data);
};

/**
 * Delete lead
 */
export const deleteLead = async (leadId: string): Promise<void> => {
  return apiDelete<void>(`${API_PREFIX}/${leadId}`);
};

// Export as service object
const leadsService = {
  createLead,
  listLeads,
  getLead,
  updateLead,
  deleteLead,
};

export default leadsService;
```

#### Step 4: Add Query Keys

**File:** `src/services/api/queryKeys.ts` (add to existing file)

```typescript
export const queryKeys = {
  // ... existing keys ...
  
  // Leads Domain
  leads: {
    all: ['leads'] as const,
    lists: () => [...queryKeys.leads.all, 'list'] as const,
    list: (filters?: ListLeadsFilters) => 
      [...queryKeys.leads.lists(), filters] as const,
    details: () => [...queryKeys.leads.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.leads.details(), id] as const,
  },
};
```

#### Step 5: Create React Hooks

**File:** `src/domains/leads/hooks/useLeads.hooks.ts`

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/services/api/queryKeys';
import leadsService from '../services/leadsService';
import { logger } from '@/core/logging';
import type {
  CreateLeadRequest,
  ListLeadsFilters,
} from '../types';

/**
 * Query hook - List leads
 */
export const useLeadsList = (filters?: ListLeadsFilters) => {
  return useQuery({
    queryKey: queryKeys.leads.list(filters),
    queryFn: () => leadsService.listLeads(filters),
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Query hook - Single lead
 */
export const useLead = (leadId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.leads.detail(leadId ?? ''),
    queryFn: () => leadsService.getLead(leadId!),
    enabled: !!leadId,
  });
};

/**
 * Mutation hook - Create lead
 */
export const useCreateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateLeadRequest) => {
      logger().info('Creating new lead', { 
        email: data.email, 
        source: data.source 
      });
      
      const response = await leadsService.createLead(data);
      
      logger().info('Lead created successfully', { 
        leadId: response.data.id 
      });
      
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch leads list
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.leads.lists() 
      });
    },
    onError: (error: Error, variables) => {
      logger().error('Failed to create lead', error, { 
        email: variables.email 
      });
    },
  });
};

/**
 * Mutation hook - Update lead
 */
export const useUpdateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      leadId, 
      data 
    }: { 
      leadId: string; 
      data: Partial<CreateLeadRequest> 
    }) => {
      logger().info('Updating lead', { leadId });
      const lead = await leadsService.updateLead(leadId, data);
      logger().info('Lead updated successfully', { leadId });
      return lead;
    },
    onSuccess: (lead) => {
      // Update cache
      queryClient.setQueryData(
        queryKeys.leads.detail(lead.id),
        lead
      );
      
      // Invalidate lists
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.leads.lists() 
      });
    },
  });
};

/**
 * Mutation hook - Delete lead
 */
export const useDeleteLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadId: string) => {
      logger().info('Deleting lead', { leadId });
      await leadsService.deleteLead(leadId);
      logger().info('Lead deleted successfully', { leadId });
    },
    onSuccess: (_data, leadId) => {
      // Remove from cache
      queryClient.removeQueries({ 
        queryKey: queryKeys.leads.detail(leadId) 
      });
      
      // Invalidate lists
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.leads.lists() 
      });
    },
  });
};
```

#### Step 6: Create Form Component

**File:** `src/domains/leads/components/CreateLeadForm.tsx`

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import { useStandardErrorHandler } from '@/shared/hooks/useStandardErrorHandler';
import Button from '@/shared/components/ui/Button';
import Input from '@/shared/components/ui/Input';
import { useCreateLead } from '../hooks/useLeads.hooks';
import { createLeadSchema, type CreateLeadFormData } from '../validation/schemas';

const SOURCE_OPTIONS = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'social', label: 'Social Media' },
  { value: 'other', label: 'Other' },
];

export function CreateLeadForm() {
  const navigate = useNavigate();
  const toast = useToast();
  const handleError = useStandardErrorHandler();
  const createLead = useCreateLead();

  const form = useForm<CreateLeadFormData>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      company: '',
      source: 'website',
      notes: '',
    },
    mode: 'onBlur', // Validate on blur for better UX
  });

  const onSubmit = async (data: CreateLeadFormData) => {
    try {
      await createLead.mutateAsync(data);
      
      // Success feedback
      toast.success('Lead created successfully!');
      
      // Navigate to leads list
      navigate('/leads');
      
      // Reset form
      form.reset();
    } catch (error) {
      // Standard error handling
      handleError(error, {
        context: { 
          operation: 'createLead', 
          form: 'CreateLeadForm' 
        },
        customMessage: 'Failed to create lead. Please try again.',
      });
    }
  };

  return (
    <form 
      onSubmit={form.handleSubmit(onSubmit)} 
      className="space-y-6"
    >
      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          {...form.register('first_name')}
          label="First Name"
          placeholder="John"
          error={form.formState.errors.first_name?.message}
          required
        />
        
        <Input
          {...form.register('last_name')}
          label="Last Name"
          placeholder="Doe"
          error={form.formState.errors.last_name?.message}
          required
        />
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          {...form.register('email')}
          type="email"
          label="Email"
          placeholder="john@example.com"
          error={form.formState.errors.email?.message}
          required
        />
        
        <Input
          {...form.register('phone')}
          type="tel"
          label="Phone"
          placeholder="+1 (555) 123-4567"
          error={form.formState.errors.phone?.message}
          required
        />
      </div>

      {/* Company Information */}
      <Input
        {...form.register('company')}
        label="Company (Optional)"
        placeholder="Acme Corporation"
        error={form.formState.errors.company?.message}
      />

      {/* Lead Source */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Lead Source <span className="text-red-500">*</span>
        </label>
        <select
          {...form.register('source')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {SOURCE_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {form.formState.errors.source && (
          <p className="mt-1 text-sm text-red-600">
            {form.formState.errors.source.message}
          </p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes (Optional)
        </label>
        <textarea
          {...form.register('notes')}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Additional information about the lead..."
        />
        {form.formState.errors.notes && (
          <p className="mt-1 text-sm text-red-600">
            {form.formState.errors.notes.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate('/leads')}
        >
          Cancel
        </Button>
        
        <Button
          type="submit"
          variant="primary"
          loading={form.formState.isSubmitting}
          disabled={!form.formState.isValid || form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? 'Creating...' : 'Create Lead'}
        </Button>
      </div>
    </form>
  );
}
```

#### Step 7: Create List Component

**File:** `src/domains/leads/components/LeadsList.tsx`

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import { useStandardErrorHandler } from '@/shared/hooks/useStandardErrorHandler';
import Button from '@/shared/components/ui/Button';
import Badge from '@/shared/components/ui/Badge';
import { useLeadsList, useDeleteLead } from '../hooks/useLeads.hooks';
import type { ListLeadsFilters, Lead } from '../types';

export function LeadsList() {
  const navigate = useNavigate();
  const toast = useToast();
  const handleError = useStandardErrorHandler();
  
  const [filters, setFilters] = useState<ListLeadsFilters>({
    page: 1,
    page_size: 10,
    sort_by: 'created_at',
    sort_order: 'desc',
  });

  const { data, isLoading, isError, error } = useLeadsList(filters);
  const deleteLead = useDeleteLead();

  const leads = data?.data.leads || [];
  const pagination = data?.data.pagination;

  const handleDelete = async (leadId: string) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) {
      return;
    }

    try {
      await deleteLead.mutateAsync(leadId);
      toast.success('Lead deleted successfully');
    } catch (error) {
      handleError(error, {
        context: { operation: 'deleteLead', leadId },
        customMessage: 'Failed to delete lead',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading leads: {error?.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Leads ({pagination?.total_items || 0})
        </h1>
        <Button
          onClick={() => navigate('/leads/create')}
          variant="primary"
        >
          Create Lead
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={filters.status || ''}
          onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="converted">Converted</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leads.map((lead: Lead) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {lead.first_name} {lead.last_name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {lead.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {lead.company || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant="info">{lead.source}</Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge 
                    variant={
                      lead.status === 'new' ? 'warning' :
                      lead.status === 'converted' ? 'success' :
                      'gray'
                    }
                  >
                    {lead.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => navigate(`/leads/${lead.id}`)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    View
                  </button>
                  <button
                    onClick={() => navigate(`/leads/${lead.id}/edit`)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(lead.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Showing {((pagination.page - 1) * pagination.page_size) + 1} to{' '}
            {Math.min(pagination.page * pagination.page_size, pagination.total_items)} of{' '}
            {pagination.total_items} results
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setFilters({ ...filters, page: filters.page! - 1 })}
              disabled={pagination.page === 1}
              variant="secondary"
            >
              Previous
            </Button>
            <Button
              onClick={() => setFilters({ ...filters, page: filters.page! + 1 })}
              disabled={pagination.page === pagination.total_pages}
              variant="secondary"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

#### Step 8: Create Page Component

**File:** `src/domains/leads/pages/LeadsPage.tsx`

```typescript
import { Routes, Route } from 'react-router-dom';
import { CreateLeadForm } from '../components/CreateLeadForm';
import { LeadsList } from '../components/LeadsList';

export default function LeadsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Routes>
        <Route index element={<LeadsList />} />
        <Route path="create" element={<CreateLeadForm />} />
      </Routes>
    </div>
  );
}
```

#### Step 9: Register Routes

**File:** `src/core/routing/routes.tsx` (add to existing routes)

```typescript
import { lazy } from 'react';

const LeadsPage = lazy(() => import('@/domains/leads/pages/LeadsPage'));

export const routes = [
  // ... existing routes ...
  
  {
    path: '/leads/*',
    element: <LeadsPage />,
    meta: {
      title: 'Leads Management',
      requiresAuth: true,
      permissions: ['leads:read'],
    },
  },
];
```

---

## 6. Validation Framework

### 6.1 Available Validators

```typescript
import {
  emailValidator,
  passwordValidator,
  usernameValidator,
  phoneValidator,
  nameValidator,
  dateValidator,
  urlValidator,
} from '@/core/validation';
```

### 6.2 Zod Schemas (Recommended)

**Pre-built schemas:**

```typescript
import {
  loginSchema,
  registerSchema,
  userCreateSchema,
  userEditSchema,
  contactFormSchema,
  emailSchema,
  passwordSchema,
  phoneSchema,
  nameSchema,
} from '@/core/validation/schemas';
```

### 6.3 Custom Validation

```typescript
import { z } from 'zod';

const customSchema = z.object({
  customField: z.string()
    .min(5, 'Minimum 5 characters')
    .max(50, 'Maximum 50 characters')
    .regex(/^[a-zA-Z0-9]+$/, 'Only alphanumeric characters'),
});
```

---

## 7. Error Handling

### 7.1 Error Handling Hooks

```typescript
// Standard error handler (with toast)
const handleError = useStandardErrorHandler();

// Form error handler (with field errors)
const handleFormError = useFormErrorHandler();

// Silent error handler (no toast)
const handleSilentError = useSilentErrorHandler();
```

### 7.2 Error Handling in Components

```typescript
const MyComponent = () => {
  const handleError = useStandardErrorHandler();
  const { setError } = useForm();

  const mutation = useMutation({
    mutationFn: apiCall,
    onError: (error) => {
      const result = handleError(error, {
        context: { operation: 'myOperation' },
        customMessage: 'Custom error message',
      });
      
      // Extract field errors for forms
      if (result.context?.fieldErrors) {
        Object.entries(result.context.fieldErrors).forEach(([field, message]) => {
          setError(field, { message: message as string });
        });
      }
    },
  });
};
```

### 7.3 Error Boundaries

**Page-level:**
```typescript
import { ModernErrorBoundary } from '@/shared/components/error/ModernErrorBoundary';

<ModernErrorBoundary level="page">
  <YourPage />
</ModernErrorBoundary>
```

**Component-level:**
```typescript
<ModernErrorBoundary level="component">
  <YourComponent />
</ModernErrorBoundary>
```

---

## 8. API Integration

### 8.1 API Helpers

```typescript
import { 
  apiGet, 
  apiPost, 
  apiPut, 
  apiDelete,
  apiDownload 
} from '@/core/api/apiHelpers';

// GET request
const data = await apiGet<ResponseType>('/api/endpoint', { 
  param1: 'value1' 
});

// POST request
const result = await apiPost<ResponseType>('/api/endpoint', {
  field1: 'value1',
  field2: 'value2',
});

// PUT request
const updated = await apiPut<ResponseType>('/api/endpoint/123', {
  field1: 'newValue',
});

// DELETE request
await apiDelete<void>('/api/endpoint/123');

// Download file
const blob = await apiDownload('/api/export', { format: 'csv' });
```

### 8.2 Query Keys

**Always use centralized query keys:**

```typescript
import { queryKeys } from '@/services/api/queryKeys';

// List query
queryKey: queryKeys.users.list({ status: 'active' })

// Detail query
queryKey: queryKeys.users.detail(userId)

// Custom query
queryKey: queryKeys.users.roles(userId)
```

### 8.3 Cache Invalidation

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/services/api/queryKeys';

const queryClient = useQueryClient();

// Invalidate specific query
queryClient.invalidateQueries({ 
  queryKey: queryKeys.users.list() 
});

// Invalidate all user queries
queryClient.invalidateQueries({ 
  queryKey: queryKeys.users.all 
});

// Remove specific query
queryClient.removeQueries({ 
  queryKey: queryKeys.users.detail(userId) 
});
```

---

## 9. State Management

### 9.1 TanStack Query (Server State)

**Use for API data:**

```typescript
const { data, isLoading, error, refetch } = useQuery({
  queryKey: queryKeys.users.list(),
  queryFn: fetchUsers,
  staleTime: 30000, // 30 seconds
  cacheTime: 300000, // 5 minutes
});
```

### 9.2 React State (Local UI State)

**Use for component state:**

```typescript
const [isOpen, setIsOpen] = useState(false);
const [selectedTab, setSelectedTab] = useState('overview');
```

### 9.3 Zustand (Global UI State)

**File:** `src/store/myStore.ts`

```typescript
import { create } from 'zustand';

interface MyState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export const useMyStore = create<MyState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));
```

**Usage:**
```typescript
const { count, increment } = useMyStore();
```

---

## 10. UI Components

### 10.1 Design System

**Import from design system:**

```typescript
import { designTokens } from '@/design-system/tokens';
import { buttonVariants } from '@/design-system/variants';
```

### 10.2 Shared Components

```typescript
import Button from '@/shared/components/ui/Button';
import Input from '@/shared/components/ui/Input';
import Badge from '@/shared/components/ui/Badge';
import Card from '@/shared/components/ui/Card';
import Modal from '@/shared/components/ui/Modal';
```

### 10.3 Component Usage

**Button:**
```typescript
<Button 
  variant="primary" // primary, secondary, danger, success
  size="md"         // sm, md, lg
  loading={isLoading}
  disabled={isDisabled}
  onClick={handleClick}
>
  Click Me
</Button>
```

**Input:**
```typescript
<Input
  label="Email"
  type="email"
  placeholder="Enter email"
  error={errors.email?.message}
  {...register('email')}
  required
/>
```

**Badge:**
```typescript
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Inactive</Badge>
```

---

## 11. Testing Guidelines

### 11.1 Unit Tests (Vitest)

**File:** `src/domains/leads/__tests__/useLeads.test.ts`

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreateLead } from '../hooks/useLeads.hooks';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useCreateLead', () => {
  it('should create lead successfully', async () => {
    const { result } = renderHook(() => useCreateLead(), {
      wrapper: createWrapper(),
    });

    const leadData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      source: 'website' as const,
    };

    result.current.mutate(leadData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
```

### 11.2 Integration Tests (Playwright)

**File:** `e2e/leads.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Leads Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/leads');
  });

  test('should create new lead', async ({ page }) => {
    await page.click('text=Create Lead');
    
    await page.fill('[name="first_name"]', 'John');
    await page.fill('[name="last_name"]', 'Doe');
    await page.fill('[name="email"]', 'john@example.com');
    await page.fill('[name="phone"]', '+1234567890');
    await page.selectOption('[name="source"]', 'website');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Lead created successfully')).toBeVisible();
  });

  test('should display validation errors', async ({ page }) => {
    await page.click('text=Create Lead');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=First name is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
  });
});
```

---

## 12. Best Practices

### 12.1 Code Organization

✅ **DO:**
- Keep files under 300 lines
- One component per file
- Co-locate related files (component + types + tests)
- Use meaningful file and folder names
- Follow domain-driven design

❌ **DON'T:**
- Mix multiple concerns in one file
- Create deeply nested folder structures
- Use generic names like `utils.ts`, `helpers.ts`

### 12.2 TypeScript

✅ **DO:**
- Use strict TypeScript
- Define explicit types for all functions
- Use `type` for object shapes
- Use `interface` for extensible contracts
- Use `import type` for type-only imports

❌ **DON'T:**
- Use `any` type
- Use implicit types
- Mix types and values in same import

### 12.3 Performance

✅ **DO:**
- Lazy load routes
- Virtualize long lists (>200 items)
- Use React.memo for expensive components
- Optimize images (WebP, lazy loading)
- Use code splitting

❌ **DON'T:**
- Render large lists without virtualization
- Use inline function definitions in JSX
- Fetch data in loops
- Mutate state directly

### 12.4 Accessibility

✅ **DO:**
- Use semantic HTML
- Add ARIA labels
- Support keyboard navigation
- Ensure color contrast (4.5:1)
- Test with screen readers

❌ **DON'T:**
- Use divs for buttons
- Skip focus management
- Ignore keyboard users
- Use color alone for information

### 12.5 Security

✅ **DO:**
- Validate all inputs
- Sanitize user content
- Use HTTPS only
- Implement CSRF protection
- Handle sensitive data securely

❌ **DON'T:**
- Trust user input
- Store secrets in code
- Log sensitive information
- Use eval() or innerHTML with user data

---

## Appendix A: Common Patterns Quick Reference

### Pattern 1: Form with Validation
```typescript
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { /* ... */ },
});

<form onSubmit={form.handleSubmit(onSubmit)}>
  <Input {...form.register('field')} error={form.formState.errors.field?.message} />
</form>
```

### Pattern 2: Data Fetching
```typescript
const { data, isLoading } = useQuery({
  queryKey: queryKeys.resource.list(filters),
  queryFn: () => service.list(filters),
});
```

### Pattern 3: Data Mutation
```typescript
const mutation = useMutation({
  mutationFn: service.create,
  onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  onError: handleError,
});
```

### Pattern 4: Error Handling
```typescript
try {
  await operation();
  toast.success('Success message');
} catch (error) {
  handleError(error, { context: { /* ... */ } });
}
```

### Pattern 5: Logging
```typescript
logger().info('Operation started', { userId, action });
// ... operation ...
logger().info('Operation completed', { result });
```

---

## Appendix B: CLI Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:e2e         # Run E2E tests
npm run test:coverage    # Generate coverage report

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript check
npm run format           # Format code with Prettier

# Analysis
npm run analyze-bundle   # Analyze bundle size
npm run lighthouse       # Run Lighthouse audit
```

---

## Appendix C: File Structure Template

```
feature/
├── components/
│   ├── FeatureForm.tsx
│   ├── FeatureList.tsx
│   └── __tests__/
│       └── FeatureForm.test.tsx
├── hooks/
│   ├── useFeature.hooks.ts
│   └── __tests__/
│       └── useFeature.test.ts
├── pages/
│   └── FeaturePage.tsx
├── services/
│   └── featureService.ts
├── types/
│   └── index.ts
├── utils/
│   └── featureHelpers.ts
└── validation/
    └── schemas.ts
```

---

## Support & Resources

- **Architecture Documentation:** `ARCHITECTURE_ANALYSIS_2025.md`
- **Implementation Plan:** `IMPLEMENTATION_PLAN_2025.md`
- **Quick Reference:** `QUICK_REFERENCE_GUIDE.md`
- **Coding Standards:** `.github/copilot-instructions.md`

For questions or issues, please contact the development team.

---

**Last Updated:** November 12, 2025  
**Version:** 1.0.0  
**Maintained By:** Development Team
