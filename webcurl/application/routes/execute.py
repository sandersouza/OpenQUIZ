import subprocess
import json
import time
from flask import Blueprint, request, jsonify

execute_bp = Blueprint("execute", __name__, url_prefix="/execute")

@execute_bp.route("/", methods=["POST"])
def execute_query():
    data = request.json
    protocol = data.get("protocol", "HTTP")
    url = data.get("url")
    method = data.get("method", "GET").upper()
    headers = data.get("headers", {})
    body = data.get("body", "")
    token = data.get("bearer_token", "")

    if not url:
        return jsonify({"error": "URL is required"}), 400

    # Construir o comando CURL
    curl_command = ["curl"]

    # Adicionar flag --http3 se o protocolo for HTTP/3
    if protocol.upper() == "HTTP/3":
        curl_command += ["--http3", "-k", "-v", "-X", method, f'"{url}"']
    else:
        curl_command += ["-k", "-v", "-X", method, f'"{url}"']

    # Adicionar token ao cabeçalho se existir
    if token:
        headers["Authorization"] = f"Bearer {token}"

    # Adicionar cabeçalhos ao comando
    for key, value in headers.items():
        curl_command += ["-H", f'"{key}: {value}"']

    # Adicionar corpo da requisição se houver
    if body:
        body_doublequote = json.dumps(body)
        curl_command += ["-d", f'\'{body_doublequote}\'']

    # Converter o comando para string para depuração
    curl_command_str = " ".join(curl_command)

    try:
        # Medir o tempo de execução
        start_time = time.time()
        result = subprocess.run(
            curl_command_str, shell=True, capture_output=True, text=True, check=True
        )
        end_time = time.time()
        response_time = (end_time - start_time) * 1000  # Tempo em milissegundos

        verbose_output = result.stderr.strip()

        # Separar headers da resposta
        response_headers = [
            line[2:].strip() for line in verbose_output.split("\n")
            if line.startswith("<") and ": " in line
        ]

        # Adicionar o tempo de resposta ao cabeçalho HTTP/3 ou HTTP
        status_line = next((line[2:].strip() for line in verbose_output.split("\n") if line.startswith("< HTTP/")), "")
        if status_line:
            status_line += f" (Response time {response_time:.2f}ms)"

        # Processar corpo da resposta
        output = result.stdout.strip()
        try:
            output_json = json.loads(output)
        except json.JSONDecodeError:
            output_json = output

        return jsonify({
            "status": "success",
            "curl_command": curl_command_str,
            "output": output_json,
            "headers": [status_line] + response_headers
        })

    except subprocess.CalledProcessError as e:
        return jsonify({
            "status": "error",
            "curl_command": curl_command_str,
            "error": e.stderr.strip()
        }), 400
