import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { DIFFICULTIES, QUESTIONS } from '../data/quiz.js'
import { SYSTEMS } from '../data/catalog.js'
import { Queue, Stack } from '../lib/structures.js'
import { useProgress } from '../context/ProgressContext.jsx'

function shuffle(list) {
  const copy = [...list]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[swap]] = [copy[swap], copy[index]]
  }
  return copy
}

function prepareQuestion(question) {
  const options = shuffle(question.options)
  return { ...question, options, correct: question.options[question.answer] }
}

export default function Quiz() {
  const { recordQuiz } = useProgress()
  const [system, setSystem] = useState('all')
  const [difficulty, setDifficulty] = useState('beginner')
  const [phase, setPhase] = useState('setup')
  const [current, setCurrent] = useState(null)
  const [picked, setPicked] = useState(null)
  const [index, setIndex] = useState(1)
  const [total, setTotal] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [review, setReview] = useState([])
  const queueRef = useRef(new Queue())
  const historyRef = useRef(new Stack())
  const savedRef = useRef(false)

  function start() {
    const pool = QUESTIONS.filter(
      (question) => question.difficulty === difficulty && (system === 'all' || question.system === system),
    )
    const round = shuffle(pool).slice(0, 10).map(prepareQuestion)
    queueRef.current = new Queue(round)
    historyRef.current = new Stack()
    savedRef.current = false
    setTotal(round.length)
    setCorrectCount(0)
    setIndex(1)
    setPicked(null)
    setReview([])
    setCurrent(queueRef.current.dequeue() || null)
    setPhase(round.length ? 'question' : 'empty')
  }

  function choose(option) {
    if (picked) return
    setPicked(option)
    const correct = option === current.correct
    if (correct) setCorrectCount((count) => count + 1)
    historyRef.current.push({ ...current, picked: option, wasCorrect: correct })
  }

  function next() {
    const upcoming = queueRef.current.dequeue()
    if (!upcoming) {
      const items = historyRef.current.toArray()
      const score = items.filter((item) => item.wasCorrect).length
      setReview(items)
      setPhase('result')
      if (!savedRef.current) {
        savedRef.current = true
        recordQuiz({
          id: crypto.randomUUID(),
          at: new Date().toISOString(),
          score,
          total,
          percent: Math.round((score / total) * 100),
          difficulty,
          system,
        })
      }
      return
    }
    setCurrent(upcoming)
    setPicked(null)
    setIndex((value) => value + 1)
  }

  if (phase === 'setup' || phase === 'empty') {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Quiz center</p>
        <h1 className="font-display mt-2 text-4xl text-white">Quiz yourself</h1>
        <p className="mt-3 text-slate-300">
          Questions are drawn at random from a bank of ten items for every organ system. A queue serves them one at a time. The answer choices are shuffled on every attempt.
        </p>
        <div className="glass-card mt-5 space-y-5 p-5">
          <fieldset>
            <legend className="text-sm font-bold text-white">Organ system</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" className="btn-quiet" data-active={system === 'all'} onClick={() => setSystem('all')}>All systems</button>
              {SYSTEMS.map((item) => (
                <button key={item.id} type="button" className="btn-quiet" data-active={system === item.id} onClick={() => setSystem(item.id)}>
                  {item.short}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-sm font-bold text-white">Difficulty</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {DIFFICULTIES.map((item) => (
                <button key={item.id} type="button" onClick={() => setDifficulty(item.id)} className={`rounded-2xl border px-3 py-3 text-left ${difficulty === item.id ? 'border-cyan-300 bg-cyan-300/10' : 'border-white/10'}`}>
                  <p className="font-bold text-white">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.hint}</p>
                </button>
              ))}
            </div>
          </fieldset>
          {phase === 'empty' && <p className="text-sm text-amber-200">No questions matched that filter.</p>}
          <button type="button" className="btn-primary" onClick={start}>Start quiz</button>
        </div>
      </div>
    )
  }

  if (phase === 'result') {
    const percent = Math.round((correctCount / total) * 100)
    return (
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Result</p>
        <h1 className="font-display mt-2 text-4xl text-white">{percent}%</h1>
        <p className="mt-2 text-slate-300">
          You answered {correctCount} of {total} correctly. This attempt is saved in My Progress on this browser.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="btn-primary" onClick={() => setPhase('setup')}>Retake quiz</button>
          <Link to="/progress" className="btn-secondary">View progress</Link>
        </div>
        <ol className="mt-6 space-y-3">
          {review.map((item, itemIndex) => (
            <li key={`${item.q}-${itemIndex}`} className="glass-card p-4">
              <p className="font-semibold text-white">{itemIndex + 1}. {item.q}</p>
              <p className={`mt-1 text-sm ${item.wasCorrect ? 'text-emerald-300' : 'text-rose-300'}`}>
                Your answer: {item.picked}
              </p>
              {!item.wasCorrect && <p className="text-sm text-emerald-200">Correct answer: {item.correct}</p>}
              <p className="mt-1 text-sm text-slate-300">{item.explain}</p>
            </li>
          ))}
        </ol>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>Question {index} of {total}</span>
        <span className="capitalize">{difficulty} · {system === 'all' ? 'All systems' : SYSTEMS.find((item) => item.id === system)?.short}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full bg-cyan-300" style={{ width: `${(index / total) * 100}%` }} />
      </div>
      <article className="glass-card mt-4 p-5 sm:p-7">
        <h1 className="font-display text-2xl text-white sm:text-3xl">{current.q}</h1>
        <div className="mt-5 grid gap-2">
          {current.options.map((option) => {
            const isCorrect = option === current.correct
            const isPicked = option === picked
            let tone = 'border-white/10 bg-white/5'
            if (picked && isCorrect) tone = 'border-emerald-300 bg-emerald-400/15'
            else if (picked && isPicked) tone = 'border-rose-300 bg-rose-400/15'
            return (
              <button key={option} type="button" disabled={Boolean(picked)} onClick={() => choose(option)} className={`rounded-2xl border px-4 py-3 text-left font-semibold text-white ${tone}`}>
                {option}
              </button>
            )
          })}
        </div>
        {picked && (
          <div className="mt-4 rounded-2xl bg-white/5 p-4">
            <p className={`font-bold ${picked === current.correct ? 'text-emerald-300' : 'text-rose-300'}`}>
              {picked === current.correct ? 'Correct' : 'Not quite'}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-200">{current.explain}</p>
            <button type="button" className="btn-primary mt-4" onClick={next}>
              {queueRef.current.isEmpty ? 'See result' : 'Next question'}
            </button>
          </div>
        )}
      </article>
    </div>
  )
}
