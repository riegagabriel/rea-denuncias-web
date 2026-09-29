import { useEffect, useState } from 'react'
import { cargarDatos } from '../datos'
import type { Datos } from '../tipos'

export interface EstadoDatos {
  datos: Datos | null
  error: string | null
}

export function useDatos(): EstadoDatos {
  const [estado, setEstado] = useState<EstadoDatos>({ datos: null, error: null })
  useEffect(() => {
    let cancelado = false
    cargarDatos()
      .then((datos) => !cancelado && setEstado({ datos, error: null }))
      .catch((e: Error) => !cancelado && setEstado({ datos: null, error: e.message }))
    return () => {
      cancelado = true
    }
  }, [])
  return estado
}
