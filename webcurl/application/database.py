import yaml
from pymongo import MongoClient

# Carregar configurações do config.yml
with open("config.yml", "r") as config_file:
    config = yaml.safe_load(config_file)

# Configuração do MongoDB
client = MongoClient(config["mongodb"]["uri"])
db = client[config["mongodb"]["database"]]
