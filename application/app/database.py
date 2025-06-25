from motor.motor_asyncio import AsyncIOMotorClient
import os

async def connect_to_mongo(app):
    try:
        mongo_srv = os.getenv("mongo_srv")
        mongo_port = os.getenv("mongo_port")

        if not mongo_srv or not mongo_port:
            raise ValueError("As variáveis de ambiente 'mongo_srv' e 'mongo_port' devem estar definidas.")

        mongo_uri = f"mongodb://{mongo_srv}:{mongo_port}"
        client = AsyncIOMotorClient(mongo_uri)
        app.state.db = client["openquiz"]
        print("Conexão com MongoDB estabelecida.")
    except Exception as e:
        print(f"Erro ao conectar ao MongoDB: {e}")
        app.state.db = None
