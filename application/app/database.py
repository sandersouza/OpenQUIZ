from motor.motor_asyncio import AsyncIOMotorClient

async def connect_to_mongo(app):
    try:
        client = AsyncIOMotorClient("mongodb://mongo:27017")
        app.state.db = client["openquiz"]
        print("Conexão com MongoDB estabelecida.")
    except Exception as e:
        print(f"Erro ao conectar ao MongoDB: {e}")
        app.state.db = None
