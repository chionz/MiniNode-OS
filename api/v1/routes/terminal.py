import os
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, Field


terminal = APIRouter(prefix="/terminal", tags=["Terminal Commands"])


# ✅ Define safe, whitelisted commands and their responses
WHITELISTED_COMMANDS = {
    "help": """
Available commands:
- help           → Show available commands
- status         → Show system status
- version        → Show app version
- list_users     → Show active users
- uptime         → Show system uptime
""",
    "status": "✅ System running normally. All services operational.",
    "version": "App version 1.0.3 (MiniNode Terminal)",
    "list_users": "lincon\nalfdolf\nghostrider\nsystem_support",
    "uptime": "Server uptime: 3 days, 4 hours, 29 minutes"
}

@terminal.post("/")
async def run_command(request: Request):
    data = await request.json()
    command = data.get("command", "").strip().lower()

    # If not allowed
    if command not in WHITELISTED_COMMANDS:
        raise HTTPException(status_code=400, detail=f"'{command}' is not recognized. Type 'help' for a list of commands.")

    # Return the response
    return {"output": WHITELISTED_COMMANDS[command]}
