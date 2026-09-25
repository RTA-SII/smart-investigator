/**
 * The whole complaint as a document the officer can keep.
 *
 * Everything the case page shows across its tabs, in one printable file:
 * what was alleged and by whom, the vehicle and driver it was raised
 * against, what cross-validation concluded, how it was ruled on, and the
 * audit trail. An investigator asked for the case is asked for all of it,
 * not for one form out of it.
 *
 * A standalone HTML document because it has to survive leaving the app: it
 * opens in any browser, prints to A4, and carries statements taken in Arabic
 * with the direction they were taken in — every free-text block gets
 * `dir="auto"`.
 */

const esc = (v) =>
  String(v ?? "—")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

const stamp = (iso) => (iso ? String(iso).slice(0, 19).replace("T", " ") : "—")

const row = (label, value) => `<tr><th>${esc(label)}</th><td>${esc(value)}</td></tr>`

const table = (rows) => `<table>${rows.filter(Boolean).join("")}</table>`

const section = (title, body) => `<h2>${esc(title)}</h2>${body}`

const prose = (title, body) =>
  body
    ? `<section><h3>${esc(title)}</h3><p dir="auto">${esc(body)}</p></section>`
    : ""

/** The eight cross-validation signals, as a pass/fail list. */
function checks(ai) {
  if (!ai?.checks?.length) return ""
  const items = ai.checks
    .map(
      (c) =>
        `<li class="${c.pass ? "pass" : "fail"}">${c.pass ? "PASS" : "FAIL"} &middot; ${esc(c.label)}</li>`,
    )
    .join("")
  return `<ul class="checks">${items}</ul>`
}

/** Who did what to the case, in order. */
function trail(timeline = []) {
  if (!timeline.length) return "<p>No entries.</p>"
  const rows = timeline
    .map(
      (e) =>
        `<tr><td class="when">${esc(stamp(e.at))}</td><td><b>${esc(e.action)}</b><br>${esc(e.actor)}${
          e.note ? `<br><span class="note">${esc(e.note)}</span>` : ""
        }</td></tr>`,
    )
    .join("")
  return `<table class="trail">${rows}</table>`
}

export function complaintReportHtml(c) {
  const f = c.form ?? {}
  const ai = c.ai ?? {}

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Complaint ${esc(c.id)}</title>
<style>
  :root { color-scheme: light }
  body {
    margin: 0; padding: 32px; background: #fff; color: #1a1a1a;
    font: 14px/1.55 "Segoe UI", system-ui, sans-serif;
  }
  header { border-bottom: 3px solid #171c8f; padding-bottom: 14px; margin-bottom: 4px }
  h1 { margin: 0 0 4px; font-size: 20px; color: #171c8f }
  .ref { font-family: ui-monospace, Consolas, monospace; font-size: 12px; color: #575757 }
  h2 {
    margin: 26px 0 10px; font-size: 13px; text-transform: uppercase;
    letter-spacing: .5px; color: #575757;
  }
  h3 { margin: 0 0 4px; font-size: 13px; color: #171c8f }
  table { width: 100%; border-collapse: collapse }
  th, td { text-align: start; padding: 7px 10px; border-bottom: 1px solid #e6e6e6; vertical-align: top }
  th { width: 34%; font-weight: 600; color: #575757 }
  section { margin-bottom: 12px; padding: 12px 14px; background: #f6f6f8; border-radius: 8px }
  section p { margin: 0; white-space: pre-wrap }
  ul.checks { margin: 0; padding: 0; list-style: none; columns: 2; font-size: 13px }
  ul.checks li { padding: 3px 0 }
  ul.checks li.pass::marker, .pass { color: #0a7a33 }
  .fail { color: #c4261d }
  table.trail th, table.trail td { font-size: 13px }
  td.when { width: 30%; font-family: ui-monospace, Consolas, monospace; font-size: 12px; color: #575757 }
  .note { color: #575757 }
  footer { margin-top: 28px; font-size: 11px; color: #8a8a8a }
  @media print {
    body { padding: 0 }
    section { background: none; padding: 0 }
    h2 { break-after: avoid }
  }
</style>
</head>
<body>
<header>
  <h1>Complaint ${esc(c.id)}</h1>
  <p class="ref">${esc(c.type)} &middot; ${esc(c.mode)} &middot; ${esc(c.stage)}${
    c.outcome ? ` &middot; ${esc(c.outcome)}` : ""
  }</p>
</header>

${section(
  "Case",
  table([
    row("Complaint ID", c.id),
    row("CRM reference", c.crmRef),
    row("Case type", c.caseType),
    row("Reason / purpose", c.type),
    row("Category", c.category),
    row("Priority", c.priority),
    row("Channel", c.channel),
    row("Received", stamp(c.receivedAt)),
    row("Handling target", c.slaMinutes ? `${c.slaMinutes} minutes` : null),
    row("Handling time", c.handlingMinutes != null ? `${c.handlingMinutes} minutes` : null),
    row("Stage", c.stage),
    row("Assigned to", c.assignee ? `${c.assignee.name} · ${c.assignee.id}` : "Unassigned"),
  ]),
)}

${section(
  "Vehicle and operator",
  table([
    row("Transport mode", c.mode),
    row("Operator", c.company),
    row("Plate number", c.plate),
    row("Side number", c.sideNumber),
    row("Location", c.location),
  ]),
)}

${section(
  "Complainant",
  table([
    row("Name", c.complainant?.name ?? "Anonymous"),
    row("Contact", c.complainant?.phone),
    row("Trip reference", c.complainant?.tripRef),
    row("Satisfaction", c.satisfaction),
  ]),
)}

${section(
  "Driver",
  table([
    row("Name", c.driver?.name),
    row("Licence", c.driver?.licence),
    row("Permit", c.driver?.permit),
    row("Nationality", c.driver?.nationality ?? f.nationality),
    row("Rating", c.driver?.rating),
    row("Prior complaints", c.driver?.priorComplaints),
  ]),
)}

${section("Allegation", prose("As reported", c.narrative) || "<p>Not recorded.</p>")}

${section(
  "Cross-validation",
  table([
    row("Verdict", ai.verdict),
    row("Confidence", ai.confidence != null ? `${ai.confidence}%` : null),
    row("Investigation method", f.investigationMethod),
  ]) +
    checks(ai) +
    prose("Summary", ai.summary) +
    prose("Recommended action", ai.recommendation),
)}

${section(
  "Statements",
  prose("Customer's statement", f.customerStatement) +
    prose("Driver's statement", f.driverStatement) +
    prose("Investigator's statement", f.investigatorStatement) || "<p>None recorded.</p>",
)}

${section(
  "Outcome",
  table([
    row("Verified finding", c.outcome),
    row("Action taken", f.actionTaken ?? c.penalty),
    row("Suspension period", f.suspensionDays ? `${f.suspensionDays} days` : null),
    row("Fine category", f.fineCategory),
    row("Fine sub category", f.fineSubCategory),
    row("Decided by", c.decision?.by),
    row("Decided at", stamp(c.decision?.at)),
  ]),
)}

${section("Audit trail", trail(c.timeline))}

<footer>
  Smart Investigator Initiative &middot; generated ${stamp(new Date().toISOString())}
</footer>
</body>
</html>`
}

/** Hand the document to the browser as a file. */
export function downloadComplaintReport(c) {
  const blob = new Blob([complaintReportHtml(c)], { type: "text/html;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")

  a.href = url
  a.download = `complaint-${c.id}.html`
  document.body.appendChild(a)
  a.click()
  a.remove()

  // Revoking immediately can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
