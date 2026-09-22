import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Bell, ChevronDown, LogOut, Menu, Moon, ShieldCheck, Sun } from "lucide-react"
import { NOW } from "@/data/complaints"
import { useComplaints } from "@/app/complaintStore"
import { roleById } from "@/data/personas"
import { signOut, toggleTheme, useSession } from "@/app/session"
import { StatusPanel } from "@/components/shell/StatusPanel"
import { NotificationPanel } from "@/components/shell/NotificationPanel"
import { markAllRead, useNotifications } from "@/app/notifications"
import { toggleLang, useLang, useT } from "@/i18n"
import { cn } from "@/lib/cn"

/**
 * Global context only — status and live counts on the left, utilities and the
 * signed-in identity on the right. Page identity lives in the page header.
 * A 40px glass pill, inset from the window edge, exactly as SMC renders it.
 */
export function TopBar({ onOpenNav }) {
  const session = useSession()
  const navigate = useNavigate()
  const [statusOpen, setStatusOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const role = roleById(session.roleId)
  const dark = session.theme === "dark"
  const lang = useLang()
  const complaints = useComplaints()
  const notifications = useNotifications()
  const t = useT()

  const unread = notifications.filter((n) => !n.read).length

  // "Live" means still inside its five-minute handling window.
  const live = useMemo(
    () =>
      complaints.filter(
        (c) =>
          c.stage !== "Closed" &&
          (NOW - new Date(c.receivedAt)) / 60_000 <= c.slaMinutes,
      ).length,
    [complaints],
  )

  return (
    <header className="glass-surface relative z-10 flex h-10 shrink-0 items-center justify-between gap-3 overflow-visible rounded-2xl px-2">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={onOpenNav}
          aria-label={t("Open navigation")}
          className="grid size-8 shrink-0 place-items-center rounded-lg transition-colors duration-150 hover:bg-white/40 dark:hover:bg-white/10 lg:hidden"
        >
          <Menu className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => setStatusOpen((v) => !v)}
          className="flex min-w-0 items-center gap-2 rounded-lg px-2 py-1 transition-colors duration-150 hover:bg-white/40 dark:hover:bg-white/10"
        >
          <span className="flex shrink-0 items-center gap-1">
            {["#16a34a", "#f59e0b", "#f59e0b", "#f59e0b", "#f59e0b"].map((c, i) => (
              <span key={i} className="size-1.5 rounded-full" style={{ backgroundColor: c }} />
            ))}
          </span>
          <span className="truncate text-[11px] font-semibold">{t("System Status")}</span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-[var(--muted-foreground)] transition-transform",
              statusOpen && "rotate-180",
            )}
          />
        </button>

        <span className="hidden shrink-0 items-center gap-1.5 rounded-full border-[1px] border-[rgb(228_26_20/0.25)] bg-[rgb(228_26_20/0.1)] px-3 py-1.5 text-[11px] leading-none font-semibold text-[var(--destructive)] sm:inline-flex">
          <span className="size-1.5 rounded-full bg-[var(--destructive)]" />
          {live} {t("Live Complaints")}
        </span>

        {statusOpen && <StatusPanel onClose={() => setStatusOpen(false)} />}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <IconButton label={t("Toggle theme")} onClick={toggleTheme}>
          {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </IconButton>
        <IconButton
          label={lang === "ar" ? "English" : "العربية"}
          onClick={toggleLang}
        >
          <span className="text-[11px] font-semibold">
            {lang === "ar" ? "EN" : "عربي"}
          </span>
        </IconButton>
        <span className="relative">
          <IconButton
            label={t("Notifications")}
            onClick={() => {
              setBellOpen((v) => !v)
              markAllRead()
            }}
          >
            <Bell className="size-4" />
            {unread > 0 && (
              <span className="ltr-value absolute -top-0.5 -end-0.5 grid min-w-4 place-items-center rounded-full bg-[var(--destructive)] px-1 text-[9px] leading-4 font-bold text-white">
                {unread}
              </span>
            )}
          </IconButton>
          {bellOpen && <NotificationPanel onClose={() => setBellOpen(false)} />}
        </span>

        <span className="ms-1 hidden items-center gap-1.5 rounded-lg bg-[var(--accent)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--primary)] md:inline-flex">
          <ShieldCheck className="size-4" />
          {t(role.title)}
        </span>

        <div className="me-1 ms-2 hidden min-w-0 text-end sm:block">
          <p className="truncate text-xs leading-tight font-semibold">{role.staff.name}</p>
          <p className="flex items-center justify-end gap-1.5 truncate text-[10px] leading-tight text-[var(--muted-foreground)]">
            <span className="size-1.5 rounded-full bg-[#16a34a]" />
            {t(role.title)} · {t("Online")}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            signOut()
            navigate("/")
          }}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-[var(--muted-foreground)] transition-colors duration-150 hover:bg-white/40 hover:text-[var(--foreground)] dark:hover:bg-white/10"
        >
          <LogOut className="size-4" />
          <span className="hidden lg:inline">{t("Sign Out")}</span>
        </button>
      </div>
    </header>
  )
}

function IconButton({ label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="relative grid size-8 shrink-0 place-items-center rounded-lg transition-colors duration-150 hover:bg-white/40 dark:hover:bg-white/10"
    >
      {children}
    </button>
  )
}
