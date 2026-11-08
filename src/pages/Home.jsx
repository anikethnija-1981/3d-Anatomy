import { Link } from 'react-router-dom'
import { Activity, BookOpen, Box, GraduationCap, HeartPulse, Network, Search } from 'lucide-react'
import BodyViewer from '../components/BodyViewer.jsx'
import { DEFAULT_VISIBLE_SYSTEMS, SYSTEMS } from '../data/catalog.js'
import { useProgressStats } from '../context/ProgressContext.jsx'

const FEATURES = [
  { icon: Box, title: 'Interactive 3D Human Body', text: 'Rotate, zoom, and select organs in a full-body model that runs in the browser.' },
  { icon: Network, title: 'Eight Organ Systems', text: 'Circulatory through reproductive, each with organs, functions, and structures.' },
  { icon: Activity, title: 'Animated Body Functions', text: 'Watch the heartbeat, blood flow, breathing, and the path of digestion.' },
  { icon: BookOpen, title: 'Organ Information', text: 'Every selection opens location, structure, function, parts, and facts.' },
  { icon: GraduationCap, title: 'Interactive Quizzes', text: 'Randomized questions across three difficulties, with an explanation after each answer.' },
  { icon: HeartPulse, title: 'Learning Progress Tracking', text: 'Quiz scores and completed lessons stay in this browser through local storage.' },
]

export default function Home() {
  const stats = useProgressStats()
  return (
    <div>
      <section className="grid items-center gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Computer Science and Engineering · S3-A</p>
          <h1 className="font-display mt-3 text-4xl text-white sm:text-5xl lg:text-6xl">Interactive 3D Human Anatomy</h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-300">
            Explore the human body in an interactive 3D environment.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/explorer" className="btn-primary">Start Exploring</Link>
            <Link to="/systems" className="btn-secondary">Explore Organ Systems</Link>
            <Link to="/learn" className="btn-secondary">Learn Anatomy</Link>
            <Link to="/quiz" className="btn-secondary">Quiz Yourself</Link>
          </div>
          {stats.attempts.length > 0 && (
            <p className="mt-5 text-sm text-slate-400">
              You have attempted {stats.attempts.length} quiz{stats.attempts.length === 1 ? '' : 'zes'} · best score {stats.highest}% · lessons {stats.percent}% complete.
            </p>
          )}
        </div>
        <BodyViewer
          className="h-[460px] sm:h-[540px]"
          systems={DEFAULT_VISIBLE_SYSTEMS}
          autoRotate
          showChrome={false}
        >
          <div className="pointer-events-none absolute bottom-4 left-4 rounded-full border border-white/10 bg-[#07101c]/75 px-3 py-1 text-xs font-semibold text-slate-200">
            Z-Anatomy models · drag to rotate · pinch to zoom
          </div>
        </BodyViewer>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-3xl text-white">What you can do here</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="glass-card p-5">
              <feature.icon className="text-cyan-300" size={22} />
              <h3 className="mt-3 text-lg font-bold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-card p-6">
          <h2 className="font-display text-3xl text-white">Eight systems, one body</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Open a system to isolate it in the viewer. Hide the others when you want a clear look at a single pathway.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {SYSTEMS.map((system) => (
              <Link key={system.id} to={`/systems/${system.id}`} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 hover:border-cyan-300/40">
                <p className="font-bold text-white">{system.name}</p>
                <p className="text-sm text-slate-400">{system.summary}</p>
              </Link>
            ))}
          </div>
        </div>
        <div className="glass-card flex flex-col justify-between p-6">
          <div>
            <Search className="text-violet-300" />
            <h2 className="font-display mt-3 text-3xl text-white">Search any organ</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              The search box uses a trie for suggestions and a hash map for exact names. Try Heart, Brain, Lungs, Kidney, Liver, or Stomach.
            </p>
          </div>
          <Link to="/explorer?organ=heart" className="btn-primary mt-6 w-fit">Show the heart</Link>
        </div>
      </section>
    </div>
  )
}
