import { ClassifyResponseSchema, type Intent } from "@/lib/orchestration-types";
import { extractJsonObject } from "@/server/jsonExtract";
import { getRouterModel, sarvamChatCompletion } from "@/server/sarvamClient";

export async function classifyIntent(userText: string): Promise<Intent> {
  const { content } = await sarvamChatCompletion({
    model: getRouterModel(),
    temperature: 0,
    messages: [
      {
        role: "system",
        content:
          'You classify railway-assistant intents. Reply with ONLY a JSON object of the form {"intent":"PREDICT_DELAY"|"FETCH_PNR"|"GENERAL_HELP"|"BOOK_TICKET"}. No markdown, no explanation.',
      },
      { role: "user", content: userText },
    ],
  });

  try {
    const parsed = extractJsonObject(content);
    const r = ClassifyResponseSchema.safeParse(parsed);
    if (r.success) return r.data.intent;
  } catch {
    // fall through
  }
  return "GENERAL_HELP";
}
