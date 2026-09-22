---
project_id: 33bb37d5-0faa-41c4-af2a-e9f179653560
status: building          # building | live | paused | archived
goal: "A 1:1 replica of the RTA SMC portal carrying only the complaints investigation module — CRM complaints, AI cross-validation, officer and supervisor workflow"
domain: ops
audience: "RTA enforcement stakeholders and the Ducont SMC delivery team"
---

# RTA SMC — Complaints Investigation Module

> A clickable front-end module that takes a public complaint from CRM, puts the
> AI's cross-validation of it in front of an investigation officer, and closes
> the loop in five minutes — dismiss, substantiate, escalate, fine, or suspend
> the permit.

## Current state

_2026-09-21_ — **Module complete and conformed to the POC scope.** Nine
routes across two roles, rendered in the SMC portal's own design system, on a
live complaint store that every screen reads and writes. 107 tests pass; lint
and production build are clean.

```bash
npm install --prefix frontend
npm run dev --prefix frontend
```

Then open <http://localhost:3100>.

## What it does

A complaint arrives from CRM. Before an officer sees it, a cross-validation
engine has already weighed it against eight telematics and camera signals —
GPS track, speed profile, harsh-braking events, in-cab footage, phone-use
detection, trip record, driver identity, permit validity — and returned a
verdict with a confidence score.

The officer's job is to agree, disagree, or say "I can't tell" and pass it up.
The clock is the point: every complaint carries a **five-minute handling
target**, counting down live in the queue and on the detail page, amber under
two minutes and red once breached.

### Screens

| Route | Screen | Role |
|---|---|---|
| `/` | Role picker | — |
| `/dashboard` | KPIs, volume trend, category split, verdict breakdown | both |
| `/reports` | Officer performance, categories, channels, operators | both |
| `/complaints` | All complaints — filterable table, assignment, density-by-area view | supervisor |
| `/complaints/:id` | Investigation workspace | both |
| `/manual-complaints` | Complaints logged at the centre | both |
| `/manual-complaints/new` | Manual intake form | both |
| `/my-queue` | The officer's own assigned work | officer |

### The two roles

Separation of duty is enforced, not decorative:

Both roles close a complaint the same three ways — **False Positive**, **No
Fine Required**, **Issue Fine**. The fourth action is what separates them:

- **Investigation Officer** (Layla Al-Hammadi, SMC-0318) — pulls work from the
  Main Queue and **escalates** where the evidence is thin.
- **Supervisor** (Omar Bin Haider, SMC-0204) — monitors the queue, rules on
  referrals, and **returns a complaint to an officer** instead of escalating.

Issuing a fine may carry a suspension alongside it — driver, vehicle or permit.
Enforcement actions open a slide-in confirmation carrying the driver's licence,
permit and prior-complaint count, and warn that the action is written to the
enforcement record.

### The investigation workspace

Four tabs, mirroring SMC's alert detail — which has no AI tab:

- **Details** — source channel, CRM reference, driver, company, location, plus
  the complainant's statement and the evidence tiles.
- **Complainant & Driver** — both parties, with the driver's rating and prior
  complaint count. Contact numbers are masked to the last four digits.
- **Comments** — the case conversation between the officer and the supervisor,
  with a composer that posts as whoever is signed in.
- **Audit Log** — the workflow rail plus the full trail, opening with the CRM
  handover.

Comments and the audit log are deliberately separate trails: the log is the
system's evidential record of what happened, the thread is what the people
working the case said to each other. Posting a comment does not write to the
log.

**Cross-validation sits inline on the Details tab**, under the evidence,
where SMC keeps it — and it is **gated behind a Verify button**. The verdict
exists from the moment the complaint is generated, but the officer is not
shown it until they ask: they look at the statement and the evidence first,
then run the engine and weigh what it says. Running it takes about a second
and lands in the audit trail as an act.

Anything already being worked has been through the engine; a complaint that
has just arrived has not, so its officer gets the button. Verifying reveals
the verdict, the confidence bar, the eight signals as pass/fail chips, the
summary and the recommended action.

