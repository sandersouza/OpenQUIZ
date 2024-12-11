#!./venv/bin/python3
import argparse
import json
import os
import logging
from pymongo import MongoClient

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s - %(name)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

# Reduzir verbosidade dos logs do PyMongo
logging.getLogger("pymongo").setLevel(logging.WARNING)

def main():
    # Configurar argumentos da linha de comando
    parser = argparse.ArgumentParser(description="Inserir um payload JSON em um banco de dados MongoDB.")
    parser.add_argument("-d", "--database", type=str, required=True, help="Nome do banco de dados.")
    parser.add_argument("-c", "--collection", type=str, required=True, help="Nome da coleção.")
    parser.add_argument("-k", "--api_key", type=str, help="Chave da API, se necessário.")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--payload", type=str, help="Payload JSON a ser inserido no MongoDB.")
    group.add_argument("--payload-file", type=str, help="Caminho para um arquivo JSON contendo o payload a ser inserido.")

    # Exibir ajuda e sair se não houver argumentos
    if len(os.sys.argv) == 1:
        parser.print_help()
        return

    # Parse dos argumentos
    args = parser.parse_args()

    # MongoDB URI (ajustável para diferentes ambientes)
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")

    # Carregar o payload (direto ou de arquivo)
    try:
        if args.payload:
            payload = json.loads(args.payload)
            logging.info("Payload JSON fornecido diretamente foi validado com sucesso.")
        elif args.payload_file:
            with open(args.payload_file, "r", encoding="utf-8") as file:
                payload = json.load(file)
                logging.info(f"Payload JSON carregado do arquivo '{args.payload_file}' foi validado com sucesso.")
    except (TypeError, json.JSONDecodeError) as e:
        logging.error(f"Erro ao validar o payload JSON: {e}")
        return
    except FileNotFoundError:
        logging.error(f"O arquivo '{args.payload_file}' não foi encontrado.")
        return

    # Conectar ao MongoDB
    try:
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)  # Timeout de 5 segundos
        client.server_info()  # Valida a conexão com o servidor
        db = client[args.database]
        collection = db[args.collection]
        logging.info(f"Conectado ao banco de dados '{args.database}' e coleção '{args.collection}'.")
    except Exception as e:
        logging.error(f"Erro ao conectar ao MongoDB: {e}")
        return

    # Validar se a coleção existe (apenas se já houver documentos na coleção)
    if args.collection not in db.list_collection_names():
        logging.warning(f"A coleção '{args.collection}' não existe. Será criada automaticamente ao inserir o documento.")

    # Inserir o documento no MongoDB
    try:
        if args.api_key:
            payload['api_key'] = args.api_key  # Adicionar api_key ao payload se fornecida

        result = collection.insert_one(payload)
        logging.info(f"Documento inserido com sucesso. ID: {result.inserted_id}")
    except Exception as e:
        logging.error(f"Erro ao inserir o documento no MongoDB: {e}")

if __name__ == "__main__":
    main()
