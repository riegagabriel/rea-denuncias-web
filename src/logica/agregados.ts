import type { Feature, FeatureCollection, Point } from 'geojson'
import type { Caso, Categoria, Distrito } from '../tipos'

export function formatoMiles(n: number | null): string {
  if (n === null) return 's/d'
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export function formatoFecha(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) throw new Error(`Fecha ISO inválida: ${iso}`)
  return `${m[3]}/${m[2]}/${m[1]}`
}

export function conteoPorCategoria(casos: Caso[]): Record<number, number> {
  const r: Record<number, number> = {}
  for (const c of casos) r[c.cat] = (r[c.cat] ?? 0) + 1
  return r
}

export function conteoPorCanal(casos: Caso[]): Record<string, number> {
  const r: Record<string, number> = {}
  for (const c of casos) r[c.canal] = (r[c.canal] ?? 0) + 1
  return r
}

export function casosDeDistrito(casos: Caso[], ubigeo: string): Caso[] {
  return casos.filter((c) => c.ubigeo_inei === ubigeo)
}

export interface FilaDepartamento {
  departamento: string
  total: number
  porCategoria: Record<number, number>
}

export function denunciasPorDepartamento(casos: Caso[]): FilaDepartamento[] {
  const m = new Map<string, FilaDepartamento>()
  for (const c of casos) {
    if (!c.departamento) continue
    const f = m.get(c.departamento) ?? { departamento: c.departamento, total: 0, porCategoria: {} }
    f.total += 1
    f.porCategoria[c.cat] = (f.porCategoria[c.cat] ?? 0) + 1
    m.set(c.departamento, f)
  }
  return [...m.values()].sort((a, b) => b.total - a.total || a.departamento.localeCompare(b.departamento, 'es'))
}

export interface FilaCiudadanos {
  cat: number
  casos: number
  ciudadanos: number
  sinDato: number
}

export function ciudadanosPorCategoria(casos: Caso[], ids: number[]): FilaCiudadanos[] {
  return ids.map((cat) => {
    const propios = casos.filter((c) => c.cat === cat)
    return {
      cat,
      casos: propios.length,
      ciudadanos: propios.reduce((s, c) => s + (c.ciudadanos ?? 0), 0),
      sinDato: propios.filter((c) => c.ciudadanos === null).length,
    }
  })
}

export interface FiltroCascada {
  departamento: string
  provincia: string
  distrito: string
}

export function filtrarCascada(casos: Caso[], f: FiltroCascada): Caso[] {
  return casos.filter(
    (c) =>
      (!f.departamento || c.departamento === f.departamento) &&
      (!f.provincia || c.provincia === f.provincia) &&
      (!f.distrito || c.distrito === f.distrito),
  )
}

export function opcionesCascada(casos: Caso[], f: FiltroCascada) {
  const unicos = (xs: string[]) => [...new Set(xs.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'))
  const enDep = casos.filter((c) => !f.departamento || c.departamento === f.departamento)
  const enProv = enDep.filter((c) => !f.provincia || c.provincia === f.provincia)
  return {
    departamentos: unicos(casos.map((c) => c.departamento)),
    provincias: unicos(enDep.map((c) => c.provincia)),
    distritos: unicos(enProv.map((c) => c.distrito)),
  }
}

export function ubigeosConAlerta(casos: Caso[]): Set<string> {
  const s = new Set<string>()
  for (const c of casos) if (c.alerta && c.ubigeo_inei) s.add(c.ubigeo_inei)
  return s
}

export interface PuntoDistrito {
  ubigeo: string
  lon: number
  lat: number
  n: number
  cat: number | null
  verificado: boolean
}

export function puntosDistrito(distritos: Distrito[], casos: Caso[], activas: ReadonlySet<number>): PuntoDistrito[] {
  const porDistrito = new Map<string, Caso[]>()
  for (const c of casos) {
    if (!c.ubigeo_inei) continue
    const l = porDistrito.get(c.ubigeo_inei) ?? []
    l.push(c)
    porDistrito.set(c.ubigeo_inei, l)
  }
  const salida: PuntoDistrito[] = []
  for (const d of distritos) {
    const todos = porDistrito.get(d.ubigeo_inei) ?? []
    const act = todos.filter((c) => activas.has(c.cat))
    if (act.length === 0 && (todos.length > 0 || d.verificacion === null)) continue
    const cuenta = new Map<number, number>()
    for (const c of act) cuenta.set(c.cat, (cuenta.get(c.cat) ?? 0) + 1)
    let cat: number | null = null
    let mejor = 0
    for (const [k, v] of [...cuenta.entries()].sort((a, b) => a[0] - b[0])) {
      if (v > mejor) {
        mejor = v
        cat = k
      }
    }
    salida.push({ ubigeo: d.ubigeo_inei, lon: d.lon, lat: d.lat, n: act.length, cat, verificado: d.verificacion !== null })
  }
  return salida
}

const COLOR_SOLO_VERIFICADO = '#141414'

export function puntosGeojson(puntos: PuntoDistrito[], categorias: Categoria[]): FeatureCollection<Point> {
  const features: Feature<Point>[] = puntos.map((p) => ({
    type: 'Feature',
    properties: {
      u: p.ubigeo,
      n: p.n,
      ver: p.verificado ? 1 : 0,
      ver0: p.verificado && p.n === 0 ? 1 : 0,
      color: categorias.find((c) => c.id === p.cat)?.color ?? COLOR_SOLO_VERIFICADO,
    },
    geometry: { type: 'Point', coordinates: [p.lon, p.lat] },
  }))
  return { type: 'FeatureCollection', features }
}

export function enriquecerProvincias(geo: FeatureCollection, casos: Caso[]): FeatureCollection {
  const n = new Map<string, number>()
  const nd = new Map<string, Set<string>>()
  for (const c of casos) {
    if (!c.ubigeo_inei || !c.clave_provincia) continue
    n.set(c.clave_provincia, (n.get(c.clave_provincia) ?? 0) + 1)
    const s = nd.get(c.clave_provincia) ?? new Set<string>()
    s.add(c.ubigeo_inei)
    nd.set(c.clave_provincia, s)
  }
  return {
    ...geo,
    features: geo.features.map((f) => {
      const k = String(f.properties?.clave ?? '')
      return { ...f, properties: { ...f.properties, n: n.get(k) ?? 0, nd: nd.get(k)?.size ?? 0 } }
    }),
  }
}

export function enriquecerDistritos(geo: FeatureCollection, distritos: Distrito[], alertas: ReadonlySet<string>): FeatureCollection {
  const por = new Map(distritos.map((d) => [d.ubigeo_inei, d]))
  return {
    ...geo,
    features: geo.features.map((f) => {
      const u = String(f.properties?.ubigeo_inei ?? '')
      const d = por.get(u)
      return {
        ...f,
        properties: { ...f.properties, n: d?.denuncias ?? 0, ver: d?.verificacion ? 1 : 0, al: alertas.has(u) ? 1 : 0 },
      }
    }),
  }
}
