import type { FeatureCollection } from 'geojson'
import type { Caso, Config, Datos, Distrito, Meta } from './tipos'

async function leer<T>(ruta: string): Promise<T> {
  // no-cache: un corte nuevo debe verse al instante, sin esperar a que caduque el navegador
  const r = await fetch(`${import.meta.env.BASE_URL}${ruta}`, { cache: 'no-cache' })
  if (!r.ok) throw new Error(`${ruta}: HTTP ${r.status}`)
  return (await r.json()) as T
}

export async function cargarDatos(): Promise<Datos> {
  // Archivo único (doble clic, sin servidor): los datos ya vienen dentro del HTML.
  if (window.__REA_DATA__) return window.__REA_DATA__
  const [config, meta, casos, distritos, departamentos, provincias, distritosGeo] = await Promise.all([
    leer<Config>('config.json'),
    leer<Meta>('data/meta.json'),
    leer<Caso[]>('data/casos.json'),
    leer<Distrito[]>('data/distritos.json'),
    leer<FeatureCollection>('data/departamentos.geojson'),
    leer<FeatureCollection>('data/provincias.geojson'),
    leer<FeatureCollection>('data/distritos.geojson'),
  ])
  return { config, meta, casos, distritos, departamentos, provincias, distritosGeo }
}
