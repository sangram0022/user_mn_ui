/**
 * ========================================
 * RBAC Predictive Loading (Phase 2)
 * ========================================
 * Intelligent permission and component pre-loading
 * Based on user navigation patterns and role hierarchy
 * Reduces latency for common user workflows
 *
 * Features:
 * - Navigation pattern analysis
 * - Role-based prediction models
 * - Intelligent preloading strategies
 * - User behavior learning
 * - Performance optimization
 * ========================================
 */

import type { UserRole, Permission } from '../types/rbac.types';
import { ROLE_HIERARCHY } from '../utils/rolePermissionMap';
import { preloadRoleBundles, preloadPredictedBundles } from './bundleSplitting';
import { logger } from '@/core/logging';
import { storageService } from '@/core/storage';
// import { rbacPersistentCache } from './persistentCache'; // For future integration

// ========================================
// Types
// ========================================

interface NavigationPattern {
  fromRoute: string;
  toRoute: string;
  count: number;
  lastAccessed: number;
  userRole: UserRole;
}

interface PredictionModel {
  routes: Record<string, RoutePredictor>;
  permissions: Record<string, PermissionPredictor>;
  components: Record<string, ComponentPredictor>;
}

interface RoutePredictor {
  currentRoute: string;
  nextRoutes: Array<{
    route: string;
    probability: number;
    avgTimeToNavigation: number;
  }>;
  userRole: UserRole;
}

interface PermissionPredictor {
  permission: Permission;
  likelyNextPermissions: Array<{
    permission: Permission;
    probability: number;
  }>;
  commonRoutes: string[];
}

interface ComponentPredictor {
  component: string;
  preloadTriggers: Array<{
    route: string;
    userRole: UserRole;
    probability: number;
  }>;
}

interface UserSession {
  userId: string;
  userRoles: UserRole[];
  navigationHistory: Array<{
    route: string;
    timestamp: number;
    permissions: Permission[];
  }>;
  sessionStart: number;
}

// ========================================
// Configuration
// ========================================

const PREDICTION_CONFIG = {
  // How many navigation events to keep in history
  maxHistorySize: 100,
  
  // Minimum probability threshold for preloading
  preloadThreshold: 0.3,
  
  // How long to wait before preloading (ms)
  preloadDelay: 500,
  
  // Maximum concurrent preloads
  maxConcurrentPreloads: 3,
  
  // Learning rate for pattern updates
  learningRate: 0.1,
  
  // Session timeout (minutes)
  sessionTimeout: 30,
} as const;

// ========================================
// Navigation Pattern Storage
// ========================================

const STORAGE_KEYS = {
  NAVIGATION_PATTERNS: 'rbac_navigation_patterns',
  PREDICTION_MODEL: 'rbac_prediction_model',
  USER_SESSIONS: 'rbac_user_sessions',
  PRELOAD_STATS: 'rbac_preload_stats',
} as const;

// ========================================
// Predictive Loading Manager
// ========================================

class RbacPredictiveLoader {
  private navigationPatterns: NavigationPattern[] = [];
  private predictionModel: PredictionModel = {
    routes: {},
    permissions: {},
    components: {},
  };
  private currentSession: UserSession | null = null;
  private preloadQueue: Set<string> = new Set();
  private activePreloads: Set<Promise<void>> = new Set();

  constructor() {
    this.loadStoredData();
    this.setupSessionCleanup();
  }

  // ========================================
  // Session Management
  // ========================================

  startSession(userId: string, userRoles: UserRole[]): void {
    this.currentSession = {
      userId,
      userRoles,
      navigationHistory: [],
      sessionStart: Date.now(),
    };

    // Preload bundles for user roles
    this.preloadInitialBundles(userRoles);
  }

  endSession(): void {
    if (this.currentSession) {
      this.updatePredictionModel();
      this.saveStoredData();
      this.currentSession = null;
    }
  }

  // ========================================
  // Navigation Tracking
  // ========================================

  trackNavigation(
    fromRoute: string,
    toRoute: string,
    permissions: Permission[] = []
  ): void {
    if (!this.currentSession) return;

    const now = Date.now();

    // Add to session history
    this.currentSession.navigationHistory.push({
      route: toRoute,
      timestamp: now,
      permissions,
    });

    // Limit history size
    if (this.currentSession.navigationHistory.length > PREDICTION_CONFIG.maxHistorySize) {
      this.currentSession.navigationHistory.shift();
    }

    // Update navigation patterns
    this.updateNavigationPattern(fromRoute, toRoute, this.currentSession.userRoles[0]);

    // Predict and preload next likely routes/permissions
    this.predictAndPreload(toRoute, this.currentSession.userRoles);
  }

