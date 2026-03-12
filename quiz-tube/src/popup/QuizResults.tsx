import { useState } from 'react'
import type { Question } from '../types/quiz'

interface Props {
  questions: Question[]
  userAnswers: Array<Set<number>>
  onRetry: () => void
  onNewQuiz: () => void
}

function isCorrect(question: Question, selected: Set<number>): boolean {
  const correctSet = new Set(
    question.choices.map((c, i) => (c.correct ? i : -1)).filter(i => i >= 0),
  )
  if (correctSet.size !== selected.size) return false
  for (const i of correctSet) if (!selected.has(i)) return false
  return true
}

function getRemark(pct: number): string {
  if (pct === 100) return '🏆 Perfect score!'
  if (pct >= 80) return '🎉 Excellent work!'
  if (pct >= 60) return '👍 Good job!'
  if (pct >= 40) return '📚 Keep studying!'
  return '💪 Keep at it!'
}

interface ReviewRowProps {
  question: Question
  selected: Set<number>
  index: number
}

function ReviewRow({ question, selected, index }: ReviewRowProps) {
  const [open, setOpen] = useState(false)
  const correct = isCorrect(question, selected)

  const userChoices = question.choices.filter((_, i) => selected.has(i))
  const correctChoices = question.choices.filter(c => c.correct)

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden">
      {/* Header row */}
      <button
        className="flex items-center gap-2 w-full px-3 py-2.5 text-left cursor-pointer hover:bg-[#222] transition-colors duration-100"
        onClick={() => setOpen(o => !o)}
      >
        <span className="text-[13px] shrink-0">{correct ? '✅' : '❌'}</span>
        <span className="text-xs text-[#bbb] flex-1 truncate">
          {index + 1}. {question.title || question.question}
        </span>
        <span className="text-[#555] text-[10px] shrink-0">{open ? '▲' : '▼'}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="px-3 pb-3 flex flex-col gap-2 border-t border-[#2a2a2a]">
          <p className="text-xs text-[#888] pt-2 leading-snug">{question.question}</p>

          {/* User's answer */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-[#555] mb-1">
              Your answer
            </div>
            {userChoices.length === 0 ? (
              <p className="text-xs text-[#555] italic">No answer selected</p>
            ) : (
              userChoices.map((c, i) => (
                <div
                  key={i}
                  className={`text-xs px-2 py-1.5 rounded mb-1 ${
                    c.correct
                      ? 'bg-[#0c1f0d] text-green-300 border border-green-900'
                      : 'bg-[#1f0c0c] text-red-300 border border-red-900'
                  }`}
                >
                  {c.answer}
                </div>
              ))
            )}
          </div>

          {/* Correct answer — only shown if wrong */}
          {!correct && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-[#555] mb-1">
                Correct answer
              </div>
              {correctChoices.map((c, i) => (
                <div key={i} className="text-xs px-2 py-1.5 rounded mb-1 bg-[#0c1f0d] text-green-300 border border-green-900">
                  <div>{c.answer}</div>
                  {c.feedback && (
                    <div className="text-[11px] text-green-500 italic mt-0.5">{c.feedback}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function QuizResults({ questions, userAnswers, onRetry, onNewQuiz }: Props) {
  const score = questions.reduce(
    (acc, q, i) => acc + (isCorrect(q, userAnswers[i]) ? 1 : 0),
    0,
  )
  const pct = Math.round((score / questions.length) * 100)

  return (
    <div className="p-4 flex flex-col gap-3.5">
      <div className="text-center px-5 py-5.5 bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl">
        <div className="text-[48px] font-bold text-red-600 tracking-tight leading-none">
          {score}/{questions.length}
        </div>
        <div className="text-lg text-[#bbb] mt-1">{pct}%</div>
        <div className="text-sm text-[#888] mt-2.5">{getRemark(pct)}</div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-[#555] mb-0.5">
          Question Breakdown
        </div>
        {questions.map((q, i) => (
          <ReviewRow key={i} question={q} selected={userAnswers[i]} index={i} />
        ))}
      </div>

      <div className="flex gap-2">
        <button
          className="bg-red-600 hover:bg-red-700 text-white rounded-lg py-2.5 text-sm font-semibold flex-1 cursor-pointer transition-colors duration-150"
          onClick={onRetry}
        >
          Try Again
        </button>
        <button
          className="bg-[#2a2a2a] hover:bg-[#333] text-[#bbb] rounded-lg py-2.5 text-sm font-semibold flex-1 cursor-pointer transition-colors duration-150"
          onClick={onNewQuiz}
        >
          New Quiz
        </button>
      </div>
    </div>
  )
}
