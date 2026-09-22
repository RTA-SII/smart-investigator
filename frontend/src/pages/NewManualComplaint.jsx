import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, CirclePlus, Save } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { DraftRail } from "@/components/complaints/manual/DraftRail"
import { IntakeSection } from "@/components/complaints/manual/IntakeSection"
import { ComplainantSection } from "@/components/complaints/manual/ComplainantSection"
import { IncidentSection } from "@/components/complaints/manual/IncidentSection"
import { SubjectSection } from "@/components/complaints/manual/SubjectSection"
import { AllegationSection } from "@/components/complaints/manual/AllegationSection"
import { HandlingSection } from "@/components/complaints/manual/HandlingSection"
import { roleById } from "@/data/personas"
import { useSession } from "@/app/session"
import { canSubmit, EMPTY_DRAFT, nowLocal } from "@/lib/manualComplaint"
import { fileComplaint } from "@/app/complaintStore"
import { toComplaint } from "@/data/fromDraft"
import { useT } from "@/i18n"

/** Log a complaint that did not come through CRM. */
export function NewManualComplaint() {
  const navigate = useNavigate()
  const session = useSession()
  const officer = roleById(session.roleId)
  const t = useT()

  const [draft, setDraft] = useState(() => ({
    ...EMPTY_DRAFT,
    receivedAt: nowLocal(),
  }))
  const [filed, setFiled] = useState(null)

  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }))
  const ready = canSubmit(draft)

  if (filed) {
    return (
      <Card className="mx-auto max-w-lg p-10 text-center">
        <p className="ltr-value font-mono text-lg font-bold text-[var(--primary)]">{filed}</p>
        <p className="mt-2 text-sm">{t("Complaint filed and queued for cross-validation.")}</p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {t("It is now in All Complaints as New, against a five-minute target.")}
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={() => navigate("/manual-complaints")}>
            {t("Back to Manual Complaints")}
          </Button>
          <Button variant="primary" onClick={() => navigate(`/complaints/${filed}`)}>
            {t("Open the queue")}
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label={t("Back")}
            className="grid size-8 shrink-0 place-items-center rounded-lg transition-colors duration-150 hover:bg-white/40 dark:hover:bg-white/10"
          >
            <ChevronLeft className="size-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold">{t("Create Manual Complaint")}</h1>
            <p className="truncate text-sm text-[var(--muted-foreground)]">
              {t("Log a complaint taken directly at the centre, not received from CRM")}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="ghost" onClick={() => navigate("/manual-complaints")}>
            {t("Cancel")}
          </Button>
          <Button>
            <Save />
            {t("Save draft")}
          </Button>
          <Button
            variant="primary"
            disabled={!ready}
            onClick={() => setFiled(fileComplaint(toComplaint(draft, officer)))}
          >
            <CirclePlus />
            {t("File Complaint")}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid min-w-0 gap-4">
          <IntakeSection draft={draft} set={set} officer={officer} />
          <ComplainantSection draft={draft} set={set} />
          <IncidentSection draft={draft} set={set} />
          <SubjectSection draft={draft} set={set} />
          <AllegationSection draft={draft} set={set} />
          <HandlingSection draft={draft} set={set} />
        </div>

        <DraftRail draft={draft} />
      </div>
    </>
  )
}
