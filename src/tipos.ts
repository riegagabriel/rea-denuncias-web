import type { FeatureCollection } from 'geojson'

export interface Categoria {
  id: number
  nombre: string
  color: string
  descripcion: string
}

export interface Config {
  titulo: string
  subtitulo: string
  pie: string
  categorias: Categoria[]
  canales: Record<string, string>
  canalSinAsignar: string[]
}

export interface Cifras {
  denuncias: number
  distritos: number
  departamentos: number
  ciudadanos: number
  ciudadanos_con_dato: number
  sin_territorio: number
  en_distrito_verificado: number
  distritos_verificados: number
  alertas: number
}

export interface Meta {
  corte: string
  generado: string
  fuente: string
  cifras: Cifras
  por_categoria: Record<string, number>
  nota_ubigeo: string
}

export interface Caso {
  item: number
  ubigeo_inei: string | null
  clave_provincia: string | null
  departamento: string
  provincia: string
  distrito: string
  fecha: string
  documento: string
  canal: string
  cat: number
  ciudadanos: number | null
  observacion: string
  alerta: boolean
  alerta_motivo: string
  en_distrito_verificado: boolean
  posterior_a_resolucion: boolean
  localidad_original: string
}

export interface Verificacion {
  tipo: 'resolucion' | 'puntual'
  resolucion: string | null
  publicada: string | null
  domicilios: number | null
  A: number | null
  B: number | null
  C: number | null
  url: string | null
}

export interface Distrito {
  ubigeo_inei: string
  departamento: string
  provincia: string
  distrito: string
  clave_provincia: string
  lon: number
  lat: number
  bbox: [number, number, number, number]
  denuncias: number
  ciudadanos: number | null
  verificacion: Verificacion | null
}

export type Fondo = 'ninguno' | 'gris' | 'osm' | 'openfreemap'

export type Seleccion =
  | { tipo: 'ninguna' }
  | { tipo: 'distrito'; ubigeo: string }
  | { tipo: 'provincia'; clave: string }

export interface Datos {
  config: Config
  meta: Meta
  casos: Caso[]
  distritos: Distrito[]
  departamentos: FeatureCollection
  provincias: FeatureCollection
  distritosGeo: FeatureCollection
}
