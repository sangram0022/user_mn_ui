/**
 * Micro-Frontend Architecture Types
 *
 * These types enable future migration to micro-frontend architecture
 * Each domain can be independently deployed and loaded
 *
 * @module shared/types/micro-frontend
 */

import type { ComponentType, LazyExoticComponent } from 'react';
import type { RouteObject } from 'react-router-dom';

/**
 * Component Registry - Maps component names to React components
 */
export type ComponentRegistry = Record<
  string,
  ComponentType<any> | LazyExoticComponent<ComponentType<any>>
>;

/**
 * Service Registry - Maps service names to service instances
 */
export type ServiceRegistry = Record<string, unknown>;

/**
 * Store Slice - State management slice for domain
 */
export interface StoreSlice<T = unknown> {
  name: string;
  initialState: T;
  actions: Record<string, (...args: unknown[]) => void>;
  selectors?: Record<string, (state: T) => unknown>;
}

/**
 * Route Configuration for domain
 */
export interface RouteConfig {
  path: string;
  element?: React.ReactNode;
  Component?: ComponentType<any> | LazyExoticComponent<ComponentType<any>>;
  children?: RouteConfig[];
  index?: boolean;
  caseSensitive?: boolean;
  id?: string;
  loader?: RouteObject['loader'];
  action?: RouteObject['action'];
  errorElement?: React.ReactNode;
  /** Route metadata */
  meta?: {
    title?: string;
    description?: string;
    requiresAuth?: boolean;
    roles?: string[];
    icon?: string;
  };
}

/**
 * Domain Module Interface
 *
 * Each domain exports this interface to enable:
 * - Independent deployment
 * - Lazy loading
 * - Dynamic composition
 * - Micro-frontend architecture
 */
export interface DomainModule {
  /** Domain name */
  name: string;

  /** Domain version (semver) */
  version: string;

  /** Domain routes */
  routes: RouteConfig[];

  /** Domain components registry */
  components: ComponentRegistry;

  /** Domain services registry */
  services: ServiceRegistry;

  /** Domain state slice (optional) */
  store?: StoreSlice;

  /** Domain initialization hook (optional) */
  initialize?: () => Promise<void> | void;

  /** Domain cleanup hook (optional) */
  dispose?: () => Promise<void> | void;

  /** Domain dependencies (optional) */
  dependencies?: string[];

  /** Domain metadata (optional) */
  meta?: {
    displayName?: string;
    description?: string;
    author?: string;
    tags?: string[];
  };
}

/**
 * Domain Module Factory
 *
 * Helper type for creating domain modules
 */
export type DomainModuleFactory = () => DomainModule | Promise<DomainModule>;

/**
 * Domain Module Loader Configuration
 */
export interface DomainModuleLoaderConfig {
  /** Remote module URL (for micro-frontend deployment) */
  remoteUrl?: string;

  /** Fallback component on load error */
  fallback?: ComponentType<any>;

  /** Loading component */
  loading?: ComponentType<any>;

  /** Max retry attempts */
  maxRetries?: number;

  /** Retry delay in ms */
  retryDelay?: number;

  /** Enable lazy loading */
  lazy?: boolean;

  /** Preload domain */
  preload?: boolean;
}

/**
 * Domain Registry Entry
 */
export interface DomainRegistryEntry {
  module: DomainModule;
  config?: DomainModuleLoaderConfig;
  status: 'pending' | 'loading' | 'loaded' | 'error';
  error?: Error;
  loadedAt?: Date;
}

/**
 * Domain Registry
 *
 * Central registry for all domain modules
 */
export interface DomainRegistry {
  domains: Map<string, DomainRegistryEntry>;

  /** Register a domain */
  register(
    name: string,
    module: DomainModule | DomainModuleFactory,
    config?: DomainModuleLoaderConfig
  ): void;

  /** Unregister a domain */
  unregister(name: string): void;

  /** Get domain module */
  get(name: string): DomainModule | undefined;

  /** Load domain */
  load(name: string): Promise<DomainModule>;

  /** Check if domain is loaded */
  isLoaded(name: string): boolean;

  /** Get all domains */
  getAll(): DomainModule[];
}

/**
 * Module Federation Config (Webpack Module Federation)
 */
export interface ModuleFederationConfig {
  name: string;
  filename: string;
  exposes?: Record<string, string>;
  remotes?: Record<string, string>;
  shared?: Record<
    string,
    {
      singleton?: boolean;
      strictVersion?: boolean;
      requiredVersion?: string;
    }
  >;
}

/**
 * Domain Communication Event
 *
 * For inter-domain communication in micro-frontend architecture
 */
export interface DomainEvent<T = unknown> {
  type: string;
  source: string;
  target?: string;
  payload: T;
  timestamp: number;
  id: string;
}

/**
 * Domain Event Bus
 */
export interface DomainEventBus {
  /** Publish event */
  publish<T>(event: Omit<DomainEvent<T>, 'timestamp' | 'id'>): void;

  /** Subscribe to events */
  subscribe<T>(type: string, handler: (event: DomainEvent<T>) => void): () => void;

  /** Unsubscribe from events */
  unsubscribe(type: string, handler: (event: DomainEvent) => void): void;

  /** Clear all subscriptions */
  clear(): void;
}

/**
 * Domain Module Manifest
 *
 * Metadata file for domain module discovery
 */
export interface DomainModuleManifest {
  name: string;
  version: string;
  displayName?: string;
  description?: string;
  author?: string;
  homepage?: string;
  repository?: string;
  license?: string;

  /** Main entry point */
  main: string;

  /** Module format */
  format: 'esm' | 'cjs' | 'umd';

  /** Dependencies */
  dependencies?: Record<string, string>;

  /** Peer dependencies */
  peerDependencies?: Record<string, string>;

  /** Exported components */
  exports?: {
    components?: string[];
    services?: string[];
    routes?: string[];
  };

  /** Build info */
  build?: {
    timestamp: string;
    hash: string;
    env: 'development' | 'production';
  };
}
