import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import { analyzer } from 'vite-bundle-analyzer';
import { cspHtmlTransform } from './vite-plugins/csp-html-transform';
import { inlineCriticalCSS } from './vite-plugins/inline-critical-css';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react({
        // Use automatic JSX runtime
        jsxRuntime: 'automatic',
      }),
      // CSP nonce transformation for production security
      mode === 'production' &&
        cspHtmlTransform({
          enableNonces: true,
          apiEndpoints: env.VITE_API_BASE_URL ? [env.VITE_API_BASE_URL] : [],
        }),
      // Critical CSS inlining for faster FCP
      mode === 'production' && inlineCriticalCSS(),
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
        '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
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
          target: env.VITE_BACKEND_URL || 'http://127.0.0.1:8001',
          changeOrigin: true,
          secure: false,
          cookieDomainRewrite: {
            '127.0.0.1': 'localhost',
            localhost: 'localhost',
          },
          cookiePathRewrite: {
            '*': '/',
          },
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

      // Advanced esbuild options
      esbuildOptions: {
        // Drop console and debugger in production
        drop: mode === 'production' ? ['console', 'debugger'] : [],
        // Aggressive minification
        legalComments: 'none',
        // Target modern browsers (ES2022 for top-level await support)
        target: 'es2022',
      },

      // Rollup options for enhanced code splitting
      rollupOptions: {
        output: {
          // Optimized chunk naming for better caching with CloudFront
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId
              ? chunkInfo.facadeModuleId.split('/').pop()
              : 'chunk';
            return `assets/js/${facadeModuleId}-[hash].js`;
          },
          entryFileNames: 'assets/js/[name]-[hash].js',

          // Asset file naming for CloudFront caching
          assetFileNames: (assetInfo) => {
            if (!assetInfo.name) return 'assets/[name]-[hash][extname]';

            // Images
            if (/\.(png|jpe?g|svg|gif|webp|avif)$/i.test(assetInfo.name)) {
              return 'assets/images/[name]-[hash][extname]';
            }
            // CSS
            if (/\.css$/i.test(assetInfo.name)) {
              return 'assets/css/[name]-[hash][extname]';
            }
            // Fonts
            if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
              return 'assets/fonts/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          },

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

            // Admin domain (split further for better caching)
            if (id.includes('/src/domains/admin')) {
              // Heavy admin pages get their own chunks
              if (id.includes('AuditLogsPage') || id.includes('audit')) {
                return 'admin-audit';
              }
              if (id.includes('BulkOperationsPage') || id.includes('bulk')) {
                return 'admin-bulk';
              }
              if (id.includes('HealthMonitoringPage') || id.includes('health')) {
                return 'admin-health';
              }
              if (id.includes('GDPRCompliancePage') || id.includes('gdpr')) {
                return 'admin-gdpr';
              }
              // Other admin pages
              return 'domain-admin';
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

            // Design system CSS (critical)
            if (id.includes('/src/styles/tokens') || id.includes('primitives.css')) {
              return 'design-tokens';
            }

            if (id.includes('/src/styles/compositions') || id.includes('layouts.css')) {
              return 'layouts';
            }

            // Component CSS (lazy load per component)
            if (id.includes('/src/styles/components/button.css')) {
              return 'component-button';
            }
            if (id.includes('/src/styles/components/alert.css')) {
              return 'component-alert';
            }
            if (id.includes('/src/styles/components/toast.css')) {
              return 'component-toast';
            }
            if (id.includes('/src/styles/components')) {
              return 'components-css';
            }

            // Self-hosted fonts
            if (id.includes('@fontsource')) {
              return 'fonts';
            }

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

      // Target modern browsers for better optimization (ES2022 for top-level await support)
      target: ['es2022', 'chrome89', 'firefox89', 'safari15'],

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
      // ✅ Enhanced production-like security headers
      headers: {
        // Prevent MIME type sniffing
        'X-Content-Type-Options': 'nosniff',

        // Prevent embedding in iframes (clickjacking protection)
        'X-Frame-Options': 'DENY',

        // Enable browser XSS protection
        'X-XSS-Protection': '1; mode=block',

        // Force HTTPS (1 year)
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

        // Control referrer information
        'Referrer-Policy': 'strict-origin-when-cross-origin',

        // ✅ Enhanced Content Security Policy (CSP)
        'Content-Security-Policy': [
          // Default: Only allow resources from same origin
          "default-src 'self'",

          // Scripts: Allow self and inline (required for Vite)
          // TODO: Remove 'unsafe-inline' by using nonces in production
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",

          // Styles: Allow self and inline (required for styled components)
          "style-src 'self' 'unsafe-inline'",

          // Images: Allow self, data URLs, and https
          "img-src 'self' data: https:",

          // Fonts: Allow self
          "font-src 'self'",

          // AJAX/WebSocket: Allow self and API endpoint
          `connect-src 'self' ${env.VITE_BACKEND_URL || 'http://127.0.0.1:8001'}`,

          // Frames: Disallow all
          "frame-src 'none'",

          // Prevent parent frame access
          "frame-ancestors 'none'",

          // Media: Allow self
          "media-src 'self'",

          // Objects: Disallow all (Flash, etc.)
          "object-src 'none'",

          // Forms: Only submit to self
          "form-action 'self'",

          // Upgrade insecure requests to HTTPS
          'upgrade-insecure-requests',

          // Block mixed content
          'block-all-mixed-content',
        ].join('; '),

        // ✅ Permissions Policy (formerly Feature-Policy)
        'Permissions-Policy': [
          'camera=()',
          'microphone=()',
          'geolocation=()',
          'payment=()',
          'usb=()',
        ].join(', '),
      },
    },

    // Environment variables
    define: {
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    },
  };
});
