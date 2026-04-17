import { AlertTriangle } from "lucide-react";
import type { AlertArtefact } from "@/lib/types";

export function AlertBubble({ data }: { data: AlertArtefact }) {
  return (
    <div className="my-1 max-w-[85%] rounded-lg border-2 border-wa-alert-border bg-wa-alert-bg p-3 shadow-sm">
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-wa-alert-border" />
        <div>
          <div className="text-sm font-semibold text-foreground">{data.title}</div>
          <div className="mt-0.5 text-xs text-foreground/80">{data.body}</div>
        </div>
      </div>
    </div>
  );
}
