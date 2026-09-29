import type { ExpressionSpecification, GeoJSONSource, Map as MapaGL } from 'maplibre-gl'
import type { FeatureCollection } from 'geojson'
import type { Fondo, Seleccion } from '../tipos'
import { pinturaCoropleta } from './estiloBase'

export interface FuentesTerritorio {
  departamentos: FeatureCollection
  provincias: FeatureCollection
  distritos: FeatureCollection
  puntos: FeatureCollection
}

export interface FuentesCasos {
  departamentos: FeatureCollection
  distritos: FeatureCollection
  puntos: FeatureCollection
}

const zoom = (a: number, b: number, c: number, d: number): ExpressionSpecification => ['interpolate', ['linear'], ['zoom'], a, b, c, d]
const VERIFICADO: ExpressionSpecification = ['==', ['get', 'ver'], 1]
const NINGUNO: ExpressionSpecification = ['==', ['get', 'ubigeo_inei'], '']

export function imagenRayado(): { width: number; height: number; data: Uint8Array } {
  const s = 8
  const data = new Uint8Array(s * s * 4)
  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      if ((x + y) % s < 2) {
        const i = (y * s + x) * 4
        data[i] = 20
        data[i + 1] = 20
        data[i + 2] = 20
        data[i + 3] = 255
      }
    }
  }
  return { width: s, height: s, data }
}

function fuente(mapa: MapaGL, id: string, data: FeatureCollection): void {
  const existente = mapa.getSource(id) as GeoJSONSource | undefined
  if (existente) existente.setData(data)
  else mapa.addSource(id, { type: 'geojson', data })
}

function capasVerificacion(mapa: MapaGL, filtroPuntos: ExpressionSpecification): void {
  if (!mapa.hasImage('rayado')) mapa.addImage('rayado', imagenRayado())
  mapa.addLayer({ id: 'ver-fill', type: 'fill', source: 'dg', filter: VERIFICADO, paint: { 'fill-pattern': 'rayado', 'fill-opacity': zoom(5, 0, 7, 0.9) } })
  mapa.addLayer({ id: 'ver-line', type: 'line', source: 'dg', filter: VERIFICADO, paint: { 'line-color': '#141414', 'line-width': zoom(5, 0.6, 9, 1.6) } })
  mapa.addLayer({
    id: 'ver-pt', type: 'circle', source: 'pts', filter: filtroPuntos,
    paint: {
      'circle-radius': 3.4, 'circle-color': '#141414', 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1,
      'circle-opacity': zoom(6, 1, 8, 0), 'circle-stroke-opacity': zoom(6, 1, 8, 0),
    },
  })
}

function capasSeleccion(mapa: MapaGL): void {
  mapa.addLayer({ id: 'hit', type: 'fill', source: 'dg', paint: { 'fill-color': '#000000', 'fill-opacity': 0.01 } })
  mapa.addLayer({ id: 'sel-halo', type: 'line', source: 'dg', filter: NINGUNO, paint: { 'line-color': '#ffffff', 'line-width': 6 } })
  mapa.addLayer({ id: 'sel-line', type: 'line', source: 'dg', filter: NINGUNO, paint: { 'line-color': '#111111', 'line-width': 2.4 } })
}

export function instalarTerritorio(mapa: MapaGL, f: FuentesTerritorio, fondo: Fondo): void {
  fuente(mapa, 'deps', f.departamentos)
  fuente(mapa, 'dg', f.distritos)
  fuente(mapa, 'prov', f.provincias)
  fuente(mapa, 'pts', f.puntos)
  const p = pinturaCoropleta(fondo)
  mapa.addLayer({ id: 'prov-fill', type: 'fill', source: 'prov', paint: { 'fill-color': p.colorRelleno, 'fill-opacity': p.opacidad, 'fill-outline-color': '#ffffff' } })
  mapa.addLayer({ id: 'prov-line', type: 'line', source: 'prov', paint: { 'line-color': '#ffffff', 'line-width': 0.5 } })
  mapa.addLayer({ id: 'deps-line', type: 'line', source: 'deps', paint: { 'line-color': '#8d897f', 'line-width': 0.8 } })
  mapa.addLayer({ id: 'den-line', type: 'line', source: 'dg', filter: ['>', ['get', 'n'], 0], paint: { 'line-color': '#3a3730', 'line-width': zoom(5, 0.4, 9, 1.2) } })
  capasVerificacion(mapa, VERIFICADO)
  capasSeleccion(mapa)
  mapa.addLayer({ id: 'prov-sel', type: 'line', source: 'prov', filter: ['==', ['get', 'clave'], ''], paint: { 'line-color': '#111111', 'line-width': 2.4 } })
}

export function instalarCasos(mapa: MapaGL, f: FuentesCasos): void {
  fuente(mapa, 'deps', f.departamentos)
  fuente(mapa, 'dg', f.distritos)
  fuente(mapa, 'pts', f.puntos)
  mapa.addLayer({ id: 'deps-fill', type: 'fill', source: 'deps', paint: { 'fill-color': '#f7f6f1', 'fill-opacity': 1 } })
  mapa.addLayer({ id: 'deps-line', type: 'line', source: 'deps', paint: { 'line-color': '#b9b5a9', 'line-width': 0.8 } })
  capasVerificacion(mapa, ['==', ['get', 'ver0'], 1])
  mapa.addLayer({
    id: 'ring', type: 'circle', source: 'pts', filter: ['all', ['==', ['get', 'ver'], 1], ['>', ['get', 'n'], 0]],
    paint: { 'circle-radius': ['+', 9, ['*', 3, ['sqrt', ['get', 'n']]]], 'circle-color': 'rgba(0,0,0,0)', 'circle-stroke-color': '#141414', 'circle-stroke-width': 2.2, 'circle-stroke-opacity': 0.95 },
  })
  mapa.addLayer({
    id: 'casos', type: 'circle', source: 'pts', filter: ['>', ['get', 'n'], 0],
    paint: { 'circle-radius': ['+', 4, ['*', 3, ['sqrt', ['get', 'n']]]], 'circle-color': ['get', 'color'], 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1.4, 'circle-opacity': 0.95 },
  })
  capasSeleccion(mapa)
}

export function actualizarPuntos(mapa: MapaGL, puntos: FeatureCollection): void {
  const s = mapa.getSource('pts') as GeoJSONSource | undefined
  if (s) s.setData(puntos)
}

export function aplicarFondoTerritorio(mapa: MapaGL, fondo: Fondo): void {
  if (!mapa.getLayer('prov-fill')) return
  const p = pinturaCoropleta(fondo)
  mapa.setPaintProperty('prov-fill', 'fill-color', p.colorRelleno)
  mapa.setPaintProperty('prov-fill', 'fill-opacity', p.opacidad)
}

export function marcarSeleccion(mapa: MapaGL, sel: Seleccion): void {
  if (!mapa.getLayer('sel-line')) return
  const u: ExpressionSpecification = ['==', ['get', 'ubigeo_inei'], sel.tipo === 'distrito' ? sel.ubigeo : '']
  mapa.setFilter('sel-halo', u)
  mapa.setFilter('sel-line', u)
  if (mapa.getLayer('prov-sel')) mapa.setFilter('prov-sel', ['==', ['get', 'clave'], sel.tipo === 'provincia' ? sel.clave : ''])
}
