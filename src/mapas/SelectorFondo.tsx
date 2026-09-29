import { FONDOS } from './estiloBase'
import type { Fondo } from '../tipos'

interface Props {
  fondo: Fondo
  aviso: string | null
  alCambiar(f: Fondo): void
}

export default function SelectorFondo({ fondo, aviso, alCambiar }: Props) {
  const actual = FONDOS.find((f) => f.id === fondo)
  return (
    <div className="fondo-selector" role="group" aria-label="Mapa base">
      <span>Fondo:</span>
      {FONDOS.map((f) => (
        <button key={f.id} type="button" aria-pressed={f.id === fondo} onClick={() => alCambiar(f.id)}>
          {f.etiqueta}
        </button>
      ))}
      <small className="atribucion">{aviso ?? actual?.atribucion}</small>
    </div>
  )
}
