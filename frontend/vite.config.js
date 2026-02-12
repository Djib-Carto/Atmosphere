import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Atmosphere/',
  server: {
    port: 3006,
    strictPort: true,
  }
})
