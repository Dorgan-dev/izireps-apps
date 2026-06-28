import { defineConfig } from 'vite'
import svgr from "vite-plugin-svgr";
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), svgr({
    svgrOptions: {
      icon: true,
      // This will transform your SVG to a React component
      exportType: "named",
      namedExport: "ReactComponent",
    },
  }),],
  server: {
    port: 5173,
    host: true, // atau host: '0.0.0.0'
    proxy: {
      // Semua request ke /api akan di-forward ke Laravel backend
      '/api': {
        target: 'http://localhost:8000',
        // target: 'http://192.168.168.165:8000',
        changeOrigin: true,
        secure: false,
      },
      // Juga proxy endpoint Sanctum CSRF cookie
      '/sanctum': {
        target: 'http://localhost:8000',
        // target: 'http://192.168.168.165:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})