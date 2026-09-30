import { describe, expect, it } from 'vitest'
import { ESCALA_DENUNCIAS, FONDOS, URL_OPENFREEMAP, esErrorDeFondo, estiloParaFondo, opacidadRellenoPais, pinturaCoropleta } from './estiloBase'

type Capa = { type: string; paint?: Record<string, number> }

describe('estiloParaFondo', () => {
  it('sin fondo: solo el color de fondo, sin fuentes externas', () => {
    const e = estiloParaFondo('ninguno')
    if (typeof e === 'string') throw new Error('se esperaba un estilo')
    expect(e.layers).toHaveLength(1)
    expect(Object.keys(e.sources)).toEqual([])
  })
  it('gris: mosaicos de OSM desaturados', () => {
    const e = estiloParaFondo('gris')
    if (typeof e === 'string') throw new Error('se esperaba un estilo')
    const raster = (e.layers as unknown as Capa[]).find((l) => l.type === 'raster')
    expect(raster).toBeDefined()
    expect(raster?.paint?.['raster-saturation']).toBe(-1)
    expect(e.sources.base).toMatchObject({ type: 'raster' })
  })
  it('osm: mosaicos de OSM sin filtro de color', () => {
    const e = estiloParaFondo('osm')
    if (typeof e === 'string') throw new Error('se esperaba un estilo')
    const raster = (e.layers as unknown as Capa[]).find((l) => l.type === 'raster')
    expect(raster?.paint ?? {}).toEqual({})
  })
  it('openfreemap: devuelve la URL del estilo vectorial', () => {
    expect(estiloParaFondo('openfreemap')).toBe(URL_OPENFREEMAP)
  })
})

describe('pinturaCoropleta', () => {
  it('sin fondo el relleno es opaco y las provincias sin denuncias tienen color', () => {
    const p = pinturaCoropleta('ninguno')
    expect(p.opacidad).toBe(1)
    expect((p.colorRelleno as unknown[])[2]).toBe('#e6e3d8')
  })
  it('con fondo el relleno es semitransparente y las provincias sin denuncias son transparentes', () => {
    for (const f of ['gris', 'osm', 'openfreemap'] as const) {
      const p = pinturaCoropleta(f)
      expect(p.opacidad).toBeLessThan(1)
      expect((p.colorRelleno as unknown[])[2]).toBe('rgba(230,227,216,0)')
    }
  })
})

describe('ESCALA_DENUNCIAS (leyenda de la coropleta)', () => {
  it('coincide con los tramos y colores que pinta el mapa', () => {
    const e = pinturaCoropleta('ninguno').colorRelleno as unknown[]
    const tramos = e.slice(3) // tras ['step', entrada, color base]
    expect(tramos).toEqual(ESCALA_DENUNCIAS.flatMap((t) => [t.desde, t.color]))
  })
  it('tiene etiqueta legible en cada tramo', () => {
    expect(ESCALA_DENUNCIAS.map((t) => t.etiqueta)).toEqual(['1', '2–3', '4–6', '7 o más'])
  })
})

describe('FONDOS', () => {
  it('ofrece los cuatro fondos y «Sin fondo» va primero', () => {
    expect(FONDOS.map((f) => f.id)).toEqual(['ninguno', 'gris', 'osm', 'openfreemap'])
    expect(FONDOS.every((f) => f.atribucion.length > 0)).toBe(true)
  })
})

describe('opacidadRellenoPais (fondo visible dentro de Perú en el mapa de casos)', () => {
  it('sin fondo el país se rellena; con cualquier fondo el relleno es transparente', () => {
    expect(opacidadRellenoPais('ninguno')).toBe(1)
    for (const f of ['gris', 'osm', 'openfreemap'] as const) expect(opacidadRellenoPais(f)).toBe(0)
  })
})

describe('esErrorDeFondo (aviso de fondo bloqueado)', () => {
  it('sin fondo nunca hay error de fondo', () => {
    expect(esErrorDeFondo('ninguno', 'base', false)).toBe(false)
  })
  it('un error en la fuente de mosaicos cuenta', () => {
    expect(esErrorDeFondo('gris', 'base', true)).toBe(true)
    expect(esErrorDeFondo('openfreemap', 'openmaptiles', true)).toBe(true)
  })
  it('un error de una fuente propia no cuenta', () => {
    expect(esErrorDeFondo('gris', 'dg', true)).toBe(false)
  })
  it('OpenFreeMap: un error sin fuente antes de cargar el estilo (URL bloqueada) cuenta', () => {
    expect(esErrorDeFondo('openfreemap', undefined, false)).toBe(true)
  })
  it('OpenFreeMap: un error sin fuente con el estilo ya cargado no cuenta; en los raster tampoco', () => {
    expect(esErrorDeFondo('openfreemap', undefined, true)).toBe(false)
    expect(esErrorDeFondo('gris', undefined, false)).toBe(false)
  })
})
