import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://api.oplab.com.br/v3',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('Access-Token', '9u6ykxOMf7M5IOX3mA54FUISYIyy9LD24EngKuv4CAvGxqB4P9dbGuW+IK8E4BJY--IMuGLGk9CJSpTgsWlkEYjA==--OWYyZjRiZjM1MjI0MDg0ZDgwMTA2NjQxY2U0YzMzOGU=')
          })
        }
      }
    }
  }
})
