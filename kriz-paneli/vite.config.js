import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        // Eğer backend'de adres direkt "/login" ise alttaki satırı aktif etmelisin:
        // rewrite: (path) => path.replace(/^\/auth/, '')
      },
      '/talepler': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/requests': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/buyuk-depremler': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/araclar': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/arac-ekle': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/assign-vehicle': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      }
    }
  }
})