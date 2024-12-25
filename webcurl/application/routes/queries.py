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
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON body"}), 400
        if not data.get("name"):
            return jsonify({"error": "Query name is required"}), 400

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
