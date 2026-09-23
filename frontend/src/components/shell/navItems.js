import { Bell, ClipboardList, LayoutDashboard, CirclePlus } from "lucide-react"

/**
 * Nav for this module only — no other SMC modules appear. The shape follows
 * the portal's own drawer: two ungrouped entries up top, then a captioned
 * section. Shared by the persistent sidebar and the narrow-viewport drawer so
 * the two cannot drift.
 */
export function navSections(role, complaints) {
  const openCount = complaints.filter((c) => c.stage !== "Closed").length
  const mineCount = complaints.filter(
    (c) => c.assignee?.id === role.staff.code && c.stage !== "Closed",
  ).length

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
