import { CheckCircle2 } from "lucide-react";
import type { ProgressArtefact as P } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProgressArtefact({ data }: { data: P }) {
  return (
    <div className="mt-2 w-full max-w-[300px] rounded-lg border border-border/70 bg-background/80 p-3 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-wa-accent">
        Journey
      </div>
      <div className="mt-1 text-sm font-semibold">{data.trainLabel}</div>

      <div className="mt-3 flex items-center">
        {data.segments.map((s, i) => {
          const isLast = i === data.segments.length - 1;
          const dot =
            s.status === "delayed"
              ? "bg-wa-delay"
              : s.status === "completed"
                ? "bg-wa-ontime"
                : "bg-wa-accent";
          const line =
            s.status === "delayed" || data.segments[i + 1]?.status === "delayed"
              ? "bg-wa-delay"
              : "bg-wa-ontime";
          return (
            <div key={s.station} className="flex flex-1 items-center last:flex-none">
              <div className={cn("size-3 shrink-0 rounded-full", dot)} />
              {!isLast && <div className={cn("h-1 flex-1", line)} />}
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
        {data.segments.map((s) => (
          <div key={s.station} className="flex flex-col items-center">
            <span className="font-medium text-foreground">{s.station}</span>
            {s.delayMinutes ? (
              <span className="text-wa-delay">+{s.delayMinutes}m</span>
            ) : null}
          </div>
        ))}
      </div>

      {data.summary && (
        <div className="mt-3 flex items-start gap-1.5 text-xs">
          <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-wa-accent" />
          <span className="text-muted-foreground">{data.summary}</span>
        </div>
      )}
    </div>
  );
}
