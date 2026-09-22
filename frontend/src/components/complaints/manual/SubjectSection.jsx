import { Car } from "lucide-react"
import { Field, FormSection, Lookup, SelectField } from "@/components/ui/Form"
import { MODES } from "@/data/catalog"
import { useT } from "@/i18n"

export function SubjectSection({ draft, set }) {
  const t = useT()
  return (
    <FormSection
      icon={Car}
      tone="#9b59b6"
      title={t("Subject of the complaint")}
      hint={t("The vehicle and driver the allegation is against.")}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={t("Side number or plate")}
          required
          hint={t("Usually all the complainant recorded.")}
        >
          <Lookup
            placeholder={t("Enter side number or plate")}
            value={draft.vehicleRef}
            onChange={(e) => set("vehicleRef", e.target.value)}
          />
        </Field>

        <Field
          label={t("Permit, staff ID or licence")}
          optional
          hint={t("Resolved from the vehicle and trip if left blank.")}
        >
          <Lookup
            placeholder={t("Enter permit, staff ID or licence")}
            value={draft.driverRef}
            onChange={(e) => set("driverRef", e.target.value)}
          />
        </Field>

        <Field label={t("Transport mode")} optional>
          <SelectField
            placeholder={t("Select mode")}
            options={MODES}
            value={draft.mode}
            onChange={(e) => set("mode", e.target.value)}
          />
        </Field>
      </div>
    </FormSection>
  )
}
