import logoUrl from '../assets/reniec-logo.png'
import type { Config } from '../tipos'

export default function Pie({ config }: { config: Config }) {
  return (
    <footer className="pie">
      <div className="pie-in">
        <img src={logoUrl} alt="RENIEC" onError={(e) => (e.currentTarget.style.display = 'none')} />
        <p>{config.pie}</p>
      </div>
    </footer>
  )
}
