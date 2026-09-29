import type { Datos, Seleccion } from '../tipos'
import PanelDistrito from './PanelDistrito'
import PanelProvincia from './PanelProvincia'
import PanelResumen from './PanelResumen'

interface Props {
  datos: Datos
  seleccion: Seleccion
  alSeleccionarDistrito(u: string): void
  alLimpiar(): void
  alAcercar(bbox: [number, number, number, number]): void
}

export default function Panel({ datos, seleccion, alSeleccionarDistrito, alLimpiar, alAcercar }: Props) {
  return (
    <aside className="tarjeta panel" aria-live="polite" aria-label="Detalle de la selección">
      {seleccion.tipo === 'distrito' && (
        <PanelDistrito datos={datos} ubigeo={seleccion.ubigeo} alAcercar={alAcercar} alLimpiar={alLimpiar} />
      )}
      {seleccion.tipo === 'provincia' && (
        <PanelProvincia datos={datos} clave={seleccion.clave} alSeleccionarDistrito={alSeleccionarDistrito} alLimpiar={alLimpiar} />
      )}
      {seleccion.tipo === 'ninguna' && <PanelResumen datos={datos} />}
    </aside>
  )
}
