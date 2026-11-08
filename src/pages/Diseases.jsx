import { Link } from 'react-router-dom'
import { DISEASES } from '../data/diseases.js'
import { organById, systemById } from '../data/catalog.js'

export default function Diseases() {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Classroom health literacy</p>
      <h1 className="font-display mt-2 text-4xl text-white">Disease and health information</h1>
      <div className="mt-4 rounded-2xl border border-amber-300/40 bg-amber-300/10 p-4 text-sm leading-relaxed text-amber-50">
        This section is for learning anatomy. It is not a medical diagnosis tool, and it does not replace a clinician. It does not tell you whether you have a disease.
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {DISEASES.map((disease) => {
          const organ = organById.get(disease.organId)
          const system = systemById(disease.system)
          return (
            <article key={disease.id} className="glass-card p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-300">{system?.name}</p>
              <h2 className="font-display mt-1 text-2xl text-white">{disease.name}</h2>
              <p className="mt-1 text-sm font-semibold text-violet-200">Affected organ: {organ?.name}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-200">{disease.summary}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{disease.detail}</p>
              <p className="mt-3 text-sm text-slate-300"><span className="font-bold text-white">Study link. </span>{disease.learn}</p>
              <Link to={`/explorer?organ=${disease.organId}`} className="mt-4 inline-block text-sm font-bold text-cyan-300">
                Show {organ?.name} in the 3D body
              </Link>
            </article>
          )
        })}
      </div>
    </div>
  )
}
