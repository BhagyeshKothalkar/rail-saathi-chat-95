export type TicketArtefact = {
  type: "ticket";
  pnr: string;
  trainNumber: string;
  trainName: string;
  date: string; // e.g., "12 Oct"
  time: string; // e.g., "16:00"
  from: string;
  to: string;
  classCode?: string; // e.g., "3A"
};

export type ProgressSegment = {
  station: string;
  status: "completed" | "ontime" | "delayed";
  delayMinutes?: number;
};

export type ProgressArtefact = {
  type: "progress";
  trainLabel: string;
  segments: ProgressSegment[];
  summary?: string; // e.g. "Predicted 25 min delay near Bhopal"
};

export type AlertArtefact = {
  type: "alert";
  severity: "warning" | "critical";
  title: string;
  body: string;
};

export type Artefact = TicketArtefact | ProgressArtefact | AlertArtefact;

export type MessageContent =
  | {
      type: "text";
      text: string;
    }
  | {
      type: "artefact";
      artefact: Artefact;
    }
  | {
      type: "group";
      items: MessageContent[];
    };

export type AttachmentMeta = {
  name: string;
  mimeType: string;
  sizeBytes: number;
  thumbnailDataUrl?: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "ai" | "system";
  content: MessageContent[];
  attachment?: AttachmentMeta;
  createdAt: number;
  pending?: boolean; // for typing indicator messages
  pendingLabel?: string;
};

export type UserProfile = {
  pnrs: string[];
  frequentRoutes: string[];
  language: string;
};

export type SendMessageInput = {
  text?: string;
  attachment?: AttachmentMeta;
  command?: boolean;
  lang?: string;
  /** Stable id for getUserMemory and related tools (defaults to "anonymous" on the server). */
  userId?: string;
};

export type SendMessageResult = {
  messages: Array<{
    content: MessageContent[];
  }>;
};

export type UploadDocumentResult = {
  ticket: TicketArtefact;
  profile: Partial<UserProfile>;
};
