import { useEffect, useRef, useState } from "react";
import { Mic, Paperclip, Send, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { SlashCommandPopover } from "./SlashCommandPopover";
import { cn } from "@/lib/utils";

type Props = {
  disabled?: boolean;
  placeholder?: string;
  onSend: (text: string, isCommand: boolean) => void;
  onUpload: (file: File) => void;
};

export function ChatInput({ disabled, placeholder, onSend, onUpload }: Props) {
  const [value, setValue] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { listening, supported, start, stop } = useSpeechToText((t) =>
    setValue((prev) => (prev ? `${prev} ${t}` : t)),
  );

  // Auto-grow textarea up to a max.
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [value]);

  const showSlash = value.startsWith("/");
  const hasText = value.trim().length > 0;

  const handleSend = () => {
    const v = value.trim();
    if (!v) return;
    onSend(v, v.startsWith("/"));
    setValue("");
  };

  return (
    <div className="relative border-t border-border bg-background/95 px-3 py-2 backdrop-blur">
      {showSlash && !disabled && (
        <SlashCommandPopover
          query={value.split(/\s/)[0]}
          onPick={(cmd) => {
            setValue(cmd + " ");
            taRef.current?.focus();
          }}
        />
      )}

      <div className="flex items-end gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUpload(f);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          disabled={disabled}
          onClick={() => fileRef.current?.click()}
          aria-label="Attach file"
          className="shrink-0 text-muted-foreground"
        >
          <Paperclip className="size-5" />
        </Button>

        <textarea
          ref={taRef}
          rows={1}
          disabled={disabled}
          placeholder={placeholder ?? "Message Rail Saathi"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className={cn(
            "flex-1 resize-none rounded-2xl border border-input bg-background px-3 py-2 text-sm",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
        />

        <Button
          type="button"
          size="icon"
          disabled={disabled}
          onClick={() => {
            if (hasText) handleSend();
            else if (listening) stop();
            else if (supported) start();
          }}
          aria-label={hasText ? "Send" : listening ? "Stop recording" : "Record voice"}
          className={cn(
            "shrink-0 rounded-full transition-all",
            "bg-wa-accent text-wa-accent-foreground hover:bg-wa-accent/90",
          )}
        >
          {hasText ? (
            <Send className="size-5" />
          ) : listening ? (
            <Square className="size-5" />
          ) : (
            <Mic className="size-5" />
          )}
        </Button>
      </div>
    </div>
  );
}
