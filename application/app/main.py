from fastapi import FastAPI
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi
from app.routers import quizzes
from app.database import connect_to_mongo

app = FastAPI(
    title="OpenQUIZ",
    version="1.0.0",
    docs_url="/docs",  # Caminho para o Swagger
    redoc_url="/redoc",  # Caminho para o ReDoc
    openapi_url="/openapi.json"  # Caminho para o JSON do OpenAPI
)

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

@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(openapi_url="/openapi.json", title="API Docs")

@app.get("/openapi.json", include_in_schema=False)
async def custom_openapi():
    return get_openapi(title="FastAPI", version="1.0.0", routes=app.routes)