/**
 * Rail Saathi API stub layer.
 *
 * Replace the bodies of `sendMessage`, `uploadDocument`, and `connectStatus`
 * with real fetch/WebSocket calls to your backend. The shapes are kept
 * intentionally narrow — see src/lib/types.ts.
 */
import type {
  SendMessageInput,
  SendMessageResult,
  UploadDocumentResult,
  AttachmentMeta,
} from "./types";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function sendMessage(input: SendMessageInput): Promise<SendMessageResult> {
  await wait(700);

  const text = (input.text ?? "").trim();
  const lower = text.toLowerCase();

  // Slash command routing (skips LLM on real backend).
  if (input.command) {
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
  }

  if (input.attachment) {
    return {
      messages: [
        { text: "Got it — I'll keep this on file." },
      ],
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
      messages: [
        { text: "Sure — what's your destination?" },
      ],
    };
  }

  return {
    messages: [
      {
        text:
          "I can help you book tickets, track trains, and predict delays. Try /pnr, /status, or /delay — or upload a ticket image.",
      },
    ],
  };
}

export async function uploadDocument(_file: File, meta: AttachmentMeta): Promise<UploadDocumentResult> {
  await wait(1200);
  return {
    ticket: {
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
    profile: {
      pnrs: ["1234567890"],
    },
  };
  // `meta` is reserved for the real backend; included here so the signature is stable.
  void meta;
}

export function connectStatus(): boolean {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}
