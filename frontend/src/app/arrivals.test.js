// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  FIRST_ARRIVAL_MS,
  NEXT_ARRIVAL_MS,
  arrivalsDelivered,
  deliverArrival,
  deskIsClear,
  resetArrivals,
  startArrivals,
} from "./arrivals"
import {
  allComplaints,
  complaintById,
  decide,
  resetComplaints,
} from "./complaintStore"
import { allNotifications, clearNotifications } from "./notifications"
import { signIn, signOut } from "./session"
import { ROLES } from "@/data/personas"
import { chtState, isQueued } from "@/lib/cht"

const OFFICER = ROLES[0]
const CLOSE = { id: "notGuilty", label: "Driver Not Guilty", note: "n/a" }

beforeEach(() => {
  signIn("officer")
  resetComplaints()
  resetArrivals()
  clearNotifications()
})
afterEach(() => {
  resetArrivals()
  signOut()
})

describe("the officer's desk", () => {
  it("is clear at sign-in — nothing seeded is on their name", () => {
    expect(deskIsClear()).toBe(true)
    expect(allComplaints().some(isQueued)).toBe(false)
  })

  it("is not clear while they are holding the one they were given", () => {
    deliverArrival(0)
    expect(deskIsClear()).toBe(false)
  })

  it("clears again once the complaint is closed", () => {
    const id = deliverArrival(0)
    decide(id, CLOSE)
    expect(deskIsClear()).toBe(true)
  })

  it("does not count closed work as still held", () => {
    const id = deliverArrival(0)
    decide(id, CLOSE)

    // The complaint keeps its assignee and its pulledAt for the audit trail;
    // neither means the officer is still working on it.
    expect(complaintById(id).assignee).toBeTruthy()
    expect(complaintById(id).pulledAt).toBeTruthy()
    expect(deskIsClear()).toBe(true)
  })

  it("clears when the complaint is escalated away", () => {
    const id = deliverArrival(0)
    decide(id, { id: "faceToFace", label: "Face-to-Face Investigation Needed", note: "n/a" })
    expect(deskIsClear()).toBe(true)
  })
})

describe("deliverArrival", () => {
  it("hands the complaint to the officer with the clock already running", () => {
    const arrived = complaintById(deliverArrival(0))

    expect(arrived.stage).toBe("Under Investigation")
    expect(arrived.assignee.id).toBe(OFFICER.staff.code)
    expect(arrived.pulledAt).toBeTruthy()
    expect(arrived.pushed).toBe(true)
  })

  it("leaves nothing unowned — every complaint has an officer on it", () => {
    deliverArrival(0)
    expect(allComplaints().some(isQueued)).toBe(false)
  })

  it("logs the handover on the audit trail", () => {
    const entry = complaintById(deliverArrival(0)).timeline.at(-1)
    expect(entry.action).toBe("Assigned to investigation officer")
    expect(entry.note).toContain(OFFICER.staff.name)
  })

  it("stays with the officer when the handling time lapses", () => {
    const id = deliverArrival(0)
    complaintById(id).pulledAt = new Date(Date.now() - 9_999_000).toISOString()

    expect(chtState(complaintById(id), Date.now()).phase).toBe("breached")
    expect(complaintById(id).assignee.id).toBe(OFFICER.staff.code)
    expect(deskIsClear()).toBe(false)
  })

  it("raises one notification, stamped on the demo clock", () => {
    const id = deliverArrival(0)
    const notes = allNotifications()

    expect(notes).toHaveLength(1)
    expect(notes[0].complaintId).toBe(id)
    expect(notes[0].at).toBe(complaintById(id).receivedAt)
  })

  it("is deterministic — the same index yields the same complaint", () => {
    const a = complaintById(deliverArrival(3))
    resetComplaints()
    const b = complaintById(deliverArrival(3))
    expect(b.type).toBe(a.type)
    expect(b.company).toBe(a.company)
  })

  it("grows the set by one and keeps ids unique", () => {
    const before = allComplaints().length
    deliverArrival(0)
    deliverArrival(1)

    const rows = allComplaints()
    expect(rows).toHaveLength(before + 2)
    expect(new Set(rows.map((c) => c.id)).size).toBe(rows.length)
  })
})

describe("startArrivals", () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it("delivers the first complaint shortly after sign-in", () => {
    startArrivals()

    vi.advanceTimersByTime(FIRST_ARRIVAL_MS - 1)
    expect(arrivalsDelivered()).toBe(0)

    vi.advanceTimersByTime(1)
    expect(arrivalsDelivered()).toBe(1)
    expect(allComplaints().some(isQueued)).toBe(false)
  })

  it("hands nothing to a supervisor", () => {
    signIn("supervisor")
    startArrivals()
    vi.advanceTimersByTime(FIRST_ARRIVAL_MS + NEXT_ARRIVAL_MS * 3)
    expect(arrivalsDelivered()).toBe(0)
  })

  it("sends nothing more while the officer still has that one", () => {
    startArrivals()
    vi.advanceTimersByTime(FIRST_ARRIVAL_MS)

    vi.advanceTimersByTime(NEXT_ARRIVAL_MS * 5)
    expect(arrivalsDelivered()).toBe(1)
  })

  it("sends the next one 20 seconds after the complaint is closed", () => {
    startArrivals()
    vi.advanceTimersByTime(FIRST_ARRIVAL_MS)
    const [id] = allComplaints()
      .filter((c) => c.pushed && c.stage !== "Closed")
      .map((c) => c.id)

    decide(id, CLOSE)
    vi.advanceTimersByTime(NEXT_ARRIVAL_MS - 1)
    expect(arrivalsDelivered()).toBe(1)

    vi.advanceTimersByTime(1)
    expect(arrivalsDelivered()).toBe(2)
  })

  it("keeps the cycle going, one complaint at a time", () => {
    startArrivals()
    vi.advanceTimersByTime(FIRST_ARRIVAL_MS)

    for (let round = 2; round <= 4; round++) {
      const open = allComplaints().find((c) => c.pushed && c.stage !== "Closed")
      decide(open.id, CLOSE)
      vi.advanceTimersByTime(NEXT_ARRIVAL_MS)
      expect(arrivalsDelivered()).toBe(round)
      expect(allComplaints().some(isQueued)).toBe(false)
    }
  })

  it("does not double the rate when started twice", () => {
    startArrivals()
    startArrivals()
    vi.advanceTimersByTime(FIRST_ARRIVAL_MS)
    expect(arrivalsDelivered()).toBe(1)
  })

  it("stops delivering once the run is reset", () => {
    startArrivals()
    resetArrivals()
    vi.advanceTimersByTime(FIRST_ARRIVAL_MS + NEXT_ARRIVAL_MS * 3)
    expect(arrivalsDelivered()).toBe(0)
  })
})
