import { AlertTriangle } from "lucide-react"
import { Choice, Field, FormSection, SelectField, Textarea } from "@/components/ui/Form"
import { CATEGORIES } from "@/data/catalog"
import { useT } from "@/i18n"

const PRIORITIES = [
  { value: "Critical", label: "Critical", tone: "var(--tone-critical)" },
  { value: "High", label: "High", tone: "var(--tone-high)" },
  { value: "Medium", label: "Medium", tone: "var(--tone-medium)" },
  { value: "Low", label: "Low", tone: "var(--tone-low)" },
]

export function AllegationSection({ draft, set }) {
  const t = useT()
  const types = draft.category ? CATEGORIES[draft.category] : []

  return (
    <FormSection
      icon={AlertTriangle}
      tone="var(--destructive)"
      title={t("Allegation")}
      hint={t("What is being alleged, and how serious it is.")}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("Category")} required>
          <SelectField
            placeholder={t("Select category")}
            options={Object.keys(CATEGORIES)}
            value={draft.category}
            onChange={(v) => {
              set("category", v)
              set("type", "")
            }}
          />
        </Field>

        <Field label={t("Complaint type")} required>
          <SelectField
            placeholder={draft.category ? t("Select type") : t("Select a category first")}
            options={types}
            value={draft.type}
            disabled={!draft.category}
            onChange={(v) => set("type", v)}
          />
        </Field>

        <Field
          label={t("Priority")}
          required
          className="sm:col-span-2"
          hint={t("Critical routes straight to a supervisor.")}
        >
          <Choice
            options={PRIORITIES}
            value={draft.priority}
            onChange={(v) => set("priority", v)}
          />
        </Field>

        <Field
          label={t("Complainant statement")}
          required
          className="sm:col-span-2"
          hint={t("Record the account in the complainant's own words — this is the evidence the investigation weighs.")}
        >
          <Textarea
            placeholder={t("What did the complainant say happened?")}
            value={draft.statement}
            onChange={(e) => set("statement", e.target.value)}
          />
        </Field>
      </div>
    </FormSection>
  )
}
