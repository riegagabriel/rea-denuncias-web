import type { CSSProperties } from 'react'
import type { Categoria } from '../tipos'
import { COLOR_SIN_DENUNCIAS, ESCALA_DENUNCIAS } from './estiloBase'

export function LeyendaTerritorio() {
  return (
    <div className="leyenda leyenda-territorio">
      <p className="ley-frase">
        El color muestra <b>dónde se concentran las denuncias</b>: cuanto más oscuro, más denuncias en la provincia.
      </p>
      <div className="escala" role="img" aria-label="Denuncias por provincia: sin denuncias, 1, 2 a 3, 4 a 6, 7 o más">
        <span className="escala-tramo" style={{ '--c': COLOR_SIN_DENUNCIAS } as CSSProperties}><i />0</span>
        {ESCALA_DENUNCIAS.map((s) => (
          <span className="escala-tramo" key={s.desde} style={{ '--c': s.color } as CSSProperties}><i />{s.etiqueta}</span>
        ))}
      </div>
      <div className="ley-item ley-grande">
        <span className="marca"><span className="punto-ver" /></span>
        <span><b>Distrito donde ya se realizó verificación domiciliaria</b></span>
      </div>
      <div className="ley-item">
        <span className="marca"><span className="bandera-mini">⚑</span></span>
        <span><b>Posible conflicto o violencia</b><small>Distrito con al menos una denuncia que advierte ese riesgo.</small></span>
      </div>
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
        <span><span className="anillo" />Distrito donde ya se realizó verificación domiciliaria</span>
        <span><span className="bandera-mini">⚑</span> Posible conflicto o violencia</span>
        <span>Tamaño del punto: n.º de denuncias</span>
      </div>
    </div>
  )
}
