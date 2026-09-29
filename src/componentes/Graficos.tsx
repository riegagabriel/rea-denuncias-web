import { useEffect, useRef } from 'react'
import * as Plot from '@observablehq/plot'
import type { Caso, Config } from '../tipos'
import { conteoPorCanal } from '../logica/agregados'

function useGrafico(dibujar: (contenedor: HTMLDivElement) => void, deps: unknown[]) {
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const contenedor = ref.current
    if (!contenedor) return
    contenedor.innerHTML = ''
    dibujar(contenedor)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return ref
}

export function BarrasDepartamento({ casos, config }: { casos: Caso[]; config: Config }) {
  const ref = useGrafico(
    (contenedor) => {
      const ids = config.categorias.map((c) => c.id)
      const conTerritorio = casos.filter((c) => c.departamento)
      const nDep = new Set(conTerritorio.map((c) => c.departamento)).size
      contenedor.append(
        Plot.plot({
          marginLeft: 110,
          height: Math.max(220, nDep * 22),
          x: { label: 'Denuncias' },
          y: { label: null },
          color: { domain: ids, range: config.categorias.map((c) => c.color), legend: false },
          marks: [
            Plot.barX(conTerritorio, Plot.groupY({ x: 'count' }, { y: 'departamento', fill: 'cat', sort: { y: '-x' } })),
            Plot.ruleX([0]),
          ],
        }),
      )
    },
    [casos, config],
  )
  return (
    <section className="tarjeta">
      <h2 className="grafico-titulo">Denuncias por departamento</h2>
      <div ref={ref} className="grafico" />
    </section>
  )
}

function trazoDonut(cx: number, cy: number, r: number, r0: number, a0: number, a1: number) {
  const p = (a: number, radio: number) => [cx + radio * Math.sin(a), cy - radio * Math.cos(a)]
  const [x0, y0] = p(a0, r)
  const [x1, y1] = p(a1, r)
  const [x2, y2] = p(a1, r0)
  const [x3, y3] = p(a0, r0)
  const grande = a1 - a0 > Math.PI ? 1 : 0
  return `M${x0},${y0} A${r},${r} 0 ${grande} 1 ${x1},${y1} L${x2},${y2} A${r0},${r0} 0 ${grande} 0 ${x3},${y3} Z`
}

export function DonaCanal({ casos, config }: { casos: Caso[]; config: Config }) {
  const entradas = Object.entries(conteoPorCanal(casos)).sort((a, b) => b[1] - a[1])
  const total = entradas.reduce((s, [, v]) => s + v, 0)
  let sinAsignar = 0
  let acumulado = 0
  const arcos = entradas.map(([canal, valor]) => {
    const color = config.canales[canal] ?? config.canalSinAsignar[sinAsignar++ % config.canalSinAsignar.length]
    const a0 = (acumulado / total) * 2 * Math.PI
    acumulado += valor
    const a1 = (acumulado / total) * 2 * Math.PI
    return { canal, valor, color, pct: Math.round((valor / total) * 100), path: trazoDonut(90, 90, 88, 55, a0, a1) }
  })
  return (
    <section className="tarjeta">
      <h2 className="grafico-titulo">Canal de ingreso</h2>
      <div className="dona">
        <svg viewBox="0 0 180 180" width={180} height={180} role="img" aria-label="Denuncias por canal de ingreso">
          {arcos.map((a) => <path key={a.canal} d={a.path} fill={a.color} />)}
          <text x={90} y={96} textAnchor="middle" fontSize={22} fontWeight={700} fill="currentColor">{total}</text>
        </svg>
        <div className="dona-leyenda">
          {arcos.map((a) => (
            <span key={a.canal}><i style={{ background: a.color }} />{a.canal} · {a.valor} ({a.pct}%)</span>
          ))}
        </div>
      </div>
    </section>
  )
}

export function LineaTiempo({ casos }: { casos: Caso[] }) {
  const ref = useGrafico(
    (contenedor) => {
      const puntos = casos.map((c) => ({ fecha: new Date(`${c.fecha}T00:00:00`) }))
      contenedor.append(
        Plot.plot({
          height: 180,
          marginLeft: 40,
          x: { label: null },
          y: { label: 'Denuncias / semana', grid: true },
          marks: [Plot.rectY(puntos, { ...Plot.binX({ y: 'count' }, { x: 'fecha', interval: 'week' }), fill: '#4a3aa7' }), Plot.ruleY([0])],
        }),
      )
    },
    [casos],
  )
  return (
    <section className="tarjeta ancho">
      <h2 className="grafico-titulo">Denuncias por semana de ingreso</h2>
      <div ref={ref} className="grafico" />
    </section>
  )
}
