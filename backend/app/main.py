from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .llm import build_chat_response
from .models import ChatRequest, ChatResponse

app = FastAPI(title="Rail Saathi Backend")
ROOT_DIR = Path(__file__).resolve().parents[2]
CLIENT_DIST_DIR = ROOT_DIR / "dist" / "client"
ASSETS_DIR = CLIENT_DIST_DIR / "assets"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    return await build_chat_response(request.text, request.userId)


if ASSETS_DIR.exists():
    app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")


@app.get("/{full_path:path}")
async def spa_entry(full_path: str) -> FileResponse:
    index_file = CLIENT_DIST_DIR / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    raise RuntimeError(
        "Frontend assets are missing. Run `npm run build` before starting the app."
    )
