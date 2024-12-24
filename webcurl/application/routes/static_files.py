import os
from flask import Blueprint, send_from_directory

static_bp = Blueprint("static_files", __name__)

@static_bp.route("/scripts/<path:filename>")
def serve_script(filename):
    return send_from_directory("scripts", filename)
