import mysql.connector
import yaml

# Carregar configuração
with open("config.yml", "r") as f:
    config = yaml.safe_load(f)
mysql_config = config["mysql"]

def get_db_connection():
    return mysql.connector.connect(
        host=mysql_config["host"],
        user=mysql_config["user"],
        password=mysql_config["password"],
        database=mysql_config["database"],
    )