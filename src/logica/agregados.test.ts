import { describe, expect, it } from 'vitest'
import type { FeatureCollection } from 'geojson'
import {
  casosDeDistrito, ciudadanosPorCategoria, conteoPorCanal, conteoPorCategoria, denunciasPorDepartamento,
  enriquecerDistritos, enriquecerProvincias, filtrarCascada, formatoFecha, formatoMiles, nombresProvincia, opcionesCascada,
  puntosDistrito, puntosGeojson, ubigeosConAlerta,
} from './agregados'
import { VERIFICACION, caso, distrito } from './fixtures'

describe('formato', () => {
  it('separa miles con espacio fino y muestra s/d si es nulo', () => {
    expect(formatoMiles(5130)).toBe('5 130')
    expect(formatoMiles(77)).toBe('77')
    expect(formatoMiles(null)).toBe('s/d')
  })
  it('convierte fecha ISO a dd/mm/aaaa y falla si el formato no cuadra', () => {
    expect(formatoFecha('2026-09-29')).toBe('29/09/2026')
    expect(() => formatoFecha('29/09/2026')).toThrow()
  })
})

describe('conteos', () => {
  const casos = [caso({ item: 1, cat: 1 }), caso({ item: 2, cat: 1 }), caso({ item: 3, cat: 5, canal: 'ONPE' })]
  it('por categoría', () => expect(conteoPorCategoria(casos)).toEqual({ 1: 2, 5: 1 }))
  it('por canal', () => expect(conteoPorCanal(casos)).toEqual({ RENIEC: 2, ONPE: 1 }))
  it('casos de un distrito', () => {
    expect(casosDeDistrito([caso({ item: 1 }), caso({ item: 2, ubigeo_inei: '020202' })], '020202').map((c) => c.item)).toEqual([2])
  })
  it('por departamento: ordena de mayor a menor y omite los sin territorio', () => {
    const r = denunciasPorDepartamento([
      caso({ item: 1, departamento: 'LIMA', cat: 1 }), caso({ item: 2, departamento: 'LIMA', cat: 2 }),
      caso({ item: 3, departamento: 'ICA', cat: 1 }), caso({ item: 4, departamento: '', ubigeo_inei: null }),
    ])
    expect(r.map((f) => [f.departamento, f.total])).toEqual([['LIMA', 2], ['ICA', 1]])
    expect(r[0].porCategoria).toEqual({ 1: 1, 2: 1 })
  })
  it('ciudadanos por categoría: suma, casos y casos sin dato', () => {
    const r = ciudadanosPorCategoria([
      caso({ cat: 1, ciudadanos: 10 }), caso({ item: 2, cat: 1, ciudadanos: null }), caso({ item: 3, cat: 2, ciudadanos: 5 }),
    ], [1, 2, 3])
    expect(r).toEqual([
      { cat: 1, casos: 2, ciudadanos: 10, sinDato: 1 },
      { cat: 2, casos: 1, ciudadanos: 5, sinDato: 0 },
      { cat: 3, casos: 0, ciudadanos: 0, sinDato: 0 },
    ])
  })
})

describe('cascada Departamento > Provincia > Distrito', () => {
  const casos = [
    caso({ item: 1, departamento: 'LIMA', provincia: 'YAUYOS', distrito: 'TANTA' }),
    caso({ item: 2, departamento: 'LIMA', provincia: 'HUARAL', distrito: 'CHANCAY' }),
    caso({ item: 3, departamento: 'ICA', provincia: 'ICA', distrito: 'ICA' }),
  ]
  it('las opciones se acotan según lo elegido', () => {
    expect(opcionesCascada(casos, { departamento: '', provincia: '', distrito: '' }).departamentos).toEqual(['ICA', 'LIMA'])
    const o = opcionesCascada(casos, { departamento: 'LIMA', provincia: '', distrito: '' })
    expect(o.provincias).toEqual(['HUARAL', 'YAUYOS'])
    expect(o.distritos).toEqual(['CHANCAY', 'TANTA'])
    expect(opcionesCascada(casos, { departamento: 'LIMA', provincia: 'YAUYOS', distrito: '' }).distritos).toEqual(['TANTA'])
  })
  it('filtra por los tres niveles', () => {
    expect(filtrarCascada(casos, { departamento: 'LIMA', provincia: '', distrito: '' }).map((c) => c.item)).toEqual([1, 2])
    expect(filtrarCascada(casos, { departamento: 'LIMA', provincia: 'HUARAL', distrito: 'CHANCAY' }).map((c) => c.item)).toEqual([2])
    expect(filtrarCascada(casos, { departamento: '', provincia: '', distrito: '' })).toHaveLength(3)
  })
})

describe('alertas', () => {
  it('ubigeos con alerta, ignorando los casos sin territorio', () => {
    const s = ubigeosConAlerta([
      caso({ item: 1, alerta: true, ubigeo_inei: '080910' }), caso({ item: 2 }),
      caso({ item: 3, alerta: true, ubigeo_inei: null }),
    ])
    expect([...s]).toEqual(['080910'])
  })
})

