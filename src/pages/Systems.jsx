import { Link } from 'react-router-dom'
import { SYSTEMS, organsInSystem } from '../data/catalog.js'
import { SystemIcon } from '../components/icons.jsx'

export default function Systems() {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Organ systems</p>
      <h1 className="font-display mt-2 text-4xl text-white">Eight systems of the body</h1>
      <p className="mt-3 max-w-3xl text-slate-300">
        Each system has its own 3D view, a description, the organs that belong to it, and the jobs those organs do. Choose one to study it without the rest of the body crowding the screen.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {SYSTEMS.map((system) => (
          <Link key={system.id} to={`/systems/${system.id}`} className="glass-card p-5 transition hover:-translate-y-0.5">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/5" style={{ color: system.color }}>
                <SystemIcon name={system.icon} />
              </span>
              <div>
                <h2 className="text-xl font-bold text-white">{system.name}</h2>
                <p className="text-xs font-semibold text-slate-400">{organsInSystem(system.id).length} structures in the model</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{system.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
