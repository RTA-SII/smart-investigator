import { NavBrand, NavList } from "@/components/shell/NavList"
import { navSections } from "@/components/shell/navItems"
import { useComplaints } from "@/app/complaintStore"

/**
 * The portal's persistent sidebar: a 256px glass panel inset from the window
 * edge, shown from `lg` up. Below that the same nav appears as a drawer.
 */
export function Sidebar({ role }) {
  const complaints = useComplaints()

  return (
    <div className="no-print relative z-10 hidden h-full min-h-0 py-2 ps-3 lg:flex">
      <aside className="glass-surface relative flex h-full w-64 shrink-0 flex-col overflow-hidden rounded-2xl">
        <NavBrand />
        <NavList sections={navSections(role, complaints)} />
      </aside>
    </div>
  )
}
