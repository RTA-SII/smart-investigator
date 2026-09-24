import { useCallback, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { useT } from "@/i18n";
import { cn } from "@/lib/cn";
import { useDismiss } from "@/lib/useDismiss";

/**
 * The form's dropdown — SMC's popover list on a form-shaped trigger.
 *
 * A native `<select>` hands the option list to the operating system, so the
 * form's menus looked nothing like the ones on the filter bar two screens
 * away. This is the same popover the filters use — 11.2px radius on a black/10
 * hairline, rows at 6.4px, a primary wash on the chosen one — sitting under a
 * trigger that matches the inputs beside it rather than a filter chip.
 *
 * Single-select, unlike `FilterSelect`: a form field holds one value.
 *
 * `options` take either shape:
 *   "Taxi"
 *   { value: "Deira", label: "Deira", hint: "Northern Dubai" }
 */
const trigger =
  "flex h-9 w-full items-center gap-2 rounded-lg border border-[var(--input)] " +
  "bg-[rgb(238_238_238/0.4)] px-2.5 text-sm transition-colors outline-none " +
  "dark:bg-[rgb(255_255_255/0.04)]";

const normalise = (o) => (typeof o === "string" ? { value: o, label: o } : o);

export function SelectMenu({
  value,
  onChange,
  options,
  placeholder,
  searchable = false,
  searchPlaceholder,
  icon: Icon,
  disabled = false,
  className,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const root = useRef(null);
  const t = useT();

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);
  useDismiss(root, open, close);

  const items = options.map(normalise);
  const chosen = items.find((o) => o.value === value);

  const needle = query.trim().toLowerCase();
  const shown = needle
    ? items.filter((o) =>
        `${t(o.label)} ${o.hint ?? ""}`.toLowerCase().includes(needle),
      )
    : items;

  return (
    <span ref={root} className={cn("relative block", className)}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
        className={cn(
          trigger,
          "cursor-pointer disabled:cursor-not-allowed disabled:opacity-60",
          open && "border-[var(--ring)] ring-1 ring-[var(--ring)]",
          chosen
            ? "text-[var(--foreground)]"
            : "text-[var(--muted-foreground)]",
        )}
      >
        {Icon && (
          <Icon className="size-4 shrink-0 text-[var(--muted-foreground)]" />
        )}
        <span className="min-w-0 flex-1 truncate text-start">
          {chosen ? t(chosen.label) : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 opacity-70 transition-transform duration-150",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute start-0 end-0 top-[calc(100%+6px)] z-40 overflow-hidden rounded-[11.2px] border-[1px] border-[rgb(0_0_0/0.1)] bg-[var(--popover)] shadow-[0_18px_44px_rgb(0_0_0/0.18)]"
        >
          {searchable && (
            <div className="relative border-b border-[rgb(0_0_0/0.06)] p-2">
              <Search className="pointer-events-none absolute start-4 top-1/2 size-3.5 -translate-y-1/2 text-[var(--muted-foreground)]" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder ?? t("Search")}
                className="h-8 w-full rounded-lg border border-[var(--input)] bg-transparent ps-7 pe-2 text-xs outline-none placeholder:text-[var(--muted-foreground)] focus-visible:border-[var(--ring)]"
              />
            </div>
          )}

          <ul className="max-h-[240px] overflow-y-auto p-1.5">
            {shown.map((o) => {
              const on = o.value === value;
              return (
                <li key={o.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={on}
                    onClick={() => {
                      onChange(o.value);
                      close();
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-[6.4px] px-2 py-1.5 text-start",
                      "transition-colors duration-150",
                      on
                        ? "bg-[rgb(23_28_143/0.1)] text-[var(--primary)]"
                        : "hover:bg-[rgb(23_28_143/0.06)] dark:hover:bg-white/10",
                    )}
                  >
                    {Icon && (
                      <Icon
                        className={cn(
                          "size-4 shrink-0",
                          !on && "text-[var(--muted-foreground)]",
                        )}
                      />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px]">
                        {t(o.label)}
                      </span>
                      {o.hint && (
                        <span className="block truncate text-[11px] text-[var(--muted-foreground)]">
                          {t(o.hint)}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}

            {!shown.length && (
              <li className="px-2 py-5 text-center text-[11px] text-[var(--muted-foreground)]">
                {t("No matches")}
              </li>
            )}
          </ul>
        </div>
      )}
    </span>
  );
}
