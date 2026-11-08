import { useEffect, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { organTrie } from '../lib/structures.js'
import { systemById } from '../data/catalog.js'

export default function SearchBox({ onPick, placeholder = 'Search heart, brain, lungs, kidney…' }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)
  const results = query.trim().length >= 1 ? organTrie.suggest(query, 6) : []

  useEffect(() => {
    function onDoc(event) {
      if (!boxRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDoc)
    return () => document.removeEventListener('pointerdown', onDoc)
  }, [])

  function choose(organ) {
    setQuery(organ.name)
    setOpen(false)
    onPick(organ)
  }

  return (
    <div ref={boxRef} className="relative w-full max-w-xl">
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cyan-200" />
      <input
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        aria-label="Search organs"
        className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-400 focus:border-cyan-300/60"
      />
      {open && results.length > 0 && (
        <ul className="absolute z-40 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0c1730] shadow-2xl">
          {results.map((organ) => (
            <li key={organ.id}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-white/5"
                onClick={() => choose(organ)}
              >
                <span className="font-semibold text-white">{organ.name}</span>
                <span className="text-xs text-slate-400">{systemById(organ.system)?.short}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