  // ========================================
  // Prediction Logic
  // ========================================

  private updateNavigationPattern(
    fromRoute: string,
    toRoute: string,
    userRole: UserRole
  ): void {
    const existingPattern = this.navigationPatterns.find(
      p => p.fromRoute === fromRoute && p.toRoute === toRoute && p.userRole === userRole
    );

    if (existingPattern) {
      existingPattern.count++;
      existingPattern.lastAccessed = Date.now();
    } else {
      this.navigationPatterns.push({
        fromRoute,
        toRoute,
        count: 1,
        lastAccessed: Date.now(),
        userRole,
      });
    }

    // Remove old patterns (older than 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    this.navigationPatterns = this.navigationPatterns.filter(
      p => p.lastAccessed > thirtyDaysAgo
    );
  }

  private predictAndPreload(currentRoute: string, userRoles: UserRole[]): void {
    const predictions = this.getPredictions(currentRoute, userRoles);
    
    // Schedule preloading with delay
    setTimeout(() => {
      this.executePreloading(predictions);
    }, PREDICTION_CONFIG.preloadDelay);
  }

  private getPredictions(
    currentRoute: string,
    userRoles: UserRole[]
  ): Array<{ type: 'route' | 'permission' | 'component'; target: string; probability: number }> {
    const predictions: Array<{ type: 'route' | 'permission' | 'component'; target: string; probability: number }> = [];

    // Route predictions based on navigation patterns
    const routePredictions = this.predictNextRoutes(currentRoute, userRoles);
    predictions.push(...routePredictions.map(p => ({ type: 'route' as const, target: p.route, probability: p.probability })));

    // Permission predictions based on route
    const permissionPredictions = this.predictPermissions(currentRoute, userRoles);
    predictions.push(...permissionPredictions.map(p => ({ type: 'permission' as const, target: p, probability: 0.7 })));

    // Component predictions based on role hierarchy
    const componentPredictions = this.predictComponents(currentRoute, userRoles);
    predictions.push(...componentPredictions.map(p => ({ type: 'component' as const, target: p, probability: 0.6 })));

    return predictions.filter(p => p.probability >= PREDICTION_CONFIG.preloadThreshold);
  }

  private predictNextRoutes(
    currentRoute: string,
    userRoles: UserRole[]
  ): Array<{ route: string; probability: number }> {
    const relevantPatterns = this.navigationPatterns.filter(
      p => p.fromRoute === currentRoute && userRoles.includes(p.userRole)
    );

    if (relevantPatterns.length === 0) {
      return this.getDefaultRoutePredictions(currentRoute, userRoles);
    }

    // Calculate probabilities based on historical patterns
    const totalCount = relevantPatterns.reduce((sum, p) => sum + p.count, 0);
    const routeGroups = relevantPatterns.reduce((groups, pattern) => {
      if (!groups[pattern.toRoute]) {
        groups[pattern.toRoute] = { count: 0, lastAccessed: 0 };
      }
      groups[pattern.toRoute].count += pattern.count;
      groups[pattern.toRoute].lastAccessed = Math.max(groups[pattern.toRoute].lastAccessed, pattern.lastAccessed);
      return groups;
    }, {} as Record<string, { count: number; lastAccessed: number }>);

    return Object.entries(routeGroups)
      .map(([route, data]) => ({
        route,
        probability: data.count / totalCount,
      }))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5); // Top 5 predictions
  }

  private getDefaultRoutePredictions(
    currentRoute: string,
    userRoles: UserRole[]
  ): Array<{ route: string; probability: number }> {
    // Default predictions based on common patterns
    const defaultPatterns: Record<string, string[]> = {
      '/dashboard': ['/profile', '/settings', '/admin'],
      '/admin': ['/users', '/audit-logs', '/rbac-cache'],
      '/profile': ['/dashboard', '/settings'],
      '/': ['/dashboard', '/login'],
    };

    const predicted = defaultPatterns[currentRoute] || [];
    
    // Filter predictions based on user roles
    const accessibleRoutes = predicted.filter(route => {
      // Simple role-based filtering
      if (route.includes('/admin')) {
        return userRoles.some(role => ['admin', 'super_admin'].includes(role as string));
      }
      return true;
    });

    return accessibleRoutes.map(route => ({
      route,
      probability: 0.4, // Default probability
    }));
  }

  private predictPermissions(
    currentRoute: string,
    userRoles: UserRole[]
  ): Permission[] {
    // Predict permissions based on route and role hierarchy
    const routePermissions: Record<string, Permission[]> = {
      '/admin': ['admin:read', 'user:read', 'audit:read'],
      '/users': ['user:read', 'user:write'],
      '/audit-logs': ['audit:read'],
      '/profile': ['profile:read', 'profile:write'],
      '/dashboard': ['dashboard:read'],
    };

    const basePermissions = routePermissions[currentRoute] || [];
    
    // Add permissions based on role hierarchy
    const hierarchicalPermissions = userRoles.flatMap(role => {
      const roleLevel = ROLE_HIERARCHY[role as keyof typeof ROLE_HIERARCHY];
      if (roleLevel >= 80) { // Admin level
        return ['user:read', 'user:write', 'admin:read', 'audit:read'];
      } else if (roleLevel >= 60) { // Manager level
        return ['user:read', 'dashboard:read', 'reports:read'];
      } else {
        return ['profile:read', 'dashboard:read'];
      }
    });

    return [...new Set([...basePermissions, ...hierarchicalPermissions])];
  }

  private predictComponents(
    currentRoute: string,
    userRoles: UserRole[]
  ): string[] {
    // Predict components based on route and role
    const routeComponents: Record<string, string[]> = {
      '/admin': ['userManagement', 'auditLogs', 'rbacCache'],
      '/dashboard': ['userProfile', 'reportViewer'],
      '/profile': ['userProfile'],
    };

    const baseComponents = routeComponents[currentRoute] || [];
    
    // Add role-specific components
    const roleComponents = userRoles.includes('admin' as UserRole) || userRoles.includes('super_admin' as UserRole)
      ? ['adminDashboard', 'rbacUtils']
      : [];

    return [...new Set([...baseComponents, ...roleComponents])];
  }

  // ========================================
  // Preloading Execution
  // ========================================

  private async executePreloading(
    predictions: Array<{ type: 'route' | 'permission' | 'component'; target: string; probability: number }>
  ): Promise<void> {
    // Limit concurrent preloads
    if (this.activePreloads.size >= PREDICTION_CONFIG.maxConcurrentPreloads) {
      return;
    }

    const highPriorityPredictions = predictions
      .filter(p => p.probability > 0.6)
      .sort((a, b) => b.probability - a.probability)
      .slice(0, PREDICTION_CONFIG.maxConcurrentPreloads - this.activePreloads.size);

    for (const prediction of highPriorityPredictions) {
      if (this.preloadQueue.has(prediction.target)) {
        continue; // Already in queue
      }

      this.preloadQueue.add(prediction.target);
      const preloadPromise = this.executeSpecificPreload(prediction);
      this.activePreloads.add(preloadPromise);

      preloadPromise.finally(() => {
        this.activePreloads.delete(preloadPromise);
        this.preloadQueue.delete(prediction.target);
      });
    }
  }

  private async executeSpecificPreload(
    prediction: { type: 'route' | 'permission' | 'component'; target: string; probability: number }
  ): Promise<void> {
    try {
      switch (prediction.type) {
        case 'route':
          await this.preloadRoute(prediction.target);
          break;
        case 'permission':
          await this.preloadPermission(prediction.target);
          break;
        case 'component':
          await this.preloadComponent(prediction.target);
          break;
      }

      if (import.meta.env.DEV) {
        logger().info(`Preloaded ${prediction.type}: ${prediction.target}`, { probability: (prediction.probability * 100).toFixed(1) + '%' });
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        logger().warn(`Failed to preload ${prediction.type}: ${prediction.target}`, { error: String(error) });
      }
    }
  }

  private async preloadRoute(route: string): Promise<void> {
    // Preload predicted bundles for the route
    if (this.currentSession) {
      preloadPredictedBundles(route, this.currentSession.userRoles);
    }
  }

  private async preloadPermission(permission: Permission): Promise<void> {
    // Pre-warm permission cache
    if (this.currentSession) {
      // This will be filled by actual permission check results
      // For now, we just mark it as a predicted permission
      if (import.meta.env.DEV) {
        logger().info(`Predicting permission: ${permission}`, { userId: this.currentSession.userId });
      }
    }
  }

  private async preloadComponent(componentKey: string): Promise<void> {
    // This would normally trigger the bundle loader
    // For now, we just log the prediction
    if (import.meta.env.DEV) {
      logger().info(`Predicting component: ${componentKey}`);
    }
  }

  // ========================================
  // Initial Bundle Preloading
  // ========================================

  private async preloadInitialBundles(userRoles: UserRole[]): Promise<void> {
    try {
      await preloadRoleBundles(userRoles);
      
      if (import.meta.env.DEV) {
        logger().info(`Preloaded initial bundles for roles`, { roles: userRoles.join(', ') });
      }
    } catch (error) {
      logger().warn('Failed to preload initial bundles', { error: String(error) });
    }
  }

  // ========================================
  // Model Updates
  // ========================================

  private updatePredictionModel(): void {
    if (!this.currentSession) return;

    // Update route predictor
    const routePatterns = this.navigationPatterns.filter(
      p => this.currentSession!.userRoles.includes(p.userRole)
    );

    // Build route prediction model
    const uniqueRoutes = [...new Set(routePatterns.map(p => p.fromRoute))];
    
    uniqueRoutes.forEach(route => {
      const fromThisRoute = routePatterns.filter(p => p.fromRoute === route);
      const totalCount = fromThisRoute.reduce((sum, p) => sum + p.count, 0);
      
      this.predictionModel.routes[route] = {
        currentRoute: route,
        nextRoutes: fromThisRoute.map(p => ({
          route: p.toRoute,
          probability: p.count / totalCount,
          avgTimeToNavigation: 2000, // Default 2 seconds
        })),
        userRole: this.currentSession!.userRoles[0],
      };
    });
  }

  // ========================================
  // Data Persistence
  // ========================================

  private loadStoredData(): void {
    if (typeof window === 'undefined') return;

    const patterns = storageService.get<NavigationPattern[]>(STORAGE_KEYS.NAVIGATION_PATTERNS);
    if (patterns) {
      this.navigationPatterns = patterns;
    }

    const model = storageService.get<PredictionModel>(STORAGE_KEYS.PREDICTION_MODEL);
    if (model) {
      this.predictionModel = model;
    }
  }

  private saveStoredData(): void {
    if (typeof window === 'undefined') return;

    storageService.set(STORAGE_KEYS.NAVIGATION_PATTERNS, this.navigationPatterns);
    storageService.set(STORAGE_KEYS.PREDICTION_MODEL, this.predictionModel);
  }

  private setupSessionCleanup(): void {
    if (typeof window === 'undefined') return;

    // Clean up expired sessions periodically
    setInterval(() => {
      const now = Date.now();
      
      // Clean up old navigation patterns (older than 7 days)
      this.navigationPatterns = this.navigationPatterns.filter(
        p => now - p.lastAccessed < 7 * 24 * 60 * 60 * 1000 // 7 days
      );

      this.saveStoredData();
    }, 10 * 60 * 1000); // Every 10 minutes
  }

  // ========================================
  // Public API
  // ========================================

  getStats() {
    return {
      navigationPatterns: this.navigationPatterns.length,
      predictionModelRoutes: Object.keys(this.predictionModel.routes).length,
      activePreloads: this.activePreloads.size,
      queuedPreloads: this.preloadQueue.size,
      currentSession: this.currentSession ? {
        userId: this.currentSession.userId,
        userRoles: this.currentSession.userRoles,
        navigationHistory: this.currentSession.navigationHistory.length,
        sessionDuration: Date.now() - this.currentSession.sessionStart,
      } : null,
    };
  }

  clearPredictionData(): void {
    this.navigationPatterns = [];
    this.predictionModel = { routes: {}, permissions: {}, components: {} };
    this.preloadQueue.clear();
    
    if (typeof window !== 'undefined') {
      Object.values(STORAGE_KEYS).forEach(key => {
        storageService.remove(key);
      });
    }
  }
}

// ========================================
// Singleton Instance
// ========================================

export const rbacPredictiveLoader = new RbacPredictiveLoader();

// ========================================
// React Hook
// ========================================

export function useRbacPredictiveLoading() {
  return {
    startSession: rbacPredictiveLoader.startSession.bind(rbacPredictiveLoader),
    endSession: rbacPredictiveLoader.endSession.bind(rbacPredictiveLoader),
    trackNavigation: rbacPredictiveLoader.trackNavigation.bind(rbacPredictiveLoader),
    getStats: rbacPredictiveLoader.getStats.bind(rbacPredictiveLoader),
    clearData: rbacPredictiveLoader.clearPredictionData.bind(rbacPredictiveLoader),
  };
}

export type { NavigationPattern, PredictionModel, UserSession };