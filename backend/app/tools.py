from __future__ import annotations

import json
from typing import Any


def get_user_memory(user_id: str) -> dict[str, Any]:
    return {
        "userId": user_id,
        "language": "en",
        "pnrs": ["1234567890"],
        "frequentRoutes": ["MMCT-NDLS"],
    }


def get_historical_delays(train_id: str) -> dict[str, Any]:
    return {
        "trainId": train_id,
        "avgDelayMinutes30d": 18,
        "sampleSize": 120,
    }


def get_live_status(train_id: str) -> dict[str, Any]:
    return {
        "trainId": train_id,
        "lastReportedStation": "RTM",
        "status": "running",
        "delayMinutes": 12,
    }


def get_route_weather(route_id: str) -> dict[str, Any]:
    return {
        "routeId": route_id,
        "advisories": ["Dense fog possible between Ratlam and New Delhi overnight."],
        "fogRisk": "high",
    }


TOOL_DEFINITIONS: list[dict[str, Any]] = [
    {
        "type": "function",
        "function": {
            "name": "getUserMemory",
            "description": "Fetches local user preferences, active PNRs, and language settings.",
            "parameters": {
                "type": "object",
                "properties": {
                    "userId": {"type": "string", "description": "Stable user identifier"}
                },
                "required": ["userId"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "getHistoricalDelays",
            "description": "30-day rolling average delay statistics from the ML pipeline.",
            "parameters": {
                "type": "object",
                "properties": {
                    "trainId": {"type": "string", "description": "5-digit train number"}
                },
                "required": ["trainId"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "getLiveStatus",
            "description": "Current train position and delay from the live feed.",
            "parameters": {
                "type": "object",
                "properties": {"trainId": {"type": "string"}},
                "required": ["trainId"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "getRouteWeather",
            "description": "Meteorological advisories along a route identifier.",
            "parameters": {
                "type": "object",
                "properties": {
                    "routeId": {
                        "type": "string",
                        "description": "Opaque route key, e.g. MMCT-NDLS",
                    }
                },
                "required": ["routeId"],
            },
        },
    },
]


def dispatch_tool(name: str, arguments_json: str) -> dict[str, Any]:
    try:
        args = json.loads(arguments_json) if arguments_json else {}
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid tool arguments for {name}") from exc

    if name == "getUserMemory":
        return get_user_memory(str(args.get("userId", "anonymous")))
    if name == "getHistoricalDelays":
        return get_historical_delays(str(args.get("trainId", "12951")))
    if name == "getLiveStatus":
        return get_live_status(str(args.get("trainId", "12951")))
    if name == "getRouteWeather":
        return get_route_weather(str(args.get("routeId", "MMCT-NDLS")))

    raise ValueError(f"Unknown tool: {name}")