The right-hand rail carries the assignment and the **Take Action** card — no
verdict summary, because SMC has none and one would give away the answer
before Verify is pressed.

## Goals

- Show stakeholders the complaints workflow inside the portal they already
  know, rather than describing it.
- Make the five-minute target legible at a glance, everywhere.
- Prove the officer/supervisor split and the escalation path.
- Match SMC exactly enough that the module reads as part of the portal.

## Non-goals

- **No backend.** Deliberately front-end only, against a deterministic mock
  dataset — the same call the BLE POC made. The scaffolded FastAPI/Postgres
  stack was removed rather than left dead in the tree.
- **No other SMC modules.** Alerts, registry and per-mode analytics are absent
  on purpose.
- **No real CRM integration.** CRM is represented as provenance — every
  complaint carries a `CRM-2026-xxxxxx` reference and its ingest channel, and
  every audit trail opens with the CRM Gateway handover.

## How the look was matched

Not eyeballed from screenshots. The portal was opened in the browser and its
design system read directly:

- **Tokens** — both `:root` and `.dark` blocks lifted verbatim from SMC's
  stylesheet (primary `#171c8f`, destructive `#e41a14`, ground `#f3f3f4`).
- **Type scale** — measured via computed styles on live elements, correcting
  for the 1.5× device pixel ratio that makes screenshots misleading.
- **Components** — badge, table, segmented control, tab and card specs read off
  the real DOM, down to the 0.667px hairline borders.
- **Animations** — `card-pop`, `row-flash`, `sk-shimmer`, `glass-glint-drift`
  and `glass-orb-drift` keyframes copied from the bundle.
- **Assets** — the four licensed RTA font files and both RTA logos pulled from
  the portal with the owner's approval, and self-hosted.

One finding worth recording: despite the `glass-*` class naming, **there is no
backdrop blur anywhere in SMC**. The effect is flat translucent white lit by
three inset hairlines. That is what this build does too — and it keeps the
house rule against glassmorphism substantively intact.

## Stack deviation

The DAK default is Astryx + the DEWA theme. This project uses SMC's stack
instead — Tailwind v4, shadcn tokens, lucide, recharts — because the brief was
an exact replica and SMC's tokens only reproduce faithfully in that system.
See `CONVENTIONS.md` for the full rationale and the two house rules set aside.

## Log

### Phase 11 — Aligned to RTA's workflow and data (2026-09-22)

The RTA team sent `Book2.xlsx` (9 CRM cases with their investigation forms)
and `Investigation_Office_Workflow.pptx` (the Investigation Office process).
Both changed the domain model, which until then had been inferred from the POC
scope document and the SMC alerts portal.

**RTA's cases are now seed data.** All 9 are transcribed verbatim into
`src/data/rtaCases.js` — generated reference data, confirmed with the team, not
production records. They carry what we could not write convincingly: the Arabic
Q&A driver interviews, the investigator's reasoning, the real fine codes. Two
are wholly in Arabic. The generator still produces 96 rows for volume, in the
same shape.

**The decision model was wrong and is now RTA's.** False Positive / No Fine
Required / Issue Fine / Escalate became the four verified findings from the
deck — *Valid complaint • Guilty*, *Valid complaint • Not guilty*, *Invalid
complaint • No event exists*, *Essential information missing* — plus
*Face-to-face investigation needed*. A guilty finding now carries a real RTA
fine code (1-49, 1-52, 1-53, 1-60) and a suspension in days.

**The Investigation Form exists.** A fifth workspace tab carrying sheet 2's
field set, including the three statements. `decide()` writes into it rather
than the two living separately — the form is the record the process exists to
produce.

**Two controls that were missing entirely:**

- The **completeness gate** — a case short of a date, time, side/plate number
  or description cannot be worked at all, and the only route out is back to
  Customer Happiness. Verified: such a case offers exactly one action.
- The **missing-recording exception** — vehicle suspended, driver permit
  blocked, company fined and notified, investigation switched to face to face,
  and a release once resolved. This forced company-level fines and a release
  action, neither of which existed.

