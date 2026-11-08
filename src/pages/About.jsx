import { useMemo, useState } from 'react'
import { ORGANS, SYSTEMS } from '../data/catalog.js'
import {
  Stack,
  Queue,
  anatomyTree,
  circulationGraph,
  digestionPath,
  exactOrgans,
  organTrie,
  systemicReturnPath,
} from '../lib/structures.js'

function TreeNode({ node, depth = 0 }) {
  const [open, setOpen] = useState(depth < 1)
  const hasChildren = node.children?.length > 0
  return (
    <li className="mt-1">
      <button type="button" className="text-left text-sm text-slate-200" onClick={() => setOpen((value) => !value)}>
        <span className="mr-2 text-cyan-300">{hasChildren ? (open ? '▾' : '▸') : '•'}</span>
        {node.name}
      </button>
      {open && hasChildren && (
        <ul className="ml-4 border-l border-white/10 pl-3">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  )
}

export default function About() {
  const [query, setQuery] = useState('he')
  const [stackText, setStackText] = useState('Heart')
  const [stackView, setStackView] = useState(['Liver'])
  const stack = useMemo(() => {
    const history = new Stack()
    history.push('Liver')
    return history
  }, [])
  const [queueView, setQueueView] = useState(['Name the four chambers', 'Where does gas exchange occur?'])
  const suggestions = organTrie.suggest(query, 5)
  const exact = exactOrgans(query)
  const path = systemicReturnPath

  function pushStack() {
    const name = stackText.trim()
    if (!name) return
    stack.push(name)
    setStackView(stack.toArray())
  }
  function popStack() {
    stack.pop()
    setStackView(stack.toArray())
  }
  function dequeue() {
    const queue = new Queue(queueView)
    queue.dequeue()
    setQueueView(queue.toArray())
  }

  return (
    <div className="space-y-5">
      <section className="glass-card p-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">PBL project</p>
        <h1 className="font-display mt-2 text-4xl text-white">Interactive 3D Human Anatomy Visualization and Learning System</h1>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-400">Department</dt>
            <dd className="mt-1 font-semibold text-white">Computer Science and Engineering</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-400">Semester</dt>
            <dd className="mt-1 font-semibold text-white">III Semester – S3-A</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-400">Purpose</dt>
            <dd className="mt-1 font-semibold text-white">Educational PBL project</dd>
          </div>
        </dl>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-amber-100">
          3D models: BodyParts3D, Database Center for Life Science, CC BY-SA 2.1 Japan. Z-Anatomy, CC BY-SA 4.0. Some adapted structures carry additional licences recorded in License.txt, including University of Dundee content (CC BY 4.0 and CC BY-NC-SA 4.0) and a kidney model by lissiecowley (CC BY-NC 4.0). The original GLB files remain in the project root. Copies used by the site are in public/models/z-anatomy. The files are not Draco-compressed. The viewer still has a Draco loader for a future compressed export.
        </p>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-300">
          This project is developed as an educational PBL project. Students rotate a 3D body, read accurate introductory anatomy, watch four function animations, follow guided lessons, and take randomized quizzes. Progress stays in localStorage. The 3D model is drawn with Three.js so the site works with no extra download. If a Draco-compressed GLB is placed at <span className="text-cyan-200">public/models/body.glb</span> and its mesh names match organ ids, GLTFLoader swaps those meshes in.
        </p>
      </section>

      <section className="glass-card p-6">
        <h2 className="font-display text-2xl text-white">Tree — body, system, organ, part</h2>
        <p className="mt-2 text-sm text-slate-300">
          The anatomy catalog is stored as a tree. The root is the body. Each of the {SYSTEMS.length} systems is a child. Each of the {ORGANS.length} organs hangs under its system, and named parts hang under the organ. Open a node to walk the hierarchy used by the lessons and the information panel.
        </p>
        <ul className="mt-3 max-h-80 overflow-auto rounded-2xl bg-black/20 p-3">
          <TreeNode node={anatomyTree.root} />
        </ul>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="glass-card p-5">
          <h2 className="font-display text-2xl text-white">Trie and hash map — organ search</h2>
          <p className="mt-2 text-sm text-slate-300">
            Every organ name and alias is inserted into a trie, so prefixes such as “he” or “lu” return suggestions without scanning the whole list each keystroke. A hash map stores the same keys for an exact lookup.
          </p>
          <input value={query} onChange={(event) => setQuery(event.target.value)} className="mt-3 w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none" aria-label="Try the trie" />
          <p className="mt-3 text-sm text-slate-400">Trie suggestions</p>
          <p className="text-sm text-white">{suggestions.map((organ) => organ.name).join(', ') || 'No prefix match'}</p>
          <p className="mt-2 text-sm text-slate-400">Hash map exact match</p>
          <p className="text-sm text-white">{exact.map((organ) => organ.name).join(', ') || 'No exact key'}</p>
        </article>
        <article className="glass-card p-5">
          <h2 className="font-display text-2xl text-white">Graph — blood circulation</h2>
          <p className="mt-2 text-sm text-slate-300">
            Chambers and vessels are nodes. Directed edges are the only legal direction of flow. Breadth-first search on that graph answers “how does blood get from the left ventricle back to the right atrium?”
          </p>
          <p className="mt-3 text-sm font-semibold text-cyan-200">{path.join(' → ')}</p>
          <p className="mt-2 text-xs text-slate-400">{circulationGraph.adj.size} nodes in the circulation graph. The same route drives the particle animation.</p>
        </article>
      </section>

      <section className="glass-card p-5">
        <h2 className="font-display text-2xl text-white">Linked list — digestion pathway</h2>
        <p className="mt-2 text-sm text-slate-300">
          Each stop points only to the next one. That is the order of the bolus animation, from the mouth to the rectum.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {digestionPath.toArray().map((step, index, all) => (
            <span key={step} className="flex items-center gap-2 text-sm font-semibold text-white">
              <span className="rounded-full bg-white/10 px-3 py-1">{step}</span>
              {index < all.length - 1 && <span className="text-cyan-300">→</span>}
            </span>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="glass-card p-5">
          <h2 className="font-display text-2xl text-white">Stack — navigation history</h2>
          <p className="mt-2 text-sm text-slate-300">
            The body explorer pushes the previous organ when you select a new one. Previous organ pops the stack. The same Stack class is used here.
          </p>
          <div className="mt-3 flex gap-2">
            <input value={stackText} onChange={(event) => setStackText(event.target.value)} className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none" aria-label="Stack value" />
            <button type="button" className="btn-primary" onClick={pushStack}>Push</button>
            <button type="button" className="btn-secondary" onClick={popStack}>Pop</button>
          </div>
          <p className="mt-3 text-sm text-slate-300">Bottom → top: {stackView.join(' · ') || 'empty'}</p>
        </article>
        <article className="glass-card p-5">
          <h2 className="font-display text-2xl text-white">Queue — quiz order</h2>
          <p className="mt-2 text-sm text-slate-300">
            A quiz round is enqueued after shuffling. Next question dequeues. You only move forward, which is what a queue is for. Answered questions are also pushed onto a stack so the result page can review them.
          </p>
          <button type="button" className="btn-primary mt-3" onClick={dequeue} disabled={queueView.length === 0}>Dequeue next</button>
          <ol className="mt-3 space-y-1 text-sm text-slate-200">
            {queueView.map((item, index) => (
              <li key={item}>{index === 0 ? 'Front: ' : ''}{item}</li>
            ))}
            {queueView.length === 0 && <li>Queue empty</li>}
          </ol>
        </article>
      </section>
    </div>
  )
}
