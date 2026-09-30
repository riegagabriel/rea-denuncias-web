import { useCallback, useRef, useState } from 'react'
import Cifras from './componentes/Cifras'
import { BarrasDepartamento, DonaCanal, LineaTiempo } from './componentes/Graficos'
import Encabezado from './componentes/Encabezado'
import Panel from './componentes/Panel'
import Pie from './componentes/Pie'
import TablaCasos from './componentes/TablaCasos'
import { useDatos } from './hooks/useDatos'
import { useEsMovil } from './hooks/useEsMovil'
import Mapas from './mapas/Mapas'
import type { Fondo, Seleccion } from './tipos'

export default function App() {
  const { datos, error } = useDatos()
  const [seleccion, setSeleccion] = useState<Seleccion>({ tipo: 'ninguna' })
  const [fondo, setFondo] = useState<Fondo>(window.__REA_DATA__ ? 'ninguno' : 'gris')
  const [activas, setActivas] = useState<ReadonlySet<number>>(() => new Set([1, 2, 3, 4, 5]))
  const movil = useEsMovil()
  const [pestana, setPestana] = useState<'territorio' | 'casos'>('territorio')
  const acercar = useRef<(bbox: [number, number, number, number]) => void>(() => {})

  const alternar = useCallback((id: number) => {
    setActivas((prev) => {
      const s = new Set(prev)
      if (s.has(id)) s.delete(id)
      else s.add(id)
      return s
    })
  }, [])
  const alDistrito = useCallback((u: string) => setSeleccion({ tipo: 'distrito', ubigeo: u }), [])
  const alLimpiar = useCallback(() => setSeleccion({ tipo: 'ninguna' }), [])

  if (error) return <div className="estado estado-error">Error cargando datos: {error}</div>
  if (!datos) return <div className="estado">Cargando denuncias REA…</div>

  return (
    <>
      <Encabezado config={datos.config} meta={datos.meta} />
      <Cifras datos={datos} />
      <div className="principal">
        <div className="columna-mapas">
          <div className="pestanas" role="group" aria-label="Mapa visible">
            <button type="button" aria-pressed={pestana === 'territorio'} onClick={() => setPestana('territorio')}>Territorio</button>
            <button type="button" aria-pressed={pestana === 'casos'} onClick={() => setPestana('casos')}>Casos</button>
          </div>
          <Mapas
            datos={datos} fondo={fondo} seleccion={seleccion} activas={activas} pestana={pestana}
            alCambiarFondo={setFondo} alAlternarCategoria={alternar}
            alSeleccionarDistrito={alDistrito}
            alSeleccionarProvincia={(k) => setSeleccion({ tipo: 'provincia', clave: k })}
            alLimpiar={alLimpiar}
            registrarAcercar={(fn) => { acercar.current = fn }}
          />
        </div>
        {movil ? (
          seleccion.tipo !== 'ninguna' && (
            <div className="hoja" role="dialog" aria-label="Detalle de la selección">
              <button type="button" className="btn hoja-cerrar" onClick={alLimpiar}>Cerrar ✕</button>
              <Panel datos={datos} seleccion={seleccion} alSeleccionarDistrito={alDistrito} alLimpiar={alLimpiar} alAcercar={(b) => acercar.current(b)} />
            </div>
          )
        ) : (
          <Panel datos={datos} seleccion={seleccion} alSeleccionarDistrito={alDistrito} alLimpiar={alLimpiar} alAcercar={(b) => acercar.current(b)} />
        )}
      </div>
      <div className="graficos">
        <BarrasDepartamento casos={datos.casos} config={datos.config} />
        <DonaCanal casos={datos.casos} config={datos.config} />
        <LineaTiempo casos={datos.casos} />
      </div>
      <div className="tabla">
        <TablaCasos casos={datos.casos} config={datos.config} seleccion={seleccion} alSeleccionarDistrito={alDistrito} />
      </div>
      <Pie config={datos.config} />
    </>
  )
}
