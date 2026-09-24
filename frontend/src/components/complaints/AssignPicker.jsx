import { useMemo, useState } from "react"
import { Check, ChevronDown, Search, UserPlus } from "lucide-react"
import { assign, useComplaints } from "@/app/complaintStore"
import { DEPARTMENTS, LOAD_BANDS, operatorLoads } from "@/data/personas"
import { initials } from "@/lib/format"
import { useT } from "@/i18n"
import { cn } from "@/lib/cn"

/** The busiest operator sets the bar length, so the comparison is relative. */
const barWidth = (load, busiest) =>
  busiest ? `${Math.max(4, Math.round((load / busiest) * 100))}%` : "4%"

const ROLE_TABS = [
  { id: "all", label: "All roles" },
  { id: "Investigation Officer", label: "Officers" },
  { id: "Supervisor", label: "Supervisors" },
]

/**
 * The assignment popover from SMC's alert list, carrying complaints instead.
 *
 * Measured off `/alerts`: a 352px card on an 11.2px radius over a 1px
 * black/10 hairline, a 32px search field, 18px pill filters, and 48px
 * operator rows whose workload bar is 4px tall. The workload is the whole
 * point of it — a supervisor assigns by seeing who can actually take the
 * work, so the lightest-loaded is flagged as the best fit.
 */
export function AssignPicker({ complaint }) {
  const [open, setOpen] = useState(false)
  const assignee = complaint.assignee
  const t = useT()

  return (
    <span className="relative inline-block" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex h-8 max-w-[190px] items-center gap-2 rounded-lg px-2",
          "text-[13px] whitespace-nowrap transition-colors duration-150",
          "hover:bg-[rgb(23_28_143/0.06)] dark:hover:bg-white/10",
        )}
      >
        {assignee ? (
          <>
            <Avatar name={assignee.name} size={20} />
            <span className="truncate">{assignee.name}</span>
          </>
        ) : (
          <>
            <UserPlus className="size-4 text-[var(--muted-foreground)]" />
            <span className="text-[var(--muted-foreground)]">{t("Assign")}</span>
          </>
        )}
        <ChevronDown className="size-3.5 shrink-0 text-[var(--muted-foreground)]" />
      </button>

      {open && <Popover complaint={complaint} onClose={() => setOpen(false)} />}
    </span>
  )
}

