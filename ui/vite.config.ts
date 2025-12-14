import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true,
    open: true,            // avab brauseri automaatselt
    proxy: {
      // kõik /api päringud proxytakse Spring Booti (http://localhost:8080)
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

