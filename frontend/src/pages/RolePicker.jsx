import { asset } from "@/lib/asset"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronRight, Moon, Search, ShieldCheck, Sun } from "lucide-react"
import { ROLES } from "@/data/personas"
import { applyTheme, signIn, toggleTheme, useSession } from "@/app/session"
import { initials } from "@/lib/format"

const ICONS = { search: Search, shield: ShieldCheck }

const TONES = {
  primary: { fg: "var(--primary)", soft: "rgb(23 28 143 / 0.08)", edge: "rgb(23 28 143 / 0.22)" },
  amber: { fg: "#c2410c", soft: "rgb(245 158 11 / 0.1)", edge: "rgb(245 158 11 / 0.3)" },
}

/** SMC's entry screen, scoped to this module's two roles. */
export function RolePicker() {
  const session = useSession()
  const navigate = useNavigate()

  useEffect(() => applyTheme(session.theme), [session.theme])

  const enter = (roleId) => {
    signIn(roleId)
    navigate("/dashboard")
  }

  return (
    <div className="relative min-h-dvh">
      <div className="app-scene" aria-hidden />
      <header className="relative z-10 flex items-center justify-between gap-4 border-b border-[var(--border)] px-8 py-4">
        <div className="flex min-w-0 items-center gap-4">
          <img src={asset("rta-icon.svg")} alt="" className="h-8 w-auto shrink-0" />
          <div className="min-w-0">
            <p className="truncate text-xl leading-tight font-bold">
              Roads and Transport Authority
            </p>
            <p className="truncate text-[11px] tracking-[1px] text-[var(--muted-foreground)] uppercase">
              Complaints Investigation
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="glass-surface grid size-10 place-items-center rounded-xl"
          >
            {session.theme === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </button>
          <span className="hidden items-center gap-2 rounded-full border-[1px] border-[rgb(79_174_94/0.3)] bg-[rgb(79_174_94/0.12)] px-4 py-2.5 text-sm font-semibold tracking-[1px] text-[#15803d] uppercase sm:inline-flex">
            <span className="size-2 rounded-full bg-[#16a34a]" />
            System Online
          </span>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-[1240px] px-6 py-14">
        <h1 className="text-center text-4xl font-bold">Select Role</h1>
        <p className="mt-3 text-center text-base text-[var(--muted-foreground)]">
          Select a persona to continue to the complaints dashboard
        </p>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {ROLES.map((role) => {
            const Icon = ICONS[role.icon]
            const tone = TONES[role.tone]
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => enter(role.id)}
                className="group glass-surface rounded-2xl p-8 text-start transition-transform duration-200 hover:-translate-y-1"
                style={{ borderColor: tone.edge }}
              >
                <span
                  className="grid size-16 place-items-center rounded-2xl"
                  style={{ background: tone.soft, color: tone.fg }}
                >
                  <Icon className="size-7" />
                </span>

                <p className="mt-7 flex flex-wrap items-baseline gap-3">
                  <span className="text-2xl font-bold">{role.title}</span>
                  <span className="text-sm text-[var(--muted-foreground)]">
                    {role.arabic}
                  </span>
                </p>
                <p className="mt-2 text-base text-[var(--muted-foreground)]">
                  {role.scope}
                </p>

                <span
                  className="mt-7 flex items-center gap-4 rounded-xl px-4 py-3"
                  style={{ background: tone.soft }}
                >
                  <span
                    className="grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
                    style={{ background: tone.fg }}
                  >
                    {initials(role.staff.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base font-bold">
                      {role.staff.name}
                    </span>
                    <span className="block truncate text-sm text-[var(--muted-foreground)]">
                      {role.staff.code} · {role.staff.handle}
                    </span>
                  </span>
                  <ChevronRight
                    className="size-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1"
                    style={{ color: tone.fg }}
                  />
                </span>
              </button>
            )
          })}
        </div>
      </main>
    </div>
  )
}
