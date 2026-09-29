import { describe, expect, it } from "vitest"
import { authenticate, USERNAMES } from "./auth"
import { ROLES } from "@/data/personas"

const PASSWORD = "Ducont1234"

describe("authenticate", () => {
  it("admits the investigation officer", async () => {
    expect(await authenticate("officer1", PASSWORD)).toBe("officer")
  })

  it("admits the supervisor", async () => {
    expect(await authenticate("supervisor1", PASSWORD)).toBe("supervisor")
  })

  it("turns away a wrong password", async () => {
    expect(await authenticate("officer1", "ducont1234")).toBeNull()
    expect(await authenticate("officer1", "")).toBeNull()
    expect(await authenticate("officer1", PASSWORD + " ")).toBeNull()
  })

  it("turns away an unknown username", async () => {
    expect(await authenticate("admin", PASSWORD)).toBeNull()
    expect(await authenticate("", PASSWORD)).toBeNull()
  })

  it("survives nothing at all rather than throwing", async () => {
    expect(await authenticate(undefined, undefined)).toBeNull()
    expect(await authenticate(null, null)).toBeNull()
  })

  it("forgives case and stray space in the username, never in the password", async () => {
    expect(await authenticate("  Officer1 ", PASSWORD)).toBe("officer")
    expect(await authenticate("SUPERVISOR1", PASSWORD)).toBe("supervisor")
    expect(await authenticate("officer1", " Ducont1234")).toBeNull()
  })

  it("keeps a username for each role, matching the persona's handle", async () => {
    // The sign-in screen is the only way in and the username is what picks the
    // role, so a role without an account is a role nobody can reach.
    for (const role of ROLES) {
      expect(USERNAMES).toContain(role.staff.handle)
      expect(await authenticate(role.staff.handle, PASSWORD)).toBe(role.id)
    }
  })
})