**Lost Item** is a second case type with its own finding and no driver fine.

Findings worth recording:

- The process maps on slides 5–6 go beyond the text slides: termination runs a
  three-level approval chain (Chief → Manager → Director) before the decision
  is released to companies, and a disputed fine goes to the Dubai Public
  Transport Agency Grievance Committee. Neither is built — noted as scope.
- RTA's real SLA is 5–9 days with cases resolved in 1–7. The five-minute
  handling clock stays as the POC's target; the gap is the before/after story,
  not a contradiction.
- The Arabic statements are the first real test of the RTL layout against long
  free text. They need `dir="auto"`, not the page direction.

### Phase 10 — Take Action, and a portal that keeps moving (2026-09-22)

**The actions moved to where SMC keeps them.** They had been built under the
tab content; the portal puts them in the right-hand rail, under Assigned To,
in a card headed *Take Action*. Every number was measured off the live alert
detail page and matches: 32px tall on a 42px pitch, `0 10px` padding, 8px
radius, 14px/500 type, 16px icon, left-aligned.

The five buttons now carry the POC scope's own vocabulary — Escalate to
Supervisor for the officer, Reassign to Investigation Officer for the
supervisor, then False Positive, No Fine Required and Issue Fine for both.

One trap worth recording: those buttons **look** pale pink and mint in a
screenshot, but the fill is the plain page ground. The tint is JPEG chroma
bleed off the coloured text and hairline. Sampling a blank patch of each
button settled it before the wrong value got copied.

Reassignment had a second, silent path — a bare `<select>` on the Assigned To
card that changed the owner with no note and no audit entry. Removed. The
documented action owns it, so a reassignment now carries a confirmation, the
candidate officers with their live load, a note, and an audit entry.

**One complaint at a time, handed straight to the officer.** They sign in to
an empty desk — an empty Main Queue *and* nothing on their name, because the
seeded backlog is spread across their colleagues only. Three seconds later the
first complaint is assigned to them, with the five-minute clock already
running. The next comes twenty seconds after that one is off their hands, and
not before.

The Main Queue stays at zero for an officer: work is pushed to them, so there
is never anything left unowned to pull. The pull path is intact for the
supervisor's view and still covered by tests.

**All Complaints is the supervisor's view.** Along with Escalations, it is
gated out of the officer's nav — an officer works what they are given rather
than browsing the estate.

So the demo reads in one line: **sign in → a complaint arrives → close it
inside five minutes → twenty seconds later, the next one.**

Each arrival raises a toast, bumps the bell badge, and moves the queue count,
the live-complaints pill and the dashboard KPIs as it lands. Arrivals go in
unassigned — the officer is told, not pushed.

The scheduler watches the store rather than the decision path: after every
write it asks whether the desk is clear. Closing, escalating, handing back and
an automatic recall therefore all behave correctly without `decide()` knowing
arrivals exist.

**The tie-out margin is gone.** The handling time now lapses straight into a
recall, with no grace period — and pushed work is not recalled at all, since
there is no queue behind it; its clock simply breaches.

**The vocabulary was swept.** `Substantiated` is gone as a verdict, replaced
by `Confirmed`; the AI's recommendation no longer offers `Dismiss Complaint`
or `Request Additional Evidence`. All three were leftovers from the pre-scope
action set (Substantiate / Dismiss) that the POC document replaced — never
SMC's words, and none of them a button the officer actually has. Two tests now
assert every generated verdict and recommendation is in the current set.

That rename did not reach the screen at first, which is worth recording: the
store persists whole complaints, so `Substantiated` stayed alive in every
browser that had already run the app while the source was clean. The
localStorage key now carries a data version and sweeps older keys on load.

**The Main Queue is gone entirely**, page and pull path both. Work is pushed
to the officer, so nothing is ever left unowned to take and the page read zero
permanently. `pullNext`, `recall`, `sweepRecalls` and `queueOrder` went with
it; a lapsed handling time now simply **breaches** and the complaint stays
with the officer, because there is nowhere to send it back to.

