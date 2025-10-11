import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import { analyzer } from 'vite-bundle-analyzer';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Use automatic JSX runtime
      jsxRuntime: 'automatic',
    }),
    // Bundle analyzer - only in analysis mode
    process.env.ANALYZE === 'true' &&
      analyzer({
        analyzerMode: 'server',
        openAnalyzer: true,
      }),
  ].filter(Boolean),
  resolve: {
    alias: {
      // DDD Architecture Paths
      '@domains': fileURLToPath(new URL('./src/domains', import.meta.url)),
      '@infrastructure': fileURLToPath(new URL('./src/infrastructure', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      '@app': fileURLToPath(new URL('./src/app', import.meta.url)),

      // Legacy paths (deprecated - migrate to DDD structure)
      '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
      '@widgets': fileURLToPath(new URL('./src/widgets', import.meta.url)),
      '@config': fileURLToPath(new URL('./src/config', import.meta.url)),
      '@contexts': fileURLToPath(new URL('./src/contexts', import.meta.url)),
      '@lib': fileURLToPath(new URL('./src/lib', import.meta.url)),
      '@hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
      '@styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
      '@layouts': fileURLToPath(new URL('./src/layouts', import.meta.url)),
      '@routing': fileURLToPath(new URL('./src/routing', import.meta.url)),
      '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
    },
  },

  // Development server configuration
  server: {
    port: 5173,
    open: true,
    cors: true,
    hmr: {
      overlay: true,
    },
    // Security headers for development
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    },
    // Proxy API requests to backend to avoid CORS issues
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
        secure: false,
        // Remove the /api prefix when forwarding to backend since backend already includes /api/v1
        // Frontend: /api/v1/auth/login -> Backend: /api/v1/auth/login
      },
    },
  },

  // Build optimizations (Enhanced for Performance)
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: process.env.NODE_ENV === 'development',
    minify: 'esbuild',

    // CSS code splitting
    cssCodeSplit: true,

    // Rollup options for enhanced code splitting
    rollupOptions: {
      output: {
        // Optimized chunk naming for better caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',

        manualChunks(id) {
          // Vendor chunks for better caching and lazy loading
          if (id.includes('node_modules')) {
            // React core (smallest, most frequently used)
            if (id.includes('react/') || id.includes('react-dom/')) {
              return 'react-vendor';
            }
            // Router
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            // Icons (optimize separately)
            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }
            // State management
            if (id.includes('zustand')) {
              return 'state-vendor';
            }
            // Security and validation
            if (id.includes('zod') || id.includes('dompurify') || id.includes('crypto-js')) {
              return 'security-vendor';
            }
            // Query and state management
            if (
              id.includes('@tanstack/react-query') ||
              id.includes('react-intersection-observer')
            ) {
              return 'query-vendor';
            }
            // Other vendor libraries
            return 'vendor';
          }

          // === DDD DOMAIN SPLITTING (Route-based lazy loading) ===

          // Authentication domain
          if (id.includes('/src/domains/authentication') || id.includes('/src/domains/auth')) {
            return 'domain-authentication';
          }

          // User management domain
          if (id.includes('/src/domains/user-management') || id.includes('/src/domains/users')) {
            return 'domain-user-management';
          }

          // Workflow engine domain
          if (
            id.includes('/src/domains/workflow-engine') ||
            id.includes('/src/domains/workflows')
          ) {
            return 'domain-workflow-engine';
          }

          // Analytics dashboard domain
          if (
            id.includes('/src/domains/analytics-dashboard') ||
            id.includes('/src/domains/analytics') ||
            id.includes('/src/domains/dashboard')
          ) {
            return 'domain-analytics-dashboard';
          }

          // System administration domain
          if (
            id.includes('/src/domains/system-administration') ||
            id.includes('/src/domains/settings') ||
            id.includes('/src/domains/security') ||
            id.includes('/src/domains/moderation')
          ) {
            return 'domain-system-administration';
          }

          // === INFRASTRUCTURE SPLITTING ===

          // Infrastructure API
          if (id.includes('/src/infrastructure/api')) {
            return 'infrastructure-api';
          }

          // Infrastructure storage
          if (id.includes('/src/infrastructure/storage')) {
            return 'infrastructure-storage';
          }

          // Infrastructure monitoring
          if (id.includes('/src/infrastructure/monitoring')) {
            return 'infrastructure-monitoring';
          }

          // Infrastructure security
          if (id.includes('/src/infrastructure/security')) {
            return 'infrastructure-security';
          }

          // === SHARED CODE SPLITTING ===

          // Shared UI components (heavy)
          if (id.includes('/src/shared/ui')) {
            return 'shared-ui';
          }

          // Shared performance utilities
          if (id.includes('/src/shared/performance')) {
            return 'shared-performance';
          }

          // Shared utilities
          if (id.includes('/src/shared/utils')) {
            return 'shared-utils';
          }
        },
      },
    },

    // Performance optimizations
    chunkSizeWarningLimit: 500, // Reduced from 600KB for better performance

    // Target modern browsers for better optimization
    target: ['es2020', 'chrome80', 'firefox78', 'safari14'],

    // Additional optimizations
    reportCompressedSize: true,

    // Disable CSS minification in development for faster builds
    cssMinify: process.env.NODE_ENV !== 'development',
  },

  // CSS processing
  css: {
    devSourcemap: true,
  },

  // Preview configuration
  preview: {
    port: 4173,
    open: true,
    // Production-like security headers
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },

  // Environment variables
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
  },
});
