import type { CSSProperties } from 'react'
import type { Datos, Distrito } from '../tipos'
import { casosDeDistrito, formatoFecha, formatoMiles } from '../logica/agregados'

function BloqueVerificacion({ d }: { d: Distrito }) {
  const v = d.verificacion
  if (!v) return null
  if (v.tipo !== 'resolucion') {
    return (
      <section className="vbox">
        <h4>Verificación domiciliaria</h4>
        <div className="abc">Verificación puntual registrada; sin cifras por situación.</div>
      </section>
    )
  }
  const a = v.A ?? 0
  const b = v.B ?? 0
  const c = v.C ?? 0
  const t = a + b + c || 1
  return (
    <section className="vbox">
      <h4>Verificación domiciliaria</h4>
      <div className="abc">
        Resolución {v.resolucion}
        {v.publicada && ` · publicada ${formatoFecha(v.publicada)}`}
      </div>
      <div className="vbarra" role="img" aria-label={`Reside ${a}, no reside ${b}, dirección no existe ${c}`}>
        <i style={{ width: `${(a / t) * 100}%`, background: '#5b8f5b' }} />
        <i style={{ width: `${(b / t) * 100}%`, background: '#c98f2e' }} />
        <i style={{ width: `${(c / t) * 100}%`, background: '#8a3b3b' }} />
      </div>
      <div className="abc">
        <span><b>{formatoMiles(a)}</b> reside (A)</span>
        <span><b>{formatoMiles(b)}</b> no reside (B)</span>
        <span><b>{formatoMiles(c)}</b> dirección no existe (C)</span>
      </div>
      <div className="abc" style={{ marginTop: 4 }}>{formatoMiles(v.domicilios)} domicilios verificados</div>
      {v.url && (
        <div style={{ marginTop: 6 }}>
          <a className="enlace" href={v.url} target="_blank" rel="noopener noreferrer">Ver resolución (PDF)</a>
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
  const hayAlerta = casos.some((c) => c.alerta)
  return (
    <div className="panel-in">
      <div className="panel-cab"><small>{d.departamento} · {d.provincia}</small><h3>{d.distrito}</h3></div>
      <div className="tags">
        {hayAlerta && <span className="tag tag-alerta">⚑ ALERTA</span>}
        {d.verificacion && <span className="tag tag-ver">▨ Distrito verificado</span>}
      </div>
      <div className="kpis">
        <div className="kpi"><b>{d.denuncias}</b><span>denuncias</span></div>
        <div className="kpi"><b>{formatoMiles(d.ciudadanos)}</b><span>ciudadanos</span></div>
        <div className="kpi"><b>{d.verificacion ? 'Sí' : 'No'}</b><span>verificado</span></div>
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
