import { useEffect, useRef, useState } from 'react'
import { NavLink, useSearchParams } from 'react-router-dom'
import {
  BookOpen,
  ChevronUp,
  GraduationCap,
  HeartPulse,
  Maximize,
  Minimize,
  MoreHorizontal,
  RotateCcw,
  RotateCw,
  Undo2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import BodyViewer from '../components/BodyViewer.jsx'
import OrganPanel from '../components/OrganPanel.jsx'
import SearchBox from '../components/SearchBox.jsx'
import { SystemIcon } from '../components/icons.jsx'
import { DEFAULT_VISIBLE_SYSTEMS, SYSTEMS, organById } from '../data/catalog.js'
import { useProgress } from '../context/ProgressContext.jsx'
import { Stack } from '../lib/structures.js'

const EXTRA = [
  { id: 'joints', short: 'Joints', icon: 'bone' },
  { id: 'lymphatic', short: 'Lymphatic', icon: 'droplets' },
]

const MORE = [
  { to: '/systems', label: 'Organ systems' },
  { to: '/animations', label: 'Animations' },
  { to: '/diseases', label: 'Disease information' },
  { to: '/about', label: 'About project' },
]

const VIEWS = ['front', 'back', 'left', 'right']

export default function Explorer() {
  const [params, setParams] = useSearchParams()
  const organParam = params.get('organ')
  const { visitOrgan } = useProgress()
  const [selected, setSelected] = useState(organParam && organById.has(organParam) ? organParam : null)
  const [systems, setSystems] = useState(DEFAULT_VISIBLE_SYSTEMS)
  const [detail, setDetail] = useState(null)
  const [history, setHistory] = useState([])
  const [view, setView] = useState('front')
  const [spinning, setSpinning] = useState(false)
  const [sheet, setSheet] = useState(null)
  const [more, setMore] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const cssFull = useRef(false)
  const stackRef = useRef(new Stack())
  const selectedRef = useRef(selected)
  const lastParam = useRef(null)
  const shellRef = useRef(null)
  const viewerRef = useRef(null)

  useEffect(() => {
    selectedRef.current = selected
  }, [selected])

  useEffect(() => {
    function onChange() {
      const active = document.fullscreenElement === shellRef.current || document.webkitFullscreenElement === shellRef.current
      if (active) {
        cssFull.current = false
        setFullscreen(true)
      } else if (!cssFull.current) {
        setFullscreen(false)
      }
    }
    document.addEventListener('fullscreenchange', onChange)
    document.addEventListener('webkitfullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      document.removeEventListener('webkitfullscreenchange', onChange)
    }
  }, [])

  useEffect(() => {
    if (!organParam || !organById.has(organParam) || organParam === lastParam.current) return
    lastParam.current = organParam
    const current = selectedRef.current
    if (current && current !== organParam) {
      stackRef.current.push(current)
      setHistory(stackRef.current.toArray())
    }
    selectedRef.current = organParam
    setSelected(organParam)
    visitOrgan(organParam)
    const system = organById.get(organParam).system
    setSystems((list) => (list.includes(system) ? list : [...list, system]))
  }, [organParam, visitOrgan])

  function selectOrgan(id, info) {
    setDetail(info || (id ? { name: organById.get(id)?.name, system: organById.get(id)?.system } : null))
    if (selectedRef.current && id && selectedRef.current !== id) {
      stackRef.current.push(selectedRef.current)
      setHistory(stackRef.current.toArray())
    }
    selectedRef.current = id
    lastParam.current = id
    setSelected(id)
    if (id) {
      visitOrgan(id)
      setParams({ organ: id }, { replace: true })
      const organ = organById.get(id)
      if (organ) setSystems((list) => (list.includes(organ.system) ? list : [...list, organ.system]))
    } else {
      setParams({}, { replace: true })
    }
  }

  function goBack() {
    const previous = stackRef.current.pop()
    setHistory(stackRef.current.toArray())
    if (!previous) return
    selectedRef.current = previous
    lastParam.current = previous
    setSelected(previous)
    setParams({ organ: previous }, { replace: true })
  }

  function toggle(id) {
    setSystems((list) => (list.includes(id) ? list.filter((item) => item !== id) : [...list, id]))
  }

  function toggleFullscreen() {
    const shell = shellRef.current
    if (!shell) return
    const native = document.fullscreenElement || document.webkitFullscreenElement
    if (fullscreen || native) {
      cssFull.current = false
      setFullscreen(false)
      document.exitFullscreen?.().catch(() => {})
      document.webkitExitFullscreen?.()
      return
    }
    cssFull.current = true
    setFullscreen(true)
    const request = shell.requestFullscreen?.bind(shell) || shell.webkitRequestFullscreen?.bind(shell)
    if (!request) return
    Promise.resolve(request()).then(() => {
      if (document.fullscreenElement === shell || document.webkitFullscreenElement === shell) cssFull.current = false
    }).catch(() => {
      cssFull.current = true
    })
  }

  const showSidebars = !fullscreen
  const organName = selected ? organById.get(selected)?.name || detail?.name : null

  return (
    <div ref={shellRef} className={`explorer-shell relative flex w-full min-h-0 min-w-0 max-w-full flex-col overflow-hidden bg-[#07101c] ${fullscreen ? 'fixed inset-0 z-50 h-dvh' : 'h-full'}`}>
      <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-white/10 px-3 py-2 sm:px-4">
        <NavLink to="/" className="shrink-0 leading-none">
          <span className="font-display text-lg text-white sm:text-xl">3D Anatomy</span>
        </NavLink>
        <div className="order-last w-full min-w-0 md:order-none md:w-auto md:flex-1">
          <SearchBox onPick={(organ) => selectOrgan(organ.id)} />
        </div>
        <nav className="ml-auto flex items-center gap-1 md:ml-0">
          <TopLink to="/learn" icon={GraduationCap} label="Learning" />
          <TopLink to="/quiz" icon={BookOpen} label="Quiz" />
          <TopLink to="/progress" icon={HeartPulse} label="Progress" />
          <button type="button" className="btn-quiet" onClick={() => setMore((value) => !value)} aria-expanded={more} aria-label="More pages">
            <MoreHorizontal size={15} />
            <span className="hidden lg:inline">More</span>
          </button>
        </nav>
        <button type="button" className="btn-quiet shrink-0" onClick={toggleFullscreen}>
          {fullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
          <span className="hidden sm:inline">{fullscreen ? 'Exit full screen' : 'Full screen'}</span>
        </button>
      </header>

        {more && showSidebars && (
        <div className="absolute right-3 top-14 z-40 min-w-52 rounded-2xl border border-white/10 bg-[#0c1730] p-2 shadow-2xl">
          {MORE.map((item) => (
            <NavLink key={item.to} to={item.to} className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/5" onClick={() => setMore(false)}>
              {item.label}
            </NavLink>
          ))}
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        {showSidebars && (
          <aside className="hidden w-56 shrink-0 flex-col border-r border-white/10 lg:flex">
            <p className="px-4 pb-2 pt-4 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Organ systems</p>
            <div className="flex-1 space-y-1 overflow-auto px-3 pb-4">
              {SYSTEMS.map((system) => (
                <SystemButton key={system.id} system={system} active={systems.includes(system.id)} onClick={() => toggle(system.id)} />
              ))}
              <p className="px-2 pb-1 pt-4 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Also in the model</p>
              {EXTRA.map((system) => (
                <SystemButton key={system.id} system={system} active={systems.includes(system.id)} onClick={() => toggle(system.id)} />
              ))}
            </div>
          </aside>
        )}

        <div className="relative min-w-0 flex-1">
          <BodyViewer
            ref={viewerRef}
            className="h-full rounded-none border-0"
            systems={systems}
            selectedOrganId={selected}
            onSelect={selectOrgan}
            view={view}
            onViewChange={setView}
            autoRotate={spinning}
            showChrome={false}
            viewsFrameBody
          />
        </div>

        {showSidebars && (
          <aside className="hidden w-[22rem] shrink-0 flex-col border-l border-white/10 lg:flex">
            <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Organ information</p>
              <button type="button" className="btn-quiet" disabled={history.length === 0} onClick={goBack}>
                <Undo2 size={14} /> Previous
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto">
              <OrganPanel organId={selected} detail={detail} onSelect={selectOrgan} flush />
              {history.length > 0 && (
                <p className="px-5 pb-4 text-xs text-slate-400">
                  Navigation stack: {history.map((id) => organById.get(id)?.name).join(' → ')}
                </p>
              )}
            </div>
          </aside>
        )}
      </div>

      {showSidebars && sheet === 'systems' && (
        <div className="absolute inset-x-0 bottom-16 z-30 max-h-[46dvh] overflow-auto border-t border-white/10 bg-[#0c1730] p-3 lg:hidden">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-bold text-white">Organ systems</p>
            <button type="button" className="btn-quiet" onClick={() => setSheet(null)} aria-label="Close systems">
              <X size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[...SYSTEMS, ...EXTRA].map((system) => (
              <SystemButton key={system.id} system={system} active={systems.includes(system.id)} onClick={() => toggle(system.id)} />
            ))}
          </div>
        </div>
      )}

      {showSidebars && sheet === 'info' && (
        <div className="absolute inset-x-0 bottom-16 z-30 max-h-[58dvh] overflow-auto border-t border-white/10 bg-[#0c1730] lg:hidden">
          <div className="flex items-center justify-between px-3 py-2">
            <button type="button" className="btn-quiet" disabled={history.length === 0} onClick={goBack}>
              <Undo2 size={14} /> Previous
            </button>
            <button type="button" className="btn-quiet" onClick={() => setSheet(null)} aria-label="Close organ information">
              <X size={14} />
            </button>
          </div>
          <OrganPanel organId={selected} detail={detail} onSelect={selectOrgan} flush />
        </div>
      )}

      <footer className="flex min-w-0 shrink-0 items-center gap-2 overflow-x-auto border-t border-white/10 px-3 py-2" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
        <button type="button" className="btn-quiet shrink-0 lg:hidden" data-active={sheet === 'systems'} onClick={() => setSheet((value) => (value === 'systems' ? null : 'systems'))}>
          Systems
        </button>
        <button type="button" className="btn-quiet shrink-0 lg:hidden" data-active={sheet === 'info'} onClick={() => setSheet((value) => (value === 'info' ? null : 'info'))}>
          <ChevronUp size={14} />
          {organName || 'Details'}
        </button>
        <span className="mx-1 hidden h-6 w-px bg-white/10 sm:block" />
        <button type="button" className="btn-quiet shrink-0" data-active={spinning} onClick={() => setSpinning((value) => !value)}>
          <RotateCw size={15} /> Rotate
        </button>
        <button type="button" className="btn-quiet shrink-0" onClick={() => viewerRef.current?.zoom(0.82)} aria-label="Zoom in">
          <ZoomIn size={15} /> <span className="hidden sm:inline">Zoom in</span>
        </button>
        <button type="button" className="btn-quiet shrink-0" onClick={() => viewerRef.current?.zoom(1.18)} aria-label="Zoom out">
          <ZoomOut size={15} /> <span className="hidden sm:inline">Zoom out</span>
        </button>
        <button type="button" className="btn-quiet shrink-0" onClick={() => { setView('front'); viewerRef.current?.reset() }}>
          <RotateCcw size={15} /> Reset
        </button>
        {VIEWS.map((item) => (
          <button key={item} type="button" className="btn-quiet shrink-0 capitalize" data-active={view === item} onClick={() => setView(item)}>
            {item}
          </button>
        ))}
      </footer>
    </div>
  )
}

function TopLink({ to, icon: Icon, label }) {
  return (
    <NavLink to={to} className="btn-quiet" aria-label={label}>
      <Icon size={15} />
      <span className="hidden xl:inline">{label}</span>
    </NavLink>
  )
}

function SystemButton({ system, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-active={active}
      className="flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold text-slate-200 hover:bg-white/5 data-[active=true]:bg-cyan-300 data-[active=true]:text-slate-950"
    >
      <SystemIcon name={system.icon} size={16} />
      {system.short}
    </button>
  )
}
