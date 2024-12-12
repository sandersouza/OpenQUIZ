from fastapi import FastAPI
from app.routers import quizzes
from app.database import connect_to_mongo

app = FastAPI()

@app.on_event("startup")
async def startup():
    print("Iniciando conexão com o MongoDB...")
    await connect_to_mongo(app)

@app.on_event("shutdown")
async def shutdown():
    print("Encerrando aplicação...")

# Inclusão de roteadores
app.include_router(quizzes.router, prefix="/quizzes", tags=["Quizzes"])

# Rota para o endpoint schema
@app.get("/schema")
async def get_schema():
    return app.openapi()

# Rota para o endpoint raiz
@app.get("/")
async def root():
    return {"openquiz": "status ok"}
