import { useSyncExternalStore } from 'react'

const CONSULTA = '(max-width: 720px)'

function suscribir(cb: () => void): () => void {
  const m = window.matchMedia(CONSULTA)
  m.addEventListener('change', cb)
  return () => m.removeEventListener('change', cb)
}

export function useEsMovil(): boolean {
  return useSyncExternalStore(suscribir, () => window.matchMedia(CONSULTA).matches, () => false)
}
