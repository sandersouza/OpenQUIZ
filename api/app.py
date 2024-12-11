from flask import Flask
from routes.quizzes import quizzes_bp
from routes.questions import questions_bp

app = Flask(__name__)

# Registro dos Blueprints
app.register_blueprint(quizzes_bp, url_prefix="")
app.register_blueprint(questions_bp, url_prefix="")

# Rota de healthcheck
@app.route("/health", methods=["GET"])
def health_check():
    return {"status": "ok"}, 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)