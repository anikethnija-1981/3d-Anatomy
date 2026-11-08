import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { SYSTEMS } from '../data/catalog.js'
import { LESSONS } from '../data/learning.js'

const KEY = 'anatomy-pbl-progress-v1'

function emptyProgress() {
  return { quizAttempts: [], completedLessons: [], organVisits: [] }
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyProgress()
    const parsed = JSON.parse(raw)
    return {
      quizAttempts: Array.isArray(parsed.quizAttempts) ? parsed.quizAttempts : [],
      completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons : [],
      organVisits: Array.isArray(parsed.organVisits) ? parsed.organVisits : [],
    }
  } catch {
    return emptyProgress()
  }
}

const ProgressContext = createContext(null)

export function ProgressProvider({ children }) {
  const [data, setData] = useState(loadProgress)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(data))
  }, [data])

  const recordQuiz = useCallback((attempt) => {
    setData((current) => ({
      ...current,
      quizAttempts: [attempt, ...current.quizAttempts].slice(0, 40),
    }))
  }, [])

  const toggleLesson = useCallback((id) => {
    setData((current) => {
      const has = current.completedLessons.includes(id)
      return {
        ...current,
        completedLessons: has
          ? current.completedLessons.filter((item) => item !== id)
          : [...current.completedLessons, id],
      }
    })
  }, [])

  const visitOrgan = useCallback((id) => {
    setData((current) =>
      current.organVisits.includes(id) ? current : { ...current, organVisits: [...current.organVisits, id] },
    )
  }, [])

  const resetProgress = useCallback(() => setData(emptyProgress()), [])

  const value = useMemo(
    () => ({ data, recordQuiz, toggleLesson, visitOrgan, resetProgress }),
    [data, recordQuiz, toggleLesson, visitOrgan, resetProgress],
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  const context = useContext(ProgressContext)
  if (!context) throw new Error('useProgress must be used inside ProgressProvider')
  return context
}

export function useProgressStats() {
  const { data } = useProgress()
  return useMemo(() => {
    const attempts = data.quizAttempts
    const average = attempts.length
      ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.percent, 0) / attempts.length)
      : 0
    const highest = attempts.reduce((max, attempt) => Math.max(max, attempt.percent), 0)
    const completed = new Set(data.completedLessons)
    const percent = Math.round((completed.size / LESSONS.length) * 100)
    const systemsDone = SYSTEMS.filter((system) => {
      const lessons = LESSONS.filter((lesson) => lesson.system === system.id)
      return lessons.length > 0 && lessons.every((lesson) => completed.has(lesson.id))
    })
    return {
      attempts,
      average,
      highest,
      percent,
      systemsDone,
      completedCount: completed.size,
      totalLessons: LESSONS.length,
      visits: data.organVisits,
    }
  }, [data])
}
