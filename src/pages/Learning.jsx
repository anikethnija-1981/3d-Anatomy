import { useMemo, useState } from 'react'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import BodyViewer from '../components/BodyViewer.jsx'
import { LESSONS } from '../data/learning.js'
import { SYSTEMS, systemById } from '../data/catalog.js'
import { useProgress } from '../context/ProgressContext.jsx'

export default function Learning() {
  const { data, toggleLesson } = useProgress()
  const [index, setIndex] = useState(0)
  const [view, setView] = useState(LESSONS[0].view)
  const [picked, setPicked] = useState(LESSONS[0].organId)
  const lesson = LESSONS[index]
  const done = data.completedLessons.includes(lesson.id)
  const progress = useMemo(
    () => Math.round((data.completedLessons.length / LESSONS.length) * 100),
    [data.completedLessons.length],
  )

  function go(next) {
    const clamped = Math.min(LESSONS.length - 1, Math.max(0, next))
    setIndex(clamped)
    setView(LESSONS[clamped].view)
    setPicked(LESSONS[clamped].organId)
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Learning mode</p>
          <h1 className="font-display text-4xl text-white">Guided exploration</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            {data.completedLessons.length} of {LESSONS.length} lessons marked complete · {progress}%
          </p>
        </div>
        <div className="h-2 w-48 overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-cyan-300" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="grid items-start gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <ol className="glass-card max-h-[70vh] space-y-1 overflow-auto p-3">
          {SYSTEMS.map((system) => (
            <li key={system.id}>
              <p className="px-2 pb-1 pt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">{system.short}</p>
              {LESSONS.filter((item) => item.system === system.id).map((item) => {
                const itemIndex = LESSONS.findIndex((lesson) => lesson.id === item.id)
                const active = itemIndex === index
                const complete = data.completedLessons.includes(item.id)
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => go(itemIndex)}
                    className={`flex w-full items-center justify-between rounded-xl px-2 py-2 text-left text-sm ${active ? 'bg-cyan-300 text-slate-950' : 'text-slate-200 hover:bg-white/5'}`}
                  >
                    <span>{item.title}</span>
                    {complete && <Check size={14} />}
                  </button>
                )
              })}
            </li>
          ))}
        </ol>
        <div>
          <BodyViewer
            className="h-[52vh] min-h-[340px]"
            systems={[lesson.system]}
            selectedOrganId={picked}
            sex={lesson.sex}
            view={view}
            onViewChange={setView}
            onSelect={(id) => id && setPicked(id)}
          />
          <article className="glass-card mt-4 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-300">
              Step {index + 1} of {LESSONS.length} · {systemById(lesson.system)?.name}
            </p>
            <h2 className="font-display mt-1 text-3xl text-white">{lesson.title}</h2>
            <p className="mt-2 text-sm font-semibold text-violet-200">Objective: {lesson.objective}</p>
            <p className="mt-3 leading-relaxed text-slate-200">{lesson.text}</p>
            <p className="mt-3 text-sm text-slate-400">{lesson.checkpoint}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" className="btn-secondary" disabled={index === 0} onClick={() => go(index - 1)}>
                <ChevronLeft size={16} /> Previous
              </button>
              <button type="button" className="btn-primary" disabled={index === LESSONS.length - 1} onClick={() => go(index + 1)}>
                Next <ChevronRight size={16} />
              </button>
              <button type="button" className="btn-quiet" data-active={done} onClick={() => toggleLesson(lesson.id)}>
                <Check size={15} /> {done ? 'Completed' : 'Mark as completed'}
              </button>
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}
