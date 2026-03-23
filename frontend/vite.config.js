import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: mode === 'development' ? {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      }
    } : undefined
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  }
}))
