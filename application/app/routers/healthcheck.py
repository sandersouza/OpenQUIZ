from fastapi import APIRouter, Request
from datetime import datetime
import os

router = APIRouter()

def log_operation(ip: str, method: str, route: str, quiz_id: str = "N/A", status: str = "success"):
    timestamp = datetime.now().astimezone().strftime("%Y-%m-%d %H:%M:%S %z")
    pid = os.getpid()
    log_message = f"[{timestamp}] [{pid}] [INFO] {ip} - [{status}][{method.upper()}] Operation on {route} with status ok."
    print(log_message)

@router.get("/")
async def healthcheck(request: Request):
    ip = request.client.host if request.client else "unknown"
    log_operation(ip, "GET", "/healthcheck")
    return {"openquiz": "status ok"}
