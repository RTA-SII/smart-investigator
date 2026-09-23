import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowUp, Banknote, CircleCheck, CircleX, Undo2 } from "lucide-react"
import { Card, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { ActionButton } from "./ActionButton"
import { DecisionConfirm } from "./DecisionConfirm"
import { decide } from "@/app/complaintStore"
import { OFFICERS } from "@/data/personas"
import { useT } from "@/i18n"

/**
 * SMC's "Take Action" card, carrying the complaints actions from the POC
 * scope (§8) instead of the alert ones.
 *
 * Both roles close a complaint the same three ways — False Positive, No Fine
 * Required, Issue Fine. The first row is what separates them: an officer who
 * is not sure escalates, a supervisor hands the complaint back to an officer.
 *
 * Order, tone and icon follow the portal's own list: the two routes that
 * take the case away from the officer first in red, then the grey
 * face-to-face step, the no-penalty outcome in green, and the single
 * enforcement action last as the solid primary button.
 */
const ACTIONS = [
  {
    id: "missingInfo",
    label: "Essential Information Missing",
    icon: ArrowUp,
    tone: "danger",
    roles: ["officer", "supervisor"],
    note: "Returned to Customer Happiness for the missing detail",
    approval: true,
  },
  {
    id: "escalate",
    label: "Escalate to Supervisor",
    icon: CircleX,
    tone: "danger",
    roles: ["officer"],
    note: "Referred upward — the officer was not sure",
    approval: true,
  },
  {
    id: "faceToFace",
    label: "Face-to-Face Investigation Needed",
    icon: Undo2,
    tone: "neutral",
    roles: ["officer", "supervisor"],
    note: "Required for termination, or where no recording is available",
    approval: true,
  },
  {
    // One button for both of the deck's no-enforcement findings: the event
    // happened but the driver is not at fault, and the event did not happen
    // at all. Either way nothing is raised against the licence.
    id: "noEnforcement",
    label: "No Enforcement Needed",
    icon: CircleCheck,
    tone: "success",
    roles: ["officer", "supervisor"],
    note: "Recorded with no enforcement action against the driver",
  },
  {
    id: "guilty",
    label: "Issue Fine",
    icon: Banknote,
    tone: "primary",
    roles: ["officer", "supervisor"],
    note: "Verified finding recorded; fine transferred to Stafteesh",
    penalties: true,
  },
  {
    id: "matchFound",
    label: "Potential Match Found",
    icon: CircleCheck,
    tone: "success",
    roles: ["officer", "supervisor"],
    note: "The item was traced and matched to the report",
    caseTypes: ["Lost Item"],
  },
  {
    id: "reassign",
    label: "Reassign to Investigation Officer",
    icon: Undo2,
    tone: "neutral",
    roles: ["supervisor"],
    note: "Sent back to an officer for further work",
    officers: true,
  },
]

export function DecisionBar({ complaint, role }) {
  const [pending, setPending] = useState(null)
  const navigate = useNavigate()
  const t = useT()
  const decision = complaint.decision

  if (decision) return <DecisionRecorded decision={decision} />

  const lostItem = complaint.caseType === "Lost Item"

  const available = ACTIONS.filter((a) => {
    if (!a.roles.includes(role.id)) return false
    // The completeness gate: a case missing an essential detail cannot be
    // worked at all, so the only route out is back to Customer Happiness.
    if (complaint.incomplete) return a.id === "missingInfo"
    // A lost-item case is traced or it is not — there is no driver fine.
    if (a.caseTypes) return a.caseTypes.includes(complaint.caseType)
    if (lostItem && a.id === "guilty") return false
    return true
  })

  const confirm = ({ note, penalty, officer, fineSubCategory, suspensionDays }) => {
    decide(complaint.id, pending, {
      note,
      penalty,
      fineSubCategory,
      suspensionDays,
      officer: OFFICERS.find((o) => o.id === officer),
      by: `${role.staff.name} · ${role.staff.code}`,
    })
    setPending(null)

    // An officer is done with this one — send them back to their own list,
    // where it now sits marked Closed and the next complaint will land. A
    // supervisor stays put; they are working a referral, not a queue.
    if (role.id !== "supervisor") navigate("/my-queue")
  }

  return (
    <Card className="p-4">
      <CardTitle className="mb-3">{t("Take Action")}</CardTitle>

      <div className="grid gap-2.5">
        {available.map((a) => (
          <ActionButton key={a.id} tone={a.tone} onClick={() => setPending(a)}>
            <a.icon />
            {t(a.label)}
          </ActionButton>
        ))}
      </div>

      {pending && (
        <DecisionConfirm
          action={pending}
          complaint={complaint}
          role={role}
          onCancel={() => setPending(null)}
          onConfirm={confirm}
        />
      )}
    </Card>
  )
}

/** Once a complaint is settled the list is replaced by what was decided. */
function DecisionRecorded({ decision }) {
  return (
    <Card className="p-4">
      <CardTitle className="mb-3">Decision recorded</CardTitle>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={decision.id === "falsePositive" ? "low" : "critical"}>
          {decision.label}
        </Badge>
        {decision.penalty && <Badge tone="critical">{decision.penalty}</Badge>}
      </div>
      <p className="mt-2.5 text-sm text-[var(--muted-foreground)]">{decision.note}</p>
      <p className="mt-1 text-[11px] text-[var(--muted-foreground)]">{decision.by}</p>
    </Card>
  )
}
