import type { Datos } from '../tipos'
import { contarAlertas, nombresProvincia } from '../logica/agregados'

interface Props {
  datos: Datos
  clave: string
  alSeleccionarDistrito(u: string): void
  alLimpiar(): void
}

export default function PanelProvincia({ datos, clave, alSeleccionarDistrito, alLimpiar }: Props) {
  const ds = datos.distritos.filter((d) => d.clave_provincia === clave && d.denuncias > 0).sort((a, b) => b.denuncias - a.denuncias)
  const nombres = nombresProvincia(datos.provincias, clave)
  const total = ds.reduce((s, d) => s + d.denuncias, 0)
  const nAlertas = contarAlertas(datos.casos.filter((c) => c.clave_provincia === clave))
  return (
    <div className="panel-in">
      <div className="panel-cab"><small>{nombres.departamento} · provincia</small><h3>{nombres.provincia}</h3></div>
      <div className="kpis kpis-4">
        <div className="kpi"><b>{total}</b><span>denuncias</span></div>
        <div className={nAlertas > 0 ? 'kpi kpi-alerta' : 'kpi'}><b>{nAlertas}</b><span>con alerta ⚑<em> (posible conflicto o violencia)</em></span></div>
        <div className="kpi"><b>{ds.length}</b><span>distritos con denuncias</span></div>
        <div className="kpi"><b>{ds.filter((d) => d.verificacion).length}</b><span>con verificación realizada</span></div>
      </div>
      {ds.length === 0 && <p className="ayuda">Sin denuncias en esta provincia.</p>}
      {ds.map((d) => (
        <button type="button" className="fila-lista" key={d.ubigeo_inei} onClick={() => alSeleccionarDistrito(d.ubigeo_inei)}>
          <span>{d.distrito} {d.verificacion ? '●' : ''}</span>
          <small>{d.denuncias} denuncia{d.denuncias === 1 ? '' : 's'}</small>
        </button>
      ))}
      <p className="ayuda">● Distrito donde ya se realizó verificación domiciliaria</p>
      <button type="button" className="btn" onClick={alLimpiar}>Volver al resumen</button>
    </div>
  )
}
