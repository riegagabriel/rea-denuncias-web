import type { Datos } from './tipos'

declare global {
  interface Window {
    // Presente solo en el «archivo único» (scripts/empaquetar_html.py): los datos del corte viajan dentro del HTML.
    __REA_DATA__?: Datos
  }
}

export {}
