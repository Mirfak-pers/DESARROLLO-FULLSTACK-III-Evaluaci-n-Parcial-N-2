import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api/inventario': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/inventario/, '/api/inventario'),
      },
      '/api/pedidos': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/envios': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
      '/api/usuarios': {
        target: 'http://localhost:8084',
        changeOrigin: true,
      },
    },
  },
})
