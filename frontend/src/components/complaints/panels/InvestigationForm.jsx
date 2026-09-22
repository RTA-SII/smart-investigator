import { ClipboardCheck, Scale, UserSearch } from "lucide-react"
import { Card, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { PENALTY_TONE } from "@/data/catalog"
import { longStamp } from "@/lib/format"
import { useT } from "@/i18n"

/**
 * The Investigation Form — RTA's own record, and the artefact the whole
 * workflow exists to produce (workbook sheet 2).
 *
 * The three statements are the substance: what the customer reported, what
 * the driver said when interviewed, and how the investigator reconciled
 * them. They are written in whichever language the interview happened in, so
 * every one carries `dir="auto"` — an Arabic statement has to render
 * right-to-left inside an English page, and vice versa.
 */
export function InvestigationForm({ complaint }) {
  const form = complaint.form
  const t = useT()

  if (!form) {
    return (
      <Card className="p-5">
        <CardTitle>{t("Investigation Form")}</CardTitle>
        <p className="py-10 text-center text-sm text-[var(--muted-foreground)]">
          {t("No investigation form has been opened for this case yet.")}
        </p>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      <Card className="p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--accent)] text-[var(--primary)]">
            <ClipboardCheck className="size-4" />
          </span>
          <CardTitle>{t("Investigation Form")}</CardTitle>
          {form.investigationMethod && (
            <Badge tone="info">{t(form.investigationMethod)}</Badge>
          )}
          <span className="ms-auto flex flex-wrap items-center gap-2">
            <span className="ltr-value font-mono text-[11px] text-[var(--muted-foreground)]">
              {form.id}
            </span>
            {form.date && (
              <span className="ltr-value text-[11px] text-[var(--muted-foreground)]">
                {longStamp(form.date)}
              </span>
            )}
          </span>
        </div>

        <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          <Row label={t("Driver ID")} value={form.driverId} mono />
          <Row label={t("Nationality")} value={form.nationality} />
          <Row label={t("Plate Number")} value={complaint.plate} mono />
          <Row label={t("Side Number")} value={complaint.sideNumber} mono />
          <Row label={t("Case Location")} value={form.caseLocation} />
          <Row label={t("Reason / Purpose")} value={t(complaint.type)} />
        </dl>
      </Card>

      <Card className="p-5">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--accent)] text-[var(--primary)]">
            <UserSearch className="size-4" />
          </span>
          <CardTitle>{t("Statements")}</CardTitle>
        </div>

        <div className="grid gap-4">
          <Statement label={t("Customer's Statement")} body={form.customerStatement} />
          <Statement label={t("Driver's Statement")} body={form.driverStatement} />
          <Statement
            label={t("Investigator's Statement")}
            body={form.investigatorStatement}
          />
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--accent)] text-[var(--primary)]">
            <Scale className="size-4" />
          </span>
          <CardTitle>{t("Outcome")}</CardTitle>
        </div>

        {form.actionTaken ? (
          <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            <Row
              label={t("Action Taken")}
              value={
                <Badge tone={PENALTY_TONE[form.actionTaken] ?? "neutral"}>
                  {t(form.actionTaken)}
                </Badge>
              }
            />
            <Row
              label={t("Suspension Period")}
              value={form.suspensionDays ? `${form.suspensionDays} ${t("days")}` : "—"}
            />
            <Row label={t("Fine Category")} value={form.fineCategory ?? "—"} />
            <Row
              label={t("Fine Sub Category")}
              value={form.fineSubCategory ?? "—"}
              wide
            />
          </dl>
        ) : (
          <p className="py-6 text-center text-sm text-[var(--muted-foreground)]">
            {t("The outcome is recorded here once a finding is taken.")}
          </p>
        )}
      </Card>
    </div>
  )
}

function Row({ label, value, mono, wide }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="text-[10px] font-semibold tracking-[0.5px] text-[var(--muted-foreground)] uppercase">
        {label}
      </dt>
      <dd className={`mt-0.5 text-sm ${mono ? "ltr-value font-mono" : ""}`}>
        {value || "—"}
      </dd>
    </div>
  )
}

/**
 * `dir="auto"` lets the browser pick direction from the first strong
 * character, so RTA's Arabic interview transcripts read correctly without
 * the page having to be in Arabic.
 */
function Statement({ label, body }) {
  const t = useT()
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-semibold tracking-[0.5px] text-[var(--muted-foreground)] uppercase">
        {label}
      </p>
      {body ? (
        <p
          dir="auto"
          className="rounded-xl bg-[rgb(0_0_0/0.03)] px-4 py-3 text-sm leading-relaxed whitespace-pre-line dark:bg-[rgb(255_255_255/0.04)]"
        >
          {body.trim()}
        </p>
      ) : (
        <p className="rounded-xl border-[1px] border-dashed border-[var(--border)] px-4 py-3 text-sm text-[var(--muted-foreground)]">
          {t("Not recorded yet")}
        </p>
      )}
    </div>
  )
}
