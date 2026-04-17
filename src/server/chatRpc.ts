import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { classifyIntent } from "@/server/classifyIntent";
import { orchestratedPayloadToSendResult } from "@/server/mapPayloadToMessages";
import { runOrchestrationStage2 } from "@/server/orchestrateStage2";
import { getSarvamApiKey } from "@/server/sarvamClient";
import { handleSlashCommand } from "@/server/slashCommands";
import { stubNaturalLanguageResponse } from "@/server/stubChat";

const chatInputSchema = z.object({
  text: z.string(),
  lang: z.string().optional(),
  userId: z.string().optional(),
});

export const runSlashCommand = createServerFn({ method: "POST" })
  .inputValidator(chatInputSchema)
  .handler(async ({ data }) => {
    return handleSlashCommand(data.text.trim());
  });

export const runOrchestration = createServerFn({ method: "POST" })
  .inputValidator(chatInputSchema)
  .handler(async ({ data }) => {
    const text = data.text.trim();
    if (!getSarvamApiKey()) {
      console.warn("[chatRpc] SARVAM_API_KEY is unavailable; serving stub response");
      return stubNaturalLanguageResponse({ text, lang: data.lang });
    }

    try {
      const intent = await classifyIntent(text);
      const payload = await runOrchestrationStage2(text, intent, data.userId ?? "anonymous");
      return orchestratedPayloadToSendResult(payload);
    } catch (error) {
      console.error("[chatRpc] Orchestration failed; serving stub response", error);
      return stubNaturalLanguageResponse({ text, lang: data.lang });
    }
  });
