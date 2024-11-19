from flask import Blueprint, jsonify, request
from services.db import get_db_connection
import yaml
from functools import wraps

quizzes_blueprint = Blueprint('quizzes', __name__)

# Carregar o token do config.yml
with open("config.yml", "r") as f:
    config = yaml.safe_load(f)
BEARER_TOKEN = config["auth"]["bearer_token"]

# Middleware para autenticação
def token_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token or not token.startswith("Bearer "):
            return jsonify({"message": "Token is missing or invalid"}), 403
        provided_token = token.split(" ")[1]
        if provided_token != BEARER_TOKEN:
            return jsonify({"message": "Invalid token"}), 403
        return f(*args, **kwargs)
    return wrapper

# Listar todos os quizzes
@quizzes_blueprint.route('', methods=['GET'])
@token_required
def list_quizzes():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, name FROM quizzes")
        quizzes = cursor.fetchall()
        result = [{"id": q[0], "name": q[1]} for q in quizzes]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Criar um novo quiz
@quizzes_blueprint.route('', methods=['POST'])
@token_required
def create_quiz():
    data = request.json
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO quizzes (name) VALUES (%s)", (data['name'],))
        conn.commit()
        return jsonify({"message": "Quiz created", "id": cursor.lastrowid}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Obter detalhes de um quiz específico (incluindo perguntas e respostas)
@quizzes_blueprint.route('/<int:id>', methods=['GET'])
@token_required
def get_quiz(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Obter detalhes do quiz
        cursor.execute("SELECT id, name FROM quizzes WHERE id = %s", (id,))
        quiz = cursor.fetchone()
        if not quiz:
            return jsonify({"message": "Quiz not found"}), 404

        # Obter perguntas relacionadas ao quiz
        cursor.execute("SELECT id, question_text, points FROM questions WHERE quiz_id = %s", (id,))
        questions = cursor.fetchall()

        question_list = []
        for question in questions:
            question_id, question_text, points = question

            # Obter respostas para cada pergunta
            cursor.execute("SELECT id, answer_text, is_correct FROM answers WHERE question_id = %s", (question_id,))
            answers = cursor.fetchall()

            question_list.append({
                "id": question_id,
                "text": question_text,
                "points": points,
                "answers": [{"id": a[0], "text": a[1], "is_correct": a[2]} for a in answers]
            })

        result = {
            "id": quiz[0],
            "name": quiz[1],
            "questions": question_list
        }
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Atualizar um quiz existente
@quizzes_blueprint.route('/<int:id>', methods=['PUT'])
@token_required
def update_quiz(id):
    data = request.json
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE quizzes SET name = %s WHERE id = %s", (data['name'], id))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"message": "Quiz not found"}), 404
        return jsonify({"message": "Quiz updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Excluir um quiz
@quizzes_blueprint.route('/<int:id>', methods=['DELETE'])
@token_required
def delete_quiz(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM quizzes WHERE id = %s", (id,))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"message": "Quiz not found"}), 404
        return jsonify({"message": "Quiz deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500