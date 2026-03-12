import { useState } from 'react'
import type { Question, Choice } from '../types/quiz'
import { seekToTimestamp } from '../utils/seekToTimestamp'

interface Props {
  question: Question
  questionNumber: number
  totalQuestions: number
  onSubmit: (selectedIndices: number[]) => void
  onNext: () => void
  isLastQuestion: boolean
}

type ChoiceState =
  | 'default'
  | 'selected'
  | 'result-correct-hit'
  | 'result-correct-miss'
  | 'result-wrong-hit'
  | 'result-neutral'

function getChoiceState(
  index: number,
  choice: Choice,
  selected: Set<number>,
  submitted: boolean,
): ChoiceState {
  if (!submitted) return selected.has(index) ? 'selected' : 'default'
  if (choice.correct && selected.has(index)) return 'result-correct-hit'
  if (choice.correct && !selected.has(index)) return 'result-correct-miss'
  if (!choice.correct && selected.has(index)) return 'result-wrong-hit'
  return 'result-neutral'
}

const choiceBtnBase =
  'flex items-start gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm leading-relaxed text-left border-[1.5px] transition-all duration-[120ms]'

function choiceBtnClasses(state: ChoiceState, submitted: boolean): string {
  if (!submitted) {
    if (state === 'selected')
      return `${choiceBtnBase} border-[#cc2200] bg-[#1f0e0a] text-[#d0d0d0] cursor-pointer`
    return `${choiceBtnBase} bg-[#1a1a1a] border-[#2e2e2e] text-[#d0d0d0] cursor-pointer hover:border-[#4a4a4a] hover:bg-[#222]`
  }
  switch (state) {
    case 'result-correct-hit':
      return `${choiceBtnBase} border-green-600 bg-[#0c1f0d] text-green-300 cursor-default`
    case 'result-correct-miss':
      return `${choiceBtnBase} border-green-900 bg-transparent text-[#555] cursor-default`
    case 'result-wrong-hit':
      return `${choiceBtnBase} border-red-600 bg-[#1f0c0c] text-red-300 cursor-default`
    case 'result-neutral':
      return `${choiceBtnBase} bg-[#1a1a1a] border-[#2e2e2e] opacity-40 cursor-default`
    default:
      return `${choiceBtnBase} bg-[#1a1a1a] border-[#2e2e2e] text-[#d0d0d0]`
  }
}

const indicatorBase =
  'shrink-0 w-[18px] h-[18px] border-2 flex items-center justify-center text-[10px] mt-px transition-all duration-[120ms]'

function indicatorClasses(state: ChoiceState, isSquare: boolean, submitted: boolean): string {
  const shape = isSquare ? 'rounded' : 'rounded-full'
  if (!submitted) {
    if (state === 'selected')
      return `${indicatorBase} ${shape} border-[#cc2200] bg-[#cc2200] text-white`
    return `${indicatorBase} ${shape} border-[#444]`
  }
  switch (state) {
    case 'result-correct-hit':
      return `${indicatorBase} ${shape} border-green-500 bg-green-500 text-white`
    case 'result-correct-miss':
      return `${indicatorBase} ${shape} border-green-800 text-green-800`
    case 'result-wrong-hit':
      return `${indicatorBase} ${shape} border-red-600 bg-red-600 text-white`
    default:
      return `${indicatorBase} ${shape} border-[#444]`
  }
}

function feedbackClasses(state: ChoiceState): string {
  const base = 'text-[11px] italic mt-1.25 leading-snug'
  switch (state) {
    case 'result-correct-hit':   return `${base} text-green-400`
    case 'result-correct-miss':  return `${base} text-[#555]`
    case 'result-wrong-hit':     return `${base} text-red-300`
    default:                     return base
  }
}


function getIndicatorChar(state: ChoiceState, submitted: boolean, isSelected: boolean): string {
  if (!submitted) return isSelected ? '✓' : ''
  if (state === 'result-correct-hit' || state === 'result-correct-miss') return '✓'
  if (state === 'result-wrong-hit') return '✗'
  return ''
}

export function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  onSubmit,
  onNext,
  isLastQuestion,
}: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [submitted, setSubmitted] = useState(false)

  const isMulti = question.question_style === 'SELECT MANY ANSWERS'

  const toggle = (i: number) => {
    if (submitted) return
    setSelected(prev => {
      const next = new Set(prev)
      if (isMulti) {
        if (next.has(i)) next.delete(i)
        else next.add(i)
      } else {
        next.clear()
        next.add(i)
      }
      return next
    })
  }

  const handleSubmit = () => {
    setSubmitted(true)
    onSubmit([...selected])
  }

  const progress = (questionNumber / totalQuestions) * 100

  return (
    <div className="p-4 flex flex-col gap-3">
      {/* Progress row */}
      <div className="flex items-center justify-between text-xs text-[#666]">
        <span>Question {questionNumber} of {totalQuestions}</span>
        {isMulti && (
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#888] bg-[#1c1c1c] border border-[#2e2e2e] rounded px-1.5 py-0.5">
            Select all that apply
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-0.75 bg-[#222] rounded-full overflow-hidden">
        <div
          className="h-full bg-red-600 rounded-full transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question text */}
      <div>
        <p className="text-sm font-medium leading-relaxed text-[#f1f1f1]">{question.question}</p>
        {question.context_start && (
          <button
            className="text-[11px] text-[#555] mt-1 hover:text-red-500 transition-colors duration-150 cursor-pointer"
            onClick={() => seekToTimestamp(question.context_start)}
          >
            ▶ {question.context_start}
          </button>
        )}
      </div>

      {/* Choices */}
      <div className="flex flex-col gap-1.75">
        {question.choices.map((choice, i) => {
          const state = getChoiceState(i, choice, selected, submitted)
          const showFeedback = submitted && (choice.correct || selected.has(i))
          return (
            <button key={i} className={choiceBtnClasses(state, submitted)} onClick={() => toggle(i)}>
              <div className={indicatorClasses(state, isMulti, submitted)}>
                {getIndicatorChar(state, submitted, selected.has(i))}
              </div>
              <div className="flex-1 min-w-0">
                <div>{choice.answer}</div>
                {showFeedback && (
                  <div className={feedbackClasses(state)}>{choice.feedback}</div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Action button */}
      {!submitted ? (
        <button
          className="bg-red-600 hover:bg-red-700 disabled:bg-[#2e2e2e] disabled:text-[#555] disabled:cursor-not-allowed text-white rounded-lg py-2.5 text-sm font-semibold w-full cursor-pointer transition-colors duration-150"
          onClick={handleSubmit}
          disabled={selected.size === 0}
        >
          Submit Answer
        </button>
      ) : (
        <button
          className="bg-red-600 hover:bg-red-700 text-white rounded-lg py-2.5 text-sm font-semibold w-full cursor-pointer transition-colors duration-150"
          onClick={onNext}
        >
          {isLastQuestion ? 'See Results →' : 'Next Question →'}
        </button>
      )}
    </div>
  )
}
