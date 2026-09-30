import { useMemo, useState } from 'react'
import type { Caso, Config, Seleccion } from '../tipos'
import { filtrarCascada, formatoFecha, formatoMiles, opcionesCascada } from '../logica/agregados'

interface Props {
  casos: Caso[]
  config: Config
  seleccion: Seleccion
  alSeleccionarDistrito(u: string): void
}

export default function TablaCasos({ casos, config, seleccion, alSeleccionarDistrito }: Props) {
  const [f, setF] = useState({ departamento: '', provincia: '', distrito: '' })
  const opciones = useMemo(() => opcionesCascada(casos, f), [casos, f])
  const filtrados = useMemo(() => filtrarCascada(casos, f), [casos, f])
  const ubigeoSel = seleccion.tipo === 'distrito' ? seleccion.ubigeo : null

  return (
    <section className="tarjeta tabla-tarjeta">
      <header className="tarjeta-cab">
        <h2>Detalle por denuncia</h2>
        <p>Filtre por territorio; al hacer clic en una fila se abre el distrito en el panel.</p>
      </header>
      <div className="tabla-filtros">
        <label>Departamento{' '}
          <select value={f.departamento} onChange={(e) => setF({ departamento: e.target.value, provincia: '', distrito: '' })}>
            <option value="">Todos</option>
            {opciones.departamentos.map((d) => <option key={d}>{d}</option>)}
          </select>
        </label>
        <label>Provincia{' '}
          <select value={f.provincia} onChange={(e) => setF({ ...f, provincia: e.target.value, distrito: '' })}>
            <option value="">Todas</option>
            {opciones.provincias.map((p) => <option key={p}>{p}</option>)}
          </select>
        </label>
        <label>Distrito{' '}
          <select value={f.distrito} onChange={(e) => setF({ ...f, distrito: e.target.value })}>
            <option value="">Todos</option>
            {opciones.distritos.map((d) => <option key={d}>{d}</option>)}
          </select>
        </label>
        <span className="tabla-contador">{filtrados.length} de {casos.length}</span>
      </div>
      <div className="tabla-scroll">
        <table>
          <thead>
            <tr>
              <th>Ítem</th><th>Fecha</th><th>Departamento</th><th>Provincia</th><th>Distrito</th>
              <th>Categoría</th><th>Canal</th><th>Ciudadanos</th><th>Observación</th><th>Documento</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((c) => {
              const cat = config.categorias.find((k) => k.id === c.cat)
              const clicable = c.ubigeo_inei !== null
              return (
                <tr
                  key={c.item}
                  aria-selected={c.ubigeo_inei !== null && c.ubigeo_inei === ubigeoSel}
                  style={{ cursor: clicable ? 'pointer' : 'default' }}
                  onClick={() => c.ubigeo_inei && alSeleccionarDistrito(c.ubigeo_inei)}
                >
                  <td>{c.item}{c.alerta ? ' ⚑' : ''}</td>
                  <td>{formatoFecha(c.fecha)}</td>
                  <td>{c.departamento || '—'}</td>
                  <td>{c.provincia || '—'}</td>
                  <td>{c.distrito || '—'}</td>
                  <td><span className="chip-cat" style={{ background: cat?.color }}>{cat?.nombre}</span></td>
                  <td>{c.canal}</td>
                  <td>{formatoMiles(c.ciudadanos)}</td>
                  <td className="col-obs">{c.observacion}</td>
                  <td className="col-doc">{c.documento}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
