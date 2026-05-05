import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
<<<<<<< HEAD
      '/auth': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        // Eğer backend'de adres direkt "/login" ise alttaki satırı aktif etmelisin:
        // rewrite: (path) => path.replace(/^\/auth/, '')
=======
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
>>>>>>> d849e80bb2520d1a5c52ad43670b2ef8f20067d0
      },
      '/auth': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/requests': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://127.0.0.1:8000',
        ws: true,
        changeOrigin: true,
      },
<<<<<<< HEAD
      '/arac-ekle': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/assign-vehicle': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      }
=======
>>>>>>> d849e80bb2520d1a5c52ad43670b2ef8f20067d0
    }
  }
})