from flask import Flask
from routes.quizzes import quizzes_blueprint
from routes.questions import questions_blueprint

app = Flask(__name__)

# Registrar Blueprints
app.register_blueprint(quizzes_blueprint, url_prefix='/quizzes')
app.register_blueprint(questions_blueprint, url_prefix='/questions')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)