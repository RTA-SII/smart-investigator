// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import {
  allComplaints,
  applyRecordingException,
  assign,
  complaintById,
  decide,
  releaseVehicle,
  deliverTo,
  fileComplaint,
  resetComplaints,
  TRANSITIONS,
  verifyAi,
} from "./complaintStore"
import { OFFICERS, officerLoads } from "@/data/personas"
import { buildArrival, COMPLAINTS } from "@/data/complaints"


const openOne = () => allComplaints().find((c) => c.stage !== "Closed")

describe("decide", () => {
  beforeEach(() => resetComplaints())

  it("closes the complaint and records the outcome", () => {
    const before = openOne()
    decide(before.id, { id: "invalid", label: "Invalid Complaint", note: "n/a" })

    const after = complaintById(before.id)
    expect(after.stage).toBe("Closed")
    expect(after.outcome).toBe("Invalid Complaint - No Event Exists")
  })

  it("carries a suspension alongside a fine, and only alongside a fine", () => {
    const a = openOne()
    decide(a.id, { id: "guilty", label: "Driver Guilty", note: "n/a" }, {
      penalty: "Fine & Suspension",
    })
    expect(complaintById(a.id).outcome).toBe("Valid Complaint - Guilty")
    expect(complaintById(a.id).penalty).toBe("Fine & Suspension")

    // A penalty passed with any other finding is ignored — RTA's form
    // records "Not guilty" as the action taken instead.
    resetComplaints()
    const b = openOne()
    decide(b.id, { id: "notGuilty", label: "Driver Not Guilty", note: "n/a" }, {
      penalty: "Fine & Suspension",
    })
    expect(complaintById(b.id).penalty).toBe("Not guilty")
    expect(complaintById(b.id).form.fineSubCategory).toBeNull()
    expect(complaintById(b.id).form.suspensionDays).toBeNull()
  })

  it("writes the finding into the investigation form", () => {
    const c = openOne()
    decide(c.id, { id: "guilty", label: "Driver Guilty", note: "Camera confirms" }, {
      penalty: "Fine & Suspension",
      fineSubCategory: "1-49 Driving recklessly, or in a way that is dangerous to the public.",
      suspensionDays: 5,
    })

    const form = complaintById(c.id).form
    expect(form.actionTaken).toBe("Fine & Suspension")
    expect(form.fineCategory).toBe("Driver Fines")
    expect(form.fineSubCategory).toContain("1-49")
    expect(form.suspensionDays).toBe(5)
    expect(form.investigatorStatement).toBe("Camera confirms")
  })

  it("moves an escalation onto the supervisor's queue", () => {
    const before = openOne()
    expect(before.stage).not.toBe("Escalated")

    decide(before.id, { id: "faceToFace", label: "Face-to-Face Investigation Needed", note: "n/a" })

    const escalated = allComplaints().filter((c) => c.stage === "Escalated")
    expect(escalated.map((c) => c.id)).toContain(before.id)
    // ...and it is no longer counted as open work for the officer.
    expect(complaintById(before.id).outcome).toBeNull()
  })

  it("applies every action in the transition table", () => {
    for (const [id, move] of Object.entries(TRANSITIONS)) {
      resetComplaints()
      const target = openOne()
      decide(target.id, { id, label: id, note: "n/a" })
      const after = complaintById(target.id)
      expect(after.stage, id).toBe(move.stage)
      expect(after.outcome, id).toBe(move.outcome)
    }
  })

  it("keeps the officer's own words in the audit trail", () => {
    const target = openOne()
    const entries = target.timeline.length

    decide(target.id, { id: "invalid", label: "Invalid Complaint", note: "fallback" }, {
      note: "Camera shows the lane change was signalled.",
      by: "Layla Al-Hammadi · SMC-0318",
    })

    const after = complaintById(target.id)
    expect(after.timeline).toHaveLength(entries + 1)
    expect(after.timeline.at(-1).note).toBe(
      "Camera shows the lane change was signalled.",
    )
    expect(after.timeline.at(-1).actor).toBe("Layla Al-Hammadi · SMC-0318")
  })

  it("falls back to the action's own wording when the note is blank", () => {
    const target = openOne()
    decide(target.id, { id: "invalid", label: "Invalid Complaint", note: "Evidence does not support" }, {
      note: "   ",
    })
    expect(complaintById(target.id).timeline.at(-1).note).toBe(
      "Evidence does not support",
    )
  })

  it("ignores an unknown complaint or action", () => {
    const before = allComplaints()
    decide("CMP-999999", { id: "invalid", label: "Invalid Complaint" })
    decide(openOne().id, { id: "not-a-thing", label: "?" })
    expect(allComplaints()).toBe(before)
  })
})

