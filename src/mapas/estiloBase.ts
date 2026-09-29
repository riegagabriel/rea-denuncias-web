import type { ExpressionSpecification, StyleSpecification } from 'maplibre-gl'
import type { Fondo } from '../tipos'

export const COLOR_FONDO = '#eeece4'
export const URL_OPENFREEMAP = 'https://tiles.openfreemap.org/styles/positron'

export const FONDOS: { id: Fondo; etiqueta: string; atribucion: string }[] = [
  { id: 'ninguno', etiqueta: 'Sin fondo', atribucion: 'Sin fondo: no depende de servicios externos' },
  { id: 'gris', etiqueta: 'Calles (gris)', atribucion: '© OpenStreetMap contributors (en grises)' },
  { id: 'osm', etiqueta: 'OpenStreetMap', atribucion: '© OpenStreetMap contributors' },
  { id: 'openfreemap', etiqueta: 'OpenFreeMap', atribucion: '© OpenStreetMap contributors, OpenFreeMap' },
]

const OSM = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'

export function estiloParaFondo(f: Fondo): StyleSpecification | string {
  if (f === 'openfreemap') return URL_OPENFREEMAP
  const base: StyleSpecification = {
    version: 8,
    sources: {},
    layers: [{ id: 'fondo', type: 'background', paint: { 'background-color': COLOR_FONDO } }],
  }
  if (f === 'ninguno') return base
  return {
    ...base,
    sources: { base: { type: 'raster', tiles: [OSM], tileSize: 256, maxzoom: 19 } },
    layers: [
      ...base.layers,
      {
        id: 'base-raster',
        type: 'raster',
        source: 'base',
        paint:
          f === 'gris'
            ? { 'raster-saturation': -1, 'raster-contrast': -0.25, 'raster-brightness-min': 0.32, 'raster-brightness-max': 1 }
            : {},
      },
    ],
  }
}

export interface PinturaCoropleta {
  colorRelleno: ExpressionSpecification
  opacidad: number
}

export function pinturaCoropleta(f: Fondo): PinturaCoropleta {
  const conFondo = f !== 'ninguno'
  return {
    colorRelleno: ['step', ['get', 'n'], conFondo ? 'rgba(230,227,216,0)' : '#e6e3d8', 1, '#f2e2b8', 2, '#e3c17c', 4, '#c98f2e', 7, '#8f5a06'],
    opacidad: f === 'ninguno' ? 1 : f === 'gris' ? 0.74 : f === 'osm' ? 0.68 : 0.7,
  }
}

// El mapa de casos rellena el país con un color liso. Con un mapa base ese relleno lo taparía.
export function opacidadRellenoPais(f: Fondo): number {
  return f === 'ninguno' ? 1 : 0
}

// Fuentes de mosaicos de los fondos: 'base' (raster de OSM) y 'openmaptiles' (estilo de OpenFreeMap).
export const FUENTES_DE_FONDO = ['base', 'openmaptiles']

// ¿Este error de MapLibre significa que el fondo no cargó? Un error en una fuente de mosaicos, o (solo en
// OpenFreeMap) un error sin fuente antes de que el estilo cargue, que es lo que pasa si su URL está bloqueada.
export function esErrorDeFondo(fondo: Fondo, sourceId: string | undefined, estiloCargado: boolean): boolean {
  if (fondo === 'ninguno') return false
  if (sourceId && FUENTES_DE_FONDO.includes(sourceId)) return true
  return fondo === 'openfreemap' && !sourceId && !estiloCargado
}
