import { useEffect, useState } from 'react'
import type { Question } from '../types/quiz'
import { QuizSetup } from './QuizSetup'
import { QuizQuestion } from './QuizQuestion'
import { QuizResults } from './QuizResults'
import { Settings } from './Settings'
import { loadSettings, type LLMSettings } from '../utils/storage'

const API_BASE = 'http://localhost:8000'

type Phase =
  | { type: 'checking' }
  | { type: 'not-youtube' }
  | { type: 'setup'; videoId: string }
  | { type: 'settings'; videoId: string | null }
  | { type: 'loading'; videoId: string }
  | { type: 'error'; message: string; videoId: string }
  | { type: 'quiz'; videoId: string; questions: Question[]; currentIndex: number; userAnswers: Array<Set<number>> }
  | { type: 'results'; videoId: string; questions: Question[]; userAnswers: Array<Set<number>> }

function GearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function Header({ onSettingsClick, onBackClick, showBack }: { onSettingsClick?: () => void; onBackClick?: () => void; showBack?: boolean }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-red-600 shrink-0">
      {showBack && (
        <button onClick={onBackClick} className="text-white/80 hover:text-white cursor-pointer transition-colors mr-1">
          <BackIcon />
        </button>
      )}
      <span className="text-base font-bold text-white tracking-tight">QuizTube</span>
      {showBack && <span className="text-[11px] text-white/70">Settings</span>}
      {!showBack && <span className="text-[11px] text-white/70 ml-auto">AI Quiz Generator</span>}
      {onSettingsClick && !showBack && (
        <button onClick={onSettingsClick} className="text-white/70 hover:text-white cursor-pointer transition-colors ml-auto">
          <GearIcon />
        </button>
      )}
    </div>
  )
}

function Spinner() {
  return (
    <div className="w-9 h-9 rounded-full border-[3px] border-[#2a2a2a] border-t-red-600 animate-spin" />
  )
}

function Layout({ children, center = false, onSettings, onBack, showBack }: {
  children: React.ReactNode
  center?: boolean
  onSettings?: () => void
  onBack?: () => void
  showBack?: boolean
}) {
  return (
    <div className="bg-[#0f0f0f] h-full flex flex-col">
      <Header onSettingsClick={onSettings} onBackClick={onBack} showBack={showBack} />
      <div className={`flex-1 min-h-0 overflow-y-auto${center ? ' flex flex-col items-center justify-center' : ''}`}>
        {children}
      </div>
    </div>
  )
}

