/**
 * Dummy tool implementations (replace with DB / NTES / weather integrations).
 */
export type UserMemory = {
  userId: string;
  language: string;
  pnrs: string[];
  frequentRoutes: string[];
};

export async function getUserMemory(userId: string): Promise<UserMemory> {
  return {
    userId,
    language: "en",
    pnrs: ["1234567890"],
    frequentRoutes: ["MMCT-NDLS"],
  };
}

export async function getHistoricalDelays(trainId: string): Promise<{
  trainId: string;
  avgDelayMinutes30d: number;
  sampleSize: number;
}> {
  return {
    trainId,
    avgDelayMinutes30d: 18,
    sampleSize: 120,
  };
}

export async function getLiveStatus(trainId: string): Promise<{
  trainId: string;
  lastReportedStation: string;
  status: string;
  delayMinutes: number;
}> {
  return {
    trainId,
    lastReportedStation: "RTM",
    status: "running",
    delayMinutes: 12,
  };
}

export async function getRouteWeather(routeId: string): Promise<{
  routeId: string;
  advisories: string[];
  fogRisk: "low" | "medium" | "high";
}> {
  return {
    routeId,
    advisories: ["Dense fog possible between Ratlam and New Delhi overnight."],
    fogRisk: "high",
  };
}

export const toolDefinitions = [
  {
    type: "function" as const,
    function: {
      name: "getUserMemory",
      description: "Fetches local user preferences, active PNRs, and language settings.",
      parameters: {
        type: "object",
        properties: {
          userId: { type: "string", description: "Stable user identifier" },
        },
        required: ["userId"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "getHistoricalDelays",
      description: "30-day rolling average delay statistics from the ML pipeline.",
      parameters: {
        type: "object",
        properties: {
          trainId: { type: "string", description: "5-digit train number" },
        },
        required: ["trainId"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "getLiveStatus",
      description: "Current train position / delay from NTES-style live feed (stub).",
      parameters: {
        type: "object",
        properties: {
          trainId: { type: "string" },
        },
        required: ["trainId"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "getRouteWeather",
      description: "Meteorological advisories along a route identifier.",
      parameters: {
        type: "object",
        properties: {
          routeId: { type: "string", description: "Opaque route key, e.g. MMCT-NDLS" },
        },
        required: ["routeId"],
      },
    },
  },
];

export async function dispatchTool(name: string, argsJson: string): Promise<unknown> {
  let args: Record<string, unknown>;
  try {
    args = JSON.parse(argsJson) as Record<string, unknown>;
  } catch {
    throw new Error(`Invalid tool arguments for ${name}`);
  }

  switch (name) {
    case "getUserMemory":
      return getUserMemory(String(args.userId ?? ""));
    case "getHistoricalDelays":
      return getHistoricalDelays(String(args.trainId ?? "12951"));
    case "getLiveStatus":
      return getLiveStatus(String(args.trainId ?? "12951"));
    case "getRouteWeather":
      return getRouteWeather(String(args.routeId ?? "MMCT-NDLS"));
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
