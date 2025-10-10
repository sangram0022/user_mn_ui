/**
 * Enhanced State Management with React 19 Context Patterns
 * Advanced state management using React Context with type safety
 */

import { logger } from './../utils/logger';
import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, Notification, SystemHealth } from '../api/apiTypes';

// Application state interface
interface AppState { // User state
  user: User | null;
  isAuthenticated: boolean;
  authToken: string | null;
  
  // UI state
  theme: 'light' | 'dark' | 'system';
  sidebar: {
    isOpen: boolean;
    isCollapsed: boolean;
  };
  notifications: Notification[];
  
  // System state
  systemHealth: SystemHealth | null;
  isOnline: boolean;
  lastSyncTime: number | null;
  
  // Loading states
  loading: { auth: boolean;
    dashboard: boolean;
    users: boolean;
    system: boolean;
  };
  
  // Error states
  errors: { auth: string | null;
    dashboard: string | null;
    users: string | null;
    system: string | null;
  };
  
  // Cache metadata
  cache: { lastUsersFetch: number | null;
    lastSystemHealthCheck: number | null;
    lastNotificationsFetch: number | null;
  };
}

// Action types
type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTH_TOKEN'; payload: string | null }
  | { type: 'LOGIN'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_THEME'; payload: AppState['theme'] }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR_COLLAPSED'; payload: boolean }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'SET_SYSTEM_HEALTH'; payload: SystemHealth }
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'UPDATE_LAST_SYNC_TIME' }
  | { type: 'SET_LOADING'; payload: { key: keyof AppState['loading']; isLoading: boolean } }
  | { type: 'SET_ERROR'; payload: { key: keyof AppState['errors']; error: string | null } }
  | { type: 'CLEAR_ERROR'; payload: keyof AppState['errors'] }
  | { type: 'CLEAR_ALL_ERRORS' }
  | { type: 'UPDATE_CACHE_TIMESTAMP'; payload: keyof AppState['cache'] }
  | { type: 'RESET' };

// Initial state
const initialState: AppState = { user: null,
  isAuthenticated: false,
  authToken: null,
  
  theme: 'system',
  sidebar: {
    isOpen: true,
    isCollapsed: false,
  },
  notifications: [],
  
  systemHealth: null,
  isOnline: navigator.onLine,
  lastSyncTime: null,
  
  loading: { auth: false,
    dashboard: false,
    users: false,
    system: false,
  },
  
  errors: { auth: null,
    dashboard: null,
    users: null,
    system: null,
  },
  
  cache: { lastUsersFetch: null,
    lastSystemHealthCheck: null,
    lastNotificationsFetch: null,
  },
};

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState { switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
      };
      
    case 'SET_AUTH_TOKEN':
      return { ...state,
        authToken: action.payload,
      };
      
    case 'LOGIN':
      return { ...state,
        user: action.payload.user,
        authToken: action.payload.token,
        isAuthenticated: true,
        errors: {
          ...state.errors,
          auth: null,
        },
      };
      
    case 'LOGOUT':
      return { ...state,
        user: null,
        authToken: null,
        isAuthenticated: false,
        notifications: [],
        errors: {
          ...state.errors,
          auth: null,
        },
        cache: initialState.cache,
      };
      
    case 'SET_THEME':
      return { ...state,
        theme: action.payload,
      };
      
    case 'TOGGLE_SIDEBAR':
      return { ...state,
        sidebar: {
          ...state.sidebar,
          isOpen: !state.sidebar.isOpen,
        },
      };
      
    case 'SET_SIDEBAR_COLLAPSED':
      return { ...state,
        sidebar: {
          ...state.sidebar,
          isCollapsed: action.payload,
        },
      };
      
    case 'ADD_NOTIFICATION': { const exists = state.notifications.some(n => n.id === action.payload.id);
      if (exists) return state;
      
      const newNotifications = [action.payload, ...state.notifications];
      return {
        ...state,
        notifications: newNotifications.slice(0, 50), // Keep only last 50
      };
    }
    
    case 'REMOVE_NOTIFICATION':
      return { ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };
      
    case 'MARK_NOTIFICATION_READ':
      return { ...state,
        notifications: state.notifications.map(n => 
          n.id === action.payload ? { ...n, isRead: true } : n
        ),
      };
      
    case 'CLEAR_NOTIFICATIONS':
      return { ...state,
        notifications: [],
      };
      
    case 'SET_SYSTEM_HEALTH':
      return { ...state,
        systemHealth: action.payload,
        cache: {
          ...state.cache,
          lastSystemHealthCheck: Date.now(),
        },
      };
      
    case 'SET_ONLINE_STATUS':
      return { ...state,
        isOnline: action.payload,
      };
      
    case 'UPDATE_LAST_SYNC_TIME':
      return { ...state,
        lastSyncTime: Date.now(),
      };
      
    case 'SET_LOADING':
      return { ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.isLoading,
        },
      };
      
    case 'SET_ERROR':
      return { ...state,
        errors: {
          ...state.errors,
          [action.payload.key]: action.payload.error,
        },
      };
      
    case 'CLEAR_ERROR':
      return { ...state,
        errors: {
          ...state.errors,
          [action.payload]: null,
        },
      };
      
    case 'CLEAR_ALL_ERRORS':
      return { ...state,
        errors: {
          auth: null,
          dashboard: null,
          users: null,
          system: null,
        },
      };
      
    case 'UPDATE_CACHE_TIMESTAMP':
      return { ...state,
        cache: {
          ...state.cache,
          [action.payload]: Date.now(),
        },
      };
      
    case 'RESET':
      return initialState;
      
    default:
      return state;
  }
}

