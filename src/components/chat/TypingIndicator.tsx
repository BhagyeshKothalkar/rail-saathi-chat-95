export function TypingIndicator({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm bg-wa-bubble-ai px-3 py-2 shadow-sm">
      <div className="flex gap-1">
        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
      </div>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </div>
  );
}
