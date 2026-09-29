import { describe, expect, it } from "vitest"
import { isMine, isMineOpen } from "./ownership"
import { COMPLAINTS } from "@/data/complaints"
import { ROLES } from "@/data/personas"

const OFFICER = ROLES.find((r) => r.id === "officer")
const SUPERVISOR = ROLES.find((r) => r.id === "supervisor")

const row = (patch) => ({
  stage: "Under Investigation",
  assignee: { id: "SMC-0322", name: "Rashid Al-Nuaimi" },
  ...patch,
})

describe("isMine", () => {
  it("an officer owns what carries their name", () => {
    expect(isMine(row({ assignee: { id: OFFICER.staff.code } }), OFFICER)).toBe(true)
    expect(isMine(row(), OFFICER)).toBe(false)
  })

  it("a supervisor owns what was referred to them, not what they are assigned", () => {
    const referral = row({
      stage: "Escalated",
      escalatedTo: { id: SUPERVISOR.staff.code, name: SUPERVISOR.staff.name },
    })
    expect(isMine(referral, SUPERVISOR)).toBe(true)

    // Assigning a complaint to a supervisor does not make it theirs — the
    // officer keeps the investigation, so this is how it has to read.
    expect(isMine(row({ assignee: { id: SUPERVISOR.staff.code } }), SUPERVISOR)).toBe(false)
  })

  it("a referral to the other supervisor is not this one's", () => {
    const other = row({ stage: "Escalated", escalatedTo: { id: "SMC-0209" } })
    expect(isMine(other, SUPERVISOR)).toBe(false)
  })
})

describe("isMineOpen", () => {
  const referral = (stage) =>
    row({ stage, escalatedTo: { id: SUPERVISOR.staff.code } })

  it("counts a referral only while it sits at Escalated", () => {
    expect(isMineOpen(referral("Escalated"), SUPERVISOR)).toBe(true)
    // Ruled on, or handed back to an officer: still in their list as history,
    // no longer work.
    expect(isMineOpen(referral("Closed"), SUPERVISOR)).toBe(false)
    expect(isMineOpen(referral("Assigned"), SUPERVISOR)).toBe(false)
  })

  it("leaves an officer's escalation off their own open count", () => {
    const mine = { stage: "Under Investigation", assignee: { id: OFFICER.staff.code } }
    expect(isMineOpen(mine, OFFICER)).toBe(true)
    expect(isMineOpen({ ...mine, stage: "Escalated" }, OFFICER)).toBe(false)
  })
})

describe("the seeded referral", () => {
  it("hands the duty supervisor exactly one case to rule on", () => {
    const waiting = COMPLAINTS.filter((c) => isMineOpen(c, SUPERVISOR))
    expect(waiting).toHaveLength(1)
    expect(waiting[0].stage).toBe("Escalated")
  })

  it("keeps the escalating officer on the case", () => {
    const [referral] = COMPLAINTS.filter((c) => isMineOpen(c, SUPERVISOR))
    expect(referral.assignee).toBeTruthy()
    expect(referral.assignee.id).not.toBe(SUPERVISOR.staff.code)
  })

  it("names a supervisor on every complaint that went up", () => {
    const escalated = COMPLAINTS.filter((c) => c.stage === "Escalated")
    expect(escalated.length).toBeGreaterThan(1)
    expect(escalated.every((c) => c.escalatedTo?.id)).toBe(true)
  })
})
