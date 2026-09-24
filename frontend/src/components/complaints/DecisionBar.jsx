import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowUp, Banknote, CircleCheck, CircleX, Undo2 } from "lucide-react"
import { Card, CardTitle } from "@/components/ui/Card"
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
    label: "Return to Customer Happiness",
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
    // One button for both of the deck's no-enforcement findings — nothing is
    // raised against the licence either way — but they are not the same
    // finding, so the officer says which before it is recorded.
    id: "noEnforcement",
    label: "No Enforcement Needed",
    icon: CircleCheck,
    tone: "success",
    roles: ["officer", "supervisor"],
    note: "Recorded with no enforcement action against the driver",
    findings: [
      {
        value: "Valid Complaint - Not Guilty",
        label: "Valid complaint · Driver not guilty",
      },
      {
        value: "Invalid Complaint - No Event Exists",
        label: "Invalid complaint · No event exists",
      },
    ],
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

  // A settled complaint offers no actions at all — it says what was decided.
  // Seeded history arrives closed without a `decision` record, so the stage
  // and outcome are what this reads, not the ruling object: without that the
  // whole back catalogue showed a live Take Action card.
  const settled = settledLabel(complaint, role)
  if (settled) return <DecisionSettled complaint={complaint} label={settled} />

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

  const confirm = ({ note, penalty, officer, finding, fineSubCategory, suspensionDays }) => {
    decide(complaint.id, pending, {
      note,
      penalty,
      finding,
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

/**
 * What was decided, in place of the actions.
 *
 * Null while the complaint is still someone's to act on. Escalated is the one
 * stage that depends on who is looking: it is finished for the officer who
 * referred it and live for the supervisor who has to rule.
 */
function settledLabel(c, role) {
  if (c.stage === "Closed") return `Complaint Closed — ${c.outcome ?? "No finding recorded"}`
  if (c.stage === "Returned") return "Returned to Customer Happiness"
  if (c.stage === "Escalated" && role.id !== "supervisor")
    return "Escalated — awaiting a supervisor ruling"
  return null
}

/**
 * SMC's settled card: one line, centred, in the brand navy. No chips and no
 * buttons — there is nothing here to do, and anything that looks pressable
 * invites a click that cannot go anywhere.
 */
function DecisionSettled({ complaint, label }) {
  const t = useT()
  const { decision, penalty } = complaint

  return (
    <Card className="px-4 py-6">
      <p className="text-center text-[15px] font-bold text-[var(--primary)]">
        {t(label)}
      </p>
      {penalty && penalty !== "Not guilty" && (
        <p className="mt-1.5 text-center text-sm text-[var(--muted-foreground)]">
          {t(penalty)}
        </p>
      )}
      {decision?.by && (
        <p className="mt-3 text-center text-[11px] text-[var(--muted-foreground)]">
          {decision.by}
        </p>
      )}
    </Card>
  )
}
