from fastapi import APIRouter, HTTPException, Request
from app.models import UserInput, UserOutput

router = APIRouter()

@router.post("/", response_model=UserOutput)
async def create_user(request: Request, user: UserInput):
    db = request.app.state.db
    if db is None:
        raise HTTPException(status_code=500, detail="Erro na conexão com o banco de dados")

    existing = await db["users"].find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")

    document = {
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "password": user.password
    }

    result = await db["users"].insert_one(document)
    created = await db["users"].find_one({"_id": result.inserted_id})

    return UserOutput(
        id=str(created["_id"]),
        email=created["email"],
        first_name=created["first_name"],
        last_name=created["last_name"]
    )
