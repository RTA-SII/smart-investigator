import { ClipboardList, Paperclip } from "lucide-react"
import { Field, FormSection, SelectField } from "@/components/ui/Form"
import { officerLoads } from "@/data/personas"
import { useComplaints } from "@/app/complaintStore"
import { useT } from "@/i18n"

export function HandlingSection({ draft, set }) {
  const t = useT()
  const officers = officerLoads(useComplaints())
  return (
    <FormSection
      icon={ClipboardList}
      tone="var(--primary)"
      title={t("Handling")}
      hint={t("Who picks it up, and what came in with it.")}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={t("Assign to")}
          optional
          hint={t("Leave unassigned to let routing pick the next free officer.")}
        >
          <SelectField
            placeholder={t("Unassigned")}
            options={officers.map((o) => `${o.name} · ${o.load} open`)}
            value={draft.assignee}
            onChange={(e) => set("assignee", e.target.value)}
          />
        </Field>
      </div>

      <Field
        label={t("Attachments")}
        className="mt-4"
        hint={t("Call recording, photos or documents the complainant provided. JPEG, PNG, PDF, MP3 or MP4.")}
      >
        <button
          type="button"
          onClick={() =>
            set("attachments", [
              ...draft.attachments,
              `evidence-${draft.attachments.length + 1}`,
            ])
          }
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--border)] bg-[rgb(238_238_238/0.4)] py-5 text-sm text-[var(--muted-foreground)] transition-colors duration-150 hover:bg-white/50 hover:text-[var(--foreground)] dark:bg-[rgb(255_255_255/0.04)] dark:hover:bg-white/10"
        >
          <Paperclip className="size-4" />
          {t("Add files")}
        </button>
      </Field>
      <p className="mt-1.5 text-[11px] text-[var(--muted-foreground)]">
        {draft.attachments.length
          ? `${draft.attachments.length} ${t("attached")}`
          : t("No files attached yet.")}
      </p>
    </FormSection>
  )
}
