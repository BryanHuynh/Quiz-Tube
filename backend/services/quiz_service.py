import logging
import random
from contextlib import contextmanager
from typing import Generator

from sqlalchemy.orm import Session
from sqlalchemy import exists, select

from db.session import SessionLocal
from db.models import QuizRecord, QuestionRecord, ChoiceRecord
from db.repository import save_quiz as _save_quiz
from models.questions import Quiz, Question, Choice, QuestionStyle

logger = logging.getLogger(__name__)


# ── Session context manager ───────────────────────────────────────────────────

@contextmanager
def _session() -> Generator[Session, None, None]:
    session: Session = SessionLocal()
    try:
        yield session
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


# ── Queries ───────────────────────────────────────────────────────────────────

def video_id_exists(video_id: str) -> bool:
    with _session() as session:
        result = session.execute(
            select(exists().where(QuizRecord.video_id == video_id))
        )
        return result.scalar()


def get_cached_quiz(video_id: str, limit: int) -> Quiz | None:
    with _session() as session:
        record: QuizRecord | None = (
            session.query(QuizRecord)
            .filter(QuizRecord.video_id == video_id)
            .order_by(QuizRecord.created_at.desc())
            .first()
        )

        if record is None:
            logger.debug("No cached quiz found for video_id=%s", video_id)
            return None

        if len(record.questions) < limit:
            logger.debug(
                "Cached quiz for video_id=%s has %d questions, requested %d — cache miss",
                video_id, len(record.questions), limit,
            )
            return None

        logger.info(
            "Cache hit for video_id=%s with %d questions (quiz id=%d)",
            video_id, limit, record.id,
        )
        return _record_to_pydantic(record, limit)


# ── Writes ────────────────────────────────────────────────────────────────────

def persist_quiz(video_id: str, quiz: Quiz) -> int:
    with _session() as session:
        deleted = (
            session.query(QuizRecord)
            .filter(QuizRecord.video_id == video_id)
            .delete(synchronize_session=False)
        )
        if deleted:
            logger.info("Deleted %d previous quiz(zes) for video_id=%s", deleted, video_id)

        record = _save_quiz(session, video_id, quiz)
        logger.info("Persisted quiz id=%d for video_id=%s", record.id, video_id)
        return record.id


# ── Helpers ───────────────────────────────────────────────────────────────────

def _record_to_pydantic(record: QuizRecord, question_limit: int) -> Quiz:
    sampled = random.sample(record.questions, min(question_limit, len(record.questions)))
    questions = sorted(sampled, key=lambda q: q.position)
    return Quiz(
        questions=[
            Question(
                title=q.title,
                question=q.question,
                context_start=q.context_start,
                question_style=QuestionStyle(q.question_style),
                choices=[
                    Choice(
                        answer=c.answer,
                        correct=c.correct,
                        feedback=c.feedback,
                    )
                    for c in sorted(q.choices, key=lambda c: c.position)
                ],
            )
            for q in questions
        ]
    )
