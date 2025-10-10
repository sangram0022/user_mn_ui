import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { analyzer } from 'vite-bundle-analyzer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Use automatic JSX runtime
      jsxRuntime: 'automatic'
    }),
    // Bundle analyzer - only in analysis mode
    process.env.ANALYZE === 'true' && analyzer({
      analyzerMode: 'server',
      openAnalyzer: true,
    })
  ].filter(Boolean),
  resolve: {
    alias: {
  '@app': fileURLToPath(new URL('./src/app', import.meta.url)),
  '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
  '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
  '@widgets': fileURLToPath(new URL('./src/widgets', import.meta.url)),
  '@config': fileURLToPath(new URL('./src/config', import.meta.url)),
  '@contexts': fileURLToPath(new URL('./src/contexts', import.meta.url)),
  '@lib': fileURLToPath(new URL('./src/lib', import.meta.url)),
  '@hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
  '@styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
  '@layouts': fileURLToPath(new URL('./src/layouts', import.meta.url)),
  '@routing': fileURLToPath(new URL('./src/routing', import.meta.url)),
  '@assets': fileURLToPath(new URL('./src/assets', import.meta.url))
    }
  },
  
  // Development server configuration
  server: {
    port: 5173,
    open: true,
    cors: true,
    hmr: {
      overlay: true
    },
    // Security headers for development
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block'
    },
    // Proxy API requests to backend to avoid CORS issues
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (_proxyReq, req) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
        // Remove the /api prefix when forwarding to backend since backend already includes /api/v1
        // Frontend: /api/v1/auth/login -> Backend: /api/v1/auth/login
      }
    }
  },
  
  // Build optimizations
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: process.env.NODE_ENV === 'development',
    minify: 'esbuild',
    
    // Rollup options for enhanced code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
          icons: ['lucide-react'],
          // Security and validation libs
          security: ['zod', 'dompurify', 'crypto-js'],
          // Performance libs
          performance: ['@tanstack/react-query', 'react-intersection-observer']
        }
      }
    },
    
    // Performance optimizations
    chunkSizeWarningLimit: 600, // Warn if chunk > 600KB
    
    // Target modern browsers for better optimization
    target: ['es2020', 'chrome80', 'firefox78', 'safari14']
  },
  
  // CSS processing
  css: {
    devSourcemap: true
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
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
  },
  
  // Environment variables
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0')
  }
})
