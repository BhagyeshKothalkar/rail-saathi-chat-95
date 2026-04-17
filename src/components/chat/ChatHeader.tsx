import { Train } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChatHeader({ online }: { online: boolean }) {
  return (
    <header className="flex items-center gap-3 bg-wa-header px-4 py-3 text-wa-header-foreground shadow-md">
      <div className="flex size-9 items-center justify-center rounded-full bg-white/15">
        <Train className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold leading-tight">Rail Saathi</h1>
        <div className="flex items-center gap-1.5 text-[11px] text-wa-header-foreground/80">
          <span
            className={cn(
              "size-2 rounded-full",
              online ? "bg-wa-status-online" : "bg-wa-status-offline",
            )}
            aria-hidden
          />
          <span>{online ? "Online" : "Offline"}</span>
        </div>
      </div>
    </header>
  );
}
