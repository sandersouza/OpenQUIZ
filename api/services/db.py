import yaml
from pymongo import MongoClient
import os

# Carregar configurações do arquivo config.yml
config_file = "config.yml"
with open(config_file, "r") as file:
    config = yaml.safe_load(file)

MONGO_URI = config.get("mongo", {}).get("uri", "mongodb://localhost:27017/openquiz")
BEARER_TOKEN = config.get("auth", {}).get("bearer_token", None)

# Configuração da conexão com o MongoDB
client = MongoClient(MONGO_URI)
db = client.get_database()

# Coleções do MongoDB
quizzes_collection = db["quizzes"]
questions_collection = db["questions"]
answers_collection = db["answers"]