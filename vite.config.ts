import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'
import compression from 'vite-plugin-compression'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    
    // Bundle analysis - generates interactive bundle map
    visualizer({
      filename: 'dist/bundle-analysis.html',
      open: false, // Don't auto-open in CI
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // Options: treemap, sunburst, network
    }),

    // Compression plugins - Brotli and Gzip
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024, // Only compress files larger than 1KB
      compressionOptions: {
        level: 11, // Maximum compression
      },
    }),
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
      compressionOptions: {
        level: 9, // Maximum compression
      },
    }),
    
    // Progressive Web App plugin - enables offline support and caching
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        // Cache static assets
        globPatterns: [
          '**/*.{js,css,html,ico,png,jpg,jpeg,svg,woff,woff2,ttf,eot}',
        ],
        runtimeCaching: [
          // Cache API responses with NetworkFirst strategy
          // Try network first, fall back to cache if offline
          {
            urlPattern: /^https:\/\/api\.example\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 3600, // 1 hour
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Cache images with CacheFirst strategy
          // Use cache first, update in background
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 86400 * 30, // 30 days
              },
            },
          },
          // Cache fonts with CacheFirst strategy
          {
            urlPattern: /\.(?:woff|woff2|ttf|eot)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'font-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 86400 * 365, // 1 year
              },
            },
          },
        ],
      },
      // Web app manifest
      manifest: {
        name: 'User Management System',
        short_name: 'UserMN',
        description: 'Comprehensive User Management and Admin Dashboard',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/logo.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/logo.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        screenshots: [
          {
            src: '/screenshot1.png',
            sizes: '540x720',
            type: 'image/png',
            form_factor: 'narrow',
          },
        ],
      },
    }),
  ],
  
  // Build optimizations
  build: {
    // Manual chunks for better caching and parallel loading
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries - ~140KB
          'vendor-react': [
            'react',
            'react-dom',
            'react-router-dom',
          ],
          
          // Form handling libraries - ~40KB (Performance optimized)
          'vendor-forms': [
            'react-hook-form',
            '@hookform/resolvers',
            'zod',
          ],
          
          // Data fetching and state management - ~80KB
          'vendor-data': [
            '@tanstack/react-query',
            '@tanstack/react-query-devtools',
            'zustand',
          ],
          
          // Internationalization - ~30KB
          'vendor-i18n': [
            'i18next',
            'react-i18next',
            'i18next-browser-languagedetector',
            'i18next-http-backend',
          ],
          
          // Utility libraries - ~15KB
          'vendor-utils': [
            'axios',
            'dompurify',
          ],
          
          // Icons - if large
          'vendor-icons': [
            'lucide-react',
          ],
        },
      },
    },
    
    // Advanced minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true, // Remove debugger statements
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // Remove specific console methods
      },
      mangle: {
        safari10: true, // Support Safari 10+
      },
    },
    
    // CSS code splitting for better caching
    cssCodeSplit: true,
    
    // Disable source maps in production (reduces bundle size)
    sourcemap: false,
    
    // Chunk size warnings
    chunkSizeWarningLimit: 500, // Warn if chunk > 500KB
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
