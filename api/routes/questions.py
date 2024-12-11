from flask import Blueprint, request, jsonify
from services.db import quizzes_collection, BEARER_TOKEN
from bson.objectid import ObjectId

questions_bp = Blueprint("questions", __name__)

def authenticate(request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or auth_header.split(" ")[1] != BEARER_TOKEN:
        return False
    return True

@questions_bp.route("/questions", methods=["POST"])
def create_question():
    if not authenticate(request):
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    quiz_id = data.get("quiz_id")
    question_text = data.get("question_text")
    points = data.get("points", 150)
    answers = data.get("answers", [])

    if not quiz_id or not question_text or not answers:
        return jsonify({"error": "quiz_id, question_text, and answers are required"}), 400

    question = {
        "question_text": question_text,
        "points": points,
        "answers": [
            {"answer_text": a.get("answer_text"), "is_correct": a.get("is_correct")}
            for a in answers if a.get("answer_text") and a.get("is_correct") is not None
        ],
    }

    result = quizzes_collection.update_one(
        {"_id": ObjectId(quiz_id)},
        {"$push": {"questions": question}}
    )

    if result.matched_count == 0:
        return jsonify({"error": "Quiz not found"}), 404

    return jsonify({"message": "Question added to quiz successfully"}), 201


@questions_bp.route("/questions/<quiz_id>", methods=["GET"])
def list_questions(quiz_id):
    if not authenticate(request):
        return jsonify({"error": "Unauthorized"}), 401

    quiz = quizzes_collection.find_one({"_id": ObjectId(quiz_id)})

    if not quiz:
        return jsonify({"error": "Quiz not found"}), 404

    questions = quiz.get("questions", [])

    return jsonify(questions), 200


@questions_bp.route("/questions/<quiz_id>", methods=["PUT"])
def update_questions(quiz_id):
    if not authenticate(request):
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()

    if not isinstance(data, list):
        return jsonify({"error": "Payload must be a list of questions"}), 400

    updated_questions = [
        {
            "question_text": q.get("question_text"),
            "points": q.get("points", 150),
            "answers": [
                {"answer_text": a.get("answer_text"), "is_correct": a.get("is_correct")}
                for a in q.get("answers", []) if a.get("answer_text") and a.get("is_correct") is not None
            ],
        }
        for q in data if q.get("question_text")
    ]

    result = quizzes_collection.update_one(
        {"_id": ObjectId(quiz_id)},
        {"$set": {"questions": updated_questions}}
    )

    if result.matched_count == 0:
        return jsonify({"error": "Quiz not found"}), 404

    return jsonify({"message": "Questions updated successfully"}), 200


@questions_bp.route("/questions/<quiz_id>", methods=["DELETE"])
def delete_questions(quiz_id):
    if not authenticate(request):
        return jsonify({"error": "Unauthorized"}), 401

    result = quizzes_collection.update_one(
        {"_id": ObjectId(quiz_id)},
        {"$unset": {"questions": ""}}
    )

    if result.matched_count == 0:
        return jsonify({"error": "Quiz not found"}), 404

    return jsonify({"message": "Questions deleted successfully"}), 200