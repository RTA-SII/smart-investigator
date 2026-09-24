import { useCallback, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useT } from "@/i18n";
import { cn } from "@/lib/cn";
import { useDismiss } from "@/lib/useDismiss";

/**
 * Date and time on one control — a month grid rather than the browser's own
 * `datetime-local` widget.
 *
 * The native one renders differently in every browser and nothing like the
 * rest of the portal, which matters on a form an officer fills in front of a
 * complainant. This is the calendar SMC shows: weeks starting Sunday, the
 * neighbouring month's days dimmed rather than blank, today ringed and the
 * chosen day filled.
 *
 * `value` stays in `datetime-local` shape — `YYYY-MM-DDTHH:mm` — so nothing
 * downstream has to know the picker changed.
 */
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const pad = (n) => String(n).padStart(2, "0");
const iso = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const sameDay = (a, b) => a && b && iso(a) === iso(b);

/** Split a value into its two halves, tolerating an empty field. */
function parse(value) {
  const [date = "", time = ""] = String(value ?? "").split("T");
  const parsed = date ? new Date(`${date}T00:00:00`) : null;
  return {
    date: parsed && !isNaN(parsed) ? parsed : null,
    time: time.slice(0, 5),
  };
}

/** The 42 cells of a month grid: the month, padded out on both sides. */
function grid(month) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(first);
  start.setDate(1 - first.getDay());

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function DateTimeField({ value, onChange, placeholder, className }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const { date, time } = parse(value);
  const [month, setMonth] = useState(() => date ?? new Date());

  const close = useCallback(() => setOpen(false), []);
  useDismiss(root, open, close);

  const today = new Date();
  const days = grid(month);

  const pick = (day) => {
    // Keep the time already set; a date chosen on its own defaults to 09:00
    // rather than midnight, which is never when a complaint was taken.
    onChange(`${iso(day)}T${time || "09:00"}`);
    setOpen(false);
  };

  const setTime = (next) =>
    onChange(`${date ? iso(date) : iso(today)}T${next}`);

  const shift = (by) =>
    setMonth(new Date(month.getFullYear(), month.getMonth() + by, 1));

  return (
    <span ref={root} className={cn("relative block", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg border border-[var(--input)]",
          "bg-[rgb(238_238_238/0.4)] px-2.5 text-sm transition-colors outline-none",
          "dark:bg-[rgb(255_255_255/0.04)]",
          open && "border-[var(--ring)] ring-1 ring-[var(--ring)]",
          date ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]",
        )}
      >
        <CalendarDays className="size-4 shrink-0 text-[var(--muted-foreground)]" />
        <span className="ltr-value min-w-0 flex-1 truncate text-start">
          {date
            ? `${date.getDate()} ${t(MONTHS[date.getMonth()])} ${date.getFullYear()}, ${time || "09:00"}`
            : (placeholder ?? t("Select date and time"))}
        </span>
      </button>

      {open && (
        <div
          dir="ltr"
          className="absolute start-0 top-[calc(100%+6px)] z-40 w-[272px] overflow-hidden rounded-[11.2px] border-[1px] border-[rgb(0_0_0/0.1)] bg-[var(--popover)] shadow-[0_18px_44px_rgb(0_0_0/0.18)]"
        >
          <div className="flex items-center gap-1 px-2 py-2">
            <Arrow label={t("Previous month")} onClick={() => shift(-1)}>
              <ChevronLeft className="size-4" />
            </Arrow>
            <span className="flex-1 text-center text-[13px] font-semibold">
              {t(MONTHS[month.getMonth()])} {month.getFullYear()}
            </span>
            <Arrow label={t("Next month")} onClick={() => shift(1)}>
              <ChevronRight className="size-4" />
            </Arrow>
          </div>

          <div className="grid grid-cols-7 px-2">
            {WEEKDAYS.map((d) => (
              <span
                key={d}
                className="grid h-7 place-items-center text-[11px] font-semibold text-[var(--muted-foreground)]"
              >
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-0.5 px-2 pb-2">
            {days.map((d) => {
              const outside = d.getMonth() !== month.getMonth();
              const on = sameDay(d, date);
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  onClick={() => pick(d)}
                  className={cn(
                    "mx-auto grid size-8 place-items-center rounded-lg text-[13px]",
                    "transition-colors duration-150",
                    on
                      ? "bg-[var(--primary)] font-semibold text-white"
                      : "hover:bg-[rgb(23_28_143/0.08)] dark:hover:bg-white/10",
                    !on &&
                      outside &&
                      "text-[var(--muted-foreground)] opacity-55",
                    !on &&
                      sameDay(d, today) &&
                      "font-bold text-[var(--primary)]",
                  )}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          <TimeRow value={time || "09:00"} onChange={setTime} />
        </div>
      )}
    </span>
  );
}

/**
 * Hours and minutes as two scrolling columns.
 *
 * `<input type="time">` opens the browser's own clock popover, which is a
 * different shape and a different set of colours from everything around it —
 * the one thing this picker exists to avoid. These are the same rows as the
 * calendar above them, in the same colours.
 */
function TimeRow({ value, onChange }) {
  const t = useT()
  const [hh, mm] = value.split(":")

  return (
    <div className="border-t border-[rgb(0_0_0/0.06)] px-3 py-2.5">
      <p className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold tracking-[0.5px] text-[var(--muted-foreground)] uppercase">
        <Clock className="size-3.5 shrink-0" />
        {t("Time")}
        <span className="ltr-value ms-auto font-mono text-[13px] font-bold normal-case tracking-normal text-[var(--foreground)]">
          {value}
        </span>
      </p>

      <div className="flex gap-2">
        <Wheel
          label={t("Hour")}
          count={24}
          value={hh}
          onChange={(v) => onChange(`${v}:${mm}`)}
        />
        <Wheel
          label={t("Minute")}
          count={60}
          value={mm}
          onChange={(v) => onChange(`${hh}:${v}`)}
        />
      </div>
    </div>
  )
}

/** One column, scrolled so the chosen value is in view when it opens. */
function Wheel({ label, count, value, onChange }) {
  const scroll = (el) => {
    // A ref callback rather than an effect: the list only mounts when the
    // popover opens, which is exactly when it needs positioning.
    el?.querySelector('[data-on="true"]')?.scrollIntoView({ block: "center" })
  }

  return (
    <ul
      ref={scroll}
      aria-label={label}
      className="max-h-[108px] flex-1 overflow-y-auto rounded-lg border border-[var(--input)] p-1"
    >
      {Array.from({ length: count }, (_, i) => {
        const v = String(i).padStart(2, "0")
        const on = v === value
        return (
          <li key={v}>
            <button
              type="button"
              data-on={on}
              onClick={() => onChange(v)}
              className={cn(
                "ltr-value flex h-7 w-full items-center justify-center rounded-[6.4px] font-mono text-[13px]",
                "transition-colors duration-150",
                on
                  ? "bg-[var(--primary)] font-semibold text-white"
                  : "hover:bg-[rgb(23_28_143/0.06)] dark:hover:bg-white/10",
              )}
            >
              {v}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function Arrow({ label, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-7 shrink-0 place-items-center rounded-lg text-[var(--muted-foreground)] transition-colors duration-150 hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
    >
      {children}
    </button>
  );
}
