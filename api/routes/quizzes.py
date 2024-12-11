from flask import Blueprint, request, jsonify
from services.db import quizzes_collection, BEARER_TOKEN
from bson.objectid import ObjectId

quizzes_bp = Blueprint("quizzes", __name__)

def authenticate(request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or auth_header.split(" ")[1] != BEARER_TOKEN:
        return False
    return True

@quizzes_bp.route("/quizzes", methods=["POST"])
def create_quiz():
    if not authenticate(request):
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    quiz_name = data.get("name")
    if not quiz_name:
        return jsonify({"error": "Quiz name is required"}), 400

    quiz = {"name": quiz_name}
    result = quizzes_collection.insert_one(quiz)
    return jsonify({"id": str(result.inserted_id), "name": quiz_name}), 201


@quizzes_bp.route("/quizzes", methods=["GET"])
def list_quizzes():
    if not authenticate(request):
        return jsonify({"error": "Unauthorized"}), 401

    quizzes = quizzes_collection.find()
    quizzes_list = [{"id": str(q["_id"]), "name": q["name"]} for q in quizzes]
    return jsonify(quizzes_list), 200


@quizzes_bp.route("/quizzes/<quiz_id>", methods=["PUT"])
def update_quiz(quiz_id):
    if not authenticate(request):
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    quiz_name = data.get("name")
    if not quiz_name:
        return jsonify({"error": "Quiz name is required"}), 400

    result = quizzes_collection.update_one(
        {"_id": ObjectId(quiz_id)}, {"$set": {"name": quiz_name}}
    )

    if result.matched_count == 0:
        return jsonify({"error": "Quiz not found"}), 404

    return jsonify({"id": quiz_id, "name": quiz_name}), 200


@quizzes_bp.route("/quizzes/<quiz_id>", methods=["DELETE"])
def delete_quiz(quiz_id):
    if not authenticate(request):
        return jsonify({"error": "Unauthorized"}), 401

    result = quizzes_collection.delete_one({"_id": ObjectId(quiz_id)})

    if result.deleted_count == 0:
        return jsonify({"error": "Quiz not found"}), 404

    return jsonify({"message": "Quiz deleted successfully"}), 200