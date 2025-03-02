from flask import Blueprint, request, jsonify
from tinydb import Query as TinyQuery
from database import queries_table  # queries_table é a "tabela" do TinyDB

queries_bp = Blueprint("queries", __name__, url_prefix="/queries")

def build_query_payload(data):
    """Constroi o payload da query a partir dos dados recebidos."""
    return {
        "name": data["name"],
        "protocol": data.get("protocol", "HTTP"),
        "method": data.get("method", "GET"),
        "url": data.get("url", ""),
        "headers": data.get("headers", {}),
        "body": data.get("body", {}),
        "bearer_token": data.get("bearer_token", ""),
    }

# Rota para salvar ou atualizar uma query
@queries_bp.route("/", methods=["POST"])
def save_query():
    try:
        data = request.get_json()
        if not data or not isinstance(data, dict):
            return jsonify({"error": "Invalid JSON payload"}), 400

        if "name" not in data or not data["name"].strip():
            return jsonify({"error": "Query name is required"}), 400

        query_payload = build_query_payload(data)
        query_id = data.get("_id")
        if query_id:
            try:
                query_id_int = int(query_id)
            except ValueError:
                return jsonify({"error": "Invalid query ID"}), 400

            if queries_table.contains(doc_id=query_id_int):
                queries_table.update(query_payload, doc_ids=[query_id_int])
                return jsonify({"message": "Query updated successfully"}), 200
            else:
                return jsonify({"error": "Query not found"}), 404
        else:
            new_id = queries_table.insert(query_payload)
            return jsonify({"message": "Query created successfully", "id": str(new_id)}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Rota para buscar, atualizar ou deletar uma query existente
@queries_bp.route("/<query_id>", methods=["GET", "PUT", "DELETE"])
def handle_query(query_id):
    try:
        try:
            query_id_int = int(query_id)
        except ValueError:
            return jsonify({"error": "Invalid query ID"}), 400

        if request.method == "GET":
            query = queries_table.get(doc_id=query_id_int)
            if not query:
                return jsonify({"error": "Query not found"}), 404
            query["_id"] = str(query_id_int)
            return jsonify(query), 200

        elif request.method == "PUT":
            data = request.get_json()
            if not data or "name" not in data or not data["name"].strip():
                return jsonify({"error": "Invalid payload or missing 'name'"}), 400

            if queries_table.contains(doc_id=query_id_int):
                queries_table.update(data, doc_ids=[query_id_int])
                return jsonify({"message": "Query updated successfully"}), 200
            else:
                return jsonify({"error": "Query not found"}), 404

        elif request.method == "DELETE":
            if queries_table.contains(doc_id=query_id_int):
                queries_table.remove(doc_ids=[query_id_int])
                return jsonify({"message": "Query deleted successfully"}), 200
            else:
                return jsonify({"error": "Query not found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Rota para listar todas as queries
@queries_bp.route("/", methods=["GET"])
def list_queries():
    try:
        # Obter todos os documentos da tabela
        docs = queries_table.all()
        for doc in docs:
            # Cada documento TinyDB possui um atributo interno 'doc_id'
            doc["_id"] = str(doc.doc_id)
        return jsonify(docs), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
