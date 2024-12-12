from pydantic import BaseModel, Field
from typing import List, Optional

class AnswerInput(BaseModel):
    """
    Modelo para entrada de dados de uma resposta.
    """
    answer_text: str
    is_correct: bool

class AnswerOutput(BaseModel):
    """
    Modelo para saída de dados de uma resposta.
    """
    answer_text: str
    is_correct: bool

class QuestionInput(BaseModel):
    """
    Modelo para entrada de dados de uma pergunta.
    """
    question_text: str
    points: int = Field(default=150)
    answers: List[AnswerInput] = []

class QuestionOutput(BaseModel):
    """
    Modelo para saída de dados de uma pergunta.
    """
    question_text: str
    points: int = Field(default=150)
    answers: List[AnswerOutput] = []

class QuizInput(BaseModel):
    """
    Modelo para entrada de dados de um quiz.
    """
    name: str
    questions: List[QuestionInput] = []

class QuizOutput(BaseModel):
    """
    Modelo para saída de dados de um quiz.
    """
    id: str
    name: str
    questions: List[QuestionOutput] = []
