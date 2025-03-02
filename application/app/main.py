from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter
from app.routers import quizzes, healthcheck
from app.database import connect_to_mongo

import os
import aioredis

# Catch environment variables
BEARER_TOKEN = os.getenv("bearier_token")
rate_limit_times = int(os.getenv("rate_limit_times", "5"))
rate_limit_seconds = int(os.getenv("rate_limit_seconds", "60"))

if not BEARER_TOKEN:
    raise ValueError("A variável de ambiente BEARIER_TOKEN não está definida.")

app = FastAPI(
    title="OpenQUIZ",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Handler customizado para rate limit excedido (opcional)
@app.exception_handler(Exception)
async def custom_rate_limit_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=429,
        content={"message": "Ratelimit reached... only 5 checks per minute."}
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
    redis = aioredis.from_url("redis://valkey:6379", encoding="utf8", decode_responses=True)
    await FastAPILimiter.init(redis)

@app.on_event("shutdown")
async def shutdown():
    print("Encerrando aplicação...")

# Inclui o router de healthcheck com o rate limit de 5 requisições por minuto
app.include_router(
    healthcheck.router,
    prefix="/healthcheck",
    dependencies=[Depends(RateLimiter(times=rate_limit_times, seconds=rate_limit_seconds))],
    tags=["healthcheck"]
)

# Inclui o router de quizzes, protegido por autenticação
app.include_router(
    quizzes.router,
    prefix="/quizzes",
    dependencies=[Depends(authenticate)],
    tags=["quizzes"]
)
