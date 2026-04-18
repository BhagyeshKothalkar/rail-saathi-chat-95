import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AttachmentMeta, ChatMessage, MessageContent, UserProfile } from "@/lib/types";
import { sendMessage, uploadDocument } from "@/lib/api";
import { loadMessages, loadProfile, saveMessages, saveProfile } from "@/lib/storage";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "ai",
  content: [
    {
      type: "text",
      text: "Namaste! I'm Rail Saathi. Ask me to book a ticket, track a train, or predict delays. Type / for power commands, or tap the attachment button to upload a ticket.",
    },
  ],
  createdAt: Date.now(),
};

async function fileToThumb(file: File): Promise<string | undefined> {
  if (!file.type.startsWith("image/")) return undefined;
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : undefined);
    reader.onerror = () => resolve(undefined);
    reader.readAsDataURL(file);
  });
}

export function ChatScreen() {
  const online = useOnlineStatus();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    pnrs: [],
    frequentRoutes: [],
    language: "en",
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [m, p] = await Promise.all([loadMessages(), loadProfile()]);
      if (!alive) return;
      setMessages(m.length ? m : [WELCOME]);
      setProfile(p);
      setHydrated(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (hydrated) void saveMessages(messages);
  }, [messages, hydrated]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const appendUserText = useCallback(
    async (text: string) => {
      const userContent: MessageContent[] = [{ type: "text", text }];
      const userMsg: ChatMessage = {
        id: uid(),
        role: "user",
        content: userContent,
        createdAt: Date.now(),
      };
      const pendingId = uid();
      const pending: ChatMessage = {
        id: pendingId,
        role: "ai",
        content: [],
        pending: true,
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg, pending]);

      try {
        const res = await sendMessage({
          text,
          lang: profile.language,
        });
        const aiMessages: ChatMessage[] = res.messages.map((m) => ({
          id: uid(),
          role: "ai",
          content: m.content,
          createdAt: Date.now(),
        }));
        setMessages((prev) => [...prev.filter((m) => m.id !== pendingId), ...aiMessages]);
      } catch {
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== pendingId),
          {
            id: uid(),
            role: "ai",
            content: [{ type: "text", text: "Sorry - I couldn't reach the server. Please try again." }],
            createdAt: Date.now(),
          },
        ]);
      }
    },
    [profile.language],
  );

  const handleUpload = useCallback(async (file: File) => {
    const thumb = await fileToThumb(file);
    const meta: AttachmentMeta = {
      name: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      thumbnailDataUrl: thumb,
    };
    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      content: [],
      attachment: meta,
      createdAt: Date.now(),
    };
    const pendingId = uid();
    const pending: ChatMessage = {
      id: pendingId,
      role: "ai",
      content: [],
      pending: true,
      pendingLabel: "Rail Saathi is reading...",
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg, pending]);

    try {
      const res = await uploadDocument(file, meta);
      if (res.profile) {
        setProfile((prev) => {
          const next: UserProfile = {
            ...prev,
            pnrs: Array.from(new Set([...(prev.pnrs ?? []), ...(res.profile.pnrs ?? [])])),
            frequentRoutes: Array.from(
              new Set([...(prev.frequentRoutes ?? []), ...(res.profile.frequentRoutes ?? [])]),
            ),
            language: res.profile.language ?? prev.language,
          };
          void saveProfile(next);
          return next;
        });
      }
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== pendingId),
        {
          id: uid(),
          role: "ai",
          content: [
            { type: "text", text: "I've parsed your ticket and saved it for quick access." },
            { type: "artefact", artefact: res.ticket },
          ],
          createdAt: Date.now(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== pendingId),
        {
          id: uid(),
          role: "ai",
          content: [{ type: "text", text: "I couldn't read that file. Try a clearer image or PDF." }],
          createdAt: Date.now(),
        },
      ]);
    }
  }, []);

  const placeholder = useMemo(
    () => (online ? "Message Rail Saathi" : "Offline. Showing last saved predictions."),
    [online],
  );

  return (
    <div className="flex h-[100dvh] flex-col bg-wa-canvas">
      <ChatHeader online={online} />

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-3"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)",
          backgroundSize: "20px 20px",
        }}
      >
        <div className="mx-auto flex max-w-2xl flex-col gap-2">
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
        </div>
      </div>

      <ChatInput
        disabled={!online}
        placeholder={placeholder}
        onSend={appendUserText}
        onUpload={handleUpload}
      />
    </div>
  );
}
