import type {
  AttachmentMeta,
  SendMessageInput,
  SendMessageResult,
  UploadDocumentResult,
} from "./types";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export async function sendMessage(input: SendMessageInput): Promise<SendMessageResult> {
  const res = await fetch(`${API_BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: input.text ?? "",
      lang: input.lang,
      userId: input.userId,
    }),
  });

  if (!res.ok) {
    throw new Error(`Backend request failed: ${res.status}`);
  }

  return (await res.json()) as SendMessageResult;
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
