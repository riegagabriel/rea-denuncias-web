import { setWorkerUrl } from 'maplibre-gl'
import codigo from './worker.iife.js?raw'

// Build «archivo único» (se abre con doble clic, desde file://): no hay dónde servir el worker de MapLibre,
// así que su código —empaquetado en un solo archivo por `npm run worker:local`— viaja dentro del HTML.
// En file:// el navegador rechaza un worker desde un Blob («cannot be accessed from origin null»), pero acepta
// una URL data:. El sufijo «.cjs» hace que MapLibre lo cargue como worker clásico (no módulo).
setWorkerUrl(`data:text/javascript;charset=utf-8,${encodeURIComponent(codigo)}#worker.cjs`)