describe("decide — reassign (the supervisor's fourth action)", () => {
  beforeEach(() => resetComplaints())

  const REASSIGN = { id: "reassign", label: "Reassign to Investigation Officer" }
  const held = () =>
    allComplaints().find((c) => c.pulledAt && c.stage !== "Closed") ??
    allComplaints().find((c) => c.assignee && c.stage !== "Closed")

  it("moves the complaint to the officer it names", () => {
    const before = held()
    const other = OFFICERS.find((o) => o.id !== before.assignee?.id)
    decide(before.id, REASSIGN, { officer: other, by: "Supervisor" })

    const after = complaintById(before.id)
    expect(after.assignee.id).toBe(other.id)
    expect(after.stage).toBe("Assigned")
  })

  it("returning it to the same officer keeps them on it", () => {
    const before = held()
    const same = OFFICERS.find((o) => o.id === before.assignee.id)
    decide(before.id, REASSIGN, { officer: same, by: "Supervisor" })
    expect(complaintById(before.id).assignee.id).toBe(same.id)
  })

  it("restarts the handling time, since the complaint is live again", () => {
    const id = deliverTo(buildArrival(COMPLAINTS.length), {
      id: "SMC-0318",
      name: "Layla Al-Hammadi",
    })
    expect(complaintById(id).pulledAt).toBeTruthy()

    decide(id, REASSIGN, { officer: OFFICERS[1], by: "Supervisor" })
    expect(complaintById(id).pulledAt).toBeNull()
  })

  it("leaves the owner alone when no officer is named", () => {
    const before = held()
    decide(before.id, REASSIGN, { by: "Supervisor" })
    expect(complaintById(before.id).assignee?.id).toBe(before.assignee?.id)
  })

  it("never lets a closing action change the owner", () => {
    const before = held()
    decide(before.id, { id: "guilty", label: "Driver Guilty" }, {
      officer: OFFICERS.find((o) => o.id !== before.assignee?.id),
    })
    expect(complaintById(before.id).assignee?.id).toBe(before.assignee?.id)
  })
})

describe("assign", () => {
  beforeEach(() => resetComplaints())

  it("reassigns and logs it", () => {
    const target = openOne()
    const officer = OFFICERS.find((o) => o.id !== target.assignee?.id)

    assign(target.id, officer)

    const after = complaintById(target.id)
    expect(after.assignee).toEqual({ id: officer.id, name: officer.name })
    expect(after.timeline.at(-1).action).toBe("Reassigned")
  })

  it("takes a New complaint to Assigned", () => {
    const fresh = fileComplaint(buildArrival(COMPLAINTS.length))
    assign(fresh, OFFICERS[0])
    expect(complaintById(fresh).stage).toBe("Assigned")
  })

  it("can return a complaint to the pool", () => {
    const target = allComplaints().find((c) => c.assignee)
    assign(target.id, null)
    expect(complaintById(target.id).assignee).toBeNull()
  })

  it("feeds a single officer load that every caller shares", () => {
    const officer = OFFICERS[0]
    const before = officerLoads(allComplaints()).find((o) => o.id === officer.id).load

    const other = allComplaints().find(
      (c) => c.stage !== "Closed" && c.assignee?.id !== officer.id,
    )
    assign(other.id, officer)

    const after = officerLoads(allComplaints()).find((o) => o.id === officer.id).load
    expect(after).toBe(before + 1)
  })
})

