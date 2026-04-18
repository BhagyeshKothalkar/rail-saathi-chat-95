import type { MessageContent } from "@/lib/types";
import { AlertBubble } from "./AlertBubble";
import { ProgressArtefact } from "./ProgressArtefact";
import { TicketCard } from "./TicketCard";

function ArtefactView({ block }: { block: Extract<MessageContent, { type: "artefact" }> }) {
  switch (block.artefact.type) {
    case "alert":
      return <AlertBubble data={block.artefact} />;
    case "progress":
      return <ProgressArtefact data={block.artefact} />;
    case "ticket":
      return <TicketCard ticket={block.artefact} />;
    default: {
      const neverArtefact: never = block.artefact;
      return neverArtefact;
    }
  }
}

export function MessageContentView({
  content,
  standalone,
}: {
  content: MessageContent[];
  standalone?: boolean;
}) {
  return (
    <div className={standalone ? "flex w-full flex-col gap-2" : "space-y-2"}>
      {content.map((block, index) => {
        switch (block.type) {
          case "text":
            return (
              <div key={index} className="whitespace-pre-wrap text-sm leading-snug">
                {block.text}
              </div>
            );
          case "artefact":
            return <ArtefactView key={index} block={block} />;
          case "group":
            return (
              <div key={index} className="space-y-2 rounded-xl bg-black/5 p-2">
                <MessageContentView content={block.items} />
              </div>
            );
          default: {
            const neverBlock: never = block;
            return neverBlock;
          }
        }
      })}
    </div>
  );
}
