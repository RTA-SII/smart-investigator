import { User } from "lucide-react"
import { Choice, Field, FormSection, Input, Toggle } from "@/components/ui/Form"
import { useT } from "@/i18n"

const LANGUAGES = [
  { value: "Arabic", label: "العربية" },
  { value: "English", label: "English" },
]

export function ComplainantSection({ draft, set }) {
  const t = useT()
  return (
    <FormSection
      icon={User}
      tone="var(--tone-high)"
      title={t("Complainant")}
      hint={t("Who is making the complaint, and how to reach them.")}
    >
      <Toggle
        checked={draft.anonymous}
        onChange={(v) => set("anonymous", v)}
        label={t("Anonymous complaint")}
        hint={t("The complainant declined to identify themselves. RTA still accepts and investigates the case.")}
      />

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label={t("Full name")} required={!draft.anonymous}>
          <Input
            disabled={draft.anonymous}
            placeholder={draft.anonymous ? t("Withheld") : t("As given by the complainant")}
            value={draft.complainantName}
            onChange={(e) => set("complainantName", e.target.value)}
            className="disabled:opacity-50"
          />
        </Field>

        <Field
          label={t("Contact number")}
          required={!draft.anonymous}
          hint={t("Stored masked; only the last four digits are shown in the queue.")}
        >
          <Input
            disabled={draft.anonymous}
            placeholder={t("+971 5• ••• ••••")}
            value={draft.complainantPhone}
            onChange={(e) => set("complainantPhone", e.target.value)}
            className="disabled:opacity-50"
          />
        </Field>

        <Field label={t("Preferred language")} hint={t("Used for any callback.")}>
          <Choice
            options={LANGUAGES}
            value={draft.language}
            onChange={(v) => set("language", v)}
          />
        </Field>

        <div className="flex items-end pb-1">
          <Toggle
            checked={draft.consent && !draft.anonymous}
            onChange={(v) => set("consent", v)}
            label={t("Consents to be contacted")}
            hint={t("Required before an officer may call back about the outcome.")}
          />
        </div>
      </div>
    </FormSection>
  )
}
