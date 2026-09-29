import { Marker, type Map as MapaGL } from 'maplibre-gl'
import type { Distrito } from '../tipos'

const SVG =
  '<svg viewBox="0 0 24 30" width="22" height="27" aria-hidden="true">' +
  '<path d="M4 2v26" stroke="#3a0d09" stroke-width="2.4" stroke-linecap="round"/>' +
  '<path d="M5 3.5c5-2.6 8 2.6 14 0v11c-6 2.6-9-2.6-14 0z" fill="#d92d20" stroke="#7a1610" stroke-width="1.2" stroke-linejoin="round"/></svg>'

function elemento(ubigeo: string, nombre: string, alClic: (u: string) => void): HTMLElement {
  const e = document.createElement('button')
  e.type = 'button'
  e.className = 'bandera'
  e.title = `ALERTA: riesgo de conflicto (${nombre})`
  e.setAttribute('aria-label', `Alerta de riesgo de conflicto en ${nombre}`)
  e.innerHTML = SVG
  e.addEventListener('click', (ev) => {
    ev.stopPropagation()
    alClic(ubigeo)
  })
  return e
}

export function anadirBanderas(
  mapa: MapaGL,
  distritos: Distrito[],
  alertas: ReadonlySet<string>,
  offset: [number, number],
  alClic: (ubigeo: string) => void,
): Marker[] {
  return distritos
    .filter((d) => alertas.has(d.ubigeo_inei))
    .map((d) =>
      new Marker({ element: elemento(d.ubigeo_inei, d.distrito, alClic), anchor: 'bottom-left', offset })
        .setLngLat([d.lon, d.lat])
        .addTo(mapa),
    )
}
