import "dotenv/config";
import { SarvamAIClient, SarvamAIError } from "sarvamai";
import type { SarvamAI } from "sarvamai";

export type SarvamMessage = { role: "system" | "user" | "assistant"; content: string };

function readEnv(name: string): string | undefined {
  if (typeof process === "undefined") return undefined;
  const value = process.env[name];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export function getSarvamApiKey(): string | undefined {
  return readEnv("SARVAM_API_KEY");
}

export function getRouterModel(): string {
  return readEnv("SARVAM_MODEL_ROUTER") ?? "sarvam-30b";
}

export function getHeavyModel(): string {
  return readEnv("SARVAM_MODEL_HEAVY") ?? "sarvam-105b";
}

type ChatCompletionBody = {
  model: string;
  messages: Array<SarvamMessage | Record<string, unknown>>;
  temperature?: number;
  tools?: unknown[];
  tool_choice?: unknown;
};

let cachedClient: SarvamAIClient | undefined;

function getSarvamClient(): SarvamAIClient {
  if (cachedClient) return cachedClient;

  const key = getSarvamApiKey();
  if (!key) {
    throw new Error("SARVAM_API_KEY is not set");
  }

  cachedClient = new SarvamAIClient({
    apiSubscriptionKey: key,
  });

  return cachedClient;
}

/**
 * OpenAI-style chat completions against Sarvam. Returns assistant text (or tool_calls if present).
 */
export async function sarvamChatCompletion(body: ChatCompletionBody): Promise<{
  content: string;
  toolCalls?: Array<{ id: string; name: string; arguments: string }>;
}> {
  try {
    const client = getSarvamClient();
    const data = await client.chat.completions(body as SarvamAI.ChatCompletionsRequest, {
      timeoutInSeconds: 60,
    });

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
  } catch (error) {
    if (error instanceof SarvamAIError) {
      throw new Error(
        `Sarvam SDK ${error.statusCode ?? "unknown"}: ${String(error.body ?? error.message).slice(0, 500)}`,
      );
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Sarvam SDK request failed");
  }
}
