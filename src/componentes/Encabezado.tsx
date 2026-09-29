import { useState } from 'react'
import type { Config, Meta } from '../tipos'

export default function Encabezado({ config, meta }: { config: Config; meta: Meta }) {
  const [sinLogo, setSinLogo] = useState(false)
  return (
    <header className="encabezado">
      <div className="enc-logo">
        {sinLogo ? (
          <span className="logo-texto">RENIEC</span>
        ) : (
          <img
            src="/reniec-logo.png"
            alt="RENIEC — Registro Nacional de Identificación y Estado Civil"
            onError={() => setSinLogo(true)}
          />
        )}
      </div>
      <div className="enc-titulo">
        <h1>{config.titulo}</h1>
        <p>{config.subtitulo}</p>
      </div>
      <div className="enc-corte">
        <span>Fecha de corte</span>
        <b id="fecha-corte">{meta.corte}</b>
        <small id="fuente-datos" title={meta.nota_ubigeo}>Fuente: {meta.fuente}</small>
      </div>
    </header>
  )
}
