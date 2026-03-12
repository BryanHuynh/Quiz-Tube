import logging
from langchain_core.prompts import ChatPromptTemplate
from llm import create_llm
from models.questions import Quiz
from config import DEFAULT_QUIZ_LIMIT

logger = logging.getLogger(__name__)

_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a quiz generator. Given a video transcript, generate a comprehensive quiz with multiple choice questions. "
            "Each question should have 3-5 choices, with at least one correct answer and meaningful feedback for each choice. "
            "Do not generate questions about sponsors, advertisements, or promotional content mentioned in the transcript. "
            "If the video is a tutorial, focus less on the examples and more on the application and principles being applied. "
            "Refer to the video instead of the transcript.",
        ),
        (
            "human",
            "Generate a quiz with exactly {limit} questions from the following transcript:\n\n{transcript}",
        ),
    ]
)


def generate_questions(
    transcript: str,
    limit: int = DEFAULT_QUIZ_LIMIT,
    provider: str = "google",
    model: str = "gemini-2.0-flash",
    api_key: str = "",
) -> Quiz:
    logger.info("Invoking LLM provider=%s model=%s for %d questions", provider, model, limit)
    llm = create_llm(provider, model, api_key)
    chain = _prompt | llm.with_structured_output(Quiz)
    quiz = chain.invoke({"transcript": transcript, "limit": limit})
    logger.info("LLM returned %d questions", len(quiz.questions))
    return quiz
