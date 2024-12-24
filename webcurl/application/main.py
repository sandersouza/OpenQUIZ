from flask import Flask, render_template
from routes.queries import queries_bp
from routes.execute import execute_bp
from routes.static_files import static_bp

# Inicializar o Flask
app = Flask(__name__, template_folder="templates", static_folder="static")

# Registrar Blueprints
app.register_blueprint(queries_bp)
app.register_blueprint(execute_bp)
app.register_blueprint(static_bp)

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8082, debug=True)
