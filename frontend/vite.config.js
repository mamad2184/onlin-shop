import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/products': 'http://127.0.0.1:8000',
      '/get-token': 'http://127.0.0.1:8000',
      '/register': 'http://127.0.0.1:8000',
      '/mybasket-list': 'http://127.0.0.1:8000',
    },
  },
})
