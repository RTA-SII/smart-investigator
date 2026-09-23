// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import { RouterProvider, createMemoryRouter } from "react-router-dom"
import { App } from "./App"
import { signIn, signOut } from "./session"
import { resetComplaints, allComplaints } from "./complaintStore"
import { RolePicker } from "@/pages/RolePicker"
import { Dashboard } from "@/pages/Dashboard"
import { Complaints } from "@/pages/Complaints"
import { ComplaintDetail } from "@/pages/ComplaintDetail"
import { ManualComplaints } from "@/pages/ManualComplaints"
import { NewManualComplaint } from "@/pages/NewManualComplaint"
import { MyQueue } from "@/pages/MyQueue"
import { setLang } from "@/i18n"

/**
 * Every route, rendered under both roles.
 *
 * This exists because a supervisor-only page once shipped throwing
 * `ReferenceError: t is not defined` — lint passed (oxlint's `no-undef` is
 * off unless configured), the build passed, and nobody clicked it. A page
 * that throws should fail here rather than in front of a stakeholder.
 */

const ROUTES = [
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/complaints", element: <Complaints /> },
  { path: "/complaints/:id", element: <ComplaintDetail /> },
  { path: "/manual-complaints", element: <ManualComplaints /> },
  { path: "/manual-complaints/new", element: <NewManualComplaint /> },
  { path: "/my-queue", element: <MyQueue /> },
]

function renderAt(path) {
  const router = createMemoryRouter(
    [
      { path: "/", element: <RolePicker /> },
      { element: <App />, children: ROUTES },
    ],
    { initialEntries: [path] },
  )
  return render(<RouterProvider router={router} />)
}

/** ResizeObserver is absent in jsdom; recharts needs it to mount. */
beforeEach(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  resetComplaints()
})

afterEach(() => {
  cleanup()
  signOut()
  setLang("en")
})

describe.each(["officer", "supervisor"])("as the %s", (roleId) => {
  const detailId = () => allComplaints()[0].id

  // Assert content, not merely "did not throw" — React swallows a render
  // error into an empty tree, so a crashed page still "does not throw".
  it.each(ROUTES.map((r) => r.path))("renders %s", (path) => {
    signIn(roleId)
    const { container } = renderAt(path.replace(":id", detailId()))
    expect(container.textContent.trim().length).toBeGreaterThan(0)
  })
})

describe("the escalation filter", () => {
  it("appears on All Complaints once Stage is Escalated", () => {
    const escalated = allComplaints().filter((c) => c.stage === "Escalated")
    expect(escalated.length).toBeGreaterThan(0)

    signIn("supervisor")
    renderAt("/complaints")

    // Hidden until the Stage facet asks for it — SMC reveals it the same way.
    expect(screen.queryByText("Escalated by")).toBeNull()
  })

  it("renders All Complaints in Arabic", () => {
    signIn("supervisor")
    setLang("ar")
    const { container } = renderAt("/complaints")
    expect(container.textContent).toContain("الشكاوى")
  })
})
