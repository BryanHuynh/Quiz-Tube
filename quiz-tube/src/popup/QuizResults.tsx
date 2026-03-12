import type { Question } from '../types/quiz'

interface Props {
  questions: Question[]
  userAnswers: Array<Set<number>>
  onRestart: () => void
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

export function QuizResults({ questions, userAnswers, onRestart }: Props) {
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

      <div className="flex flex-col gap-1.25">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-[#555] mb-1">
          Question Breakdown
        </div>
        {questions.map((q, i) => (
          <div key={i} className="flex items-center gap-2 px-2.5 py-2 bg-[#1a1a1a] rounded-md">
            <span className="text-[13px] shrink-0">
              {isCorrect(q, userAnswers[i]) ? '✅' : '❌'}
            </span>
            <span className="text-xs text-[#bbb] truncate flex-1">{q.title || q.question}</span>
          </div>
        ))}
      </div>

      <button
        className="bg-red-600 hover:bg-red-700 text-white rounded-lg py-2.5 text-sm font-semibold w-full cursor-pointer transition-colors duration-150"
        onClick={onRestart}
      >
        Try Again
      </button>
    </div>
  )
}
