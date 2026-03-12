from enum import Enum
from pydantic import BaseModel

class Choice(BaseModel):
    answer: str
    correct: bool
    feedback: str
    
class QuestionStyle(str, Enum):
    SELECT_MANY = "SELECT MANY ANSWERS"
    SELECT_ONE = "SELECT A SINGLE ANSWER"

class Question(BaseModel):
    title: str
    question: str
    context_start: str
    choices: list[Choice]
    question_style: QuestionStyle
    
class Quiz(BaseModel):
    questions: list[Question]
    



    
