import type { Restituidos } from '../tipos'
import { formatoMiles } from '../logica/agregados'

// Origen de los restituidos: barra partida RENIEC / JNE con las dos cifras al pie.
export default function BarraOrigen({ r }: { r: Restituidos }) {
  const pct = r.total ? (r.reniec / r.total) * 100 : 0
  return (
    <>
      <div className="origen" role="img" aria-label={`${r.reniec} restituidos por RENIEC y ${r.jne} por el JNE`}>
        <i className="o-reniec" style={{ width: `${pct}%` }} />
        <i className="o-jne" style={{ width: `${100 - pct}%` }} />
      </div>
      <div className="leyenda-origen">
        <span className="l-reniec"><b>{formatoMiles(r.reniec)}</b> por RENIEC</span>
        <span className="l-jne"><b>{formatoMiles(r.jne)}</b> por JNE</span>
      </div>
    </>
  )
}
