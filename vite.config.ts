import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/api': path.resolve(__dirname, './src/api'),
      '@/modules': path.resolve(__dirname, './src/modules'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/shared': path.resolve(__dirname, './src/modules/shared'),
      '@/assets': path.resolve(__dirname, './src/assets'),
      '@/styles': path.resolve(__dirname, './src/styles'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss"; @import "@/styles/mixins.scss";`
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      // Auth Service (порт 8000)
      '/api/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/auth/, '/api/v1/auth')
      },
      // Profile Service (порт 8002)
      '/api/profile': {
        target: 'http://localhost:8002',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/profile/, '/api/v1/profiles')
      },
      // Schedule Service (порт 8001)
      '/api/schedule': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/schedule/, '/api/v1/schedule')
      },
      // Studios endpoint (Auth Service, но без /auth prefix)
      '/api/studios': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/studios/, '/api/v1/studios')
      },
      // Dashboard endpoint (Profile Service, но без /profile prefix)
      '/api/dashboard': {
        target: 'http://localhost:8002',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/dashboard/, '/api/v1/dashboard')
      },
    }
  }
})