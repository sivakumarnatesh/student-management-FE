import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/student-management-FE/',
  server: {
    port: 3000,
    open: false,
  },
})

