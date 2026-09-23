import { FileWarning } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { useT } from "@/i18n"

/**
 * The completeness gate (workflow deck, slide 2).
 *
 * A case missing an essential detail cannot be investigated at all, so this
 * says why before the tabs — and the decision bar reduces to the single
 * route back to Customer Happiness.
 */
export function CaseExceptions({ complaint }) {
  const t = useT()

  if (!complaint.incomplete) return null

  return (
    <Card
      className="mb-4 p-4"
      style={{
        background: "color-mix(in oklab, var(--tone-high) 8%, transparent)",
        border: "1px solid color-mix(in oklab, var(--tone-high) 30%, transparent)",
      }}
    >
      <div className="flex flex-wrap items-start gap-3">
        <span
          className="grid size-8 shrink-0 place-items-center rounded-lg"
          style={{
            color: "var(--tone-high)",
            backgroundColor: "color-mix(in oklab, var(--tone-high) 15%, transparent)",
          }}
        >
          <FileWarning className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold" style={{ color: "var(--tone-high)" }}>
            {t("Essential information missing")}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
            {t(
              "This case cannot be investigated until Customer Happiness supplies the missing detail — a date, a time, a side or plate number, and a description are all required. Returning it needs supervisor approval.",
            )}
          </p>
        </div>
      </div>
    </Card>
  )
}
