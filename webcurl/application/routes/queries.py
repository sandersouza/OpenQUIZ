from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
from database import db  # Conexão com o MongoDB

# Configuração da collection no MongoDB
queries_collection = db.queries

# Blueprint para as rotas de queries
queries_bp = Blueprint("queries", __name__, url_prefix="/queries")

# Rota para salvar ou atualizar uma query
@queries_bp.route("/", methods=["POST"])
def save_query():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON body"}), 400
        if not isinstance(data, dict):
            return jsonify({"error": "Payload must be a JSON object"}), 400

        # Verificar se o campo 'name' está presente
        if "name" not in data or not data["name"].strip():
            return jsonify({"error": "Query name is required"}), 400

        # Salvar ou atualizar a query
        query_id = data.get("_id")
        if query_id:
            updated_query = {
                "name": data["name"],
                "protocol": data.get("protocol", "HTTP"),
                "method": data.get("method", "GET"),
                "url": data.get("url", ""),
                "headers": data.get("headers", {}),
                "body": data.get("body", {}),
                "bearer_token": data.get("bearer_token", ""),
            }
            result = queries_collection.update_one(
                {"_id": ObjectId(query_id)}, {"$set": updated_query}
            )
            if result.matched_count == 0:
                return jsonify({"error": "Query not found"}), 404
            return jsonify({"message": "Query updated successfully"}), 200
        else:
            new_query = {
                "name": data["name"],
                "protocol": data.get("protocol", "HTTP"),
                "method": data.get("method", "GET"),
                "url": data.get("url", ""),
                "headers": data.get("headers", {}),
                "body": data.get("body", {}),
                "bearer_token": data.get("bearer_token", ""),
            }
            result = queries_collection.insert_one(new_query)
            return jsonify({"message": "Query created successfully", "id": str(result.inserted_id)}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Rota para buscar, atualizar ou deletar uma query existente
@queries_bp.route("/<query_id>", methods=["GET", "PUT", "DELETE"])
def handle_query(query_id):
    try:
        if request.method == "GET":
            query = queries_collection.find_one({"_id": ObjectId(query_id)})
            if not query:
                return jsonify({"error": "Query not found"}), 404
            query["_id"] = str(query["_id"])  # Converter ObjectId para string
            return jsonify(query), 200

        elif request.method == "PUT":
            try:
                data = request.get_json()
                if not data or "name" not in data or not data["name"].strip():
                    return jsonify({"error": "Invalid payload or missing 'name'"}), 400

                # Atualizar apenas os campos enviados no payload
                result = queries_collection.update_one(
                    {"_id": ObjectId(query_id)},
                    {"$set": data}
                )

                if result.matched_count == 0:
                    return jsonify({"error": "Query not found"}), 404

                return jsonify({"message": "Query updated successfully"}), 200
            except Exception as e:
                return jsonify({"error": str(e)}), 500

        elif request.method == "DELETE":
            result = queries_collection.delete_one({"_id": ObjectId(query_id)})
            if result.deleted_count == 0:
                return jsonify({"error": "Query not found"}), 404
            return jsonify({"message": "Query deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Rota para listar todas as queries
@queries_bp.route("/", methods=["GET"])
def list_queries():
    try:
        queries = list(queries_collection.find())
        for query in queries:
            query["_id"] = str(query["_id"])
        return jsonify(queries), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