**Roles, matching SMC's own nav.** An inspector there keeps Dashboard and
Reports, and its Alert Management section holds only My Alerts and Manual
Alerts — so an officer here gets Dashboard, Reports, My Complaints and Manual
Complaints. All Complaints and Escalations are the supervisor's.

**Closed work stays visible.** My Complaints defaults to All rather than Open:
a complaint the officer has just closed has to stay on screen carrying its
Closed badge, or the work appears to vanish the moment it is done. The next
complaint then arrives twenty seconds later and joins the list above it.

**Escalations became a filter, not a page.** That is how SMC has it: pick
Escalated in the Stage dropdown and an **Escalation** panel opens under the
filters — three numbered steps reading left to right, *Escalated by* → 
*Escalated to* → *Outcome*, with both outcomes ticked to begin with. The page
was deleted.

Two things had to change underneath. Asking for Stage *Escalated* now means
**was** escalated rather than *is sitting at* that stage — otherwise it
contradicts the Outcome facet beside it, which offers "Escalated and closed";
the audit trail is the durable record once the stage moves on. And the seeded
set had no complaint that went up and was then ruled on, so that outcome had
nothing to show: a share of closed complaints now carry an escalation step.
The split reads 36 ever escalated, 15 still awaiting a ruling.

**My Productivity.** SMC's own strip of personal numbers, added for the
officer above the centre-wide dashboard and again at the top of My
Complaints: assigned to me, handled, close rate, average handling time,
escalations, unactioned. All derived from the live store, so closing a
complaint moves them while you watch. My Complaints now reads KPIs → search
and filters → table.

**KPI icons lost their tinted boxes** — the icon carries its own colour and
nothing sits behind it, across every tile.

**The arrival toast was permanently see-through**, and the cause was not
opacity but `card-pop`: its last keyframe sets `background-color: #0000`, and
with `animation-fill-mode: both` that sticks after the animation ends,
overriding the class's own background. It was written for cards that sit on
an opaque surface, where ending transparent is harmless. Toasts now use their
own `toast-in` keyframe, which only moves and fades.

**The filter dropdowns are SMC's, not native selects.** A 240px popover at
11.2px radius with a search field over a divider, 28px option rows at 6.4px
with 14px checkboxes, a primary/10 wash on a chosen row, and a Clear action
once something is picked. They are **multi-select**, as SMC's are, so
`applyFilters` now takes arrays — an empty facet is off.

**The supervisor can assign by hand.** All Complaints carries SMC's own
assignment popover, measured off `/alerts`: a 352px card on an 11.2px radius,
a 32px search field over name, badge and department, 18px pill filters for
role and workload band, and 48px operator rows with a 4px workload bar. The
workload is the point — the lightest-loaded operator is flagged **Best fit**,
so a supervisor assigns by seeing who can actually take the work.

Fixed while verifying: the toast stamped wall-clock time next to a complaint
dated on the demo clock, in the same toast.

### Phase 9 — Conformance to the POC scope (2026-09-21)

The official *Smart Investigator Initiative* scope document was read against
the build. Four gaps came out of it; all four are now closed.

**A live complaint store.** `COMPLAINTS` had been a frozen module constant, so
a ruling only decorated the detail page — the complaint never left the queue,
never reached the supervisor and never moved a KPI. `src/app/complaintStore.js`
now owns the mutable set behind a `useSyncExternalStore` (the third use of the
pattern here, after `session.js` and `i18n/index.js` — no provider, no state
library). Every screen reads it, and `decide`, `assign`, `fileComplaint`,
`pullNext` and `recall` are the only ways in.

**The five decisions (§8).** The action set was rebuilt to the scope's own
vocabulary: False Positive, No Fine Required and Issue Fine for both roles,
Escalate to Supervisor for the officer, Reassign to Investigation Officer for
the supervisor. A fine may carry a driver, vehicle or permit suspension;
nothing else can. The officer's note is now captured and lands in the audit
trail.

