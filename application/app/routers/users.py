from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr, validator
from datetime import datetime
import re
import os
import math

router = APIRouter()

class UserInput(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    password: str

    @validator('email')
    def email_lower(cls, v: str) -> str:
        return v.strip().lower()

    @validator('first_name', 'last_name')
    def name_no_special_chars(cls, v: str) -> str:
        v = v.strip()
        if not re.fullmatch(r"[A-Za-z]+", v):
            raise ValueError('Somente letras sao permitidas')
        return v

    @validator('password')
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('Senha deve ter no minimo 8 caracteres')
        return v

class UserOutput(BaseModel):
    id: str
    email: EmailStr
    first_name: str
    last_name: str


class UserListOutput(BaseModel):
    users: list[UserOutput]
    current_page: int
    total_pages: int


def log_operation(ip: str, method: str, route: str, user_id: str = "N/A", status: str = "success"):
    timestamp = datetime.now().astimezone().strftime("%Y-%m-%d %H:%M:%S %z")
    pid = os.getpid()
    if method.upper() == "POST":
        log_message = f"[{timestamp}] [{pid}] [INFO] {ip} - [{status}][{method.upper()}] Insert into db with UserID: {user_id}"
    else:
        log_message = f"[{timestamp}] [{pid}] [INFO] {ip} - [{status}][{method.upper()}] Operation on {route}"
    print(log_message)


@router.post("/", response_model=UserOutput)
async def create_user(request: Request, user: UserInput):
    db = request.app.state.db
    client_ip = request.client.host if request.client else "unknown"

    if db is None:
        log_operation(client_ip, "POST", "/users", status="error - database connection failed")
        raise HTTPException(status_code=500, detail="Erro na conexao com o banco de dados")

    existing = await db["users"].find_one({"email": user.email})
    if existing:
        log_operation(client_ip, "POST", "/users", status="error - email exists")
        raise HTTPException(status_code=400, detail="E-mail ja cadastrado")

    document = {
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "password": user.password,
    }

    result = await db["users"].insert_one(document)
    created_user = await db["users"].find_one({"_id": result.inserted_id})

    log_operation(client_ip, "POST", "/users", user_id=str(result.inserted_id))
    return UserOutput(
        id=str(created_user["_id"]),
        email=created_user["email"],
        first_name=created_user["first_name"],
        last_name=created_user["last_name"],
    )


@router.get("/", response_model=UserListOutput)
async def list_users(request: Request, email: str | None = None, page: int = 1):
    db = request.app.state.db
    client_ip = request.client.host if request.client else "unknown"

    if db is None:
        log_operation(client_ip, "GET", "/users", status="error - database connection failed")
        raise HTTPException(status_code=500, detail="Erro na conexao com o banco de dados")

    query = {}
    if email:
        query["email"] = email.strip().lower()

    if page < 1:
        page = 1

    skip = (page - 1) * 100
    cursor = db["users"].find(query).skip(skip).limit(100)
    records = await cursor.to_list(length=100)
    total = await db["users"].count_documents(query)
    total_pages = max(math.ceil(total / 100), 1)

    users = [
        UserOutput(
            id=str(u["_id"]),
            email=u["email"],
            first_name=u["first_name"],
            last_name=u["last_name"],
        )
        for u in records
    ]

    log_operation(client_ip, "GET", "/users")
    return UserListOutput(users=users, current_page=page, total_pages=total_pages)
