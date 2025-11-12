/**
 * Shared Types - Central Export Point
 * 
 * This module re-exports commonly used types from core modules
 * for convenient access across the application.
 */

// API types (re-exported from core)
export * from './api.types';

// Common domain types
export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  sort_by?: string;
  sort_order?: SortOrder;
}

export interface SearchOptions {
  q?: string;
  search?: string;
}

// Status types
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended' | 'deleted';
export type RoleLevel = 'admin' | 'manager' | 'auditor' | 'user';
export type ExportFormat = 'csv' | 'json' | 'xlsx' | 'pdf';
