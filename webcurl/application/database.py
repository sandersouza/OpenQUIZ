import os
import yaml
from tinydb import TinyDB, Query

def load_config(config_path="config.yml"):
    with open(config_path, "r") as config_file:
        return yaml.safe_load(config_file)

config = load_config()

# Determine o caminho do DB a partir da variável de ambiente ou de locais padrões
db_path = os.getenv("TINYDB_PATH")
if not db_path:
    # Caminho dentro do repositório (../data/db/db.json)
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    candidate = os.path.join(repo_root, "data", "db", "db.json")
    if os.path.exists(candidate):
        db_path = candidate
    else:
        # Fallback para dentro do diretório da aplicação
        db_path = os.path.join(os.path.dirname(__file__), "db.json")

# Garante que a pasta exista para evitar erros ao abrir o arquivo
os.makedirs(os.path.dirname(db_path), exist_ok=True)

db = TinyDB(db_path)
queries_table = db.table("queries")
collections_table = db.table("collections")
