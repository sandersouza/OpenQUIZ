from fastapi import APIRouter, HTTPException, Request
from bson.objectid import ObjectId
from app.models import QuizInput, QuizOutput, QuestionOutput, AnswerOutput
from datetime import datetime
import os

def log_operation(ip: str, method: str, route: str, quiz_id: str = "N/A", status: str = "success"):
    # Captura o timestamp com a timezone do sistema
    timestamp = datetime.now().astimezone().strftime("%Y-%m-%d %H:%M:%S %z")
    pid = os.getpid()  # Obtém o PID do processo atual
    
    if method.upper() == "POST":
        log_message = f"[{timestamp}] [{pid}] [INFO] {ip} - [{status}][{method.upper()}] Make an insert into db with QuizzID: {quiz_id}"
    elif method.upper() == "GET":
        log_message = f"[{timestamp}] [{pid}] [INFO] {ip} - [{status}][{method.upper()}] Get list of all quizzes"
    elif method.upper() == "PUT":
        log_message = f"[{timestamp}] [{pid}] [INFO] {ip} - [{status}][{method.upper()}] Make an update into db with QuizzID: {quiz_id}"
    elif method.upper() == "DELETE":
        log_message = f"[{timestamp}] [{pid}] [INFO] {ip} - [{status}][{method.upper()}] Make a deletion into db with QuizzID: {quiz_id}"
    else:
        log_message = f"[{timestamp}] [{pid}] [INFO] {ip} - [{status}][{method.upper()}] Unknown Operation into db with QuizzID: {quiz_id}"
    
    print(log_message)

router = APIRouter()

@router.get("/", response_model=list[QuizOutput])
async def list_quizzes(request: Request):
    db = request.app.state.db
    client_ip = request.client.host

    if db is None:
        log_operation(client_ip, "GET", "/quizzes", status="error - database connection failed")
        raise HTTPException(status_code=500, detail="Erro na conexão com o banco de dados")
    
    quizzes = await db["quizzes"].find().to_list(100)
    log_operation(client_ip, "GET", "/quizzes")
    return [
        QuizOutput(
            id=str(quiz["_id"]),
            name=quiz["name"],
            questions=[
                QuestionOutput(
                    question_text=question["question_text"],
                    points=question["points"],
                    answers=[
                        AnswerOutput(
                            answer_text=answer["answer_text"],
                            is_correct=answer["is_correct"]
                        )
                        for answer in question["answers"]
                    ]
                )
                for question in quiz["questions"]
            ]
        )
        for quiz in quizzes
    ]

@router.post("/", response_model=QuizOutput)
async def create_quiz(request: Request, quiz: QuizInput):
    db = request.app.state.db
    client_ip = request.client.host

    if db is None:
        log_operation(client_ip, "POST", "/quizzes", status="error - database connection failed")
        raise HTTPException(status_code=500, detail="Erro na conexão com o banco de dados")
    
    document = {
        "name": quiz.name,
        "questions": [
            {
                "question_text": question.question_text,
                "points": question.points,
                "answers": [
                    {
                        "answer_text": answer.answer_text,
                        "is_correct": answer.is_correct
                    }
                    for answer in question.answers
                ]
            }
            for question in quiz.questions
        ]
    }

    result = await db["quizzes"].insert_one(document)
    created_quiz = await db["quizzes"].find_one({"_id": result.inserted_id})

    log_operation(client_ip, "POST", "/quizzes", quiz_id=str(result.inserted_id))
    return QuizOutput(
        id=str(created_quiz["_id"]),
        name=created_quiz["name"],
        questions=[
            QuestionOutput(
                question_text=question["question_text"],
                points=question["points"],
                answers=[
                    AnswerOutput(
                        answer_text=answer["answer_text"],
                        is_correct=answer["is_correct"]
                    )
                    for answer in question["answers"]
                ]
            )
            for question in created_quiz["questions"]
        ]
    )

@router.put("/{id}", response_model=QuizOutput)
async def update_quiz(request: Request, id: str, quiz: QuizInput):
    db = request.app.state.db
    client_ip = request.client.host

    if db is None:
        log_operation(client_ip, "PUT", f"/quizzes/{id}", status="error - database connection failed")
        raise HTTPException(status_code=500, detail="Erro na conexão com o banco de dados")

    existing_quiz = await db["quizzes"].find_one({"_id": ObjectId(id)})
    if not existing_quiz:
        log_operation(client_ip, "PUT", f"/quizzes/{id}", status="error - quiz not found")
        raise HTTPException(status_code=404, detail="Quiz não encontrado")

    updated_document = {
        "name": quiz.name,
        "questions": [
            {
                "question_text": question.question_text,
                "points": question.points,
                "answers": [
                    {
                        "answer_text": answer.answer_text,
                        "is_correct": answer.is_correct
                    }
                    for answer in question.answers
                ]
            }
            for question in quiz.questions
        ]
    }

    await db["quizzes"].update_one({"_id": ObjectId(id)}, {"$set": updated_document})
    updated_quiz = await db["quizzes"].find_one({"_id": ObjectId(id)})

    log_operation(client_ip, "PUT", f"/quizzes/{id}", quiz_id=id)
    return QuizOutput(
        id=str(updated_quiz["_id"]),
        name=updated_quiz["name"],
        questions=[
            QuestionOutput(
                question_text=question["question_text"],
                points=question["points"],
                answers=[
                    AnswerOutput(
                        answer_text=answer["answer_text"],
                        is_correct=answer["is_correct"]
                    )
                    for answer in question["answers"]
                ]
            )
            for question in updated_quiz["questions"]
        ]
    )

@router.delete("/{id}")
async def delete_quiz(request: Request, id: str):
    db = request.app.state.db
    client_ip = request.client.host

    if db is None:
        log_operation(client_ip, "DELETE", f"/quizzes/{id}", quiz_id=id, status="error - database connection failed")
        raise HTTPException(status_code=500, detail="Erro na conexão com o banco de dados")
    
    existing_quiz = await db["quizzes"].find_one({"_id": ObjectId(id)})
    if not existing_quiz:
        log_operation(client_ip, "DELETE", f"/quizzes/{id}", quiz_id=id, status="error - quiz not found")
        raise HTTPException(status_code=404, detail="Quiz não encontrado")
    
    result = await db["quizzes"].delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        log_operation(client_ip, "DELETE", f"/quizzes/{id}", quiz_id=id, status="error - quiz not found")
        raise HTTPException(status_code=404, detail="Quiz não encontrado")

    log_operation(client_ip, "DELETE", f"/quizzes/{id}", quiz_id=id)
    return {"message": f"Quiz com ID {id} foi deletado com sucesso."}
