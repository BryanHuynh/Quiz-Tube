from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    SmallInteger,
    String,
    Text,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class QuizRecord(Base):
    __tablename__ = "quizzes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    video_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    questions: Mapped[list["QuestionRecord"]] = relationship(
        "QuestionRecord", back_populates="quiz", cascade="all, delete-orphan"
    )


class QuestionRecord(Base):
    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    quiz_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False
    )
    position: Mapped[int] = mapped_column(SmallInteger, nullable=False)  # order in quiz
    title: Mapped[str] = mapped_column(Text, nullable=False)
    question: Mapped[str] = mapped_column(Text, nullable=False)
    context_start: Mapped[str] = mapped_column(Text, nullable=False, default="")
    question_style: Mapped[str] = mapped_column(String(32), nullable=False)

    quiz: Mapped["QuizRecord"] = relationship("QuizRecord", back_populates="questions")
    choices: Mapped[list["ChoiceRecord"]] = relationship(
        "ChoiceRecord", back_populates="question", cascade="all, delete-orphan"
    )


class ChoiceRecord(Base):
    __tablename__ = "choices"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    question_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False
    )
    position: Mapped[int] = mapped_column(SmallInteger, nullable=False)  # order in question
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    correct: Mapped[bool] = mapped_column(Boolean, nullable=False)
    feedback: Mapped[str] = mapped_column(Text, nullable=False, default="")

    question: Mapped["QuestionRecord"] = relationship(
        "QuestionRecord", back_populates="choices"
    )
