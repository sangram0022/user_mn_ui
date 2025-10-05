import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Use automatic JSX runtime
      jsxRuntime: 'automatic'
    })
  ],
  
  // Development server configuration
  server: {
    port: 5173,
    open: true,
    cors: true,
    hmr: {
      overlay: true
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
    target: 'es2022',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    
    // Rollup options
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
          icons: ['lucide-react']
        }
      }
    },
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000
  },
  
  // CSS processing
  css: {
    devSourcemap: true
  },
  
  // Preview configuration
  preview: {
    port: 4173,
    open: true
  }
})
