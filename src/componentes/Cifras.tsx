import type { CSSProperties } from 'react'
import type { Datos } from '../tipos'
import { ciudadanosPorCategoria, formatoMiles } from '../logica/agregados'

export default function Cifras({ datos }: { datos: Datos }) {
  const { cifras } = datos.meta
  const ids = datos.config.categorias.map((c) => c.id)
  const filas = ciudadanosPorCategoria(datos.casos, ids)
  const max = Math.max(1, ...filas.map((f) => f.ciudadanos))
  const cajas = [
    { valor: cifras.denuncias, etiqueta: 'Denuncias' },
    { valor: cifras.distritos, etiqueta: 'Distritos' },
    { valor: cifras.departamentos, etiqueta: 'Departamentos' },
    { valor: cifras.ciudadanos, etiqueta: `Ciudadanos (dato en ${cifras.ciudadanos_con_dato} de ${cifras.denuncias})` },
  ]
  return (
    <section className="cifras" aria-label="Cifras del corte">
      <div className="cifras-num">
        {cajas.map((c) => (
          <div className="cifra" key={c.etiqueta}>
            <b>{formatoMiles(c.valor)}</b>
            <span>{c.etiqueta}</span>
          </div>
        ))}
      </div>
      <div className="cifra cifra-ancha">
        <span>Ciudadanos por categoría</span>
        {filas.map((f) => {
          const cat = datos.config.categorias.find((c) => c.id === f.cat)
          return (
            <div className="fila-ciud" key={f.cat} style={{ '--c': cat?.color } as CSSProperties}>
              <span className="t">{cat?.nombre}</span>
              <span className="b"><i style={{ width: `${(f.ciudadanos / max) * 100}%` }} /></span>
              <span>{f.ciudadanos > 0 ? formatoMiles(f.ciudadanos) : 'sin dato'}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
