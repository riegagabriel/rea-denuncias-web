import { useDatos } from './hooks/useDatos'

export default function App() {
  const { datos, error } = useDatos()
  if (error) return <p>Error: {error}</p>
  if (!datos) return <p>Cargando…</p>
  return <p id="humo">{datos.meta.cifras.denuncias} denuncias · corte {datos.meta.corte}</p>
}
