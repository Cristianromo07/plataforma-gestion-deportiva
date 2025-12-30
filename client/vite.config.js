import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      // Proxy para la autenticación (login, check session) si fuera necesario 
      // aunque la sesión se maneja por cookies, importante que el path coincida
    }
  }
})
