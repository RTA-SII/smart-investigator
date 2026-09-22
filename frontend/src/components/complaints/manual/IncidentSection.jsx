import { MapPin } from "lucide-react"
import { Field, FormSection, Input, SelectField } from "@/components/ui/Form"
import { LOCATIONS } from "@/data/catalog"
import { NowButton } from "./NowButton"
import { nowLocal } from "@/lib/manualComplaint"
import { useT } from "@/i18n"

export function IncidentSection({ draft, set }) {
  const t = useT()
  return (
    <FormSection
      icon={MapPin}
      tone="var(--tone-low)"
      title={t("Incident")}
      hint={t("When and where the incident itself happened.")}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={t("Incident time")}
          required
          action={<NowButton onClick={() => set("incidentAt", nowLocal())} />}
          hint={t("May be well before the complaint was received.")}
        >
          <Input
            type="datetime-local"
            value={draft.incidentAt}
            onChange={(e) => set("incidentAt", e.target.value)}
          />
        </Field>

        <Field label={t("Location")} required>
          <SelectField
            placeholder={t("Select location")}
            options={LOCATIONS}
            value={draft.location}
            onChange={(e) => set("location", e.target.value)}
          />
        </Field>

        <Field
          label={t("Trip reference")}
          optional
          hint={t("If known, this is the strongest key the cross-validation engine has.")}
        >
          <Input
            placeholder={t("e.g. TRP-2522509")}
            value={draft.tripRef}
            onChange={(e) => set("tripRef", e.target.value)}
          />
        </Field>

        {draft.category === "Fare" && (
          <Field label={t("Fare paid (AED)")} optional hint={t("As stated by the complainant.")}>
            <Input
              type="number"
              min="0"
              placeholder={t("0.00")}
              value={draft.farePaid}
              onChange={(e) => set("farePaid", e.target.value)}
            />
          </Field>
        )}
      </div>
    </FormSection>
  )
}
