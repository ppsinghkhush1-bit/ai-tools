import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),
    compression({ algorithm: 'brotli', ext: '.br' }),
    compression({ algorithm: 'gzip', ext: '.gz' }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['./src/components/ToolModal.tsx', './src/components/AdminPanel.tsx'],
        }
      }
    },
    cssCodeSplit: true,
    minify: 'terser',
  }
})
