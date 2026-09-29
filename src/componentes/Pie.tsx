import type { Config } from '../tipos'

export default function Pie({ config }: { config: Config }) {
  return (
    <footer className="pie">
      <img src="/reniec-logo.png" alt="RENIEC" onError={(e) => (e.currentTarget.style.display = 'none')} />
      <p>{config.pie}</p>
    </footer>
  )
}