describe("the missing-recording exception", () => {
  beforeEach(() => resetComplaints())

  const noRecording = () =>
    allComplaints().find((c) => !c.recordingAvailable && !c.exception)

  it("suspends the vehicle, blocks the permit and fines the company", () => {
    const before = noRecording()
    expect(before).toBeTruthy()

    applyRecordingException(before.id, "Layla Al-Hammadi · SMC-0318")
    const after = complaintById(before.id)

    expect(after.exception.vehicleSuspended).toBe(true)
    expect(after.exception.permitBlocked).toBe(true)
    expect(after.exception.companyFined).toBe(true)
    expect(after.exception.released).toBe(false)
  })

  it("switches the investigation to face to face", () => {
    const id = noRecording().id
    applyRecordingException(id)
    expect(complaintById(id).form.investigationMethod).toBe("Face to Face & Camera")
  })

  it("logs the compliance action, naming the operator", () => {
    const before = noRecording()
    applyRecordingException(before.id)

    const entry = complaintById(before.id).timeline.at(-1)
    expect(entry.action).toBe("Required recording unavailable")
    expect(entry.note).toContain(before.company)
  })

  it("cannot be raised twice", () => {
    const id = noRecording().id
    applyRecordingException(id)
    const trail = complaintById(id).timeline.length
    applyRecordingException(id)
    expect(complaintById(id).timeline).toHaveLength(trail)
  })

  it("releases the vehicle once the recording issue is resolved", () => {
    const id = noRecording().id
    applyRecordingException(id)
    releaseVehicle(id)

    const after = complaintById(id)
    expect(after.exception.released).toBe(true)
    expect(after.timeline.at(-1).action).toBe("Vehicle suspension released")
  })

  it("will not release a vehicle that was never suspended", () => {
    const clean = allComplaints().find((c) => c.recordingAvailable && !c.exception)
    const trail = clean.timeline.length
    releaseVehicle(clean.id)
    expect(complaintById(clean.id).timeline).toHaveLength(trail)
  })
})

describe("verifyAi", () => {
  beforeEach(() => resetComplaints())

  // Everything seeded is already being worked, so it has been through the
  // engine. Only a freshly arrived complaint still needs verifying.
  const unverified = () =>
    complaintById(fileComplaint(buildArrival(COMPLAINTS.length)))

  it("reveals the verdict and logs the run", () => {
    const before = unverified()
    const trail = before.timeline.length

    verifyAi(before.id)
    const after = complaintById(before.id)

    expect(after.aiVerified).toBe(true)
    expect(after.timeline).toHaveLength(trail + 1)
    expect(after.timeline.at(-1).action).toBe("AI cross-validation completed")
    expect(after.timeline.at(-1).note).toContain(after.ai.verdict)
  })

  it("does not change the verdict — it only shows it", () => {
    const before = unverified()
    const verdict = before.ai.verdict
    verifyAi(before.id)
    expect(complaintById(before.id).ai.verdict).toBe(verdict)
  })

  it("cannot be run twice", () => {
    const id = unverified().id
    verifyAi(id)
    const trail = complaintById(id).timeline.length
    verifyAi(id)
    expect(complaintById(id).timeline).toHaveLength(trail)
  })
})

describe("fileComplaint", () => {
  beforeEach(() => resetComplaints())

  it("makes the complaint retrievable, as the success screen promises", () => {
    const id = fileComplaint({
      receivedAt: new Date().toISOString(),
      stage: "New",
      timeline: [],
    })
    expect(complaintById(id)).toBeTruthy()
    expect(complaintById(id).id).toBe(id)
  })

  it("issues sequential ids rather than random ones", () => {
    const a = fileComplaint({ receivedAt: new Date().toISOString(), timeline: [] })
    const b = fileComplaint({ receivedAt: new Date().toISOString(), timeline: [] })
    expect(Number(b.replace("CMP-", ""))).toBe(Number(a.replace("CMP-", "")) + 1)
  })

  it("renumbers the investigation form to match the case", () => {
    const id = fileComplaint({
      receivedAt: new Date().toISOString(),
      timeline: [],
      form: { id: "CMP-000000_2026-01-01", driverId: "1" },
    })
    expect(complaintById(id).form.id.startsWith(id)).toBe(true)
  })

  it("never collides with the seeded set", () => {
    const ids = new Set(allComplaints().map((c) => c.id))
    const id = fileComplaint({ receivedAt: new Date().toISOString(), timeline: [] })
    expect(ids.has(id)).toBe(false)
  })
})

describe("resetComplaints", () => {
  beforeEach(() => resetComplaints())

  it("restores the seed so a demo can be rerun", () => {
    const target = openOne()
    decide(target.id, { id: "guilty", label: "Driver Guilty", note: "n/a" })
    expect(complaintById(target.id).stage).toBe("Closed")

    resetComplaints()
    expect(complaintById(target.id).stage).not.toBe("Closed")
  })
})

