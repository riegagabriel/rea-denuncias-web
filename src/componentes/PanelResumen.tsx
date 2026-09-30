import type { CSSProperties } from 'react'
import type { Datos } from '../tipos'
import { formatoMiles } from '../logica/agregados'
import BarraOrigen from './BarraOrigen'

export default function PanelResumen({ datos }: { datos: Datos }) {
  const { meta } = datos
  const { cifras, por_categoria: por, corte } = meta
  const max = Math.max(1, ...Object.values(por))
  return (
    <div className="panel-in">
      <div className="panel-cab"><small>Corte {corte}</small><h3>Resumen</h3></div>
      <div className="kpis">
        <div className="kpi"><b>{cifras.denuncias}</b><span>denuncias</span></div>
        <div className="kpi"><b>{cifras.distritos}</b><span>distritos</span></div>
        <div className="kpi"><b>{formatoMiles(cifras.ciudadanos)}</b><span>ciudadanos ({cifras.ciudadanos_con_dato} con dato)</span></div>
        <div className="kpi kpi-alerta"><b>{cifras.alertas}</b><span>con alerta ⚑<em> (posible conflicto o violencia)</em></span></div>
        <div className="kpi"><b>{cifras.en_distrito_verificado}</b><span>en distrito verificado</span></div>
        <div className="kpi"><b>{cifras.distritos_verificados}</b><span>distritos con verificación realizada</span></div>
      </div>
      {meta.restituidos && (
        <section className="vbox">
          <h4>Ciudadanos restituidos a su domicilio anterior</h4>
          <div className="cifra-v"><b>{formatoMiles(meta.restituidos.total)}</b><span>en {meta.restituidos.distritos} distritos</span></div>
          <BarraOrigen r={meta.restituidos} />
        </section>
      )}
      <strong>Por categoría</strong>
      {datos.config.categorias.map((c) => (
        <div className="barra-cat" key={c.id} style={{ '--c': c.color } as CSSProperties}>
          <span className="t">{c.nombre}</span>
          <span className="b"><i style={{ width: `${((por[String(c.id)] ?? 0) / max) * 100}%` }} /></span>
          <em>{por[String(c.id)] ?? 0}</em>
        </div>
      ))}
      <p className="ayuda">
        Haga clic en un distrito (mapa derecho: punto; izquierdo: contorno) o en una provincia para ver aquí sus denuncias,
        ciudadanos, observaciones y verificaciones.
        {cifras.sin_territorio > 0 && ` ${cifras.sin_territorio} denuncia sin territorio: cuenta en el total, no en el mapa.`}
      </p>
    </div>
  )
}
