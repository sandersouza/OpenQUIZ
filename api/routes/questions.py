from flask import Blueprint, jsonify, request
from services.db import get_db_connection
import yaml
from functools import wraps

questions_blueprint = Blueprint('questions', __name__)

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

# Criar uma nova pergunta para um quiz
@questions_blueprint.route('', methods=['POST'])
@token_required
def create_question():
    data = request.json
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # Inserir pergunta
        cursor.execute(
            "INSERT INTO questions (quiz_id, question_text, points) VALUES (%s, %s, %s)",
            (data['quiz_id'], data['question_text'], data.get('points', 150)),
        )
        conn.commit()
        question_id = cursor.lastrowid  # Recuperar o ID da pergunta inserida

        # Inserir respostas associadas à pergunta
        for answer in data['answers']:
            cursor.execute(
                "INSERT INTO answers (question_id, answer_text, is_correct) VALUES (%s, %s, %s)",
                (question_id, answer['answer_text'], answer['is_correct']),
            )
        conn.commit()

        return jsonify({"message": "Question created successfully", "question_id": question_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# Listar todas as perguntas de um quiz
@questions_blueprint.route('/<int:quiz_id>', methods=['GET'])
@token_required
def list_questions(quiz_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Buscar perguntas relacionadas ao quiz
        cursor.execute(
            "SELECT id, question_text, points FROM questions WHERE quiz_id = %s",
            (quiz_id,)
        )
        questions = cursor.fetchall()

        question_list = []
        for question in questions:
            question_id, question_text, points = question

            # Buscar respostas para cada pergunta
            cursor.execute(
                "SELECT id, answer_text, is_correct FROM answers WHERE question_id = %s",
                (question_id,)
            )
            answers = cursor.fetchall()

            # Adicionar pergunta e respostas ao formato compacto
            question_list.append({
                "question_id": question_id,  # Adicionando question_id
                "question_text": question_text,
                "points": points,
                "answers": [
                    {
                        "id": a[0],
                        "answer_text": a[1],
                        "is_correct": bool(a[2])  # Convertendo para boolean
                    } for a in answers
                ]
            })

        return jsonify(question_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# Atualizar uma pergunta existente
@questions_blueprint.route('/<int:question_id>', methods=['PUT'])
@token_required
def update_question(question_id):
    data = request.json
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Verificar se a pergunta existe
        cursor.execute("SELECT id FROM questions WHERE id = %s", (question_id,))
        question = cursor.fetchone()
        if not question:
            return jsonify({"message": "Question not found"}), 404

        # Atualizar a pergunta
        cursor.execute(
            "UPDATE questions SET question_text = %s, points = %s WHERE id = %s",
            (data['question_text'], data.get('points', 150), question_id),
        )
        conn.commit()

        # Obter IDs das respostas atuais no banco
        cursor.execute(
            "SELECT id FROM answers WHERE question_id = %s", (question_id,)
        )
        current_answer_ids = {row[0] for row in cursor.fetchall()}

        # IDs das respostas enviadas na requisição
        sent_answer_ids = {answer.get("id") for answer in data['answers'] if "id" in answer}

        # Determinar quais respostas precisam ser removidas
        answers_to_delete = current_answer_ids - sent_answer_ids

        # Remover respostas que não estão na requisição
        if answers_to_delete:
            cursor.executemany(
                "DELETE FROM answers WHERE id = %s", [(answer_id,) for answer_id in answers_to_delete]
            )

        # Atualizar ou inserir respostas
        for answer in data['answers']:
            if "id" in answer:
                # Atualizar resposta existente
                cursor.execute(
                    "UPDATE answers SET answer_text = %s, is_correct = %s WHERE id = %s",
                    (answer['answer_text'], answer['is_correct'], answer['id']),
                )
            else:
                # Inserir nova resposta
                cursor.execute(
                    "INSERT INTO answers (question_id, answer_text, is_correct) VALUES (%s, %s, %s)",
                    (question_id, answer['answer_text'], answer['is_correct']),
                )
        conn.commit()

        return jsonify({"message": "Question and answers updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# Excluir uma pergunta existente
@questions_blueprint.route('/<int:question_id>', methods=['DELETE'])
@token_required
def delete_question(question_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM questions WHERE id = %s", (question_id,))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"message": "Question not found"}), 404
        return jsonify({"message": "Question deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()