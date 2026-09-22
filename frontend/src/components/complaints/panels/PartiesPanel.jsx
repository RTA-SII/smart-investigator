import { Building2, FileText, Link2, Phone, RadioTower, Star, User } from "lucide-react"
import { Card, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Field } from "@/components/complaints/panels/Field"

/** Complainant on the left, driver and permit history on the right. */
export function PartiesPanel({ complaint }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="p-5">
        <CardTitle className="mb-4">Complainant</CardTitle>
        <dl className="space-y-4">
          <Field icon={User} label="Name" value={complaint.complainant.name} />
          <Field icon={Phone} label="Contact" value={complaint.complainant.phone} />
          <Field icon={Link2} label="Trip reference" value={complaint.complainant.tripRef} />
          <Field icon={RadioTower} label="Raised via" value={complaint.channel} />
        </dl>
        <p className="mt-4 text-[11px] text-[var(--muted-foreground)]">
          Contact details are masked in line with CRM data-handling rules.
        </p>
      </Card>

      <Card className="p-5">
        <CardTitle className="mb-4">Driver & Vehicle</CardTitle>
        <dl className="space-y-4">
          <Field icon={User} label="Driver" value={complaint.driver.name} />
          <Field icon={FileText} label="Licence" value={complaint.driver.licence} mono />
          <Field icon={FileText} label="Permit" value={complaint.driver.permit} mono />
          <Field icon={Building2} label="Company" value={complaint.company} />
          <Field icon={FileText} label="Side number" value={complaint.sideNumber} mono />
          <Field icon={FileText} label="Plate" value={complaint.plate} mono />
        </dl>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
          <span className="flex items-center gap-2 text-sm">
            <Star className="size-4 text-[var(--tone-high)]" />
            Rating {complaint.driver.rating}
          </span>
          <Badge tone={complaint.driver.priorComplaints > 2 ? "critical" : "neutral"}>
            {complaint.driver.priorComplaints} prior complaints
          </Badge>
        </div>
      </Card>
    </div>
  )
}
