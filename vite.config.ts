import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  // MapLibre 6 crea su worker con new URL('./maplibre-gl-worker.mjs', import.meta.url):
  // la pre-optimización de Vite rompe esa ruta relativa y el worker no carga en desarrollo.
  optimizeDeps: { exclude: ['maplibre-gl'] },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
})
