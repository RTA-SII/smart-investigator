import { useEffect, useState } from "react"
import { Bot, Loader2 } from "lucide-react"
import { Card, CardTitle } from "@/components/ui/Card"
import { InfoTip } from "@/components/ui/InfoTip"
import { VERDICT_TONE } from "@/data/catalog"
import { CrossValidationReport } from "./CrossValidationReport"
import { verifyAi } from "@/app/complaintStore"
import { useT } from "@/i18n"

const TONE = {
  critical: "var(--tone-critical)",
  high: "var(--tone-high)",
  low: "var(--tone-low)",
}

/** How long the engine appears to think, so the act reads as work. */
const RUN_MS = 1400

/**
 * The cross-validation panel, on the complaint's own page — not behind a tab,
 * because SMC keeps it inline under the details and evidence.
 *
 * The verdict is **not** shown until the officer asks for it. SMC gates its
 * panel behind a Verify button, and that is the point of the exercise: the
 * officer decides to run the engine and then weighs what it says, rather than
 * being handed a conclusion before they have looked at anything.
 */
export function AiCrossValidation({ complaint }) {
  const { ai } = complaint
  const [running, setRunning] = useState(false)
  const t = useT()
  const tone = TONE[VERDICT_TONE[ai.verdict]] ?? TONE.high

  useEffect(() => {
    if (!running) return
    const done = setTimeout(() => {
      verifyAi(complaint.id)
      setRunning(false)
    }, RUN_MS)
    return () => clearTimeout(done)
  }, [running, complaint.id])

  const header = (
    <div className="flex items-center gap-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[rgb(245_158_11/0.15)] text-[#b45309]">
        <Bot className="size-4" />
      </span>
      <CardTitle className="text-base">{t("AI Cross-Validation")}</CardTitle>
      <InfoTip label={t("How the engine ruled after weighing eight telematics and camera signals against the complaint.")} />
      {!complaint.aiVerified && (
        <button
          type="button"
          disabled={running}
          onClick={() => setRunning(true)}
          className="ms-auto inline-flex h-7 shrink-0 items-center gap-1 rounded-[6.4px] border-[1px] border-[rgb(245_158_11/0.3)] bg-[var(--action-fill)] px-2.5 text-xs font-medium text-[#f59e0b] transition-colors duration-150 hover:bg-[var(--action-fill-hover)] disabled:opacity-60"
        >
          {running ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Bot className="size-3.5" />
          )}
          {running ? t("Verifying") : t("Verify")}
        </button>
      )}
    </div>
  )

  if (!complaint.aiVerified) {
    return (
      <Card className="p-5">
        {header}
        <p className="py-6 text-center text-sm text-[var(--muted-foreground)]">
          {running
            ? t("Checking telemetry, permits, driver records and evidence…")
            : t('Click "Verify" to validate this complaint against telemetry, permits, driver records, and evidence.')}
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-5">
      {header}

      <div
        className="mt-4 flex items-center justify-between gap-4 rounded-xl px-5 py-4"
        style={{ background: `color-mix(in oklab, ${tone} 10%, transparent)` }}
      >
        <p className="min-w-0 truncate text-xl font-bold" style={{ color: tone }}>
          {ai.verdict}
        </p>
        <p className="shrink-0 text-end">
          <span className="block text-xl leading-none font-bold" style={{ color: tone }}>
            {ai.confidence}%
          </span>
          <span className="mt-1 block text-[10px] tracking-[0.5px] text-[var(--muted-foreground)] uppercase">
            Confidence
          </span>
        </p>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.5px] text-[var(--muted-foreground)] uppercase">
            Confidence
            <InfoTip label="How strongly the signals agree. Below about 70% the verdict is treated as inconclusive." />
          </span>
          <span className="text-sm font-bold" style={{ color: tone }}>
            {ai.confidence}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[rgb(0_0_0/0.08)]">
          <div
            className="h-full rounded-full transition-[width] duration-700 ease-out"
            style={{ width: `${ai.confidence}%`, background: tone }}
          />
        </div>
      </div>

      {/* The evidence, the reasoning and the recommendation all live in the
          report below — SMC issues a numbered document here rather than a
          grid of pass/fail chips and a sentence, and the document is what an
          officer can defend a ruling with. */}
      <CrossValidationReport complaint={complaint} />

    </Card>
  )
}
