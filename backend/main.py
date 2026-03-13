import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import services.youtube_transcript_service as TranscriptService
import services.generate_questions_service as QuestionsService
import services.quiz_service as QuizService
from models.questions import Quiz
from config import DEFAULT_QUIZ_LIMIT
from db.setup import setup as db_setup

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    logger.info("Running database setup...")
    db_setup()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"chrome-extension://.*",
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

class GenerateRequest(BaseModel):
    video_id: str
    limit: int = DEFAULT_QUIZ_LIMIT
    provider: str = "google"
    model: str = "gemini-2.0-flash"
    api_key: str

@app.post("/generate", response_model=Quiz)
async def generate(request: GenerateRequest) -> Quiz:
    logger.info(
        "Generate request: video_id=%s limit=%d provider=%s model=%s",
        request.video_id, request.limit, request.provider, request.model,
    )

    cached = QuizService.get_cached_quiz(request.video_id, request.limit)
    if cached:
        logger.info("Returning cached quiz for video_id=%s", request.video_id)
        return cached

    transcript = TranscriptService.get_transcript(video_id=request.video_id)
    quiz = QuestionsService.generate_questions(
        str(transcript),
        limit=request.limit,
        provider=request.provider,
        model=request.model,
        api_key=request.api_key,
    )
    logger.info("Quiz generated: %d questions for video_id=%s", len(quiz.questions), request.video_id)

    QuizService.persist_quiz(request.video_id, quiz)

    return quiz
