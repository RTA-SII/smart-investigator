/**
 * The Investigation Form as a file the officer can keep.
 *
 * RTA's form is the artefact the whole workflow exists to produce (workbook
 * sheet 2), but it is a record rather than a workspace — nobody edits it on
 * screen, they file it. So it leaves the tab strip and becomes a download.
 *
 * Rendered as a standalone HTML document because it has to survive leaving
 * the app: it opens in any browser, prints to A4, and carries the Arabic
 * statements with the right direction. Every statement gets `dir="auto"`,
 * since an interview conducted in Arabic has to read right-to-left inside an
 * otherwise English page.
 */

const esc = (v) =>
  String(v ?? "—")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

const row = (label, value) =>
  `<tr><th>${esc(label)}</th><td>${esc(value)}</td></tr>`

const statement = (label, body) => `
  <section>
    <h3>${esc(label)}</h3>
    <p dir="auto">${esc(body || "Not recorded.")}</p>
  </section>`

const stamp = (iso) => (iso ? String(iso).slice(0, 19).replace("T", " ") : "—")

/** The document body, kept apart from the download so it can be tested. */
export function investigationFormHtml(c) {
  const f = c.form ?? {}

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Investigation Form ${esc(c.id)}</title>
<style>
  :root { color-scheme: light }
  body {
    margin: 0; padding: 32px;
    font: 14px/1.55 "Segoe UI", system-ui, sans-serif;
    color: #1a1a1a; background: #fff;
  }
  header { border-bottom: 3px solid #171c8f; padding-bottom: 14px; margin-bottom: 22px }
  h1 { margin: 0 0 4px; font-size: 20px; color: #171c8f }
  .ref { font-family: ui-monospace, Consolas, monospace; font-size: 12px; color: #575757 }
  h2 {
    margin: 26px 0 10px; font-size: 13px; text-transform: uppercase;
    letter-spacing: .5px; color: #575757;
  }
  h3 { margin: 0 0 4px; font-size: 13px; color: #171c8f }
  table { width: 100%; border-collapse: collapse; margin-bottom: 4px }
  th, td { text-align: start; padding: 7px 10px; border-bottom: 1px solid #e6e6e6; vertical-align: top }
  th { width: 34%; font-weight: 600; color: #575757 }
  section { margin-bottom: 14px; padding: 12px 14px; background: #f6f6f8; border-radius: 8px }
  section p { margin: 0; white-space: pre-wrap }
  footer { margin-top: 28px; font-size: 11px; color: #8a8a8a }
  @media print { body { padding: 0 } section { background: none; padding: 0 } }
</style>
</head>
<body>
<header>
  <h1>Investigation Form</h1>
  <p class="ref">${esc(f.id ?? c.id)} &middot; ${esc(c.type)} &middot; ${esc(c.mode)}</p>
</header>

<h2>Case</h2>
<table>
  ${row("Complaint ID", c.id)}
  ${row("CRM reference", c.crmRef)}
  ${row("Received", stamp(c.receivedAt))}
  ${row("Form raised", stamp(f.date))}
  ${row("Stage", c.stage)}
  ${row("Verified finding", c.outcome)}
  ${row("Investigation method", f.investigationMethod)}
  ${row("Case location", f.caseLocation ?? c.location)}
  ${row("Reason / purpose", c.type)}
</table>

<h2>Vehicle and driver</h2>
<table>
  ${row("Driver ID", f.driverId ?? c.driver?.licence)}
  ${row("Nationality", f.nationality ?? c.driver?.nationality)}
  ${row("Plate number", c.plate)}
  ${row("Side number", c.sideNumber)}
  ${row("Operator", c.company)}
  ${row("Prior complaints", c.driver?.priorComplaints)}
</table>

<h2>Statements</h2>
${statement("Customer's statement", f.customerStatement ?? c.narrative)}
${statement("Driver's statement", f.driverStatement)}
${statement("Investigator's statement", f.investigatorStatement)}

<h2>Outcome</h2>
<table>
  ${row("Action taken", f.actionTaken)}
  ${row("Suspension period", f.suspensionDays ? `${f.suspensionDays} days` : "—")}
  ${row("Fine category", f.fineCategory)}
  ${row("Fine sub category", f.fineSubCategory)}
  ${row("Decided by", c.decision?.by)}
</table>

<footer>
  Smart Investigator Initiative &middot; Complaints Investigation &middot;
  generated ${stamp(new Date().toISOString())}
</footer>
</body>
</html>`
}

/** Hand the document to the browser as a file. */
export function downloadInvestigationForm(c) {
  const blob = new Blob([investigationFormHtml(c)], {
    type: "text/html;charset=utf-8",
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")

  a.href = url
  a.download = `investigation-form-${c.id}.html`
  document.body.appendChild(a)
  a.click()
  a.remove()

  // Revoking immediately can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
