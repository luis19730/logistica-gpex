import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base do GitHub Pages: https://<usuario>.github.io/logistica-gpex/
export default defineConfig({
  base: '/logistica-gpex/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
