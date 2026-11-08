import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Activity,
  BookOpen,
  Box,
  GraduationCap,
  HeartPulse,
  House,
  Info,
  Menu,
  Network,
  X,
} from 'lucide-react'
import SearchBox from './SearchBox.jsx'

const LINKS = [
  { to: '/', label: 'Home', icon: House, end: true },
  { to: '/explorer', label: '3D Body Explorer', icon: Box },
  { to: '/systems', label: 'Organ Systems', icon: Network },
  { to: '/learn', label: 'Learning Mode', icon: GraduationCap },
  { to: '/animations', label: 'Animations', icon: Activity },
  { to: '/quiz', label: 'Quiz Center', icon: BookOpen },
  { to: '/progress', label: 'My Progress', icon: HeartPulse },
  { to: '/diseases', label: 'Disease Information', icon: HeartPulse },
  { to: '/about', label: 'About Project', icon: Info },
]

const MOBILE = [
  { to: '/', label: 'Home', icon: House, end: true },
  { to: '/explorer', label: '3D', icon: Box },
  { to: '/systems', label: 'Systems', icon: Network },
  { to: '/quiz', label: 'Quiz', icon: BookOpen },
]

function Item({ to, label, icon: Icon, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
          isActive ? 'bg-cyan-300 text-slate-950' : 'text-slate-300 hover:bg-white/5 hover:text-white'
        }`
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  )
}

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [more, setMore] = useState(false)
  const explorer = location.pathname === '/explorer'

  if (explorer) {
    return (
      <div className="h-dvh w-full overflow-hidden bg-[#07101c] text-slate-100">
        <Outlet />
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[#07101c] text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/10 bg-[#0a1426]/95 px-4 py-5 lg:flex">
        <NavLink to="/" className="px-2">
          <p className="font-display text-2xl text-white">3D Anatomy</p>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300">Learning system</p>
        </NavLink>
        <nav className="mt-6 flex flex-1 flex-col gap-1 overflow-auto">
          {LINKS.map((link) => (
            <Item key={link.to} {...link} />
          ))}
        </nav>
        <p className="px-2 pt-4 text-[11px] leading-relaxed text-slate-500">
          Computer Science and Engineering
          <br />
          III Semester – S3-A
        </p>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/10 bg-[#07101c]/85 px-4 py-3 backdrop-blur-md">
          <NavLink to="/" className="font-display text-lg text-white lg:hidden">
            Anatomy
          </NavLink>
          <SearchBox onPick={(organ) => navigate(`/explorer?organ=${organ.id}`)} />
        </header>
        <main className="px-4 py-5 pb-24 lg:px-6 lg:pb-8">
          <div key={location.pathname} className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-around border-t border-white/10 bg-[#0a1426]/95 px-2 py-2 backdrop-blur lg:hidden" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
        {MOBILE.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => `flex flex-1 flex-col items-center gap-1 rounded-xl py-1 text-[11px] font-bold ${isActive ? 'text-cyan-300' : 'text-slate-400'}`}
          >
            <link.icon size={18} />
            {link.label}
          </NavLink>
        ))}
        <button type="button" className="flex flex-1 flex-col items-center gap-1 text-[11px] font-bold text-slate-400" onClick={() => setMore(true)}>
          <Menu size={18} />
          More
        </button>
      </nav>

      {more && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMore(false)}>
          <div className="absolute inset-x-3 bottom-20 rounded-3xl border border-white/10 bg-[#0c1730] p-4" onClick={(event) => event.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between">
              <p className="font-display text-xl text-white">Navigate</p>
              <button type="button" className="btn-quiet" onClick={() => setMore(false)} aria-label="Close menu">
                <X size={16} />
              </button>
            </div>
            <div className="grid gap-1">
              {LINKS.map((link) => (
                <Item key={link.to} {...link} onClick={() => setMore(false)} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
