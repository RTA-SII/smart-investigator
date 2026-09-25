import { asset } from "@/lib/asset"
import { NavLink } from "react-router-dom"
import { useT } from "@/i18n"
import { cn } from "@/lib/cn"

/**
 * The nav body itself, measured off the portal's sidebar: links 14px/500 at
 * 10px/12px padding on an 11.2px radius, active state navy on primary@10%,
 * centred 9px section captions, and a navy count pill.
 */
export function NavList({ sections, onNavigate }) {
  const t = useT()
  return (
    <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
      {sections.map((s, i) => (
        <div key={i}>
          {s.title && (
            <p className="px-3 pt-4 pb-2 text-center text-[9px] font-bold tracking-[0.9px] text-[color-mix(in_oklab,var(--primary)_70%,transparent)] uppercase">
              {t(s.title)}
            </p>
          )}
          <ul className="space-y-0.5">
            {s.items.map((it) => (
              <li key={it.to}>
                <NavLink
                  to={it.to}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      // The border is always present — transparent when idle —
                      // so the active stroke never shifts the row.
                      "flex items-center gap-3 rounded-xl border px-3 py-2 text-sm font-medium",
                      "transition-colors duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]",
                      isActive
                        ? "border-[color-mix(in_oklab,var(--primary)_20%,transparent)] bg-[color-mix(in_oklab,var(--primary)_10%,transparent)] text-[var(--primary)]"
                        : "border-transparent text-[var(--sidebar-foreground)] hover:bg-white/40 dark:hover:bg-white/10",
                    )
                  }
                >
                  <it.icon className="size-4 shrink-0" />
                  {/* `truncate` clips to the line box, so the line box has
                      to hold the glyphs: at `leading-none` a 14px box cut
                      2.7px off letters like D and C. The row keeps its
                      height by giving that back from the padding. */}
                  <span className="min-w-0 flex-1 truncate leading-5">
                    {t(it.label)}
                  </span>
                  {it.count > 0 && (
                    <span className="grid h-[18px] shrink-0 place-items-center rounded-full bg-[var(--primary)] px-1.5 text-[10px] leading-none font-bold text-[var(--primary-foreground)]">
                      {it.count}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

/** Logo lockup + wordmark, shared by the sidebar and the drawer. */
export function NavBrand({ className }) {
  const t = useT()
  return (
    <div className={cn("flex min-w-0 items-center gap-2.5 px-4 py-5", className)}>
      <img src={asset("rta-icon.svg")} alt="" className="size-8 shrink-0" />
      {/* One line, so the size is set by the 256px rail rather than chosen:
          the name is the whole wordmark now, and wrapping it across two
          lines made the rail look like it held two separate labels. */}
      <p className="min-w-0 truncate text-[13px] leading-tight font-bold tracking-[-0.1px]">
        {t("Smart Investigation Initiative")}
      </p>
    </div>
  )
}
