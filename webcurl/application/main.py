import yaml
from flask import Flask, render_template, send_from_directory
from routes.queries import queries_bp
from routes.execute import execute_bp
from routes.static_files import static_bp
# Carregar configurações do config.yml
with open("config.yml", "r") as config_file:
    config = yaml.safe_load(config_file)

# Inicializar o Flask
app = Flask(__name__, template_folder="templates", static_folder="static")
app.config["DEBUG"] = config["flask"]["debug"]

# Registrar Blueprints
app.register_blueprint(queries_bp)
app.register_blueprint(execute_bp)
app.register_blueprint(static_bp)
# Rota para a pasta styles
@app.route("/styles/<path:filename>")
def serve_styles(filename):
    """Serve arquivos CSS da pasta styles."""
    return send_from_directory("styles", filename)

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(
        host=config["flask"]["host"],
        port=config["flask"]["port"],
        debug=config["flask"]["debug"]
    )
