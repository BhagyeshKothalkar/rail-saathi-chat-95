import type { SendMessageInput, SendMessageResult } from "@/lib/types";

/** Offline / missing-key fallback mirroring the previous client stub behaviour. */
export function stubNaturalLanguageResponse(input: SendMessageInput): SendMessageResult {
  const text = (input.text ?? "").trim();
  const lower = text.toLowerCase();

  if (input.attachment) {
    return {
      messages: [{ text: "Got it — I'll keep this on file." }],
    };
  }

  if (lower.includes("delay") || lower.includes("late")) {
    return {
      messages: [
        { text: "Here's the latest delay forecast:" },
        {
          artefact: {
            type: "progress",
            trainLabel: "12951 — Mumbai Rajdhani",
            summary: "Predicted 25 min delay near Bhopal",
            segments: [
              { station: "MMCT", status: "completed" },
              { station: "BRC", status: "completed" },
              { station: "RTM", status: "ontime" },
              { station: "BPL", status: "delayed", delayMinutes: 25 },
              { station: "NDLS", status: "delayed", delayMinutes: 25 },
            ],
          },
        },
      ],
    };
  }

  if (lower.includes("weather") || lower.includes("alert")) {
    return {
      messages: [
        {
          artefact: {
            type: "alert",
            severity: "warning",
            title: "Weather advisory",
            body: "Dense fog reported between Ratlam and New Delhi. Trains may run 20–40 min late tonight.",
          },
        },
      ],
    };
  }

  if (lower.includes("book") || lower.includes("ticket")) {
    return {
      messages: [{ text: "Sure — what's your destination?" }],
    };
  }

  return {
    messages: [
      {
        text: "I can help you book tickets, track trains, and predict delays. Try /pnr, /status, or /delay — or upload a ticket image.",
      },
    ],
  };
}
