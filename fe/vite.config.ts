import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config with a dev server proxy for /api to the backend at localhost:8080
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        // backend runs on :8080 by default — ensure proxy points there
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
