import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  CircleCheck,
  Clock,
  Inbox,
  ShieldAlert,
  SlidersHorizontal,
  TriangleAlert,
  Undo2,
} from "lucide-react"
import { Card } from "@/components/ui/Card"
import { Meter } from "@/components/ui/Meter"
import { InfoTip } from "@/components/ui/InfoTip"
import { useComplaints } from "@/app/complaintStore"
import { initials } from "@/lib/format"
import { caseloadFor, caseloadStats, pct } from "@/lib/kpis"
import { useT } from "@/i18n"
import { cn } from "@/lib/cn"

/**
 * The productivity strip — SMC's "My Productivity".
 *
 * An officer sees their own caseload. A supervisor sees the team's, because
 * they hold no complaints themselves: they rule on what comes up and answer
 * for what the officers are carrying.
 *
 * The four stage tiles are a partition of the first one — closed, returned,
 * escalated and unactioned add up to the total beside them, every time. They
 * did not before: escalations counted every complaint that had *ever* gone
 * up, so anything escalated and later closed was in two tiles at once and
 * the row came to more than the total.
 */
export function MyProductivity({ role }) {
  const complaints = useComplaints()
  const navigate = useNavigate()
  const t = useT()

  const team = role.id === "supervisor"
  const rows = useMemo(() => caseloadFor(complaints, role), [complaints, role])
  const k = useMemo(() => caseloadStats(rows), [rows])

  const tiles = [
    {
      label: team ? "Team Caseload" : "Total Assigned",
      value: k.total,
      caption: `${k.inProgress} ${t("still active")}`,
      meter: 100,
      tone: "var(--tone-info)",
      icon: Inbox,
      hint: team
        ? t("Every complaint carrying an officer's name, open or closed.")
        : t("Every complaint that has carried your name, open or closed."),
    },
    {
      label: "Closed",
      value: k.closed,
      caption: team ? t("Ruled on by the team") : t("Ruled on by you"),
      meter: pct(k.closed, k.total),
      tone: "var(--tone-low)",
      icon: CircleCheck,
      hint: t("Complaints ruled on and filed."),
    },
    {
      label: "Returned",
      value: k.returned,
      caption: t("Sent back for missing detail"),
      meter: pct(k.returned, k.total),
      tone: "var(--tone-medium)",
      icon: Undo2,
      hint: t("Returned to Customer Happiness because an essential detail was missing."),
    },
    {
      label: "Avg Handling",
      value: k.avgHandling == null ? "—" : `${k.avgHandling}m`,
      caption: t("Target 5m"),
      meter: k.avgHandling == null ? 0 : Math.min(100, (k.avgHandling / 5) * 100),
      tone: "var(--tone-high)",
      icon: Clock,
      hint: t("Measured from the moment a complaint was picked up to the moment it was ruled on."),
    },
    {
      // Counts what is sitting at Escalated now, not what ever went up: this
      // tile is a slice of the total above it, and has to behave like one.
      label: team ? "Awaiting Ruling" : "Escalations",
      value: k.escalated,
      caption: team ? t("Referred up to you") : t("With a supervisor"),
      meter: pct(k.escalated, k.total),
      tone: "#9B59B6",
      icon: ShieldAlert,
      hint: team
        ? t("Referrals waiting on a supervisor ruling right now.")
        : t("Complaints of yours sitting with a supervisor right now."),
      to: k.escalated ? "/complaints" : null,
    },
    {
      label: "Unactioned",
      value: k.inProgress,
      caption: team ? t("Still with an officer") : t("Still waiting on you"),
      meter: pct(k.inProgress, k.total),
      tone: "var(--tone-critical)",
      icon: TriangleAlert,
      hint: t("Open complaints with a clock running on them."),
      // The point of this tile is to be acted on. One outstanding complaint
      // opens straight onto it; more than one goes to the list holding them.
      to:
        k.inProgress === 1
          ? `/complaints/${k.inProgressIds[0]}`
          : k.inProgress
            ? team
              ? "/complaints"
              : "/my-queue"
            : null,
    },
  ]

  return (
    <Card className="mb-5 p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--tone-low)] text-sm font-bold text-white">
          {initials(role.staff.name)}
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-base font-bold">
            {t(team ? "Team Productivity" : "My Productivity")}
            <InfoTip
              label={t(
                team
                  ? "The team's caseload, not the centre's intake. The four stage figures add up to the caseload."
                  : "Your own numbers, not the centre's. They move as you work.",
              )}
            />
          </p>
          <p className="ltr-value truncate text-[11px] text-[var(--muted-foreground)]">
            {role.staff.name} · {role.staff.code}
          </p>
        </div>
        <span className="ms-auto grid size-8 shrink-0 place-items-center rounded-lg text-[var(--muted-foreground)]">
          <SlidersHorizontal className="size-4" />
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {tiles.map((tile) => (
          <Tile
            key={tile.label}
            {...tile}
            label={t(tile.label)}
            onOpen={tile.to ? () => navigate(tile.to) : null}
          />
        ))}
      </div>
    </Card>
  )
}

function Tile({ label, value, caption, meter, tone, icon: Icon, hint, onOpen }) {
  return (
    <Card
      glint
      surface="dash-tile"
      className={cn(
        "px-3 py-2.5",
        onOpen &&
          "cursor-pointer transition-all duration-150 hover:ring-2 hover:ring-[var(--primary)]",
      )}
      {...(onOpen && {
        role: "button",
        tabIndex: 0,
        onClick: onOpen,
        onKeyDown: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onOpen()
          }
        },
      })}
    >
      <div className="relative flex items-start justify-between gap-1.5">
        <p className="min-w-0 truncate text-[10px] font-semibold tracking-[0.5px] text-[var(--muted-foreground)] uppercase">
          {label}
        </p>
        <span className="flex shrink-0 items-center gap-1">
          {hint && <InfoTip label={hint} />}
          <Icon className="size-3.5 shrink-0" style={{ color: tone }} />
        </span>
      </div>
      <p className="relative mt-1.5 text-lg leading-tight font-bold">{value}</p>
      <p className="relative mt-0.5 truncate text-[9px] text-[var(--muted-foreground)]">
        {caption}
      </p>
      <Meter className="relative mt-2" value={meter} tone={tone} />
    </Card>
  )
}
