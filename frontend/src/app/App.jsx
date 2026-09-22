import { useEffect, useState } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { TopBar } from "@/components/shell/TopBar"
import { Sidebar } from "@/components/shell/Sidebar"
import { NavDrawer } from "@/components/shell/NavDrawer"
import { roleById } from "@/data/personas"
import { applyTheme, useSession } from "@/app/session"
import { applyLang, useLang } from "@/i18n"
import { startArrivals } from "@/app/arrivals"
import { ArrivalToasts } from "@/components/shell/ArrivalToasts"

/**
 * The portal shell, structured as SMC structures it: a full-height flex row
 * of sidebar rail and content column, with the page scrolling inside `main`
 * rather than the window, so the rail and top bar never move.
 */
export function App() {
  const session = useSession()
  const location = useLocation()
  const [navOpen, setNavOpen] = useState(false)

  const lang = useLang()

  useEffect(() => applyTheme(session.theme), [session.theme])
  useEffect(() => applyLang(), [lang])
  // Complaints keep arriving while the portal is open — see `arrivals.js`.
  useEffect(() => startArrivals(), [])

  if (!session.roleId) return <Navigate to="/" replace />
  const role = roleById(session.roleId)

  return (
    <div className="relative flex h-dvh overflow-hidden">
      <div className="app-scene" aria-hidden />
      <Sidebar role={role} />
      <NavDrawer role={role} open={navOpen} onClose={() => setNavOpen(false)} />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="no-print shrink-0 px-3 pt-2">
          <TopBar onOpenNav={() => setNavOpen(true)} />
        </div>
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div key={location.pathname} className="chart-rise relative px-6 pt-3 pb-6">
            <Outlet />
          </div>
        </main>
      </div>

      <ArrivalToasts />
    </div>
  )
}
