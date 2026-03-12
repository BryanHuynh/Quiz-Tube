"""
Helpers for persisting and retrieving quizzes from the database.
"""

from sqlalchemy.orm import Session
from models.questions import Quiz
from db.models import QuizRecord, QuestionRecord, ChoiceRecord


def save_quiz(session: Session, video_id: str, quiz: Quiz) -> QuizRecord:
    """Persist a generated Quiz to the database and return the saved record."""
    record = QuizRecord(video_id=video_id)

    for pos, q in enumerate(quiz.questions):
        q_record = QuestionRecord(
            position=pos,
            title=q.title,
            question=q.question,
            context_start=q.context_start,
            question_style=q.question_style.value,
        )
        for c_pos, c in enumerate(q.choices):
            q_record.choices.append(
                ChoiceRecord(
                    position=c_pos,
                    answer=c.answer,
                    correct=c.correct,
                    feedback=c.feedback,
                )
            )
        record.questions.append(q_record)

    session.add(record)
    session.commit()
    session.refresh(record)
    return record
