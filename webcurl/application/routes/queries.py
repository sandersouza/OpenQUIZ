from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
from database import db  # Importa a conexão com o banco de dados

queries_collection = db.queries

queries_bp = Blueprint("queries", __name__, url_prefix="/queries")

@queries_bp.route("/", methods=["GET", "POST"])
def manage_queries():
    if request.method == "GET":
        try:
            queries = list(queries_collection.find())
            for query in queries:
                query["_id"] = str(query["_id"])
            return jsonify(queries), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    elif request.method == "POST":
        data = request.json
        if not data.get("name"):
            return jsonify({"error": "Query name is required"}), 400

        query = {
            "name": data["name"],
            "method": data.get("method", "GET"),
            "url": data.get("url", ""),
            "headers": data.get("headers", {}),
            "body": data.get("body", "")
        }

        try:
            result = queries_collection.insert_one(query)
            return jsonify({"message": "Query created successfully", "id": str(result.inserted_id)}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@queries_bp.route("/<query_id>", methods=["GET"])
def get_query(query_id):
    try:
        query = queries_collection.find_one({"_id": ObjectId(query_id)})
        if not query:
            return jsonify({"error": "Query not found"}), 404
        query["_id"] = str(query["_id"])
        return jsonify(query), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
