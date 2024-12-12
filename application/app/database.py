from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
from pathlib import Path

# Caminho para o arquivo .env localizado em ../../.env
env_path = Path(__file__).resolve().parents[2] / '.env'
load_dotenv(dotenv_path=env_path)

async def connect_to_mongo(app):
    try:
        mongo_uri = os.getenv("MONGO_URI")
        if not mongo_uri:
            raise ValueError("A variável de ambiente MONGO_URI não está definida.")
        client = AsyncIOMotorClient(mongo_uri)
        app.state.db = client["openquiz"]
        print("Conexão com MongoDB estabelecida.")
    except Exception as e:
        print(f"Erro ao conectar ao MongoDB: {e}")
        app.state.db = None