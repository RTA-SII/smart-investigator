import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowUp, Banknote, CircleCheck, CircleX, Undo2 } from "lucide-react"
import { Card, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { ActionButton } from "./ActionButton"
import { DecisionConfirm } from "./DecisionConfirm"
import { decide } from "@/app/complaintStore"
import { OFFICERS } from "@/data/personas"

/**
 * SMC's "Take Action" card, carrying the complaints actions from the POC
 * scope (§8) instead of the alert ones.
 *
 * Both roles close a complaint the same three ways — False Positive, No Fine
 * Required, Issue Fine. The first row is what separates them: an officer who
 * is not sure escalates, a supervisor hands the complaint back to an officer.
 *
 * Order, tone and icon follow the portal's own list: the referral row first
 * in red, the two no-penalty outcomes in grey then green, and the single
 * enforcement action last as the solid primary button.
 */
const ACTIONS = [
  {
    id: "escalate",
    label: "Escalate to Supervisor",
    icon: ArrowUp,
    tone: "danger",
    roles: ["officer"],
    note: "Referred upward — the officer was not sure",
  },
  {
    id: "reassign",
    label: "Reassign to Investigation Officer",
    icon: Undo2,
    tone: "danger",
    roles: ["supervisor"],
    note: "Sent back to an officer for further work",
    officers: true,
  },
  {
    id: "falsePositive",
    label: "False Positive",
    icon: CircleX,
    tone: "neutral",
    roles: ["officer", "supervisor"],
    note: "The complaint is not borne out by the evidence",
  },
  {
    id: "noFine",
    label: "No Fine Required",
    icon: CircleCheck,
    tone: "success",
    roles: ["officer", "supervisor"],
    note: "Upheld, but not to the threshold for a penalty",
  },
  {
    id: "issueFine",
    label: "Issue Fine",
    icon: Banknote,
    tone: "primary",
    roles: ["officer", "supervisor"],
    note: "Fine raised against the driver's licence",
    penalties: true,
  },
]

export function DecisionBar({ complaint, role }) {
  const [pending, setPending] = useState(null)
  const navigate = useNavigate()
  const decision = complaint.decision

  if (decision) return <DecisionRecorded decision={decision} />

  const available = ACTIONS.filter((a) => a.roles.includes(role.id))

  const confirm = ({ note, penalty, officer }) => {
    decide(complaint.id, pending, {
      note,
      penalty,
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
      <CardTitle className="mb-3">Take Action</CardTitle>

      <div className="grid gap-2.5">
        {available.map((a) => (
          <ActionButton key={a.id} tone={a.tone} onClick={() => setPending(a)}>
            <a.icon />
            {a.label}
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
