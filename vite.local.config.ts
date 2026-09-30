import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Build «archivo único»: todo va en línea (JS, CSS, logo) y el worker de MapLibre sale de un Blob.
// Lo consume scripts/empaquetar_html.py, que además incrusta los datos del corte.
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: [{ find: /^\.\/worker$/, replacement: fileURLToPath(new URL('./src/mapas/worker.local.ts', import.meta.url)) }],
  },
  build: {
    outDir: 'dist-local',
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    modulePreload: false,
    copyPublicDir: false,
  },
})
