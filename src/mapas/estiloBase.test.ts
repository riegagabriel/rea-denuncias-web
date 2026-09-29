import { describe, expect, it } from 'vitest'
import { FONDOS, URL_OPENFREEMAP, estiloParaFondo, pinturaCoropleta } from './estiloBase'

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

describe('FONDOS', () => {
  it('ofrece los cuatro fondos y «Sin fondo» va primero', () => {
    expect(FONDOS.map((f) => f.id)).toEqual(['ninguno', 'gris', 'osm', 'openfreemap'])
    expect(FONDOS.every((f) => f.atribucion.length > 0)).toBe(true)
  })
})
