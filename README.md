# QuizTube

A Chrome extension that generates AI-powered quizzes from YouTube videos. Open a video, click the extension, choose your question count and LLM provider, and get an interactive multiple-choice quiz based on the video's transcript.

---

## Tech Stack

### Frontend — Chrome Extension
| Tool | Purpose |
|---|---|
| React 19 + TypeScript | Extension popup UI |
| Vite | Build tooling |
| Tailwind CSS v4 | Styling |
| canvas-confetti | Correct-answer celebration |
| Chrome Extension APIs | Tab detection, storage |

### Backend — REST API
| Tool | Purpose |
|---|---|
| FastAPI | HTTP server |
| LangChain | LLM orchestration and structured output |
| youtube-transcript-api | Fetching YouTube captions |
| SQLAlchemy + PostgreSQL | Quiz caching/persistence |
| Webshare / Generic proxy | Bypassing transcript fetch restrictions |

### LLM Providers (user-configurable)
- **Google Gemini** — `gemini-2.5-flash`, `gemini-2.5-pro`, etc.
- **OpenAI** — `gpt-4o-mini`, `gpt-4o`, `gpt-4-turbo`
- **Anthropic Claude** — `claude-haiku-4-5`, `claude-sonnet-4-6`, `claude-opus-4-6`

### Deployment
- Backend hosted on **Railway** (`https://quiz-tube-production.up.railway.app`)
- CORS restricted to `chrome-extension://` origins only

---

## Workflow

```
User opens a YouTube video
        │
        ▼
Extension popup detects video ID from the tab URL
        │
        ▼
User selects question count + LLM provider/model + API key
        │
        ▼
POST /generate  ──► Check PostgreSQL cache
        │                   │
        │           Cache hit? Return stored quiz
        │                   │
        │           Cache miss?
        │                   │
        ▼                   ▼
Fetch transcript via youtube-transcript-api (with proxy)
        │
        ▼
Send transcript + settings to LLM via LangChain
        │
        ▼
LLM returns structured Quiz (questions + choices + feedback)
        │
        ▼
Persist quiz to PostgreSQL, return to extension
        │
        ▼
Extension renders interactive quiz:
  - Single-answer (radio) or multi-answer (checkbox) questions
  - Per-choice feedback shown after submission
  - Timestamp links to jump to relevant video moment
  - Confetti on correct answers
  - Results summary screen at the end
```

---

## Project Structure

```
quiz-tube/
├── backend/                     # FastAPI server
│   ├── main.py                  # App entry, /generate endpoint, CORS
│   ├── config.py                # Env vars (DB URL, proxy config)
│   ├── services/
│   │   ├── youtube_transcript_service.py   # Fetch captions via proxy
│   │   ├── generate_questions_service.py   # LangChain LLM call
│   │   └── quiz_service.py                 # Cache read/write (PostgreSQL)
│   ├── models/                  # Pydantic schemas (Quiz, Question, Choice)
│   └── db/                      # SQLAlchemy models, session, setup
│
└── quiz-tube/                   # Chrome extension
    └── src/
        ├── popup/
        │   ├── Popup.tsx        # Root component, phase state machine
        │   ├── QuizSetup.tsx    # Configure and start a quiz
        │   ├── QuizQuestion.tsx # Render one question, handle answers
        │   ├── QuizResults.tsx  # Score summary
        │   └── Settings.tsx     # Provider/model/API key settings
        └── utils/
            ├── providers.ts     # Supported LLM providers and models
            ├── storage.ts       # chrome.storage wrappers for settings
            └── seekToTimestamp.ts  # Jump video to a timestamp
```

---

## Setup

### Backend

```bash
cd backend
cp .env.example .env        # fill in DATABASE_URL, proxy creds, etc.
uv sync
uvicorn main:app --reload
```

**Environment variables:**
| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `PROXY_USERNAME` | Webshare proxy username (optional) |
| `PROXY_PASSWORD` | Webshare proxy password (optional) |
| `PROXY_URL` | Generic proxy URL (optional) |

### Extension

```bash
cd quiz-tube
npm install
npm run build
```

Load the `dist/` folder as an unpacked extension in `chrome://extensions`.

---

## Notes

- API keys are entered by the user in the extension settings and sent directly to the backend per request — they are never stored server-side.
- Quizzes are cached in PostgreSQL by `video_id`. Re-generating for the same video replaces the cache.
- The backend CORS policy only accepts requests from `chrome-extension://` origins.
