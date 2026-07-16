// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // CRITICAL FOR OFFLINE DESKTOP FILE PATHS!
  plugins: [
    react(),
    tailwindcss(),
  ],
})