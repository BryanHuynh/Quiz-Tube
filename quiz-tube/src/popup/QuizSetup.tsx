import { useState, useEffect } from 'react'

interface Props {
  videoId: string
  onGenerate: (videoId: string, limit: number) => void
}

export function QuizSetup({ videoId, onGenerate }: Props) {
  const [limit, setLimit] = useState(10)
  const [title, setTitle] = useState<string | null>(null)

  useEffect(() => {
    fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
      .then(r => r.json())
      .then(d => setTitle(d.title))
      .catch(() => setTitle(null))
  }, [videoId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10)
    if (!isNaN(v) && v >= 1 && v <= 50) setLimit(v)
  }

  return (
    <div className="p-4 flex flex-col gap-3">
      <div className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg px-3 py-2.5 flex flex-col gap-0.5">
        <span className="text-[10px] text-[#555] uppercase tracking-wide">Now watching</span>
        {title
          ? <span className="text-sm text-[#f1f1f1] font-medium leading-snug">{title}</span>
          : <span className="text-xs text-[#555] font-mono">{videoId}</span>
        }
      </div>

      <div className="flex items-center justify-between bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg px-3 py-2.5">
        <label htmlFor="limit-input" className="text-sm text-[#ccc]">
          Number of questions
        </label>
        <input
          id="limit-input"
          type="number"
          className="w-16 bg-[#0f0f0f] border border-[#3a3a3a] focus:border-red-600 rounded-md text-white text-sm text-center px-2 py-1.25 outline-none"
          value={limit}
          min={1}
          max={50}
          onChange={handleChange}
        />
      </div>

      <button
        className="bg-red-600 hover:bg-red-700 text-white rounded-lg py-2.5 text-sm font-semibold w-full cursor-pointer transition-colors duration-150"
        onClick={() => onGenerate(videoId, limit)}
      >
        Generate Quiz
      </button>
    </div>
  )
}
