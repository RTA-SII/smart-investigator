import { useState } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Choice } from "@/components/ui/Form"
import { OFFICERS, officerLoads } from "@/data/personas"
import { FINE_SUB_CATEGORIES, SUSPENSION_PERIODS } from "@/data/catalog"
import { useComplaints } from "@/app/complaintStore"
import { useT } from "@/i18n"

/** RTA's `Action Taken` for a guilty finding. */
const PENALTY_CHOICES = [
  { value: "Verbal Warning", label: "Verbal warning" },
  { value: "Driver Fine", label: "Driver fine" },
  { value: "Fine & Suspension", label: "Fine and suspension" },
  { value: "Termination", label: "Termination" },
]

/**
 * The slide-in confirmation behind every action — the house pattern in place
 * of a modal. It carries the driver record the decision is written against,
 * so nobody rules on a name alone.
 */
export function DecisionConfirm({ action, complaint, role, onCancel, onConfirm }) {
  const complaints = useComplaints()
  const t = useT()
  const [penalty, setPenalty] = useState("Driver Fine")
  const [fineSubCategory, setFineSubCategory] = useState(FINE_SUB_CATEGORIES[0])
  const [suspensionDays, setSuspensionDays] = useState(SUSPENSION_PERIODS[0])
  // An unassigned complaint still has to submit somebody: without this the
  // select shows the first officer while the value stays empty, and
  // confirming would reassign it to nobody.
  const [officer, setOfficer] = useState(
    complaint.assignee?.id ?? OFFICERS[0].id,
  )
  const [note, setNote] = useState(
    `${action.note}. Cross-validation returned ${complaint.ai.verdict} at ${complaint.ai.confidence}% confidence.`,
  )

  const destructive = action.tone === "primary" || action.tone === "danger"

  // Portalled to the body on purpose. The page content sits inside the
  // `chart-rise` entry animation, and a transformed ancestor becomes the
  // containing block for its fixed-position descendants — so without this the
  // panel measures itself against the article, not the window, and the
  // Confirm button ends up below the fold.
  return createPortal(
    <>
      <div className="fixed inset-0 z-40 bg-[rgb(0_0_0/0.25)]" onClick={onCancel} />
      {/* Sized to its content, not the viewport. As a full-height drawer the
          Confirm button sat at the bottom of the screen — a long way from the
          fields it belongs to, and out of reach without scrolling on a short
          action. Capped so a long form still scrolls internally, with the
          footer staying directly beneath it. */}
      <aside className="fixed end-0 top-1/2 z-50 flex max-h-[88vh] w-[420px] max-w-[92vw] -translate-y-1/2 flex-col overflow-hidden rounded-s-2xl bg-[var(--popover)] shadow-[0_20px_60px_rgb(0_0_0/0.2)]">
        <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
          <div className="min-w-0">
            <p className="truncate text-base font-bold">{action.label}</p>
            <p className="ltr-value truncate font-mono text-[11px] text-[var(--muted-foreground)]">
              {complaint.id}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel"
            className="grid size-8 shrink-0 place-items-center rounded-lg transition-colors hover:bg-[var(--accent)]"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <p className="text-sm leading-relaxed">{action.note}.</p>

          <dl className="mt-5 space-y-3">
            <Row label="Driver" value={complaint.driver.name} />
            <Row label="Licence" value={complaint.driver.licence} mono />
            <Row label="Permit" value={complaint.driver.permit} mono />
            <Row label="Prior complaints" value={complaint.driver.priorComplaints} />
            <Row
              label="AI verdict"
              value={`${complaint.ai.verdict} · ${complaint.ai.confidence}%`}
            />
          </dl>

          {action.id === "issueFine" && (
            <p className="mt-5 rounded-xl border-[1px] border-[rgb(228_26_20/0.25)] bg-[rgb(228_26_20/0.08)] px-4 py-3 text-sm text-[var(--destructive)]">
              This action is written to the driver's enforcement record and
              notified to the operator.
            </p>
          )}

          {action.penalties && (
            <>
              <Block
                label="Action taken"
                hint="What follows from the finding, recorded on the investigation form."
              >
                <Choice options={PENALTY_CHOICES} value={penalty} onChange={setPenalty} />
              </Block>

              <Block
                label="Fine sub-category"
                hint="The RTA fine code the finding is raised under."
              >
                <select
                  aria-label={t("Fine sub-category")}
                  value={fineSubCategory}
                  onChange={(e) => setFineSubCategory(e.target.value)}
                  className="w-full cursor-pointer rounded-xl border-[1px] border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--ring)] focus:outline-none"
                >
                  {FINE_SUB_CATEGORIES.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </Block>

              {penalty === "Fine & Suspension" && (
                <Block
                  label="Suspension period"
                  hint="How many days the driver is suspended for."
                >
                  <Choice
                    options={SUSPENSION_PERIODS.map((d) => ({
                      value: d,
                      label: `${d} days`,
                    }))}
                    value={suspensionDays}
                    onChange={setSuspensionDays}
                  />
                </Block>
              )}
            </>
          )}

          {action.officers && (
            <Block
              label="Investigation officer"
              hint="Leave it with the same officer to return the complaint, or pick another to reassign it."
            >
              <select
                aria-label="Investigation officer"
                value={officer}
                onChange={(e) => setOfficer(e.target.value)}
                className="w-full cursor-pointer rounded-xl border-[1px] border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--ring)] focus:outline-none"
              >
                {officerLoads(complaints).map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} · {o.load} open
                  </option>
                ))}
              </select>
            </Block>
          )}

          <label className="mt-5 block">
            <span className="mb-1.5 block text-[10px] font-semibold tracking-[0.5px] text-[var(--muted-foreground)] uppercase">
              Officer note
            </span>
            <textarea
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-xl border-[1px] border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--ring)] focus:outline-none"
            />
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] px-5 py-4">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant={destructive ? "destructive" : "primary"}
            onClick={() =>
              onConfirm({ note, penalty, officer, fineSubCategory, suspensionDays })
            }
          >
            Confirm as {role.title}
          </Button>
        </div>
      </aside>
    </>,
    document.body,
  )
}

function Block({ label, hint, children }) {
  return (
    <div className="mt-5">
      <span className="mb-1.5 block text-[10px] font-semibold tracking-[0.5px] text-[var(--muted-foreground)] uppercase">
        {label}
      </span>
      {children}
      <span className="mt-1.5 block text-[11px] text-[var(--muted-foreground)]">
        {hint}
      </span>
    </div>
  )
}

function Row({ label, value, mono }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 text-sm text-[var(--muted-foreground)]">{label}</dt>
      <dd className={`min-w-0 truncate text-sm font-semibold ${mono ? "font-mono" : ""}`}>
        {value}
      </dd>
    </div>
  )
}
