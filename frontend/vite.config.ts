import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {}
  },
  server: {
    port: 3001, // Backend CORS (FRONTEND_URL) ile uyumlu
    proxy: {
      // /api istekleri backend'e yönlendirilir (CORS derdi olmadan)
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