The buttons then moved to where SMC keeps them: a **Take Action card in the
right-hand rail**, under Assigned To, stacked full width and left-aligned
behind a 16px icon — referral first in red, the two no-penalty outcomes in
grey then green, and the single enforcement action last as the solid primary
button. Every measurement was taken off the live alert detail page and matches
it: 32px tall on a 42px pitch, `0 10px` padding, 8px radius, 14px/500 type.

The fill turned out to be the **page ground**, not a tone tint — the pale pink
and mint in a screenshot are JPEG chroma bleed off the coloured text, not a
background. Confirmed by sampling a blank patch of each button before copying
it.

Reassignment had been a bare `<select>` on the Assigned To card that mutated
the owner silently. That second path is gone: the supervisor's documented
action now owns it, so a reassignment carries a confirmation, an officer with
their current load, a note, and an audit entry.

**The Complaints Main Queue (§7).** Distribution is pull-based, as it is for
ISMP alerts — nothing is pushed at an officer, they ask for the next complaint.
The pull starts the five-minute **Complaint Handling Time**; when it lapses
a sweep recalls the complaint to the queue automatically. `src/lib/cht.js`
holds the mechanics, `/queue` the screen. (A 20-second tie-out margin sat
between the two until Phase 11 removed it.)

**Comments (§8).** A fifth workspace tab carrying the case conversation, seeded
so escalations arrive with the officer's doubt and the supervisor's answer
already on them. Kept out of the audit log on purpose.

Three things caught while verifying, all worth recording:

- `startRecallSweep()` had been written but never called from `App.jsx`, so
  auto-recall was silently dead — the chip read "Recalling" while the complaint
  stayed assigned. Same failure mode as the `/escalations` crash: an edit
  script that asserts then writes, abandoning one file's write mid-run. Only
  the browser pass caught it; the unit tests exercised `sweepRecalls` directly.
- `rng`/`pick` had been copy-pasted into two data modules and were about to
  become three. Extracted to `src/data/rand.js` first.
- The reassign officer picker defaulted to `""` on an unassigned complaint, so
  the select *showed* the first officer while submitting nothing — confirming
  would have reassigned it to nobody. Only visible by driving the real form.

Tables now page at 15 rows through a shared `usePaged` hook and one
`Pagination` component.

### Phase 1 — Design-system extraction (2026-09-18)

Opened the live portal, confirmed no complaints module exists in SMC today, and
read out the token set, type scale, component specs, keyframes, icon library
(lucide) and chart library (recharts). Pulled the four RTA `.ttf` weights and
both logo SVGs with the owner's approval. Chrome blocks repeat automatic
downloads, so the fonts came via direct navigation and the logo from a fresh
tab — noted in case the assets need refreshing.

### Phase 2 — Module build (2026-09-18)

Scaffolded with `dak init`, stripped the DEWA/Vue scaffold and the unused
backend, and built six screens on the extracted design system. 96-complaint
deterministic dataset with a seeded PRNG; the cross-validation model leans
substantiated for driver-behaviour complaints (telematics can corroborate them
hard) and softer for fare and service disputes.

### Phase 8 — Arabic and RTL (2026-09-21)

The عربي control now works, in both themes.

Worth recording: **SMC's own عربي button does nothing.** Clicking it on the
live portal leaves `lang="en"`, `dir="ltr"`, every string English and nothing
in storage. The inert control here was a faithful copy; making it work is a
deliberate departure from SMC, not a bug fix.

- `useT()` keys off the English string, so an untranslated key renders English
  instead of a placeholder. Dictionaries sit in `src/i18n/ar/`, split into
  shell, domain and pages.
- Full RTL: the sidebar moves to the right, the drawer slides from the right,
  tables reverse, and the whole layout mirrors off `dir` on the root. Every
  directional utility in the codebase was converted to its logical equivalent.
- Data stays in its source language — driver and company names, free text —
  as in every bilingual RTA system. Only UI vocabulary is translated.
