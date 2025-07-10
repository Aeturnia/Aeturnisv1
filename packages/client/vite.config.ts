import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    // Performance budget settings
    chunkSizeWarningLimit: 200,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'motion-vendor': ['framer-motion'],
          'gesture-vendor': ['@use-gesture/react'],
        },
      },
    },
  },
  // PWA and mobile optimizations
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
})