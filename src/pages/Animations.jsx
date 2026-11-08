import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Pause, Play, RotateCcw } from 'lucide-react'
import BodyViewer from '../components/BodyViewer.jsx'
import { ANIMATIONS } from '../data/animations.js'
import { DEFAULT_VISIBLE_SYSTEMS } from '../data/catalog.js'

export default function Animations() {
  const [params, setParams] = useSearchParams()
  const initial = ANIMATIONS.some((item) => item.id === params.get('mode')) ? params.get('mode') : 'heartbeat'
  const [mode, setMode] = useState(initial)
  const [playing, setPlaying] = useState(true)
  const [token, setToken] = useState(0)
  const [phase, setPhase] = useState(ANIMATIONS.find((item) => item.id === initial).detail)
  const current = ANIMATIONS.find((item) => item.id === mode)

  function choose(id) {
    setMode(id)
    setPlaying(true)
    setToken((value) => value + 1)
    setParams({ mode: id }, { replace: true })
    setPhase(ANIMATIONS.find((item) => item.id === id).detail)
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Body functions</p>
      <h1 className="font-display mt-2 text-4xl text-white">Animations</h1>
      <p className="mt-2 max-w-3xl text-slate-300">
        These are teaching animations. The heartbeat squeezes, the lungs change volume with the diaphragm, blood particles follow the circulation graph, and a bolus follows the digestion linked list.
      </p>
      <div className="mt-5 grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="space-y-2">
          {ANIMATIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => choose(item.id)}
              className={`w-full rounded-2xl border px-4 py-3 text-left ${mode === item.id ? 'border-cyan-300 bg-cyan-300/10' : 'border-white/10 bg-white/5'}`}
            >
              <p className="font-bold text-white">{item.title}</p>
              <p className="text-sm text-slate-300">{item.summary}</p>
            </button>
          ))}
        </div>
        <div>
          <BodyViewer
            className="h-[58vh] min-h-[380px]"
            systems={DEFAULT_VISIBLE_SYSTEMS}
            selectedOrganId={current.focus[0]}
            animation={{ id: mode, playing, token }}
            onAnimationEvent={(event) => setPhase(event.label)}
            onSelect={() => {}}
          />
          <div className="glass-card mt-4 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className="btn-primary" onClick={() => setPlaying((value) => !value)}>
                {playing ? <Pause size={16} /> : <Play size={16} />} {playing ? 'Pause' : 'Play'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setToken((value) => value + 1)
                  setPlaying(false)
                }}
              >
                <RotateCcw size={16} /> Reset
              </button>
              <p className="text-sm font-semibold text-cyan-200">{phase}</p>
            </div>
            <h2 className="font-display mt-4 text-2xl text-white">{current.title}</h2>
            <p className="mt-2 leading-relaxed text-slate-300">{current.detail}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
