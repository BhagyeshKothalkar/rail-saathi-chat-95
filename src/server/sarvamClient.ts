const SARVAM_CHAT_URL = "https://api.sarvam.ai/v1/chat/completions";

export type SarvamMessage = { role: "system" | "user" | "assistant"; content: string };

export function getSarvamApiKey(): string | undefined {
  return typeof process !== "undefined" ? process.env.SARVAM_API_KEY : undefined;
}

export function getRouterModel(): string {
  return process.env.SARVAM_MODEL_ROUTER ?? "sarvam-30b";
}

export function getHeavyModel(): string {
  return process.env.SARVAM_MODEL_HEAVY ?? "sarvam-105b";
}

type ChatCompletionBody = {
  model: string;
  messages: SarvamMessage[] | Record<string, unknown>[];
  temperature?: number;
  tools?: unknown[];
  tool_choice?: unknown;
};

/**
 * OpenAI-style chat completions against Sarvam. Returns assistant text (or tool_calls if present).
 */
export async function sarvamChatCompletion(body: ChatCompletionBody): Promise<{
  content: string;
  toolCalls?: Array<{ id: string; name: string; arguments: string }>;
}> {
  const key = getSarvamApiKey();
  if (!key) {
    throw new Error("SARVAM_API_KEY is not set");
  }

  const res = await fetch(SARVAM_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`Sarvam API ${res.status}: ${raw.slice(0, 500)}`);
  }

  let data: {
    choices?: Array<{
      message?: {
        content?: string | null;
        tool_calls?: Array<{
          id: string;
          type?: string;
          function: { name: string; arguments: string };
        }>;
      };
    }>;
  };
  try {
    data = JSON.parse(raw) as typeof data;
  } catch {
    throw new Error("Sarvam API returned non-JSON");
  }

  const msg = data.choices?.[0]?.message;
  const toolCallsRaw = msg?.tool_calls;
  if (toolCallsRaw?.length) {
    return {
      content: msg?.content ?? "",
      toolCalls: toolCallsRaw.map((tc) => ({
        id: tc.id,
        name: tc.function.name,
        arguments: tc.function.arguments,
      })),
    };
  }

  const content = typeof msg?.content === "string" ? msg.content : "";
  return { content };
}
