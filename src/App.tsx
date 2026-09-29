import { useCallback, useRef, useState } from 'react'
import { useDatos } from './hooks/useDatos'
import Mapas from './mapas/Mapas'
import type { Fondo, Seleccion } from './tipos'

export default function App() {
  const { datos, error } = useDatos()
  const [seleccion, setSeleccion] = useState<Seleccion>({ tipo: 'ninguna' })
  const [fondo, setFondo] = useState<Fondo>('gris')
  const [activas, setActivas] = useState<ReadonlySet<number>>(() => new Set([1, 2, 3, 4, 5]))
  const acercar = useRef<(bbox: [number, number, number, number]) => void>(() => {})

  const alternar = useCallback((id: number) => {
    setActivas((prev) => {
      const s = new Set(prev)
      if (s.has(id)) s.delete(id)
      else s.add(id)
      return s
    })
  }, [])

  if (error) return <div className="estado estado-error">Error cargando datos: {error}</div>
  if (!datos) return <div className="estado">Cargando denuncias REA…</div>
  return (
    <div className="principal">
      <div className="columna-mapas">
        <Mapas
          datos={datos} fondo={fondo} seleccion={seleccion} activas={activas} pestana="territorio"
          alCambiarFondo={setFondo} alAlternarCategoria={alternar}
          alSeleccionarDistrito={(u) => setSeleccion({ tipo: 'distrito', ubigeo: u })}
          alSeleccionarProvincia={(k) => setSeleccion({ tipo: 'provincia', clave: k })}
          alLimpiar={() => setSeleccion({ tipo: 'ninguna' })}
          registrarAcercar={(fn) => { acercar.current = fn }}
        />
      </div>
    </div>
  )
}
