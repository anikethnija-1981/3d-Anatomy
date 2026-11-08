import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import BodyViewer from '../components/BodyViewer.jsx'
import OrganPanel from '../components/OrganPanel.jsx'
import { organsInSystem, systemById } from '../data/catalog.js'
import { ANIMATIONS } from '../data/animations.js'

export default function SystemDetail() {
  const { systemId } = useParams()
  const system = systemById(systemId)
  const organs = organsInSystem(systemId)
  const [selected, setSelected] = useState(organs[0]?.id || null)

  if (!system) {
    return (
      <div className="glass-card p-6">
        <h1 className="font-display text-3xl text-white">System not found</h1>
        <Link to="/systems" className="btn-primary mt-4">Back to systems</Link>
      </div>
    )
  }

  const related = ANIMATIONS.filter((item) => item.system === system.id || system.animations.includes(item.id))

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Organ system</p>
      <h1 className="font-display mt-2 text-4xl text-white">{system.name}</h1>
      <p className="mt-3 max-w-3xl text-slate-300">{system.description}</p>
      <div className="mt-5 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <BodyViewer
            className="h-[58vh] min-h-[380px]"
            systems={[system.id]}
            selectedOrganId={selected}
            onSelect={(id) => id && setSelected(id)}
          >
            {system.id === 'reproductive' && (
              <p className="absolute bottom-3 left-3 z-10 max-w-xs rounded-2xl bg-[#07101c]/80 px-3 py-2 text-xs text-amber-100">
                This model export includes testes, prostate, seminal glands, and penis. It does not include a uterus or ovaries.
              </p>
            )}
          </BodyViewer>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Info title="Functions" items={system.functions} />
            <Info title="Important structures" items={system.structures} />
            <Info title="Facts" items={system.facts} />
          </div>
        </div>
        <div className="space-y-4">
          <OrganPanel organId={selected} onSelect={setSelected} />
          <div className="glass-card p-4">
            <h2 className="font-bold text-white">Organs in this system</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {organs.map((organ) => (
                <button key={organ.id} type="button" className="btn-quiet" data-active={selected === organ.id} onClick={() => setSelected(organ.id)}>
                  {organ.name}
                </button>
              ))}
            </div>
            {related.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {related.map((item) => (
                  <Link key={item.id} to={`/animations?mode=${item.id}`} className="text-sm font-bold text-cyan-300">
                    Play {item.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Info({ title, items }) {
  return (
    <section className="glass-card p-4">
      <h2 className="text-sm font-bold text-white">{title}</h2>
      <ul className="mt-2 space-y-1.5">
        {items.map((item) => (
          <li key={item} className="text-sm text-slate-300">• {item}</li>
        ))}
      </ul>
    </section>
  )
}
