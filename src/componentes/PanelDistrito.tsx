import type { CSSProperties } from 'react'
import type { Datos, Distrito } from '../tipos'
import BarraOrigen from './BarraOrigen'
import { casosDeDistrito, contarAlertas, formatoFecha, formatoMiles } from '../logica/agregados'

function BloqueVerificacion({ d }: { d: Distrito }) {
  const v = d.verificacion
  const r = d.restituidos
  if (!v && !r) return null
  return (
    <section className="vbox">
      <h4>
        {v ? <><span className="punto-ver punto-ver-sm" />Se realizó verificación domiciliaria</> : 'Sin verificación domiciliaria de RENIEC'}
      </h4>
      {v && (
        <div className="cifra-v">
          {v.tipo === 'resolucion' && v.domicilios !== null
            ? <><b>{formatoMiles(v.domicilios)}</b><span>ciudadanos verificados</span></>
            : <span>Sin cifra de ciudadanos verificados.</span>}
        </div>
      )}
      {r && (
        <div className={v ? 'rest' : 'rest rest-solo'}>
          <div className="cifra-v"><b>{formatoMiles(r.total)}</b><span>ciudadanos restituidos a su domicilio anterior</span></div>
          <BarraOrigen r={r} />
        </div>
      )}
    </section>
  )
}

interface Props {
  datos: Datos
  ubigeo: string
  alAcercar(bbox: [number, number, number, number]): void
  alLimpiar(): void
}

export default function PanelDistrito({ datos, ubigeo, alAcercar, alLimpiar }: Props) {
  const d = datos.distritos.find((x) => x.ubigeo_inei === ubigeo)
  if (!d) return <div className="panel-in"><p>Distrito no encontrado.</p></div>
  const casos = casosDeDistrito(datos.casos, ubigeo)
  const nAlertas = contarAlertas(casos)
  return (
    <div className="panel-in">
      <div className="panel-cab"><small>{d.departamento} · {d.provincia}</small><h3>{d.distrito}</h3></div>
      <div className="tags">
        {nAlertas > 0 && <span className="tag tag-alerta">⚑ {nAlertas} con alerta</span>}
        {d.verificacion && <span className="tag tag-ver">● Verificación realizada</span>}
      </div>
      <div className="kpis">
        <div className="kpi"><b>{d.denuncias}</b><span>denuncias</span></div>
        <div className={nAlertas > 0 ? 'kpi kpi-alerta' : 'kpi'}>
          <b>{nAlertas}</b><span>con alerta ⚑<em> (posible conflicto o violencia)</em></span>
        </div>
        <div className="kpi"><b>{d.restituidos ? formatoMiles(d.restituidos.total) : '—'}</b><span>restituidos</span></div>
      </div>
      {casos.length === 0 && <p className="ayuda">Sin denuncias en este distrito; solo consta la verificación.</p>}
      {casos.map((c) => {
        const cat = datos.config.categorias.find((k) => k.id === c.cat)
        return (
          <article className="caso-card" key={c.item} style={{ '--c': cat?.color } as CSSProperties}>
            <div className="caso-top"><span>Ítem {c.item} · {formatoFecha(c.fecha)}</span><span>{c.canal}</span></div>
            <div className="caso-nombre">{cat?.nombre}</div>
            <div className="caso-top"><span>{c.ciudadanos !== null ? `${formatoMiles(c.ciudadanos)} ciudadanos` : 'Ciudadanos: s/d'}</span></div>
            <div className="caso-top" style={{ fontSize: 11.5 }}>{c.documento}</div>
            <p>{c.observacion}</p>
            {c.localidad_original && <span className="pill">Localidad: {c.localidad_original}</span>}
            {c.posterior_a_resolucion && <span className="pill">Posterior a la resolución de verificación</span>}
            {c.alerta && <div className="albox">⚑ <b>Alerta.</b> {c.alerta_motivo}</div>}
            {c.cat === 5 && !d.verificacion && (
              <div className="nota">Este distrito no figura en la lista de verificaciones publicada; confirmar con Operativo.</div>
            )}
          </article>
        )
      })}
      <BloqueVerificacion d={d} />
      <button type="button" className="btn" onClick={() => alAcercar(d.bbox)}>Acercar al distrito</button>
      <button type="button" className="btn" onClick={alLimpiar}>Volver al resumen</button>
    </div>
  )
}
