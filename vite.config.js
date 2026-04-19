import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/gym-streak-tracker/',
  css: {
    postcss: {
      plugins: [],
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