- Three things deliberately do not mirror: horizontal centring, chart
  geometry (`direction="ltr"` on the SVG), and Latin values inside Arabic
  text, which need bidi isolation or `18 Sep, 11:20` renders reversed.
- A test asserts every enum the queue can display has a translation, so
  adding a stage or complaint type without translating it now fails.

Extended in the same phase to the **report tables** (chips, section tabs,
column groups, every column header and its tooltip) and the **manual-complaint
form** (all six sections, every field label, placeholder and helper line, plus
the draft rail). Two collisions surfaced while doing it: `"Received"` meant a
timestamp on the queue and a count on the reports, so the report column was
renamed `"Complaints Received"`; and the completeness counter `0 / 5` was being
bidi-reordered to `5 / 0` until it was isolated.

### Phase 7 — Charts, tooltips and tile hover (2026-09-21)

- **3D charts.** SMC's pie and pipeline charts are hand-built SVG, not a chart
  library — confirmed by finding `<ellipse>` and per-slice `<path>` groups
  rather than recharts sectors. Rebuilt both: `Pie3D` projects the disc at
  SMC's own 45° tilt (`ry = rx × 0.7071`) and extrudes it 26px, drawing walls
  only for the front half; `Bar3D` gives each bar a front, top and end face on
  a shared 9px isometric offset.
- **Tooltips everywhere.** One `ChartTip` surface behind the area chart, the
  pie and the bars, matching SMC's: page-ground fill, 8px radius, 5%-black
  hairline, and a rounded swatch bar rather than a dot.
- **Per-metric ⓘ tooltips.** Added across KPI tiles, chart cards, the report
  tables, escalations and the cross-validation panel, written in SMC's
  register — what is counted, and what is not.
- **Tile hover.** Measured off the portal while hovered: lift 6px, scale 1.01,
  ring turns primary-tinted with a soft glow, transform leading at 0.4s and
  the edge trailing at 0.65s. Tiles also turned out to use a brighter fill
  than cards (white/.58 vs white/.36) and their own edge, so they now have a
  `dash-tile` surface of their own.
- **Dropdowns** restyled to SMC's own selects — 36px, 12px label, 8px radius,
  a visible 70%-strength border on a muted fill, primary ring on focus.

Fixed along the way: the specular glint was painting *over* tile content
rather than behind it, which was blanking the first KPI tile's label and
value.

### Phase 6 — Controls, nav and Reports (2026-09-18)

- **Sidebar nav** now carries SMC's labels — Dashboard, Reports, All
  Complaints, My Complaints (plus Escalations for supervisors) — and the
  active row gets its **1px primary/20 stroke**, which had been missing. The
  border is present-but-transparent when idle so the active state never
  shifts the row.
- **Line boxes.** SMC wraps nav labels in `leading-none` so the 16px icon sets
  the row height. Without it the row ran 41.5px against SMC's 37.45px, and the
  same inherited line-height was pushing badge labels off centre against their
  dots — the misalignment that was reported. Now byte-identical at 37.4537px.
- **Dropdowns** rebuilt as SMC's `filter-control`: a 36px glass pill on
  white/.42 at an 8px radius with 12px labels and inset hairlines, the native
  `<select>` laid transparently over it so the platform's option list and
  keyboard handling survive. They had been bare labels on no surface.
- **Radius scale** corrected — SMC's is custom (4.8/6.4/8/11.2/14.4), not
  stock Tailwind's.
- **Two more surfaces** measured and added: `glass-toolbar` for tab rails and
  `glass-chip` for unselected filter chips.
- **Hover** unified on SMC's `hover:bg-white/40` at 150ms, with KPI tiles
  taking the portal's slower settle-upward curve.
