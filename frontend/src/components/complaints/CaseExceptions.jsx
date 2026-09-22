import { CircleAlert, FileWarning, ShieldOff, Undo2 } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { applyRecordingException, releaseVehicle } from "@/app/complaintStore"
import { useT } from "@/i18n"

/**
 * The two states in which a case cannot simply be worked to a finding.
 *
 * Both come from the Investigation Office workflow deck: the completeness
 * gate (slide 2) stops work before it starts, and a missing recording
 * (slide 4) triggers a compliance action of its own before the investigation
 * can continue face to face.
 */
export function CaseExceptions({ complaint, role }) {
  const t = useT()
  const by = `${role.staff.name} · ${role.staff.code}`

  return (
    <>
      {complaint.incomplete && (
        <Banner
          tone="var(--tone-high)"
          icon={FileWarning}
          title={t("Essential information missing")}
          body={t(
            "This case cannot be investigated until Customer Happiness supplies the missing detail — a date, a time, a side or plate number, and a description are all required. Returning it needs supervisor approval.",
          )}
        />
      )}

      {!complaint.recordingAvailable && !complaint.exception && (
        <Banner
          tone="var(--tone-critical)"
          icon={ShieldOff}
          title={t("Required vehicle recording is unavailable")}
          body={t(
            "Lynx holds no footage for this vehicle. Raising the exception suspends the vehicle, blocks the driver permit, and issues a fine to the operating company, which is notified by email. The investigation then continues face to face.",
          )}
          action={
            <Button
              variant="destructive"
              size="md"
              onClick={() => applyRecordingException(complaint.id, by)}
            >
              <CircleAlert />
              {t("Raise recording exception")}
            </Button>
          }
        />
      )}

      {complaint.exception && (
        <Banner
          tone={
            complaint.exception.released
              ? "var(--tone-low)"
              : "var(--tone-critical)"
          }
          icon={complaint.exception.released ? Undo2 : ShieldOff}
          title={
            complaint.exception.released
              ? t("Vehicle suspension released")
              : t("Vehicle suspended — recording exception raised")
          }
          body={
            complaint.exception.released
              ? t("The recording issue was resolved and the vehicle and permit are back in service.")
              : t("Vehicle suspended, driver permit blocked, and a company fine issued and notified by email. Release the suspension once the recording issue is resolved.")
          }
          action={
            !complaint.exception.released && (
              <Button
                size="md"
                onClick={() => releaseVehicle(complaint.id, by)}
              >
                <Undo2 />
                {t("Release after resolution")}
              </Button>
            )
          }
        />
      )}
    </>
  )
}

function Banner({ tone, icon: Icon, title, body, action }) {
  return (
    <Card
      className="mb-4 p-4"
      style={{
        background: `color-mix(in oklab, ${tone} 8%, transparent)`,
        border: `1px solid color-mix(in oklab, ${tone} 30%, transparent)`,
      }}
    >
      <div className="flex flex-wrap items-start gap-3">
        <span
          className="grid size-8 shrink-0 place-items-center rounded-lg"
          style={{
            color: tone,
            backgroundColor: `color-mix(in oklab, ${tone} 15%, transparent)`,
          }}
        >
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold" style={{ color: tone }}>
            {title}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
            {body}
          </p>
        </div>
        {action && <span className="shrink-0">{action}</span>}
      </div>
    </Card>
  )
}
