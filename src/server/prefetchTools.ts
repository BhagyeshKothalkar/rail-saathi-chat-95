import type { Intent } from "@/lib/orchestration-types";
import {
  getHistoricalDelays,
  getLiveStatus,
  getRouteWeather,
  getUserMemory,
} from "@/server/sarvamTools";

function extractTrainId(text: string): string {
  const m = text.match(/\b(\d{5})\b/);
  return m?.[1] ?? "12951";
}

function extractRouteHint(text: string): string {
  const upper = text.toUpperCase();
  if (upper.includes("MMCT") && upper.includes("NDLS")) return "MMCT-NDLS";
  if (upper.includes("MUMBAI") && upper.includes("DELHI")) return "MMCT-NDLS";
  return "MMCT-NDLS";
}

/**
 * Deterministic tool execution before Stage 2 (cost control + guaranteed context).
 * Sarvam tool_calls can be layered on later; prefetch already satisfies tool semantics.
 */
export async function prefetchToolsForIntent(
  intent: Intent,
  userText: string,
  userId: string,
): Promise<Record<string, unknown>> {
  const trainId = extractTrainId(userText);
  const routeId = extractRouteHint(userText);

  const memory = await getUserMemory(userId);

  switch (intent) {
    case "PREDICT_DELAY": {
      const [hist, live, wx] = await Promise.all([
        getHistoricalDelays(trainId),
        getLiveStatus(trainId),
        getRouteWeather(routeId),
      ]);
      return {
        getUserMemory: memory,
        getHistoricalDelays: hist,
        getLiveStatus: live,
        getRouteWeather: wx,
      };
    }
    case "FETCH_PNR": {
      return { getUserMemory: memory, getLiveStatus: await getLiveStatus(trainId) };
    }
    case "BOOK_TICKET": {
      return { getUserMemory: memory };
    }
    case "GENERAL_HELP":
    default:
      return { getUserMemory: memory };
  }
}
