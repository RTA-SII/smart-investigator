import {
  Building2,
  CalendarDays,
  FileText,
  Link2,
  MapPin,
  RadioTower,
  TriangleAlert,
  User,
} from "lucide-react"
import { Card, CardTitle } from "@/components/ui/Card"
import { longStamp } from "@/lib/format"

/** Two-column icon/label/value grid — SMC's "Alert Details" layout. */
export function DetailsPanel({ complaint }) {
  const fields = [
    { icon: RadioTower, label: "Source Channel", value: complaint.channel },
    { icon: TriangleAlert, label: "Complaint Type", value: complaint.type },
    { icon: Link2, label: "CRM Reference", value: complaint.crmRef, accent: true },
    { icon: FileText, label: "Category", value: complaint.category },
    { icon: User, label: "Driver", value: complaint.driver.name, accent: true },
    { icon: Building2, label: "Company", value: complaint.company },
    { icon: MapPin, label: "Location", value: complaint.location },
    { icon: CalendarDays, label: "Received", value: longStamp(complaint.receivedAt) },
    { icon: FileText, label: "Complaint ID", value: complaint.id },
    { icon: Link2, label: "Trip Reference", value: complaint.complainant.tripRef },
  ]

  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[var(--destructive)] text-white">
          <TriangleAlert className="size-6" />
        </span>
        <div className="min-w-0">
          <CardTitle className="text-lg">Complaint Details</CardTitle>
          <p className="truncate text-sm text-[var(--muted-foreground)]">
            Complete information about this complaint
          </p>
        </div>
      </div>

      <dl className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.label} className="flex items-center gap-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[rgb(0_0_0/0.04)] text-[var(--muted-foreground)] dark:bg-[rgb(255_255_255/0.05)]">
              <f.icon className="size-4" />
            </span>
            <div className="min-w-0">
              <dt className="truncate text-[11px] tracking-[0.3px] text-[var(--muted-foreground)] uppercase">
                {f.label}
              </dt>
              <dd
                className={`truncate text-base font-bold ${
                  f.accent ? "text-[var(--tone-info)]" : ""
                }`}
              >
                {f.value}
              </dd>
            </div>
          </div>
        ))}
      </dl>

      <div className="mt-6 rounded-xl bg-[rgb(0_0_0/0.03)] px-4 py-3 dark:bg-[rgb(255_255_255/0.04)]">
        <p className="text-[10px] font-semibold tracking-[0.5px] text-[var(--muted-foreground)] uppercase">
          Complainant Statement
        </p>
        <p className="mt-1.5 text-sm leading-relaxed">{complaint.narrative}</p>
      </div>
    </Card>
  )
}

/** Complainant on the left, driver and permit history on the right. */
