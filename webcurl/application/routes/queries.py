from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
from database import db  # Conexão com o MongoDB
import subprocess
import json

# Configuração da collection no MongoDB
queries_collection = db.queries

# Blueprint para as rotas de queries
queries_bp = Blueprint("queries", __name__, url_prefix="/queries")


# Rota para salvar ou atualizar uma query
@queries_bp.route("/", methods=["POST"])
def save_query():
    """
    Salva uma nova query ou atualiza uma existente.
    """
    try:
        data = request.json
        if not data.get("name"):
            return jsonify({"error": "Query name is required"}), 400

        # Verificar se estamos atualizando uma query existente
        query_id = data.get("_id")
        if query_id:
            # Atualizar query existente
            updated_query = {
                "name": data["name"],
                "protocol": data.get("protocol", "HTTP"),
                "method": data.get("method", "GET"),
                "url": data.get("url", ""),
                "headers": data.get("headers", {}),
                "body": data.get("body", ""),
                "bearer_token": data.get("bearer_token", ""),
            }
            result = queries_collection.update_one(
                {"_id": ObjectId(query_id)}, {"$set": updated_query}
            )
            if result.matched_count == 0:
                return jsonify({"error": "Query not found"}), 404
            return jsonify({"message": "Query updated successfully"}), 200
        else:
            # Criar uma nova query
            new_query = {
                "name": data["name"],
                "protocol": data.get("protocol", "HTTP"),
                "method": data.get("method", "GET"),
                "url": data.get("url", ""),
                "headers": data.get("headers", {}),
                "body": data.get("body", ""),
                "bearer_token": data.get("bearer_token", ""),
            }
            result = queries_collection.insert_one(new_query)
            return jsonify({"message": "Query created successfully", "id": str(result.inserted_id)}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Rota para buscar ou atualizar uma query existente
@queries_bp.route("/<query_id>", methods=["GET", "PUT"])
def handle_query(query_id):
    try:
        # Buscar query pelo ID
        if request.method == "GET":
            query = queries_collection.find_one({"_id": ObjectId(query_id)})
            if not query:
                return jsonify({"error": "Query not found"}), 404

            query["_id"] = str(query["_id"])  # Converter ObjectId para string
            return jsonify(query), 200

        # Atualizar query existente
        elif request.method == "PUT":
            data = request.json
            updated_query = {
                "protocol": data.get("protocol"),
                "method": data.get("method"),
                "url": data.get("url"),
                "headers": data.get("headers"),
                "body": data.get("body"),
                "bearer_token": data.get("bearer_token")
            }

            queries_collection.update_one({"_id": ObjectId(query_id)}, {"$set": updated_query})
            return jsonify({"message": "Query updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Rota para executar uma query
@queries_bp.route("/execute", methods=["POST"])
def execute_query():
    try:
        data = request.json
        url = data.get("url")
        method = data.get("method", "GET").upper()
        headers = data.get("headers", {})
        body = data.get("body", None)

        if not url:
            return jsonify({"error": "API URL/URI is required."}), 400

        # Construir o comando CURL
        curl_command = [
            "curl",
            "-k",  # Ignorar verificação SSL
            "-v",  # Verbose para capturar os headers
            "-X", method,
            f'"{url}"'
        ]

        # Adicionar headers ao comando CURL
        for key, value in headers.items():
            curl_command += ["-H", f'"{key}: {value}"']

        # Adicionar corpo da requisição, se houver
        if body:
            curl_command += ["-d", json.dumps(body)]

        # Executar o comando CURL
        result = subprocess.run(
            " ".join(curl_command),
            shell=True,
            capture_output=True,
            text=True,
            check=True
        )

        # Separar headers do corpo da resposta
        verbose_output = result.stderr.strip()
        response_headers = []
        for line in verbose_output.split("\n"):
            if line.startswith("<") and ": " in line:
                response_headers.append(line[2:].strip())

        # Processar o corpo da resposta
        output = result.stdout.strip()
        try:
            output_json = json.loads(output)
        except json.JSONDecodeError:
            output_json = output

        return jsonify({
            "status": "success",
            "output": output_json,
            "headers": response_headers
        })

    except subprocess.CalledProcessError as e:
        return jsonify({
            "status": "error",
            "error": e.stderr.strip()
        }), 400


@queries_bp.route("/", methods=["GET"])
def list_queries():
    """
    Retorna todas as queries existentes no MongoDB.
    """
    try:
        queries = list(queries_collection.find())
        # Converter ObjectId para string
        for query in queries:
            query["_id"] = str(query["_id"])
        return jsonify(queries), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
