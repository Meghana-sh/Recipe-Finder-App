import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Recipe-Finder-App/',
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false
  }
})
