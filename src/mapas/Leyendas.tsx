import type { CSSProperties } from 'react'
import type { Categoria } from '../tipos'

export function LeyendaTerritorio() {
  return (
    <div className="leyenda leyenda-fila">
      <span><span className="muestra rayado" />Distrito verificado</span>
      <span><span className="bandera-mini">⚑</span> Alerta</span>
    </div>
  )
}

interface PropsCasos {
  categorias: Categoria[]
  conteo: Record<number, number>
  activas: ReadonlySet<number>
  alAlternar(id: number): void
}

export function LeyendaCasos({ categorias, conteo, activas, alAlternar }: PropsCasos) {
  return (
    <div className="leyenda">
      {categorias.map((c) => (
        <button
          key={c.id}
          type="button"
          className="fila-cat"
          style={{ '--c': c.color } as CSSProperties}
          aria-pressed={activas.has(c.id)}
          onClick={() => alAlternar(c.id)}
        >
          <i />
          <span>
            <b>{c.nombre}</b> <em>{conteo[c.id] ?? 0}</em>
            <small>{c.descripcion}</small>
          </span>
        </button>
      ))}
      <div className="leyenda-pie">
        <span><span className="anillo" />Distrito verificado</span>
        <span><span className="bandera-mini">⚑</span> Alerta</span>
        <span>Tamaño del punto: n.º de denuncias</span>
      </div>
    </div>
  )
}
