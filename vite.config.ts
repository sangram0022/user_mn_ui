import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

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
        manualChunks: (id) => {
          // Vendor chunk for stable dependencies (long cache)
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react'; // Core React (~45KB gzipped)
            }
            if (id.includes('react-router')) {
              return 'vendor-router'; // Routing (~20KB gzipped)
            }
            if (id.includes('react-hook-form') || id.includes('zod')) {
              return 'vendor-forms'; // Forms (~25KB gzipped)
            }
            return 'vendor-libs'; // Other libraries (~30KB gzipped)
          }
          
          // Feature-based chunks for better caching
          if (id.includes('/domains/auth/')) {
            return 'feature-auth';
          }
          if (id.includes('/domains/admin/')) {
            return 'feature-admin';
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
    minify: 'esbuild', // Faster than terser, CloudFront handles advanced compression
    cssCodeSplit: true,
    sourcemap: false, // CloudFront serves without source maps
    reportCompressedSize: false, // Skip since CloudFront compresses
    
    // Modern browser target for smaller bundles
    cssMinify: 'esbuild',
    
    // Chunk size warnings optimized for HTTP/2 + CloudFront
    chunkSizeWarningLimit: 300, // Smaller chunks for better caching
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
