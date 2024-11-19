import yaml
from flask import Flask, request, jsonify
import mysql.connector
import os

app = Flask(__name__)

# Load configuration from config.yml
with open("config.yml", "r") as f:
    config = yaml.safe_load(f)
mysql_config = config["mysql"]

# Database connection 
def get_db_connection():
    return mysql.connector.connect(
        host=mysql_config["host"],
        user=mysql_config["user"],
        password=mysql_config["password"],
        database=mysql_config["database"],
    )

# Routes
@app.route('/quizzes', methods=['POST'])
def create_quiz():
    data = request.json
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO quizzes (name) VALUES (%s)", (data['name'],))
        conn.commit()
        quiz_id = cursor.lastrowid  # Retrieve the last inserted ID
        return jsonify({"message": "Quiz created successfully", "quiz_id": quiz_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/quizzes', methods=['GET'])
def list_quizzes():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, name FROM quizzes")
        quizzes = cursor.fetchall()
        return jsonify([{"id": q[0], "name": q[1]} for q in quizzes]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/quizzes/<int:id>', methods=['PUT'])
def edit_quiz(id):
    data = request.json
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE quizzes SET name = %s WHERE id = %s", (data['name'], id))
        conn.commit()
        return jsonify({"message": "Quiz updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/quizzes/<int:id>', methods=['DELETE'])
def delete_quiz(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM quizzes WHERE id = %s", (id,))
        conn.commit()
        return jsonify({"message": "Quiz deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/questions', methods=['POST'])
def create_question():
    data = request.json
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # Insert question
        cursor.execute(
            "INSERT INTO questions (quiz_id, question_text, points) VALUES (%s, %s, %s)",
            (data['quiz_id'], data['question_text'], data.get('points', 150)),
        )
        conn.commit()
        question_id = cursor.lastrowid  # Retrieve the last inserted ID for the question

        # Insert answers
        for answer in data['answers']:
            cursor.execute(
                "INSERT INTO answers (question_id, answer_text, is_correct) VALUES (%s, %s, %s)",
                (question_id, answer['answer_text'], answer['is_correct']),
            )
        conn.commit()

        return jsonify({"message": "Question and answers created successfully", "question_id": question_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)