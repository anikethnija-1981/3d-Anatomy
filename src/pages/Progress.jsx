import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { SYSTEMS } from '../data/catalog.js'
import { LESSONS } from '../data/learning.js'
import { useProgress, useProgressStats } from '../context/ProgressContext.jsx'

export default function Progress() {
  const { resetProgress, data } = useProgress()
  const stats = useProgressStats()
  const chart = [...stats.attempts].slice(0, 8).reverse().map((attempt, index) => ({
    name: `${index + 1}`,
    score: attempt.percent,
  }))

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Saved in this browser</p>
      <h1 className="font-display mt-2 text-4xl text-white">My progress</h1>
      <p className="mt-2 max-w-3xl text-slate-300">
        Quiz scores and completed lessons are stored with localStorage. Refreshing the page keeps them. Clearing site data removes them.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Quizzes attempted" value={stats.attempts.length} />
        <Stat label="Average score" value={stats.attempts.length ? `${stats.average}%` : '—'} />
        <Stat label="Highest score" value={stats.attempts.length ? `${stats.highest}%` : '—'} />
        <Stat label="Learning progress" value={`${stats.percent}%`} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="glass-card p-5">
          <h2 className="font-bold text-white">Recent quiz scores</h2>
          {chart.length === 0 ? (
            <p className="mt-6 text-sm text-slate-400">Take a quiz to see scores here.</p>
          ) : (
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart}>
                  <CartesianGrid stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ background: '#0c1730', border: '1px solid #155e75', borderRadius: 12 }} />
                  <Bar dataKey="score" fill="#22d3ee" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
        <section className="glass-card p-5">
          <h2 className="font-bold text-white">Completed organ systems</h2>
          <p className="mt-1 text-sm text-slate-400">A system is complete when every guided lesson in it is marked done.</p>
          <ul className="mt-4 space-y-2">
            {SYSTEMS.map((system) => {
              const lessons = LESSONS.filter((lesson) => lesson.system === system.id)
              const done = lessons.filter((lesson) => data.completedLessons.includes(lesson.id)).length
              const complete = done === lessons.length
              return (
                <li key={system.id} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm">
                  <span className="text-white">{system.name}</span>
                  <span className={complete ? 'font-bold text-emerald-300' : 'text-slate-400'}>{done}/{lessons.length}</span>
                </li>
              )
            })}
          </ul>
        </section>
      </div>
      <section className="glass-card mt-4 p-5">
        <h2 className="font-bold text-white">Recent quiz results</h2>
        {stats.attempts.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">No attempts yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-white/10">
            {stats.attempts.slice(0, 8).map((attempt) => (
              <li key={attempt.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <span className="text-slate-300">{new Date(attempt.at).toLocaleString()} · {attempt.difficulty} · {attempt.system}</span>
                <span className="font-bold text-white">{attempt.score}/{attempt.total} · {attempt.percent}%</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-sm text-slate-400">Organs opened: {stats.visits.length}</p>
        <button
          type="button"
          className="btn-secondary mt-4"
          onClick={() => {
            if (window.confirm('Clear saved quizzes and lesson progress on this browser?')) resetProgress()
          }}
        >
          Reset saved progress
        </button>
      </section>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <article className="glass-card p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="font-display mt-2 text-3xl text-white">{value}</p>
    </article>
  )
}
