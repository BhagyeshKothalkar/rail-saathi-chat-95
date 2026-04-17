import type { Intent, OrchestratedUiPayload } from "@/lib/orchestration-types";
import { IntentPayloadSchemas } from "@/lib/orchestration-types";
import { extractJsonObject } from "@/server/jsonExtract";
import { prefetchToolsForIntent } from "@/server/prefetchTools";
import { getHeavyModel, sarvamChatCompletion, type SarvamMessage } from "@/server/sarvamClient";
import { dispatchTool, toolDefinitions } from "@/server/sarvamTools";

const SCHEMA_BLURBS: Record<Intent, string> = {
  PREDICT_DELAY:
    '{"type":"PROGRESS_BAR","trainLabel":"string","predictedDelay":"string","summary":"string (optional)","stations":[{"station":"string","status":"completed"|"ontime"|"delayed","delayMinutes":number (optional)}]}',
  FETCH_PNR:
    '{"type":"TICKET_CARD","pnr":"string","trainNumber":"string","trainName":"string","date":"string","time":"string","from":"string","to":"string","classCode":"string (optional)"}',
  GENERAL_HELP: '{"type":"TEXT_REPLY","text":"string"}',
  BOOK_TICKET: '{"type":"BOOKING_PROMPT","text":"string","suggestedNextStep":"string (optional)"}',
};

function buildSystemPrompt(intent: Intent, toolContext: Record<string, unknown>): string {
  const schema = SCHEMA_BLURBS[intent];
  return [
    "You are Rail Saathi, an Indian Railways assistant.",
    `Operational intent: ${intent}.`,
    "You MUST respond with a single JSON object only — no markdown fences, no commentary.",
    `The JSON must strictly match this shape: ${schema}`,
    "Tool results below were prefetched server-side; treat them as authoritative context.",
    "Tool context (JSON):",
    JSON.stringify(toolContext),
  ].join("\n");
}

async function heavyCompletionPipeline(system: string, userText: string): Promise<string> {
  const baseMessages: SarvamMessage[] = [
    { role: "system", content: system },
    { role: "user", content: userText },
  ];

  let first: Awaited<ReturnType<typeof sarvamChatCompletion>>;
  try {
    first = await sarvamChatCompletion({
      model: getHeavyModel(),
      temperature: 0.2,
      messages: baseMessages,
      tools: toolDefinitions,
      tool_choice: "auto",
    });
  } catch {
    first = await sarvamChatCompletion({
      model: getHeavyModel(),
      temperature: 0.2,
      messages: baseMessages,
    });
  }

  if (!first.toolCalls?.length) {
    return first.content;
  }

  const extended: Array<SarvamMessage | Record<string, unknown>> = [...baseMessages];
  extended.push({
    role: "assistant",
    content: first.content || null,
    tool_calls: first.toolCalls.map((tc) => ({
      id: tc.id,
      type: "function",
      function: { name: tc.name, arguments: tc.arguments },
    })),
  });

  for (const tc of first.toolCalls) {
    const result = await dispatchTool(tc.name, tc.arguments);
    extended.push({
      role: "tool",
      tool_call_id: tc.id,
      content: JSON.stringify(result),
    });
  }

  extended.push({
    role: "user",
    content:
      "Tools returned. Output ONLY the final JSON UI object described in the system message. No markdown.",
  });

  try {
    const second = await sarvamChatCompletion({
      model: getHeavyModel(),
      temperature: 0.1,
      messages: extended as SarvamMessage[],
    });
    if (second.content.trim()) return second.content;
  } catch {
    // Some providers reject tool-role messages; fall back to a plain completion.
  }

  const toolDigest = first.toolCalls.map((tc) => `${tc.name}: ${tc.arguments}`).join("\n");
  const { content } = await sarvamChatCompletion({
    model: getHeavyModel(),
    temperature: 0.1,
    messages: [
      { role: "system", content: system },
      {
        role: "user",
        content: `${userText}\n\n[Tool calls]\n${toolDigest}\n\nProduce the same JSON UI object as required by the system message.`,
      },
    ],
  });
  return content;
}

export async function runOrchestrationStage2(
  userText: string,
  intent: Intent,
  userId: string,
): Promise<OrchestratedUiPayload> {
  const toolContext = await prefetchToolsForIntent(intent, userText, userId);
  const system = buildSystemPrompt(intent, toolContext);
  const raw = await heavyCompletionPipeline(system, userText);

  const parsed = extractJsonObject(raw);
  const schema = IntentPayloadSchemas[intent];
  const validated = schema.safeParse(parsed);
  if (!validated.success) {
    throw new Error(`Stage-2 JSON failed validation: ${validated.error.message}`);
  }
  return validated.data;
}
