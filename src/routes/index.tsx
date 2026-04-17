import { createFileRoute } from "@tanstack/react-router";
import { ChatScreen } from "@/components/chat/ChatScreen";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rail Saathi — AI train assistant" },
      {
        name: "description",
        content:
          "Chat with Rail Saathi to book tickets, track trains, and predict delays — all in one conversation.",
      },
      { property: "og:title", content: "Rail Saathi — AI train assistant" },
      {
        property: "og:description",
        content: "Book, track, and predict — your conversational rail companion.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <ChatScreen />;
}