export function Popup() {
  const [phase, setPhase] = useState<Phase>({ type: 'checking' })
  const [settings, setSettings] = useState<LLMSettings | null>(null)

  // Load settings once on mount
  useEffect(() => {
    loadSettings().then(s => setSettings(s))
  }, [])

  // Tab detection
  useEffect(() => {
    const detectTab = () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0]?.url
        setPhase(prev => {
          if (prev.type === 'loading' || prev.type === 'quiz' || prev.type === 'results') return prev
          if (!url) return { type: 'not-youtube' }
          try {
            const parsed = new URL(url)
            if (!parsed.hostname.includes('youtube.com')) return { type: 'not-youtube' }
            const videoId = parsed.searchParams.get('v')
            if (!videoId) return { type: 'not-youtube' }
            if (prev.type === 'setup' && prev.videoId === videoId) return prev
            return { type: 'setup', videoId }
          } catch {
            return { type: 'not-youtube' }
          }
        })
      })
    }

    detectTab()

    const onActivated = () => detectTab()
    const onUpdated = (_id: number, changeInfo: { url?: string; status?: string }) => {
      if (changeInfo.url !== undefined || changeInfo.status === 'complete') detectTab()
    }

    chrome.tabs.onActivated.addListener(onActivated)
    chrome.tabs.onUpdated.addListener(onUpdated)
    return () => {
      chrome.tabs.onActivated.removeListener(onActivated)
      chrome.tabs.onUpdated.removeListener(onUpdated)
    }
  }, [])

  const openSettings = () => {
    const videoId = (phase as { videoId?: string }).videoId ?? null
    setPhase({ type: 'settings', videoId })
  }

  const closeSettings = (videoId: string | null) => {
    // Reload settings then go back
    loadSettings().then(s => {
      setSettings(s)
      if (videoId) setPhase({ type: 'setup', videoId })
      else setPhase({ type: 'not-youtube' })
    })
  }

  const handleGenerate = async (videoId: string, limit: number) => {
    if (!settings) return
    setPhase({ type: 'loading', videoId })
    try {
      const res = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_id: videoId,
          limit,
          provider: settings.provider,
          model: settings.model,
          api_key: settings.apiKey,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Server error' })) as { detail?: string }
        setPhase({ type: 'error', message: err.detail ?? 'Failed to generate quiz', videoId })
        return
      }
      const data = await res.json() as { questions: Question[] }
      setPhase({
        type: 'quiz',
        videoId,
        questions: data.questions,
        currentIndex: 0,
        userAnswers: data.questions.map(() => new Set<number>()),
      })
    } catch {
      setPhase({ type: 'error', message: 'Cannot reach backend. Is it running on port 8000?', videoId })
    }
  }

  const handleAnswerSubmit = (questionIndex: number, indices: number[]) => {
    if (phase.type !== 'quiz') return
    const next = [...phase.userAnswers]
    next[questionIndex] = new Set(indices)
    setPhase({ ...phase, userAnswers: next })
  }

  const handleNext = () => {
    if (phase.type !== 'quiz') return
    if (phase.currentIndex + 1 >= phase.questions.length) {
      setPhase({ type: 'results', videoId: phase.videoId, questions: phase.questions, userAnswers: phase.userAnswers })
    } else {
      setPhase({ ...phase, currentIndex: phase.currentIndex + 1 })
    }
  }

  const handleRetry = () => {
    if (phase.type !== 'results') return
    setPhase({ type: 'quiz', videoId: phase.videoId, questions: phase.questions, currentIndex: 0, userAnswers: phase.questions.map(() => new Set<number>()) })
  }

  const handleNewQuiz = (videoId: string) => setPhase({ type: 'setup', videoId })

  if (phase.type === 'checking') {
    return <Layout center><Spinner /></Layout>
  }

  if (phase.type === 'settings') {
    const { videoId } = phase
    return (
      <Layout showBack onBack={() => closeSettings(videoId)}>
        <Settings current={settings} onBack={() => closeSettings(videoId)} />
      </Layout>
    )
  }

  if (phase.type === 'not-youtube') {
    return (
      <Layout center onSettings={openSettings}>
        <div className="flex flex-col items-center gap-3 px-6 text-center">
          <div className="text-4xl">📺</div>
          <p className="text-[#aaa] leading-relaxed text-sm">Navigate to a YouTube video to generate a quiz.</p>
        </div>
      </Layout>
    )
  }

  if (phase.type === 'setup') {
    return (
      <Layout onSettings={openSettings}>
        <QuizSetup videoId={phase.videoId} settings={settings} onGenerate={handleGenerate} onOpenSettings={openSettings} />
      </Layout>
    )
  }

  if (phase.type === 'loading') {
    return (
      <Layout center>
        <div className="flex flex-col items-center gap-3 text-center">
          <Spinner />
          <p className="text-[#aaa] text-sm">Generating your quiz…</p>
          <p className="text-[#555] text-xs">This may take a moment</p>
        </div>
      </Layout>
    )
  }

  if (phase.type === 'error') {
    const { message, videoId } = phase
    return (
      <Layout center onSettings={openSettings}>
        <div className="flex flex-col items-center gap-3.5 px-5 text-center w-full">
          <div className="text-4xl">⚠️</div>
          <p className="text-red-300 text-sm leading-relaxed">{message}</p>
          <button
            className="bg-red-600 hover:bg-red-700 text-white rounded-lg py-2.5 text-sm font-semibold w-full cursor-pointer transition-colors duration-150"
            onClick={() => handleNewQuiz(videoId)}
          >
            Try Again
          </button>
        </div>
      </Layout>
    )
  }

  if (phase.type === 'quiz') {
    const { questions, currentIndex } = phase
    return (
      <Layout>
        <QuizQuestion
          key={currentIndex}
          question={questions[currentIndex]}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          onSubmit={(indices) => handleAnswerSubmit(currentIndex, indices)}
          onNext={handleNext}
          isLastQuestion={currentIndex === questions.length - 1}
        />
      </Layout>
    )
  }

  if (phase.type === 'results') {
    return (
      <Layout onSettings={openSettings}>
        <QuizResults
          questions={phase.questions}
          userAnswers={phase.userAnswers}
          onRetry={handleRetry}
          onNewQuiz={() => handleNewQuiz(phase.videoId)}
        />
      </Layout>
    )
  }

  return null
}
