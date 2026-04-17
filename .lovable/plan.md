
# Rail Saathi — Conversational UI

A single-screen, WhatsApp-inspired chat interface for the Rail Saathi AI assistant. Built as a clean frontend against a clear API contract you can plug your backend into.

## Layout
- **Header (fixed top):** "Rail Saathi" title + status dot (green online / red offline). Subtle WhatsApp-style green header with white text.
- **Chat canvas (scrollable middle):** Light textured background, right-aligned user bubbles (green tint), left-aligned AI bubbles (white). Auto-scrolls to bottom on new message.
- **Input bar (fixed bottom):** Attachment icon (left), auto-growing textarea, dynamic mic↔send button (right).

## Rich in-message artefacts
Rendered inline based on structured payload `type` field returned by AI:
- **Ticket card** — bordered card with PNR, train name/number, date/time, source→destination, class.
- **Journey progress bar** — horizontal segmented timeline; green segments for completed/on-time stations, red for predicted delays, with inline delay duration text.
- **Proactive alert bubble** — distinct yellow/red bordered bubble with alert icon for weather/disruption pushes.
- **Typing indicator** — animated three-dot bubble ("Rail Saathi is reading…" variant when parsing uploads).

## Behaviors
- **Dynamic action button:** mic icon by default, smoothly morphs to send arrow when textarea has content.
- **Voice input:** native Web Speech API; transcription appended live to textarea.
- **File upload:** accepts images + PDFs; shows thumbnail/filename bubble immediately, then "reading…" indicator, then ticket card on response. Extracted PNR + profile silently cached.
- **Slash commands:** typing `/` at index 0 opens floating popover above input listing `/pnr`, `/status`, `/delay`. On submit, request is tagged `command: true` so backend can route past the LLM.
- **Conversational state:** all follow-up questions just render as normal AI messages — frontend doesn't model forms.

## State, caching & offline
- **IndexedDB (idb-keyval)** stores: full message history (including artefact payloads so they re-render perfectly), user profile (PNRs, frequent routes), and language preference.
- On load: hydrate chat from IndexedDB before first network call.
- **Offline mode:** listens to `online`/`offline` events. When offline: header dot turns red, input disabled and grayed, placeholder becomes "Offline. Showing last saved predictions." Cached chat remains visible.

## API contract (stub layer)
A single `src/lib/api.ts` module with typed functions:
- `sendMessage({ text, attachments?, command?, lang? }) → { messages: AIMessage[] }`
- `uploadDocument(file) → { ticket, profile }`
- `connectStatus() → online/offline ping`

Ships with mock implementations returning sample ticket cards, progress bars, and alerts so the UI is fully demoable. Swap in your real endpoints by editing this one file. WebSocket hook scaffolded but inert until you provide a URL.

## Tech
- TanStack Start single route (`/`).
- Tailwind + shadcn for bubbles, buttons, popover (slash menu), tooltip.
- `idb-keyval` for storage, `lucide-react` for icons (Paperclip, Mic, Send, AlertTriangle, Train, CheckCircle2).
- Zero backend dependency for the UI to run; ready to wire to your API.

## Out of scope (v1)
- Real auth, real PNR lookup, real ML predictions (stubbed).
- Multi-language translation memory (English only for now; hook left in place for later).
