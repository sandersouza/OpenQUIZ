from pymongo import MongoClient

# Configuração do MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client.webcurl
queries_collection = db.queries
