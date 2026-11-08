import { Link } from 'react-router-dom'
import { organById, systemById } from '../data/catalog.js'
import { SystemIcon } from './icons.jsx'

const QUICK = ['heart', 'cerebrum', 'lung-right', 'kidney-left', 'liver', 'stomach']

export default function OrganPanel({ organId, onSelect, detail = null, className = '', flush = false }) {
  const organ = organId ? organById.get(organId) : null
  const system = organ ? systemById(organ.system) : systemById(detail?.system)
  const frame = flush ? `overflow-auto p-5 ${className}` : `glass-card overflow-auto p-5 ${className}`

  if (!organ && detail?.name) {
    return (
      <aside className={frame}>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">{system?.name || 'Anatomical structure'}</p>
        <h2 className="font-display mt-2 text-3xl text-white">{detail.name}</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          This is the name stored on the Z-Anatomy mesh. It is a real structure in the downloaded model. A full lesson card is written for the major organs; smaller vessels, ligaments, and nerves keep their atlas name here.
        </p>
      </aside>
    )
  }

  if (!organ) {
    return (
      <aside className={frame}>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Organ information</p>
        <h2 className="font-display mt-2 text-2xl text-white">Select a structure</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          Click a part of the 3D model, or jump to one of the examples below. The body stays in the centre while this panel shows the details.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {QUICK.map((id) => (
            <button key={id} type="button" className="btn-quiet" onClick={() => onSelect(id)}>
              {organById.get(id)?.name}
            </button>
          ))}
        </div>
      </aside>
    )
  }

  return (
    <aside className={flush ? frame : `glass-card max-h-[78vh] overflow-auto p-5 lg:max-h-[calc(100dvh-8.5rem)] ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">{system?.name}</p>
          <h2 className="font-display mt-1 text-3xl text-white">{organ.name}</h2>
          {detail?.name && detail.name !== organ.name && (
            <p className="mt-1 text-sm font-semibold text-cyan-100">Selected structure: {detail.name}</p>
          )}
          {organ.modelNote && <p className="mt-2 text-sm text-amber-200">{organ.modelNote}</p>}
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/5" style={{ color: system?.color }}>
          <SystemIcon name={system?.icon} />
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-200">{organ.summary}</p>
      <p className="mt-3 text-sm leading-relaxed text-slate-300">{organ.description}</p>

      <Section title="Location">{organ.location}</Section>
      <Section title="Structure">{organ.structure}</Section>
      <Section title="Main functions">
        <ul className="space-y-1.5">
          {organ.functions.map((item) => (
            <li key={item} className="text-sm text-slate-200">• {item}</li>
          ))}
        </ul>
      </Section>
      <Section title="Important parts">
        <ul className="space-y-2">
          {organ.parts.map((part) => (
            <li key={part.name} className="rounded-xl bg-white/5 px-3 py-2">
              <p className="text-sm font-bold text-white">{part.name}</p>
              <p className="text-sm text-slate-300">{part.detail}</p>
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Related system">
        <Link to={`/systems/${organ.system}`} className="text-sm font-bold text-cyan-300">
          Open the {system?.name}
        </Link>
      </Section>
      <Section title="Interesting facts">
        <ul className="space-y-1.5">
          {organ.facts.map((fact) => (
            <li key={fact} className="text-sm text-slate-200">• {fact}</li>
          ))}
        </ul>
      </Section>
    </aside>
  )
}

function Section({ title, children }) {
  return (
    <section className="mt-4">
      <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{title}</h3>
      <div className="mt-1.5 text-sm leading-relaxed text-slate-200">{children}</div>
    </section>
  )
}
