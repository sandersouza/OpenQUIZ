from pydantic import BaseModel, Field, EmailStr, constr
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

class UserInput(BaseModel):
    """Modelo para entrada de dados de um usuário."""
    email: EmailStr
    first_name: constr(strip_whitespace=True, regex=r"^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$")
    last_name: constr(strip_whitespace=True, regex=r"^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$")
    password: constr(min_length=8)

class UserOutput(BaseModel):
    """Modelo para saída de dados de um usuário."""
    id: str
    email: str
    first_name: str
    last_name: str
