import { Paperclip } from "lucide-react";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MessageContentView } from "./MessageContentView";
import { TypingIndicator } from "./TypingIndicator";

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  if (message.pending) {
    return (
      <div className="flex w-full justify-start">
        <TypingIndicator label={message.pendingLabel} />
      </div>
    );
  }

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3 py-2 shadow-sm",
          isUser
            ? "rounded-br-sm bg-wa-bubble-user text-wa-bubble-user-foreground"
            : "rounded-bl-sm bg-wa-bubble-ai text-wa-bubble-ai-foreground",
        )}
      >
        {message.attachment && (
          <div className="mb-1.5 flex items-center gap-2 rounded-md bg-black/5 p-2">
            {message.attachment.thumbnailDataUrl ? (
              <img
                src={message.attachment.thumbnailDataUrl}
                alt={message.attachment.name}
                className="size-12 rounded object-cover"
              />
            ) : (
              <Paperclip className="size-5 text-muted-foreground" />
            )}
            <div className="min-w-0">
              <div className="truncate text-xs font-medium">{message.attachment.name}</div>
              <div className="text-[10px] text-muted-foreground">
                {(message.attachment.sizeBytes / 1024).toFixed(1)} KB
              </div>
            </div>
          </div>
        )}

        <MessageContentView content={message.content} />

        <div
          className={cn(
            "mt-1 text-right text-[10px]",
            isUser ? "text-wa-bubble-user-foreground/60" : "text-muted-foreground",
          )}
        >
          {formatTime(message.createdAt)}
        </div>
      </div>
    </div>
  );
}
