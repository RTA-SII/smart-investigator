const FEEDS = [
  { name: "CRM Complaint Gateway", state: "Operational", tone: "#16a34a" },
  { name: "Cross-Validation Engine", state: "Degraded · 4m lag", tone: "#f59e0b" },
  { name: "Telematics Feed", state: "Degraded · partial", tone: "#f59e0b" },
  { name: "In-Cab Camera Store", state: "Degraded · retries", tone: "#f59e0b" },
  { name: "Fines & Permits Service", state: "Degraded · queued", tone: "#f59e0b" },
]

/** The upstream-service popover behind the top bar's status dots. */
export function StatusPanel({ onClose }) {
  return (
    <>
      <button
        type="button"
        aria-label="Close"
        className="fixed inset-0 z-10 cursor-default"
        onClick={onClose}
      />
      <div className="glass-surface absolute top-11 start-0 z-20 w-72 rounded-2xl bg-[var(--popover)] p-3">
        <p className="mb-2 px-1 text-[9px] font-bold tracking-[0.9px] text-[var(--muted-foreground)] uppercase">
          Upstream Services
        </p>
        <ul className="space-y-1">
          {FEEDS.map((f) => (
            <li
              key={f.name}
              className="flex items-center justify-between gap-3 rounded-lg px-1 py-1.5"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: f.tone }}
                />
                <span className="truncate text-sm">{f.name}</span>
              </span>
              <span className="shrink-0 text-[11px] text-[var(--muted-foreground)]">
                {f.state}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
