import { X } from "lucide-react"
import { NavBrand, NavList } from "@/components/shell/NavList"
import { navSections } from "@/components/shell/navItems"
import { useComplaints } from "@/app/complaintStore"
import { cn } from "@/lib/cn"

/** The same nav as a slide-in, for viewports below `lg` where the rail is hidden. */
export function NavDrawer({ role, open, onClose }) {
  const complaints = useComplaints()

  return (
    <div className="lg:hidden">
      <div
        className={cn(
          "fixed inset-0 z-40 bg-[rgb(0_0_0/0.25)] transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[320px] max-w-[88vw] flex-col",
          "bg-[var(--popover)] shadow-[0_20px_60px_rgb(0_0_0/0.18)]",
          "transition-transform duration-250 ease-out",
          open ? "translate-x-0" : "-translate-x-full rtl:translate-x-full",
        )}
      >
        <div className="flex items-start justify-between">
          <NavBrand />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="mt-5 me-4 grid size-8 shrink-0 place-items-center rounded-lg transition-colors hover:bg-[var(--accent)]"
          >
            <X className="size-4" />
          </button>
        </div>
        <NavList sections={navSections(role, complaints)} onNavigate={onClose} />
      </aside>
    </div>
  )
}
