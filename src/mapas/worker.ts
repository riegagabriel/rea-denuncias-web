import { setWorkerUrl } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'

// MapLibre 6 busca su worker junto al bundle (new URL('./maplibre-gl-worker.mjs', import.meta.url)),
// pero Vite no lo copia a dist/assets: en producción el worker daba 404 y las capas nunca se dibujaban.
// ?worker&url hace que Vite lo empaquete (con sus dependencias) y nos dé su URL.
setWorkerUrl(workerUrl)
