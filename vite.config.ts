import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  // Base path for GitHub Pages deployment (repo name)
  base: '/Manutencao/',
  plugins: [
    vue(),
    // vueDevTools(), // Temporarily disabled due to compatibility issues
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
