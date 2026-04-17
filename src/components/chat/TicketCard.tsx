import { Train } from "lucide-react";
import type { TicketArtefact } from "@/lib/types";

export function TicketCard({ ticket }: { ticket: TicketArtefact }) {
  return (
    <div className="mt-2 w-full max-w-[280px] rounded-lg border border-border/70 bg-background/80 p-3 shadow-sm">
      <div className="flex items-center gap-2 text-wa-accent">
        <Train className="size-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">Ticket</span>
      </div>
      <div className="mt-2 text-sm font-semibold text-foreground">
        {ticket.trainNumber} — {ticket.trainName}
      </div>
      <div className="mt-1 flex items-baseline justify-between text-sm">
        <span className="font-medium">{ticket.from}</span>
        <span className="text-muted-foreground">→</span>
        <span className="font-medium">{ticket.to}</span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div>
          <div className="text-[10px] uppercase tracking-wide">PNR</div>
          <div className="font-mono text-foreground">{ticket.pnr}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide">Date / Time</div>
          <div className="text-foreground">
            {ticket.date}, {ticket.time}
          </div>
        </div>
        {ticket.classCode && (
          <div>
            <div className="text-[10px] uppercase tracking-wide">Class</div>
            <div className="text-foreground">{ticket.classCode}</div>
          </div>
        )}
      </div>
    </div>
  );
}