describe('puntos del mapa de casos', () => {
  const d1 = distrito({ ubigeo_inei: '010101' })
  const d2 = distrito({ ubigeo_inei: '020202', verificacion: VERIFICACION })
  const todas = new Set([1, 2, 3, 4, 5])

  it('categoría dominante; el empate lo gana el menor id de categoría', () => {
    const casos = [caso({ item: 1, cat: 3 }), caso({ item: 2, cat: 3 }), caso({ item: 3, cat: 1 }), caso({ item: 4, cat: 1 })]
    const [p] = puntosDistrito([d1], casos, todas)
    expect(p).toMatchObject({ ubigeo: '010101', n: 4, cat: 1, verificado: false })
  })
  it('el filtro de categoría recalcula n y la categoría dominante', () => {
    const casos = [caso({ item: 1, cat: 3 }), caso({ item: 2, cat: 3 }), caso({ item: 3, cat: 1 })]
    expect(puntosDistrito([d1], casos, new Set([3]))[0]).toMatchObject({ n: 2, cat: 3 })
  })
  it('un distrito con denuncias pero sin ninguna activa desaparece', () => {
    // Review Focus 4
    expect(puntosDistrito([d1], [caso({ item: 1, cat: 1 })], new Set([2]))).toEqual([])
    expect(puntosDistrito([d2], [caso({ item: 1, cat: 1, ubigeo_inei: '020202' })], new Set([2]))).toEqual([])
  })
  it('un distrito solo verificado, sin denuncias, aparece con n = 0', () => {
    const [p] = puntosDistrito([d2], [], new Set())
    expect(p).toMatchObject({ ubigeo: '020202', n: 0, cat: null, verificado: true })
  })
  it('un distrito sin denuncias ni verificación no aparece', () => {
    expect(puntosDistrito([d1], [], todas)).toEqual([])
  })
  it('puntosGeojson pinta con el color de la categoría y marca los solo verificados', () => {
    const cats = [{ id: 1, nombre: 'a', color: '#2a78d6', descripcion: '' }]
    const fc = puntosGeojson([
      { ubigeo: '010101', lon: -77, lat: -6, n: 2, cat: 1, verificado: true },
      { ubigeo: '020202', lon: -71, lat: -17, n: 0, cat: null, verificado: true },
    ], cats)
    expect(fc.features[0].properties).toMatchObject({ u: '010101', n: 2, ver: 1, ver0: 0, color: '#2a78d6' })
    expect(fc.features[1].properties).toMatchObject({ u: '020202', n: 0, ver: 1, ver0: 1, color: '#141414' })
    expect(fc.features[0].geometry).toEqual({ type: 'Point', coordinates: [-77, -6] })
  })
})

describe('nombresProvincia', () => {
  const geo = { type: 'FeatureCollection', features: [
    { type: 'Feature', properties: { clave: 'PUNO|SAN ROMAN', DEPARTAMEN: 'PUNO', PROVINCIA: 'SAN ROMAN' }, geometry: { type: 'Polygon', coordinates: [] } },
  ] } as unknown as FeatureCollection
  it('devuelve departamento y provincia de la geometría, aunque no haya distritos con denuncias', () => {
    expect(nombresProvincia(geo, 'PUNO|SAN ROMAN')).toEqual({ departamento: 'PUNO', provincia: 'SAN ROMAN' })
  })
  it('si la clave no existe, cae al texto de la clave', () => {
    expect(nombresProvincia(geo, 'ICA|PISCO')).toEqual({ departamento: 'ICA', provincia: 'PISCO' })
  })
})

describe('enriquecimiento de geometrías', () => {
  const vacio = { type: 'Polygon', coordinates: [] } as const
  it('provincias: suma denuncias y distritos por clave', () => {
    const geo = { type: 'FeatureCollection', features: [
      { type: 'Feature', properties: { clave: 'LIMA|YAUYOS' }, geometry: vacio },
      { type: 'Feature', properties: { clave: 'ICA|ICA' }, geometry: vacio },
    ] } as unknown as FeatureCollection
    const r = enriquecerProvincias(geo, [
      caso({ item: 1, clave_provincia: 'LIMA|YAUYOS', ubigeo_inei: '151001' }),
      caso({ item: 2, clave_provincia: 'LIMA|YAUYOS', ubigeo_inei: '151002' }),
      caso({ item: 3, clave_provincia: 'LIMA|YAUYOS', ubigeo_inei: '151002' }),
      caso({ item: 4, clave_provincia: null, ubigeo_inei: null }),
    ])
    expect(r.features.map((f) => f.properties)).toEqual([
      { clave: 'LIMA|YAUYOS', n: 3, nd: 2 }, { clave: 'ICA|ICA', n: 0, nd: 0 },
    ])
  })
  it('distritos: agrega n, ver y al', () => {
    const geo = { type: 'FeatureCollection', features: [
      { type: 'Feature', properties: { ubigeo_inei: '010101' }, geometry: vacio },
      { type: 'Feature', properties: { ubigeo_inei: '020202' }, geometry: vacio },
    ] } as unknown as FeatureCollection
    const r = enriquecerDistritos(geo, [
      distrito({ ubigeo_inei: '010101', denuncias: 2 }),
      distrito({ ubigeo_inei: '020202', denuncias: 0, verificacion: VERIFICACION }),
    ], new Set(['010101']))
    expect(r.features.map((f) => f.properties)).toEqual([
      { ubigeo_inei: '010101', n: 2, ver: 0, al: 1 }, { ubigeo_inei: '020202', n: 0, ver: 1, al: 0 },
    ])
  })
})