- **Reports page** added, following SMC's Operational Reports: mode chips, a
  navy pill rail, and grouped tables under coloured bands (volume #009CDE,
  speed #FF8200, quality #9B59B6, outcomes #0072BC). Four sections — officer
  performance, categories, intake channels and operators — all aggregated from
  the same complaint set the queue reads.

### Phase 5 — Surfaces and type re-measured (2026-09-18)

A second pass over the portal's colours, transparency and type turned up four
real mismatches:

- **Surface fill.** SMC defines `--card: #ffffff38` (alpha 0.22) and then does
  not use it — its surfaces paint at **0.36**. Reading the token gave a
  visibly flatter UI. Now carried as its own `--surface` token.
- **Hairlines.** Every border measured off the portal came back as `0.667px`
  or `0.740741px`. Those are pixel-snapped renderings of a declared **1px** —
  confirmed with a throwaway probe element. The literal values had been copied
  into eight files.
- **Page ground.** `.glass-scene` is a *static* stack of four white radial
  highlights over a 165° ramp, not the drifting coloured orbs that had been
  built from the unused `glass-orb-drift` keyframe. Copied verbatim.
- **Two surface treatments, not one.** The top bar and sidebar use a real 1px
  border at a 16px radius; cards use a 1px ring at 14.4px with a different
  shadow. They had been collapsed into a single utility.
- **Top bar type.** SMC runs it at 10–12px; it had been built at `text-sm`
  (14px) throughout, making the whole shell read oversized.

### Phase 4 — Shell corrected to the desktop layout (2026-09-18)

The first build shipped a hamburger drawer instead of SMC's persistent
sidebar. Cause: the browser pane renders at 1.5× DPR, so a 1316px screenshot is
only ~877 CSS px — below SMC's `lg` breakpoint — and the portal was showing its
*narrow* layout the whole time. Re-measured at a real desktop width and
rebuilt the shell to match: 256px glass rail from `lg` up, drawer below, page
scrolling inside `main` rather than the window, top bar carrying the live-count
pill and a labelled Sign Out, six KPI tiles across one row at `xl`, and the wide
trend chart paired beside the donut.

Also corrected the sidebar logo, which SMC constrains to a 36×36 box — left
unconstrained the RTA mark runs 89px wide and eats the wordmark.

### Phase 3 — Verification and tidy-up (2026-09-18)

Walked both roles through the browser: role picker, dashboard, queue,
workspace, escalations, dark mode, and the full decision flow including permit
suspension. Fixed a page-level fade that flashed navy over the whole view
(SMC pops individual cards, not the page) and a generator bug where the
complainant's statement could describe different conduct from the reported
complaint type.

Split two files that hit their DAK caps: `DetailPanels.jsx` (249 lines, four
responsibilities) became one file per panel, and the dataset generator shed its
AI model, name pools and statement vocabulary into their own modules.

29 tests, lint clean, production build clean.

## Known gaps

- **Evidence frames are not bundled yet.** The panel matches SMC exactly — four
  across, tag chips, play control, telemetry burn-in — and picks up anything
  dropped into `frontend/src/assets/evidence/` automatically (see the README
  there). Until frames are added it renders SMC's dark frame with the burn-in
  over it. Pulling them from Lynx was blocked by this workstation's sandbox,
  which refuses bulk fetches of production personal data; export them from the
  portal by hand and drop them in.

  **If you add production captures, keep this repo private.** They are real
  CCTV of identifiable drivers tied to live violation records, and the sibling
  BLE POC was published to GitHub Pages.
- **The map view is schematic** — a density ranking by area, not a basemap.
  The POC has no tile provider.
- **The store is per-browser.** Decisions, assignments, pulls and comments
  persist in `localStorage` and survive a reload, but they are not shared
  between users — there is no backend. `resetComplaints()` restores the seeded
  set so a demo can be run again from the top.
- **Delta percentages on the KPI tiles are illustrative.** There is no previous
  period in the dataset to compare against.
- **The investigation workspace is English.** The shell, dashboard, queue,
  reports and manual-complaint form are translated; the detail page's panels,
  decision bar and comment thread are not. English prose inside an RTL
  container also reorders its trailing punctuation, which is visible there.
- **Arabic covers the UI, not the data.** Driver names, company names and
  complaint statements stay in their source language, as they do in the real
  system. The dictionary now covers the shell, dashboard, queue, reports and
  the manual-complaint form.
