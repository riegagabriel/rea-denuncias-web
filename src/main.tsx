import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './estilos.css'
import App from './App.tsx'

// Solo en desarrollo, con ?raf en la URL: si el panel del navegador está oculto, el navegador pausa
// requestAnimationFrame y MapLibre nunca termina de cargar el estilo. Este atajo permite verificar igual.
if (import.meta.env.DEV && new URLSearchParams(location.search).has('raf')) {
  window.requestAnimationFrame = (cb) => window.setTimeout(() => cb(performance.now()), 16)
  window.cancelAnimationFrame = (id) => window.clearTimeout(id)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
