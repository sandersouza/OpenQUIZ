from flask import Blueprint, request, jsonify
from tinydb import Query as TinyQuery
from database import collections_table, queries_table

collections_bp = Blueprint("collections", __name__, url_prefix="/collections")

@collections_bp.route("/", methods=["POST"])
def create_collection():
    data = request.get_json()
    if not data or "name" not in data or not data["name"].strip():
        return jsonify({"error": "Collection name is required"}), 400
    payload = {
        "name": data["name"],
        "variables": data.get("variables", {})
    }
    new_id = collections_table.insert(payload)
    return jsonify({"message": "Collection created successfully", "id": str(new_id)}), 201

@collections_bp.route("/", methods=["GET"])
def list_collections():
    cols = collections_table.all()
    result = []
    for col in cols:
        col_id = col.doc_id
        col_data = dict(col)
        col_data["_id"] = str(col_id)
        queries = queries_table.search(TinyQuery().collection_id == col_id)
        for q in queries:
            q["_id"] = str(q.doc_id)
        col_data["queries"] = queries
        result.append(col_data)
    return jsonify(result), 200

@collections_bp.route("/<collection_id>", methods=["GET", "PUT", "DELETE"])
def handle_collection(collection_id):
    try:
        col_id = int(collection_id)
    except ValueError:
        return jsonify({"error": "Invalid collection ID"}), 400

    if request.method == "GET":
        col = collections_table.get(doc_id=col_id)
        if not col:
            return jsonify({"error": "Collection not found"}), 404
        col_data = dict(col)
        col_data["_id"] = str(col_id)
        queries = queries_table.search(TinyQuery().collection_id == col_id)
        for q in queries:
            q["_id"] = str(q.doc_id)
        col_data["queries"] = queries
        return jsonify(col_data), 200

    elif request.method == "PUT":
        data = request.get_json()
        if not data or "name" not in data:
            return jsonify({"error": "Invalid payload or missing 'name'"}), 400
        if collections_table.contains(doc_id=col_id):
            collections_table.update(data, doc_ids=[col_id])
            return jsonify({"message": "Collection updated successfully"}), 200
        return jsonify({"error": "Collection not found"}), 404

    elif request.method == "DELETE":
        if collections_table.contains(doc_id=col_id):
            queries_table.update({"collection_id": None}, TinyQuery().collection_id == col_id)
            collections_table.remove(doc_ids=[col_id])
            return jsonify({"message": "Collection deleted successfully"}), 200
        return jsonify({"error": "Collection not found"}), 404
