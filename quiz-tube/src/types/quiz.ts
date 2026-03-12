export type QuestionStyle = 'SELECT A SINGLE ANSWER' | 'SELECT MANY ANSWERS'

export interface Choice {
  answer: string
  correct: boolean
  feedback: string
}

export interface Question {
  title: string
  question: string
  context_start: string
  choices: Choice[]
  question_style: QuestionStyle
}

export interface Quiz {
  questions: Question[]
}
