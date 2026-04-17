const COMMANDS = [
  { cmd: "/pnr", desc: "Look up your PNR status" },
  { cmd: "/status", desc: "Live train running status" },
  { cmd: "/delay", desc: "Predicted delay forecast" },
];

export function SlashCommandPopover({
  query,
  onPick,
}: {
  query: string;
  onPick: (cmd: string) => void;
}) {
  const filtered = COMMANDS.filter((c) => c.cmd.startsWith(query.toLowerCase()));
  if (filtered.length === 0) return null;
  return (
    <div className="absolute bottom-full left-3 right-3 mb-2 overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
      <div className="border-b border-border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Power commands
      </div>
      <ul className="max-h-48 overflow-y-auto">
        {filtered.map((c) => (
          <li key={c.cmd}>
            <button
              type="button"
              onClick={() => onPick(c.cmd)}
              className="flex w-full items-baseline gap-2 px-3 py-2 text-left hover:bg-accent"
            >
              <span className="font-mono text-sm font-semibold text-wa-accent">{c.cmd}</span>
              <span className="text-xs text-muted-foreground">{c.desc}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
