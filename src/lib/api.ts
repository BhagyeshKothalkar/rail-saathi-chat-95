/**
 * Client API: routes `/…` slash commands to a fast server handler and everything
 * else through the two-stage Sarvam orchestration pipeline (see `src/server/`).
 */
import type {
  SendMessageInput,
  SendMessageResult,
  UploadDocumentResult,
  AttachmentMeta,
} from "./types";
import { runOrchestration, runSlashCommand } from "@/server/chatRpc";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function sendMessage(input: SendMessageInput): Promise<SendMessageResult> {
  const text = (input.text ?? "").trim();

  if (text.startsWith("/")) {
    return runSlashCommand({
      data: { text, lang: input.lang, userId: input.userId },
    });
  }

  return runOrchestration({
    data: { text, lang: input.lang, userId: input.userId },
  });
}

export async function uploadDocument(
  _file: File,
  meta: AttachmentMeta,
): Promise<UploadDocumentResult> {
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
  void meta;
}

export function connectStatus(): boolean {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}
