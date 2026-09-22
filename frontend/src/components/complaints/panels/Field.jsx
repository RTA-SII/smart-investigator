/** Icon, label, right-aligned value — the row shape both party cards use. */
export function Field({ icon: Icon, label, value, mono }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="size-4 shrink-0 text-[var(--muted-foreground)]" />
      <dt className="shrink-0 text-sm text-[var(--muted-foreground)]">{label}</dt>
      <dd className={`ml-auto min-w-0 truncate text-sm font-semibold ${mono ? "font-mono" : ""}`}>
        {value}
      </dd>
    </div>
  )
}
