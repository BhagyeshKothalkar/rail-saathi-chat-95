from __future__ import annotations

import json
import os
from typing import Any

import httpx
from dotenv import load_dotenv

from .models import ChatResponse
from .tools import TOOL_DEFINITIONS, dispatch_tool

load_dotenv()

SARVAM_CHAT_URL = os.getenv("SARVAM_CHAT_URL", "https://api.sarvam.ai/v1/chat/completions")
SARVAM_MODEL = os.getenv("SARVAM_MODEL", "sarvam-105b")


def _extract_json_object(text: str) -> dict[str, Any]:
    start = text.find("{")
    if start < 0:
        raise ValueError("Model returned no JSON object")

    depth = 0
    in_string = False
    escape = False
    for index in range(start, len(text)):
        ch = text[index]
        if in_string:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == '"':
                in_string = False
            continue

        if ch == '"':
            in_string = True
        elif ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return json.loads(text[start : index + 1])

    raise ValueError("Model returned incomplete JSON")


def _system_prompt() -> str:
    return "\n".join(
        [
            "You are Rail Saathi, an Indian Railways assistant.",
            "Use tools when they help answer operational train questions.",
            'Respond with JSON only, with the exact shape {"messages":[{"content":[MessageContent,...]}]}.',
            'MessageContent can be {"type":"text","text":"..."}, {"type":"artefact","artefact":Artefact}, or {"type":"group","items":[MessageContent,...]}.',
            'Artefact can be ticket, progress, or alert.',
            "You may return multiple messages and may nest groups when it improves readability.",
            "Do not use markdown fences or any prose outside the JSON object.",
            "For ticket artefacts, use keys type, pnr, trainNumber, trainName, date, time, from, to, classCode.",
            "For progress artefacts, use keys type, trainLabel, summary, segments where each segment has station, status, delayMinutes.",
            "For alert artefacts, use keys type, severity, title, body.",
        ]
    )


def _headers() -> dict[str, str]:
    api_key = os.getenv("SARVAM_API_KEY")
    if not api_key:
        raise RuntimeError("SARVAM_API_KEY is not set")
    return {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }


async def _chat_completion(messages: list[dict[str, Any]], tools: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "model": SARVAM_MODEL,
        "temperature": 0.2,
        "messages": messages,
    }
    if tools:
        payload["tools"] = tools
        payload["tool_choice"] = "auto"

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(SARVAM_CHAT_URL, headers=_headers(), json=payload)
        response.raise_for_status()
        return response.json()


def _message_from_choice(data: dict[str, Any]) -> dict[str, Any]:
    try:
        return data["choices"][0]["message"]
    except (KeyError, IndexError) as exc:
        raise ValueError("LLM response missing choices[0].message") from exc


async def build_chat_response(user_text: str, user_id: str | None = None) -> ChatResponse:
    system_message = {"role": "system", "content": _system_prompt()}
    user_message = {
        "role": "user",
        "content": f"User id: {user_id or 'anonymous'}\nQuestion: {user_text}",
    }

    try:
        first = await _chat_completion([system_message, user_message], tools=TOOL_DEFINITIONS)
        assistant_message = _message_from_choice(first)
        tool_calls = assistant_message.get("tool_calls") or []

        if tool_calls:
            transcript: list[dict[str, Any]] = [system_message, user_message, assistant_message]
            for tool_call in tool_calls:
                function_payload = tool_call.get("function", {})
                result = dispatch_tool(
                    function_payload.get("name", ""),
                    function_payload.get("arguments", "{}"),
                )
                transcript.append(
                    {
                        "role": "tool",
                        "tool_call_id": tool_call["id"],
                        "content": json.dumps(result),
                    }
                )
            transcript.append(
                {
                    "role": "user",
                    "content": "Return the final answer as JSON in the required messages/content format only.",
                }
            )
            final = await _chat_completion(transcript)
            payload = _extract_json_object(_message_from_choice(final).get("content", ""))
        else:
            payload = _extract_json_object(assistant_message.get("content", ""))

        return ChatResponse.model_validate(payload)
    except Exception:
        return ChatResponse.model_validate(
            {
                "messages": [
                    {
                        "content": [
                            {
                                "type": "text",
                                "text": "I can help you book tickets, track trains, and predict delays. The live model is unavailable right now, so this is a fallback response.",
                            }
                        ]
                    }
                ]
            }
        )
