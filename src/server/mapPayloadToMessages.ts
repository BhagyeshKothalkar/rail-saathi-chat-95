import type { OrchestratedUiPayload } from "@/lib/orchestration-types";
import type { SendMessageResult } from "@/lib/types";

export function orchestratedPayloadToSendResult(payload: OrchestratedUiPayload): SendMessageResult {
  switch (payload.type) {
    case "PROGRESS_BAR":
      return {
        messages: [
          {
            text: `Latest delay outlook for ${payload.trainLabel}:`,
            artefact: {
              type: "progress",
              trainLabel: payload.trainLabel,
              summary: payload.summary ?? payload.predictedDelay,
              segments: payload.stations.map((s) => ({
                station: s.station,
                status: s.status,
                delayMinutes: s.delayMinutes,
              })),
            },
          },
        ],
      };
    case "TICKET_CARD":
      return {
        messages: [
          {
            text: "PNR / ticket details:",
            artefact: {
              type: "ticket",
              pnr: payload.pnr,
              trainNumber: payload.trainNumber,
              trainName: payload.trainName,
              date: payload.date,
              time: payload.time,
              from: payload.from,
              to: payload.to,
              classCode: payload.classCode,
            },
          },
        ],
      };
    case "ALERT_BANNER":
      return {
        messages: [
          {
            artefact: {
              type: "alert",
              severity: payload.severity,
              title: payload.title,
              body: payload.body,
            },
          },
        ],
      };
    case "TEXT_REPLY":
      return { messages: [{ text: payload.text }] };
    case "BOOKING_PROMPT": {
      const lines = [payload.text, payload.suggestedNextStep].filter(Boolean);
      return { messages: [{ text: lines.join("\n") }] };
    }
    default: {
      const _x: never = payload;
      return _x;
    }
  }
}
