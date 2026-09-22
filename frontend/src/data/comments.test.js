// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import { buildArrival, COMPLAINTS } from "./complaints"
import {
  addComment,
  complaintById,
  fileComplaint,
  resetComplaints,
} from "@/app/complaintStore"

const AUTHOR = { name: "Layla Al-Hammadi", id: "SMC-0318", role: "Investigation Officer" }

describe("seeded comment threads", () => {
  it("gives every complaint a thread, even an empty one", () => {
    expect(COMPLAINTS.every((c) => Array.isArray(c.comments))).toBe(true)
  })

  it("leaves a complaint nobody has taken undiscussed", () => {
    resetComplaints()
    const arrived = complaintById(fileComplaint(buildArrival(COMPLAINTS.length)))

    expect(arrived.stage).toBe("New")
    expect(arrived.comments).toHaveLength(0)
  })

  it("gives an escalation both the officer's doubt and the supervisor's answer", () => {
    const escalated = COMPLAINTS.find((c) => c.stage === "Escalated")
    expect(escalated.comments).toHaveLength(2)
    expect(escalated.comments[0].author.role).toBe("Investigation Officer")
    expect(escalated.comments[1].author.role).toBe("Supervisor")
  })

  it("keeps the thread in order and rebuilds identically", () => {
    const withThread = COMPLAINTS.find((c) => c.comments.length > 1)
    const times = withThread.comments.map((c) => new Date(c.at).getTime())
    expect([...times].sort((a, b) => a - b)).toEqual(times)
    expect(new Set(withThread.comments.map((c) => c.id)).size).toBe(
      withThread.comments.length,
    )
  })
})

describe("addComment", () => {
  beforeEach(() => resetComplaints())

  // Only a live arrival is unassigned and undiscussed — the seeded rows are
  // all on an officer, and most of them already carry a thread.
  const target = () =>
    complaintById(fileComplaint(buildArrival(COMPLAINTS.length)))

  it("appends the comment to the case thread", () => {
    const id = target().id
    addComment(id, { body: "Called the operator back.", author: AUTHOR })

    const thread = complaintById(id).comments
    expect(thread).toHaveLength(1)
    expect(thread[0].body).toBe("Called the operator back.")
    expect(thread[0].author.name).toBe(AUTHOR.name)
  })

  it("leaves the audit log alone — the two trails stay separate", () => {
    const before = target()
    const auditLength = before.timeline.length
    addComment(before.id, { body: "A note.", author: AUTHOR })
    expect(complaintById(before.id).timeline).toHaveLength(auditLength)
  })

  it("refuses an empty body and trims the rest", () => {
    const id = target().id
    expect(addComment(id, { body: "   ", author: AUTHOR })).toBeNull()
    expect(complaintById(id).comments).toHaveLength(0)

    addComment(id, { body: "  padded  ", author: AUTHOR })
    expect(complaintById(id).comments[0].body).toBe("padded")
  })

  it("stamps successive comments apart so the thread reads in order", () => {
    const id = target().id
    addComment(id, { body: "first", author: AUTHOR })
    addComment(id, { body: "second", author: AUTHOR })

    const [a, b] = complaintById(id).comments
    expect(new Date(b.at).getTime()).toBeGreaterThan(new Date(a.at).getTime())
    expect(a.id).not.toBe(b.id)
  })
})
