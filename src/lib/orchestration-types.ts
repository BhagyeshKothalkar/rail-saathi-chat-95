import { z } from "zod";

/** Stage-1 router output (strict enum). */
export const IntentSchema = z.enum(["PREDICT_DELAY", "FETCH_PNR", "GENERAL_HELP", "BOOK_TICKET"]);
export type Intent = z.infer<typeof IntentSchema>;

const progressStationSchema = z.object({
  station: z.string(),
  status: z.enum(["completed", "ontime", "delayed"]),
  delayMinutes: z.number().optional(),
});

/** Enforced UI payloads for operational queries (Stage 2). */
export const OrchestratedUiPayloadSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("PROGRESS_BAR"),
    trainLabel: z.string(),
    predictedDelay: z.string(),
    summary: z.string().optional(),
    stations: z.array(progressStationSchema).min(1),
  }),
  z.object({
    type: z.literal("TICKET_CARD"),
    pnr: z.string(),
    trainNumber: z.string(),
    trainName: z.string(),
    date: z.string(),
    time: z.string(),
    from: z.string(),
    to: z.string(),
    classCode: z.string().optional(),
  }),
  z.object({
    type: z.literal("ALERT_BANNER"),
    severity: z.enum(["warning", "critical"]),
    title: z.string(),
    body: z.string(),
  }),
  z.object({
    type: z.literal("TEXT_REPLY"),
    text: z.string(),
  }),
  z.object({
    type: z.literal("BOOKING_PROMPT"),
    text: z.string(),
    suggestedNextStep: z.string().optional(),
  }),
]);

export type OrchestratedUiPayload = z.infer<typeof OrchestratedUiPayloadSchema>;

/** Zod schema used in Stage-2 prompts and validation (one operational shape per intent). */
export const IntentPayloadSchemas: Record<Intent, z.ZodType<OrchestratedUiPayload>> = {
  PREDICT_DELAY: OrchestratedUiPayloadSchema.options[0],
  FETCH_PNR: OrchestratedUiPayloadSchema.options[1],
  GENERAL_HELP: OrchestratedUiPayloadSchema.options[3],
  BOOK_TICKET: OrchestratedUiPayloadSchema.options[4],
};

export function schemaForIntent(intent: Intent): z.ZodType<OrchestratedUiPayload> {
  return IntentPayloadSchemas[intent];
}

export const ClassifyResponseSchema = z.object({
  intent: IntentSchema,
});
