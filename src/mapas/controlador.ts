import { Map as MapaGL, type MapMouseEvent, type Marker } from 'maplibre-gl'
import type { FeatureCollection } from 'geojson'
import type { Datos, Fondo, Seleccion } from '../tipos'
import { enriquecerDistritos, enriquecerProvincias, puntosDistrito, puntosGeojson, ubigeosConAlerta } from '../logica/agregados'
import { actualizarPuntos, aplicarFondoTerritorio, instalarCasos, instalarTerritorio, marcarSeleccion } from './capas'
import { anadirBanderas } from './banderas'
import { estiloParaFondo } from './estiloBase'
import './worker'

export interface Callbacks {
  alSeleccionarDistrito(ubigeo: string): void
  alSeleccionarProvincia(clave: string): void
  alLimpiar(): void
  alFalloFondo(): void
}

const LIMITES_PERU: [[number, number], [number, number]] = [[-81.6, -18.6], [-68.4, 0.3]]
const FUENTES_DE_FONDO = ['base', 'openmaptiles']
const ERRORES_PARA_AVISAR = 4
const TODAS = new Set([1, 2, 3, 4, 5])

export class ControladorMapas {
  private territorio: MapaGL
  private casos: MapaGL
  private datos: Datos
  private fondo: Fondo
  private seleccion: Seleccion
  private activas: ReadonlySet<number>
  private cb: Callbacks
  private bloqueo = false
  private erroresFondo = 0
  private marcadores: Marker[] = []
  private tip: HTMLDivElement
  private provincias: FeatureCollection
  private distritosGeo: FeatureCollection
  private alertas: Set<string>

  constructor(
    contTerritorio: HTMLElement,
    contCasos: HTMLElement,
    datos: Datos,
    fondo: Fondo,
    seleccion: Seleccion,
    activas: ReadonlySet<number>,
    cb: Callbacks,
  ) {
    this.datos = datos
    this.fondo = fondo
    this.seleccion = seleccion
    this.activas = activas
    this.cb = cb
    this.alertas = ubigeosConAlerta(datos.casos)
    this.provincias = enriquecerProvincias(datos.provincias, datos.casos)
    this.distritosGeo = enriquecerDistritos(datos.distritosGeo, datos.distritos, this.alertas)
    this.tip = document.createElement('div')
    this.tip.className = 'tip'
    document.body.appendChild(this.tip)
    this.territorio = this.crear(contTerritorio)
    this.casos = this.crear(contCasos)

    this.territorio.on('style.load', () => {
      instalarTerritorio(this.territorio, {
        departamentos: datos.departamentos, provincias: this.provincias, distritos: this.distritosGeo,
        puntos: this.puntosTodos(),
      }, this.fondo)
      marcarSeleccion(this.territorio, this.seleccion)
    })
    this.casos.on('style.load', () => {
      instalarCasos(this.casos, { departamentos: datos.departamentos, distritos: this.distritosGeo, puntos: this.puntosActivos() })
      marcarSeleccion(this.casos, this.seleccion)
    })

    this.marcadores.push(
      ...anadirBanderas(this.territorio, datos.distritos, this.alertas, [-4, 0], (u) => cb.alSeleccionarDistrito(u)),
      ...anadirBanderas(this.casos, datos.distritos, this.alertas, [-4, -10], (u) => cb.alSeleccionarDistrito(u)),
    )
    this.sincronizar(this.territorio, this.casos)
    this.sincronizar(this.casos, this.territorio)
    this.eventos()
  }

  private crear(contenedor: HTMLElement): MapaGL {
    const mapa = new MapaGL({
      container: contenedor,
      style: estiloParaFondo(this.fondo),
      bounds: LIMITES_PERU,
      fitBoundsOptions: { padding: 6 },
      attributionControl: false,
      dragRotate: false,
      maxZoom: 12,
      minZoom: 2,
      canvasContextAttributes: { preserveDrawingBuffer: true }, // permite verificar con capturas de pantalla
    })
    mapa.touchZoomRotate.disableRotation()
    mapa.on('error', (e) => {
      const id = (e as unknown as { sourceId?: string }).sourceId
      if (this.fondo !== 'ninguno' && id && FUENTES_DE_FONDO.includes(id) && ++this.erroresFondo === ERRORES_PARA_AVISAR) {
        this.cb.alFalloFondo()
      }
    })
    return mapa
  }

  private puntosActivos(): FeatureCollection {
    return puntosGeojson(puntosDistrito(this.datos.distritos, this.datos.casos, this.activas), this.datos.config.categorias)
  }

