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

  // Every recommendation must be an action the officer actually has. The
  // old set recommended "Dismiss Complaint" and "Request Additional
  // Evidence", neither of which is a button on the Take Action card.
  const recommendation =
    verdict === "Confirmed"
      ? r() < 0.4
        ? "Issue Fine"
        : "Escalate to Supervisor"
      : verdict === "False Positive"
        ? "False Positive"
        : "Escalate to Supervisor"

  const summary =
    verdict === "Confirmed"
      ? `Telematics and in-cab footage corroborate the reported ${type.toLowerCase()}. Driver conduct falls outside permitted standards.`
      : verdict === "False Positive"
        ? "Cross-validation does not support the complaint. The vehicle's recorded behaviour is within normal parameters for this trip."
        : "Signals conflict. Camera evidence is partial and the trip record only loosely matches the reported window."

  return { verdict, confidence, checks, recommendation, summary }
}
