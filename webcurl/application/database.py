import os
import yaml
from tinydb import TinyDB, Query

def load_config(config_path="config.yml"):
    with open(config_path, "r") as config_file:
        return yaml.safe_load(config_file)

config = load_config()

# Obtenha o caminho do DB a partir de uma variável de ambiente, ou use um padrão gravável
db_path = os.getenv("TINYDB_PATH", "/tmp/db.json")

db = TinyDB(db_path)
queries_table = db.table("queries")
