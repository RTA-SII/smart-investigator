import { Bell, ClipboardList, LayoutDashboard, CirclePlus } from "lucide-react"
import { isOpenFor } from "@/lib/cht"

/**
 * Nav for this module only — no other SMC modules appear. The shape follows
 * the portal's own drawer: two ungrouped entries up top, then a captioned
 * section. Shared by the persistent sidebar and the narrow-viewport drawer so
 * the two cannot drift.
 */
export function navSections(role, complaints) {
  // Estate-wide, anything unsettled is outstanding — a returned case is
  // still somebody's problem. On the officer's own badge it is not: their
  // count is what they can act on, the same rule the arrival scheduler and
  // My Productivity use.
  const openCount = complaints.filter((c) => c.stage !== "Closed").length
  const mineCount = complaints.filter((c) => isOpenFor(c, role.staff.code)).length

  const work = [
    { to: "/my-queue", label: "My Complaints", icon: Bell, count: mineCount },
    { to: "/manual-complaints", label: "Manual Complaints", icon: CirclePlus },
  ]

  // Reports is gone for both roles. SMC carries one, but it reports on the
  // whole monitoring estate; a complaints-only module has the dashboard for
  // the same figures and nothing further to say.
  const top = [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }]

  // Matching SMC: an inspector's Alert Management section is My Alerts and
  // Manual Alerts only — the estate-wide list and the escalation queue are
  // the supervisor's.
  if (role.id !== "supervisor") {
    return [{ items: top }, { title: "Complaint Management", items: work }]
  }

  return [
    { items: top },
    {
      title: "Complaint Management",
      items: [
        {
          to: "/complaints",
          label: "All Complaints",
          icon: ClipboardList,
          count: openCount,
        },
        ...work,
      ],
    },
  ]
}
