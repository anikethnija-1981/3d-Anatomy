import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProgressProvider } from './context/ProgressContext.jsx'
import Layout from './components/Layout.jsx'

const Home = lazy(() => import('./pages/Home.jsx'))
const Explorer = lazy(() => import('./pages/Explorer.jsx'))
const Systems = lazy(() => import('./pages/Systems.jsx'))
const SystemDetail = lazy(() => import('./pages/SystemDetail.jsx'))
const Learning = lazy(() => import('./pages/Learning.jsx'))
const Animations = lazy(() => import('./pages/Animations.jsx'))
const Quiz = lazy(() => import('./pages/Quiz.jsx'))
const Progress = lazy(() => import('./pages/Progress.jsx'))
const Diseases = lazy(() => import('./pages/Diseases.jsx'))
const About = lazy(() => import('./pages/About.jsx'))

function Fallback() {
  return (
    <div className="grid min-h-[40vh] place-items-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-300/30 border-t-cyan-300" />
    </div>
  )
}

export default function App() {
  return (
    <ProgressProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route
              index
              element={
                <Suspense fallback={<Fallback />}>
                  <Home />
                </Suspense>
              }
            />
            <Route path="explorer" element={<Suspense fallback={<Fallback />}><Explorer /></Suspense>} />
            <Route path="systems" element={<Suspense fallback={<Fallback />}><Systems /></Suspense>} />
            <Route path="systems/:systemId" element={<Suspense fallback={<Fallback />}><SystemDetail /></Suspense>} />
            <Route path="learn" element={<Suspense fallback={<Fallback />}><Learning /></Suspense>} />
            <Route path="animations" element={<Suspense fallback={<Fallback />}><Animations /></Suspense>} />
            <Route path="quiz" element={<Suspense fallback={<Fallback />}><Quiz /></Suspense>} />
            <Route path="progress" element={<Suspense fallback={<Fallback />}><Progress /></Suspense>} />
            <Route path="diseases" element={<Suspense fallback={<Fallback />}><Diseases /></Suspense>} />
            <Route path="about" element={<Suspense fallback={<Fallback />}><About /></Suspense>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ProgressProvider>
  )
}
