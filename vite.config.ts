import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

// AWS CloudFront-Optimized Vite Configuration
// CloudFront handles: compression, caching, edge optimization
// Local optimization: code splitting, tree shaking, modern JS

export default defineConfig({
  plugins: [
    // React 19 with React Compiler for automatic memoization
    react({
      babel: {
        plugins: [
          ['babel-plugin-react-compiler', {
            // React Compiler configuration
            // Automatically optimizes components without manual useMemo/useCallback
            runtimeModule: 'react/compiler-runtime'
          }]
        ]
      }
    }),
    tailwindcss(),
    // Bundle visualizer (creates stats.html)
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }) as unknown as import('vite').Plugin,
  ],
  
  // Development server configuration
  server: {
    headers: {
      // Content Security Policy - XSS protection
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' http://localhost:8000 ws://localhost:*; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
      // Additional security headers
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
  
  // AWS CloudFront-Optimized Build Configuration
  build: {
    target: 'esnext', // Modern browsers - CloudFront handles legacy support via transforms
    
    rollupOptions: {
      output: {
        // AWS CloudFront cache-friendly chunking strategy
        manualChunks(id) {
          // Vendor chunk for stable dependencies (long cache)
          if (id.includes('node_modules')) {
            // Core React libraries - must come first
            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            
            // Router
            if (id.includes('react-router') || id.includes('@remix-run')) {
              return 'vendor-router';
            }
            
            // Forms and validation
            if (id.includes('react-hook-form') || id.includes('/zod/') || id.includes('@hookform')) {
              return 'vendor-forms';
            }
            
            // TanStack Query (data fetching)
            if (id.includes('@tanstack/query-core') || id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            
            // i18n libraries
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'vendor-i18n';
            }
            
            // Charts library (heavy, lazy loaded)
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'vendor-charts';
            }
            
            // Icons
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            
            // Utilities (axios, dompurify, etc.)
            if (id.includes('axios') || id.includes('dompurify') || id.includes('use-debounce')) {
              return 'vendor-utils';
            }
            
            // TanStack Virtual + Form
            if (id.includes('@tanstack/virtual') || id.includes('@tanstack/react-virtual') || 
                id.includes('@tanstack/react-form')) {
              return 'vendor-tanstack';
            }
            
            // State management
            if (id.includes('zustand')) {
              return 'vendor-state';
            }
            
            // PWA & Service Worker
            if (id.includes('workbox') || id.includes('vite-plugin-pwa')) {
              return 'vendor-pwa';
            }
            
            // React utilities
            if (id.includes('react-error-boundary') || id.includes('react-intersection-observer') ||
                id.includes('react-window')) {
              return 'vendor-react-utils';
            }
            
            // Other small libraries
            return 'vendor-misc';
          }
          
          // Feature-based chunks for better caching
          if (id.includes('/domains/auth/')) {
            return 'feature-auth';
          }
          
          // Admin domain split by route for lazy loading
          if (id.includes('/domains/admin/')) {
            // Dashboard route
            if (id.includes('DashboardPage')) {
              return 'admin-dashboard';
            }
            
            // User management routes (users list, detail, edit)
            if (id.includes('UsersPage') || id.includes('UserDetailPage') || 
                id.includes('UserEditPage') || id.includes('VirtualizedUsersTable')) {
              return 'admin-users';
            }
            
            // Role management routes (roles list, detail)
            if (id.includes('RolesPage') || id.includes('RoleDetailPage')) {
              return 'admin-roles';
            }
            
            // Audit logs route (with virtualized table)
            if (id.includes('AuditLogsPage') || id.includes('VirtualizedAuditLogTable')) {
              return 'admin-audit';
            }
            
            // Approval workflow route
            if (id.includes('ApprovalPage') || id.includes('PendingApprovalsPage')) {
              return 'admin-approvals';
            }
            
            // Shared admin utilities, services, hooks
            return 'admin-shared';
          }
          
          if (id.includes('/shared/')) {
            return 'shared-components';
          }
        },
        
        // CloudFront-friendly file naming with cache optimization
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
    
    // Production optimizations - CloudFront handles compression
    minify: 'terser', // Use terser for better tree shaking and console.log removal
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true, // Remove debugger statements
        pure_funcs: ['console.log', 'console.debug', 'console.info'], // Remove specific console methods
        passes: 2, // Multiple passes for better optimization
      },
      format: {
        comments: false, // Remove all comments
      },
    },
    cssCodeSplit: true,
    sourcemap: false, // CloudFront serves without source maps
    reportCompressedSize: false, // Skip since CloudFront compresses
    
    // Modern browser target for smaller bundles
    cssMinify: 'lightningcss', // Faster and better CSS minification
    
    // Chunk size warnings optimized for HTTP/2 + CloudFront
    chunkSizeWarningLimit: 300, // Smaller chunks for better caching
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
