import { AI_CHECKS } from "./catalog"

/**
 * The cross-validation model.
 *
 * Given a complaint, the engine weighs eight telematics and camera signals and
 * returns a verdict, a confidence, and a recommended action. Driver-behaviour
 * complaints are the ones the vehicle's own data can corroborate hard — speed
 * traces, harsh-braking events, in-cab footage — so they are confirmed far more
 * often than fare or service disputes, which rest on the trip record alone.
 */
export function buildAi(r, type, category) {
  const behavioural = category === "Driver Behaviour"
  const roll = r()

  const verdict = behavioural
    ? roll < 0.66
      ? "Confirmed"
      : roll < 0.86
        ? "Inconclusive"
        : "False Positive"
    : roll < 0.42
      ? "Confirmed"
      : roll < 0.74
        ? "Inconclusive"
        : "False Positive"

  const confidence =
    verdict === "Confirmed"
      ? 82 + Math.floor(r() * 18)
      : verdict === "False Positive"
        ? 74 + Math.floor(r() * 20)
        : 48 + Math.floor(r() * 20)

  // A confirmed verdict carries mostly passing checks; a false positive
  // mostly failing ones. Inconclusive genuinely splits — that is the point.
  const passBias =
    verdict === "Confirmed" ? 0.82 : verdict === "False Positive" ? 0.22 : 0.5

  const checks = AI_CHECKS.map((label) => ({ label, pass: r() < passBias }))

  // SMC does not give a one-word recommendation — it writes a short
  // justification: what to do, why the evidence supports it, and the caveat
  // the officer should carry into the decision. Mirrored here, and every
  // recommended action is one the officer actually has on the Take Action
  // card.
  const recommendation =
    verdict === "Confirmed"
      ? `Issue a fine against the driver's licence and record the finding as Valid Complaint — Driver Guilty; telematics and in-cab footage both place the vehicle at the reported time and corroborate the ${type.toLowerCase()}. Consider a suspension alongside the fine where the driver's prior record shows the same conduct.`
      : verdict === "False Positive"
        ? `Close with No Enforcement Needed; the recorded behaviour is within normal parameters for the trip and no signal supports the allegation. Nothing should be raised against the driver's licence, but keep the record so a repeat report against the same plate can be read as a pattern.`
        : `Do not rule on this alone — the signals conflict and confidence sits below the threshold at which a penalty is safe. Escalate for a supervisor view, or request the missing footage before deciding; closing it either way on the present evidence risks an unsound finding.`

  const summary =
    verdict === "Confirmed"
      ? `Telematics and in-cab footage corroborate the reported ${type.toLowerCase()}. Driver conduct falls outside permitted standards.`
      : verdict === "False Positive"
        ? "Cross-validation does not support the complaint. The vehicle's recorded behaviour is within normal parameters for this trip."
        : "Signals conflict. Camera evidence is partial and the trip record only loosely matches the reported window."

  return { verdict, confidence, checks, recommendation, summary }
}
