import type { SendMessageResult } from "@/lib/types";

/**
 * Slash commands bypass the LLM orchestrator — instant structured responses (stub DB).
 */
export function handleSlashCommand(text: string): SendMessageResult {
  const lower = text.toLowerCase();

  if (lower.startsWith("/pnr")) {
    return {
      messages: [
        { text: "Here's your last saved PNR status." },
        {
          artefact: {
            type: "ticket",
            pnr: "1234567890",
            trainNumber: "12951",
            trainName: "Mumbai Rajdhani",
            date: "12 Oct",
            time: "16:00",
            from: "MMCT",
            to: "NDLS",
            classCode: "3A",
          },
        },
      ],
    };
  }

  if (lower.startsWith("/status")) {
    return {
      messages: [
        { text: "Live journey status for 12951:" },
        {
          artefact: {
            type: "progress",
            trainLabel: "12951 — Mumbai Rajdhani",
            summary: "On time",
            segments: [
              { station: "MMCT", status: "completed" },
              { station: "BRC", status: "completed" },
              { station: "RTM", status: "ontime" },
              { station: "KOTA", status: "ontime" },
              { station: "NDLS", status: "ontime" },
            ],
          },
        },
      ],
    };
  }

  if (lower.startsWith("/delay")) {
    return {
      messages: [
        {
          artefact: {
            type: "progress",
            trainLabel: "12951 — Mumbai Rajdhani",
            summary: "Predicted 25 min delay near Bhopal due to dense fog",
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

  return {
    messages: [
      {
        text: "Unknown command. Try /pnr, /status, or /delay — or send a plain-language question for the AI assistant.",
      },
    ],
  };
}