// Actions interface
interface AppActions { // Authentication actions
  setUser: (user: User | null) => void;
  setAuthToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  
  // UI actions
  setTheme: (theme: AppState['theme']) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Notification actions
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  
  // System actions
  setSystemHealth: (health: SystemHealth) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  updateLastSyncTime: () => void;
  
  // Loading actions
  setLoading: (key: keyof AppState['loading'], isLoading: boolean) => void;
  
  // Error actions
  setError: (key: keyof AppState['errors'], error: string | null) => void;
  clearError: (key: keyof AppState['errors']) => void;
  clearAllErrors: () => void;
  
  // Cache actions
  updateCacheTimestamp: (key: keyof AppState['cache']) => void;
  isCacheValid: (key: keyof AppState['cache'], ttl: number) => boolean;
  
  // Utility actions
  reset: () => void; }

// Create contexts
const AppStateContext = createContext<AppState | undefined>(undefined);
const AppActionsContext = createContext<AppActions | undefined>(undefined);

// Provider component
interface AppProviderProps { children: ReactNode;
  initialState?: Partial<AppState>; }

export const AppProvider: React.FC<AppProviderProps> = ({ children, 
  initialState: providedInitialState  }) => { const [state, dispatch] = useReducer(appReducer, {
    ...initialState,
    ...providedInitialState,
  });

  // Load persisted state on mount
  useEffect(() => { try {
      const persistedState = localStorage.getItem('app-state');
      if (persistedState) {
        const parsed = JSON.parse(persistedState);
        if (parsed.user && parsed.authToken) {
          dispatch({ 
            type: 'LOGIN', 
            payload: { user: parsed.user, token: parsed.authToken } 
          });
        }
        if (parsed.theme) { dispatch({ type: 'SET_THEME', payload: parsed.theme });
        }
        if (parsed.sidebar) { dispatch({ type: 'SET_SIDEBAR_COLLAPSED', payload: parsed.sidebar.isCollapsed });
        }
      }
    } catch (error) { logger.warn('Failed to load persisted state:', { error  });
    }
  }, []);

  // Persist state changes
  useEffect(() => { try {
      const stateToPersist = {
        user: state.user,
        authToken: state.authToken,
        theme: state.theme,
        sidebar: state.sidebar,
      };
      localStorage.setItem('app-state', JSON.stringify(stateToPersist));
    } catch (error) { logger.warn('Failed to persist state:', { error  });
    }
  }, [state.user, state.authToken, state.theme, state.sidebar]);

  // Listen for online/offline events
  useEffect(() => { const handleOnline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: true });
    const handleOffline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: false });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => { window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Actions
  const actions: AppActions = { // Authentication actions
    setUser: useCallback((user: User | null) => {
      dispatch({ type: 'SET_USER', payload: user });
    }, []),

    setAuthToken: useCallback((token: string | null) => { dispatch({ type: 'SET_AUTH_TOKEN', payload: token });
    }, []),

    login: useCallback((user: User, token: string) => { dispatch({ type: 'LOGIN', payload: { user, token } });
    }, []),

    logout: useCallback(() => { dispatch({ type: 'LOGOUT' });
      // Clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }, []),

    // UI actions
    setTheme: useCallback((theme: AppState['theme']) => { dispatch({ type: 'SET_THEME', payload: theme });
    }, []),

    toggleSidebar: useCallback(() => { dispatch({ type: 'TOGGLE_SIDEBAR' });
    }, []),

    setSidebarCollapsed: useCallback((collapsed: boolean) => { dispatch({ type: 'SET_SIDEBAR_COLLAPSED', payload: collapsed });
    }, []),

    // Notification actions
    addNotification: useCallback((notification: Notification) => { dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    }, []),

    removeNotification: useCallback((id: string) => { dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
    }, []),

    markNotificationAsRead: useCallback((id: string) => { dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
    }, []),

    clearNotifications: useCallback(() => { dispatch({ type: 'CLEAR_NOTIFICATIONS' });
    }, []),

    // System actions
    setSystemHealth: useCallback((health: SystemHealth) => { dispatch({ type: 'SET_SYSTEM_HEALTH', payload: health });
    }, []),

    setOnlineStatus: useCallback((isOnline: boolean) => { dispatch({ type: 'SET_ONLINE_STATUS', payload: isOnline });
    }, []),

    updateLastSyncTime: useCallback(() => { dispatch({ type: 'UPDATE_LAST_SYNC_TIME' });
    }, []),

    // Loading actions
    setLoading: useCallback((key: keyof AppState['loading'], isLoading: boolean) => { dispatch({ type: 'SET_LOADING', payload: { key, isLoading } });
    }, []),

    // Error actions
    setError: useCallback((key: keyof AppState['errors'], error: string | null) => { dispatch({ type: 'SET_ERROR', payload: { key, error } });
    }, []),

    clearError: useCallback((key: keyof AppState['errors']) => { dispatch({ type: 'CLEAR_ERROR', payload: key });
    }, []),

    clearAllErrors: useCallback(() => { dispatch({ type: 'CLEAR_ALL_ERRORS' });
    }, []),

    // Cache actions
    updateCacheTimestamp: useCallback((key: keyof AppState['cache']) => { dispatch({ type: 'UPDATE_CACHE_TIMESTAMP', payload: key });
    }, []),

    isCacheValid: useCallback((key: keyof AppState['cache'], ttl: number) => { const timestamp = state.cache[key];
      if (!timestamp) return false;
      return Date.now() - timestamp < ttl;
    }, [state.cache]),

    // Utility actions
    reset: useCallback(() => { dispatch({ type: 'RESET' });
    }, []),
  };

  return (
    <AppStateContext.Provider value={state}>
      <AppActionsContext.Provider value={actions}>
        {children}
      </AppActionsContext.Provider>
    </AppStateContext.Provider>
  );
};

// Custom hooks
export const useAppState = (): AppState => { const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
};

export const useAppActions = (): AppActions => { const context = useContext(AppActionsContext);
  if (context === undefined) {
    throw new Error('useAppActions must be used within an AppProvider');
  }
  return context;
};

// Convenience hooks
export const useAuth = () => { const state = useAppState();
  const actions = useAppActions();
  
  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    authToken: state.authToken,
    login: actions.login,
    logout: actions.logout,
    setUser: actions.setUser,
    setAuthToken: actions.setAuthToken,
  };
};

export const useTheme = () => { const state = useAppState();
  const actions = useAppActions();
  
  return {
    theme: state.theme,
    setTheme: actions.setTheme,
  };
};

export const useSidebar = () => { const state = useAppState();
  const actions = useAppActions();
  
  return {
    sidebar: state.sidebar,
    toggleSidebar: actions.toggleSidebar,
    setSidebarCollapsed: actions.setSidebarCollapsed,
  };
};

export const useNotifications = () => { const state = useAppState();
  const actions = useAppActions();
  
  return {
    notifications: state.notifications,
    addNotification: actions.addNotification,
    removeNotification: actions.removeNotification,
    markNotificationAsRead: actions.markNotificationAsRead,
    clearNotifications: actions.clearNotifications,
  };
};

export const useSystemStatus = () => { const state = useAppState();
  const actions = useAppActions();
  
  return {
    systemHealth: state.systemHealth,
    isOnline: state.isOnline,
    lastSyncTime: state.lastSyncTime,
    setSystemHealth: actions.setSystemHealth,
    setOnlineStatus: actions.setOnlineStatus,
    updateLastSyncTime: actions.updateLastSyncTime,
  };
};

export const useLoadingState = () => { const state = useAppState();
  const actions = useAppActions();
  
  return {
    loading: state.loading,
    setLoading: actions.setLoading,
  };
};

export const useErrorState = () => { const state = useAppState();
  const actions = useAppActions();
  
  return {
    errors: state.errors,
    setError: actions.setError,
    clearError: actions.clearError,
    clearAllErrors: actions.clearAllErrors,
  };
};

export const useCache = () => { const state = useAppState();
  const actions = useAppActions();
  
  return {
    cache: state.cache,
    updateCacheTimestamp: actions.updateCacheTimestamp,
    isCacheValid: actions.isCacheValid,
  };
};

// Advanced selectors
export const useUnreadNotifications = () => { const state = useAppState();
  return state.notifications.filter(n => !n.isRead); };

export const useHasErrors = () => { const state = useAppState();
  return Object.values(state.errors).some(error => error !== null); };

export const useIsLoading = (keys?: (keyof AppState['loading'])[]): boolean => { const state = useAppState();
  
  if (!keys) {
    return Object.values(state.loading).some(Boolean);
  }
  
  return keys.some(key => state.loading[key]);
};