  private puntosTodos(): FeatureCollection {
    return puntosGeojson(puntosDistrito(this.datos.distritos, this.datos.casos, TODAS), this.datos.config.categorias)
  }

  private sincronizar(origen: MapaGL, destino: MapaGL): void {
    origen.on('move', () => {
      if (this.bloqueo) return
      this.bloqueo = true
      destino.jumpTo({ center: origen.getCenter(), zoom: origen.getZoom() })
      this.bloqueo = false
    })
  }

  private eventos(): void {
    const mover = (e: MapMouseEvent, mapa: MapaGL, esTerritorio: boolean) => {
      const capas = esTerritorio ? ['hit'] : ['casos', 'hit']
      const h = mapa.queryRenderedFeatures(e.point, { layers: capas }).find((f) => Number(f.properties?.n) > 0 || Number(f.properties?.ver) === 1)
      let texto = ''
      if (h) {
        const u = String(h.properties?.ubigeo_inei ?? h.properties?.u)
        const d = this.datos.distritos.find((x) => x.ubigeo_inei === u)
        if (d) texto = `${d.distrito} · ${d.denuncias} denuncia${d.denuncias === 1 ? '' : 's'}${d.verificacion ? ' · verificado' : ''}${this.alertas.has(u) ? ' · alerta' : ''}`
      } else if (esTerritorio) {
        const p = mapa.queryRenderedFeatures(e.point, { layers: ['prov-fill'] })[0]
        if (p) texto = `Provincia ${p.properties?.PROVINCIA} · ${p.properties?.n} denuncia${p.properties?.n === 1 ? '' : 's'}`
      }
      mapa.getCanvas().style.cursor = texto ? 'pointer' : ''
      this.tip.style.display = texto ? 'block' : 'none'
      if (texto) {
        this.tip.textContent = texto
        this.tip.style.left = `${e.originalEvent.clientX + 12}px`
        this.tip.style.top = `${e.originalEvent.clientY + 12}px`
      }
    }
    this.territorio.on('mousemove', (e) => mover(e, this.territorio, true))
    this.casos.on('mousemove', (e) => mover(e, this.casos, false))
    for (const m of [this.territorio, this.casos]) m.on('mouseout', () => (this.tip.style.display = 'none'))

    this.territorio.on('click', (e) => {
      const d = this.territorio.queryRenderedFeatures(e.point, { layers: ['hit'] }).find((f) => Number(f.properties?.n) > 0 || Number(f.properties?.ver) === 1)
      if (d) return this.cb.alSeleccionarDistrito(String(d.properties?.ubigeo_inei))
      const p = this.territorio.queryRenderedFeatures(e.point, { layers: ['prov-fill'] })[0]
      if (p) this.cb.alSeleccionarProvincia(String(p.properties?.clave))
      else this.cb.alLimpiar()
    })
    this.casos.on('click', (e) => {
      const f = this.casos.queryRenderedFeatures(e.point, { layers: ['casos', 'hit'] }).find((x) => Number(x.properties?.n) > 0 || Number(x.properties?.ver) === 1)
      if (f) this.cb.alSeleccionarDistrito(String(f.properties?.u ?? f.properties?.ubigeo_inei))
      else this.cb.alLimpiar()
    })
  }

  setFondo(f: Fondo): void {
    this.fondo = f
    this.erroresFondo = 0
    // diff:false fuerza la recarga completa del estilo y con ella el evento style.load,
    // donde se vuelven a instalar las capas propias.
    this.territorio.setStyle(estiloParaFondo(f), { diff: false })
    this.casos.setStyle(estiloParaFondo(f), { diff: false })
    aplicarFondoTerritorio(this.territorio, f)
  }

  setSeleccion(s: Seleccion): void {
    this.seleccion = s
    marcarSeleccion(this.territorio, s)
    marcarSeleccion(this.casos, s)
  }

  setActivas(a: ReadonlySet<number>): void {
    this.activas = a
    actualizarPuntos(this.casos, this.puntosActivos())
  }

  acercarA(bbox: [number, number, number, number]): void {
    this.territorio.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]], { padding: 80, maxZoom: 10 })
  }

  redimensionar(): void {
    this.territorio.resize()
    this.casos.resize()
  }

  destruir(): void {
    for (const m of this.marcadores) m.remove()
    this.territorio.remove()
    this.casos.remove()
    this.tip.remove()
  }
}
