import subprocess
import json
from flask import Blueprint, request, jsonify

execute_bp = Blueprint("execute", __name__, url_prefix="/execute")

@execute_bp.route("/", methods=["POST"])
def execute_query():
    data = request.json
    url = data.get("url")
    method = data.get("method", "GET").upper()
    headers = data.get("headers", {})
    body = data.get("body", "")
    token = data.get("bearer_token", "")

    if not url:
        return jsonify({"error": "URL is required"}), 400

    curl_command = [
        "curl", "-k", "-v", "-X", method, f'"{url}"'
    ]

    if token:
        headers["Authorization"] = f"Bearer {token}"

    for key, value in headers.items():
        curl_command += ["-H", f'"{key}: {value}"']

    if body:
        body_doublequote = json.dumps(body)
        curl_command += ["-d", f'\'{body_doublequote}\'']

    curl_command_str = " ".join(curl_command)
    print("Generated CURL Command:", curl_command_str)

    try:
        result = subprocess.run(
            curl_command_str, shell=True, capture_output=True, text=True, check=True
        )
        verbose_output = result.stderr.strip()
        response_headers = [
            line[2:].strip() for line in verbose_output.split("\n")
            if line.startswith("<") and ": " in line
        ]
        output = result.stdout.strip()
        try:
            output_json = json.loads(output)
        except json.JSONDecodeError:
            output_json = output

        return jsonify({
            "status": "success",
            "curl_command": curl_command_str,
            "output": output_json,
            "headers": response_headers
        })

    except subprocess.CalledProcessError as e:
        return jsonify({
            "status": "error",
            "curl_command": curl_command_str,
            "error": e.stderr.strip()
        }), 400