function Popover({ complaint, onClose }) {
  const complaints = useComplaints()
  const t = useT()
  const [query, setQuery] = useState("")
  const [roleTab, setRoleTab] = useState("all")
  const [department, setDepartment] = useState("")
  const [band, setBand] = useState("")

  const operators = useMemo(() => operatorLoads(complaints), [complaints])
  const busiest = Math.max(1, ...operators.map((o) => o.load))
  const lightest = Math.min(...operators.map((o) => o.load))

  const shown = operators.filter((o) => {
    if (roleTab !== "all" && o.role !== roleTab) return false
    if (department && o.department !== department) return false
    if (band && o.band.id !== band) return false
    if (!query.trim()) return true
    return `${o.name} ${o.id} ${o.department}`
      .toLowerCase()
      .includes(query.trim().toLowerCase())
  })

  const counts = Object.fromEntries(
    LOAD_BANDS.map((b) => [b.id, operators.filter((o) => o.band.id === b.id).length]),
  )

  return (
    <>
      <button
        type="button"
        aria-label={t("Close")}
        className="fixed inset-0 z-30 cursor-default"
        onClick={onClose}
      />
      <div className="absolute end-0 top-9 z-40 w-[352px] overflow-hidden rounded-[11.2px] border-[1px] border-[rgb(0_0_0/0.1)] bg-[var(--popover)] shadow-[0_18px_44px_rgb(0_0_0/0.18)]">
        <div className="p-2.5">
          <span className="relative block">
            <Search className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("Search by name, badge, or department")}
              className="filter-control h-8 w-full rounded-lg ps-8 pe-2.5 text-xs outline-none focus-visible:border-[var(--primary)]"
            />
          </span>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {ROLE_TABS.map((r) => (
              <Pill key={r.id} active={roleTab === r.id} onClick={() => setRoleTab(r.id)}>
                {t(r.label)}
              </Pill>
            ))}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <select
              aria-label={t("Department")}
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="filter-control h-7 cursor-pointer rounded-lg px-2 text-[11px] outline-none"
            >
              <option value="">{t("All departments")}</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {t(d)}
                </option>
              ))}
            </select>

            <Pill active={!band} onClick={() => setBand("")}>
              {t("Any")} <Count>{operators.length}</Count>
            </Pill>
            {LOAD_BANDS.map((b) => (
              <Pill key={b.id} active={band === b.id} onClick={() => setBand(b.id)}>
                <span className="size-1.5 rounded-full" style={{ backgroundColor: b.tone }} />
                {t(b.label)} <Count>{counts[b.id]}</Count>
              </Pill>
            ))}
          </div>
        </div>

        <ul className="max-h-[240px] overflow-y-auto border-t border-[rgb(0_0_0/0.06)]">
          {shown.map((o) => {
            const mine = complaint.assignee?.id === o.id
            return (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => {
                    assign(complaint.id, { id: o.id, name: o.name })
                    onClose()
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-2.5 py-2 text-start transition-colors duration-150",
                    mine ? "bg-[var(--accent)]" : "hover:bg-[rgb(23_28_143/0.06)] dark:hover:bg-white/10",
                  )}
                >
                  <Avatar name={o.name} tint={o.tint} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-[13px] font-bold">{o.name}</span>
                      <Tag>{t(o.role === "Supervisor" ? "Supervisor" : "Officer")}</Tag>
                      {o.load === lightest && <Tag tone="#009a44">{t("Best fit")}</Tag>}
                    </span>
                    <span className="mt-0.5 flex items-center gap-2">
                      <span className="ltr-value shrink-0 font-mono text-[10px] text-[var(--muted-foreground)]">
                        {o.id}
                      </span>
                      <span className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-white/70 dark:bg-white/10">
                        <span
                          className="block h-full rounded-full"
                          style={{
                            width: barWidth(o.load, busiest),
                            backgroundColor: o.band.tone,
                          }}
                        />
                      </span>
                      <span
                        className="ltr-value shrink-0 text-[10px] font-semibold"
                        style={{ color: o.band.tone }}
                      >
                        {o.load}
                      </span>
                    </span>
                  </span>
                  {mine && <Check className="size-4 shrink-0 text-[var(--primary)]" />}
                </button>
              </li>
            )
          })}

          {!shown.length && (
            <li className="px-3 py-8 text-center text-xs text-[var(--muted-foreground)]">
              {t("Nobody matches these filters")}
            </li>
          )}
        </ul>

        <p className="border-t border-[rgb(0_0_0/0.06)] px-2.5 py-1.5 text-[10px] text-[var(--muted-foreground)]">
          {shown.length} {t("operators")}
        </p>
      </div>
    </>
  )
}

function Pill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-[18px] items-center gap-1 rounded-full px-2 text-[10px] font-semibold",
        "transition-colors duration-150",
        active
          ? "bg-[rgb(23_28_143/0.15)] text-[var(--primary)]"
          : "text-[var(--muted-foreground)] hover:bg-[rgb(23_28_143/0.06)] dark:hover:bg-white/10",
      )}
    >
      {children}
    </button>
  )
}

const Count = ({ children }) => <span className="ltr-value opacity-60">{children}</span>

function Tag({ tone = "var(--primary)", children }) {
  return (
    <span
      className="shrink-0 rounded px-1 py-px text-[9px] font-semibold"
      style={{
        color: tone,
        backgroundColor: `color-mix(in oklab, ${tone} 12%, transparent)`,
      }}
    >
      {children}
    </span>
  )
}

function Avatar({ name, tint, size = 32 }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-bold text-white"
      style={{
        width: size,
        height: size,
        backgroundColor: tint ?? "var(--tone-info)",
        fontSize: size <= 20 ? 9 : 10,
      }}
    >
      {initials(name)}
    </span>
  )
}
