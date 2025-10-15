/**
 * Centralized constants barrel export
 *
 * Exports all application constants for easy access
 * @module constants
 */

// Re-export all domain-specific constants
export * from './api.constants';
export * from './app';
export * from './session.constants';
export * from './ui.constants';
export * from './validation.constants';

// Legacy exports for backward compatibility
export const APP_NAME = 'User Management System';
export const DEFAULT_LANGUAGE = 'en';
