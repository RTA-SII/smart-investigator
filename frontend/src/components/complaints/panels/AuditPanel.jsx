import { Card, CardTitle } from "@/components/ui/Card"
import { longStamp } from "@/lib/format"

/** Numbered workflow rail plus the full audit trail. */
export function AuditPanel({ complaint }) {
  const stages = ["New", "Assigned", "Under Investigation", "Escalated", "Closed"]
  const current = stages.indexOf(complaint.stage)

  return (
    <div className="grid gap-4">
      <Card className="p-5">
        <CardTitle className="mb-4">Workflow Progress</CardTitle>
        <ol>
          {stages.map((s, i) => {
            const done = i < current
            const active = i === current
            return (
              <li key={s} className="flex gap-4">
                <div className="flex shrink-0 flex-col items-center">
                  <span
                    className={`grid size-8 place-items-center rounded-full border-2 text-[11px] font-bold ${
                      active
                        ? "border-[var(--primary)] text-[var(--primary)]"
                        : done
                          ? "border-transparent bg-[var(--primary)] text-white"
                          : "border-[var(--border)] bg-[rgb(0_0_0/0.04)] text-[var(--muted-foreground)]"
                    }`}
                  >
                    {i + 1}
                  </span>
                  {i < stages.length - 1 && (
                    <span className="w-px flex-1 bg-[var(--border)]" />
                  )}
                </div>
                <div className={`pb-5 ${i === stages.length - 1 ? "pb-0" : ""}`}>
                  <p
                    className={`text-base font-bold ${
                      active ? "text-[var(--primary)]" : done ? "" : "text-[var(--muted-foreground)]"
                    }`}
                  >
                    {s}
                  </p>
                  {active && (
                    <p className="text-sm text-[var(--primary)] opacity-80">Current stage</p>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </Card>

      <Card className="p-5">
        <CardTitle className="mb-4">Audit Log</CardTitle>
        <ul className="space-y-4">
          {complaint.timeline.map((t, i) => (
            <li key={i} className="flex gap-4">
              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[var(--primary)]" />
              <div className="min-w-0">
                <p className="text-sm font-bold">{t.action}</p>
                <p className="text-sm text-[var(--muted-foreground)]">{t.note}</p>
                <p className="mt-0.5 text-[11px] text-[var(--muted-foreground)]">
                  {t.actor} · {longStamp(t.at)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
