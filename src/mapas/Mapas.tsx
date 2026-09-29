import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Datos, Fondo, Seleccion } from '../tipos'
import { conteoPorCategoria } from '../logica/agregados'
import { ControladorMapas, type Callbacks } from './controlador'
import { LeyendaCasos, LeyendaTerritorio } from './Leyendas'
import SelectorFondo from './SelectorFondo'

interface Props {
  datos: Datos
  fondo: Fondo
  seleccion: Seleccion
  activas: ReadonlySet<number>
  pestana: 'territorio' | 'casos'
  alCambiarFondo(f: Fondo): void
  alAlternarCategoria(id: number): void
  alSeleccionarDistrito(u: string): void
  alSeleccionarProvincia(k: string): void
  alLimpiar(): void
  registrarAcercar(fn: (bbox: [number, number, number, number]) => void): void
}

export default function Mapas(p: Props) {
  const contT = useRef<HTMLDivElement | null>(null)
  const contC = useRef<HTMLDivElement | null>(null)
  const ctl = useRef<ControladorMapas | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const conteo = useMemo(() => conteoPorCategoria(p.datos.casos), [p.datos.casos])

  // Los callbacks cambian en cada render; el controlador guarda uno estable que consulta el último.
  const ultimos = useRef(p)
  ultimos.current = p
  const estables = useRef<Callbacks>({
    alSeleccionarDistrito: (u) => ultimos.current.alSeleccionarDistrito(u),
    alSeleccionarProvincia: (k) => ultimos.current.alSeleccionarProvincia(k),
    alLimpiar: () => ultimos.current.alLimpiar(),
    alFalloFondo: () => setAviso('⚠ No se pudo cargar el fondo (¿red bloqueada?). Use «Sin fondo».'),
  })

  useEffect(() => {
    if (!contT.current || !contC.current) return
    const c = new ControladorMapas(contT.current, contC.current, p.datos, ultimos.current.fondo, ultimos.current.seleccion, ultimos.current.activas, estables.current)
    ctl.current = c
    p.registrarAcercar((bbox) => c.acercarA(bbox))
    return () => {
      c.destruir()
      ctl.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.datos])

  useEffect(() => {
    setAviso(null)
    ctl.current?.setFondo(p.fondo)
  }, [p.fondo])
  useEffect(() => ctl.current?.setSeleccion(p.seleccion), [p.seleccion])
  useEffect(() => ctl.current?.setActivas(p.activas), [p.activas])
  useEffect(() => ctl.current?.redimensionar(), [p.pestana])

  return (
    <section className="mapas" data-pestana={p.pestana}>
      <SelectorFondo fondo={p.fondo} aviso={aviso} alCambiar={p.alCambiarFondo} />
      <div className="fila-mapas">
        <article className="tarjeta tarjeta-territorio">
          <header className="tarjeta-cab">
            <h2>Territorio</h2>
            <p>¿Dónde se concentra y dónde ya verificamos?</p>
          </header>
          <div className="mapa" ref={contT} aria-label="Mapa de territorio: denuncias por provincia" />
          <LeyendaTerritorio />
        </article>
        <article className="tarjeta tarjeta-casos">
          <header className="tarjeta-cab">
            <h2>Casos</h2>
            <p>¿Qué tipo de problema hay y dónde hay alerta?</p>
          </header>
          <div className="mapa" ref={contC} aria-label="Mapa de casos: un punto por distrito" />
          <LeyendaCasos categorias={p.datos.config.categorias} conteo={conteo} activas={p.activas} alAlternar={p.alAlternarCategoria} />
        </article>
      </div>
    </section>
  )
}
