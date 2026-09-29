import type { FeatureCollection } from 'geojson'
import type { Caso, Config, Datos, Distrito, Meta } from './tipos'

async function leer<T>(ruta: string): Promise<T> {
  // no-cache: un corte nuevo debe verse al instante, sin esperar a que caduque el navegador
  const r = await fetch(`${import.meta.env.BASE_URL}${ruta}`, { cache: 'no-cache' })
  if (!r.ok) throw new Error(`${ruta}: HTTP ${r.status}`)
  return (await r.json()) as T
}

export async function cargarDatos(): Promise<Datos> {
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
