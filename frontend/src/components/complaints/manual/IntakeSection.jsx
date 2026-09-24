import { Inbox } from "lucide-react"
import { Field, FormSection, Input, SelectField } from "@/components/ui/Form"
import { DateTimeField } from "@/components/ui/DateTimeField"
import { CHANNELS } from "@/data/catalog"
import { NowButton } from "./NowButton"
import { nowLocal } from "@/lib/manualComplaint"
import { useT } from "@/i18n"

export function IntakeSection({ draft, set, officer }) {
  const t = useT()
  return (
    <FormSection
      icon={Inbox}
      tone="var(--tone-info)"
      title={t("Intake")}
      hint={t("How and when the complaint reached the centre.")}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={t("Received at")}
          required
          action={<NowButton onClick={() => set("receivedAt", nowLocal())} />}
          hint={t("Starts the five-minute handling clock.")}
        >
          <DateTimeField
            value={draft.receivedAt}
            onChange={(v) => set("receivedAt", v)}
          />
        </Field>

        <Field label={t("Channel")} required hint={t("Where the complainant reached us.")}>
          <SelectField
            placeholder={t("Select channel")}
            options={CHANNELS}
            value={draft.channel}
            onChange={(v) => set("channel", v)}
          />
        </Field>

        <Field
          label={t("External reference")}
          optional
          hint={t("Case number from Dubai Police, 999 or a happiness centre, if referred.")}
          className="sm:col-span-2"
        >
          <Input
            placeholder={t("e.g. DP-2026-004182")}
            value={draft.externalRef}
            onChange={(e) => set("externalRef", e.target.value)}
          />
        </Field>
      </div>

      <p className="mt-4 rounded-lg bg-[rgb(0_0_0/0.03)] px-3 py-2 text-[11px] text-[var(--muted-foreground)] dark:bg-[rgb(255_255_255/0.04)]">
        {t("Logged by")} <span className="font-semibold">{officer.staff.name}</span> ·{" "}
        <span className="ltr-value">{officer.staff.code}</span>
      </p>
    </FormSection>
  )
}
