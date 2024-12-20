from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.routers import quizzes
from app.database import connect_to_mongo
import yaml

# Carregar token do arquivo config.yml
def load_token():
    with open("config.yml", "r") as file:
        config = yaml.safe_load(file)
    return config["auth"]["bearer_token"]

BEARER_TOKEN = load_token()

# Instância do FastAPI
app = FastAPI(
    title="OpenQUIZ",
    version="1.0.0",
    docs_url="/docs",  # Caminho para o Swagger
    redoc_url="/redoc",  # Caminho para o ReDoc
    openapi_url="/openapi.json"  # Caminho para o JSON do OpenAPI
)

# Middleware de autenticação
security = HTTPBearer()

async def authenticate(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials.scheme != "Bearer" or credentials.credentials != BEARER_TOKEN:
        raise HTTPException(status_code=403, detail="Invalid or missing Bearer Token")

@app.on_event("startup")
async def startup():
    print("Iniciando conexão com o MongoDB...")
    await connect_to_mongo(app)

@app.on_event("shutdown")
async def shutdown():
    print("Encerrando aplicação...")

# Inclusão de roteadores com autenticação
app.include_router(
    quizzes.router, prefix="/quizzes", tags=["Quizzes"], dependencies=[Depends(authenticate)]
)

# Rota para o endpoint raiz (protegida)
@app.get("/", dependencies=[Depends(authenticate)])
async def root():
    return {"openquiz": "status ok"}
