# Conventions — RTA SMC Complaints Investigation Module

## What this project is

A 1:1 visual replica of the **RTA Smart Monitoring Centre** portal
(`rta-smc.ducontapps.com`), carrying **one module only**: complaints
investigation. No alerts, no registry, no per-mode analytics — those live in
SMC itself and are deliberately absent here.

## Stack deviation (approved)

The DAK default is Astryx + the DEWA theme. This project **does not use it**.
The brief was an exact replica of SMC's look and feel, so the stack matches
SMC's own instead:

| Layer | SMC | Here |
|---|---|---|
| Framework | React 19 + Vite | same |
| Routing | React Router | same, `createHashRouter` (DAK default) |
| Styling | Tailwind v4 + shadcn tokens | same |
| Icons | `lucide-react` | same |
| Charts | `recharts` | same |
| Typeface | RTA (licensed, self-hosted) | same files, self-hosted |

Two DAK house rules are consciously set aside, both because SMC does it and
the brief is to match SMC:

- **Tailwind.** The kit says no Tailwind; SMC is a Tailwind v4 + shadcn build,
  and its tokens only reproduce faithfully in that system.
- **Translucent surfaces.** The kit bans glassmorphism. SMC's cards *are*
  translucent — but there is no backdrop blur anywhere in the portal (verified
  against computed styles), so this is flat translucent white over the page
  ground, not frosted glass.

Everything else follows the kit: named project folder, `PROJECT.md`,
`CONVENTIONS.md`, hash router, tiered file-size caps, tests alongside source.

## Design tokens

`src/index.css` carries SMC's token set **verbatim**, light and dark. Do not
invent colours — if a value is not in the token block, it does not belong in
this UI. The load-bearing ones:

| Token | Light | Role |
|---|---|---|
| `--primary` | `#171c8f` | RTA navy; IDs, active states, chart-1 |
| `--destructive` | `#e41a14` | RTA red; breaches, enforcement |
| `--background` | `#f3f3f4` | page ground |
| `--foreground` | `#1a1a1a` | body text (never `#000`) |
| `--card` | `#ffffff38` | defined by SMC but **not** used for its surfaces |
| `--surface` | `rgb(255 255 255 / 0.36)` | the fill surfaces actually paint |
| `--muted-foreground` | `#575757` | labels, captions |
| `--radius` | `0.5rem` | base of a **custom** radius scale |

SMC's radius scale is not stock Tailwind's — `rounded-xl` is 11.2px here, not
12px, and `rounded-2xl` is 14.4px, not 16px. The scale is
`4.8 / 6.4 / 8 / 11.2 / 14.4`. Shell surfaces override to a flat 16px.

Semantic `--tone-*` variables drive every badge and status chip.

## Surfaces

SMC has **two** surface treatments and they are not interchangeable:

| | Shell (`glass-surface`) | Card (`glass-card`) |
|---|---|---|
| Used by | top bar, sidebar | every card and tile |
| Fill | `rgb(255 255 255 / 0.36)` | same |
| Edge | real `1px` border, `rgb(255 255 255 / 0.62)` | `1px` **ring** via box-shadow |
| Radius | `16px` | `14.4px` (tiles override to `rounded-xl` = 12px) |
| Shadow | `0 10px 28px rgb(0 0 0/.07)` + three inset hairlines | `0 12px 20px -12px rgb(0 0 0/.2)` + one inset |

Neither has `backdrop-filter` — verified against computed styles. The "glass"
is flat translucent white over the page ground, nothing more.

**The fill is `--surface`, not `--card`.** SMC defines `--card: #ffffff38`
(alpha 0.22) and then ignores it, painting its surfaces at 0.36. Reading
`--card` gets you a visibly flatter UI.

## Page ground

`.app-scene` — an absolutely positioned, `pointer-events-none` layer holding
four soft white radial highlights over a faint 165° ramp, copied from SMC's
`.glass-scene`. **It is static.** The bundle ships a `glass-orb-drift`
keyframe, but nothing on the page uses it; animating the ground is wrong.

## Measuring against the live portal

Two traps, both of which produced real bugs here:

1. **Device pixel ratio.** The portal renders at 1.35–1.5× DPR, so screenshots
   read 35–50% larger than the real CSS, and a 1316px screenshot is only
   ~877 CSS px — below `lg`, showing the *narrow* layout. Check
   `window.innerWidth`, never the screenshot.
2. **Border widths are pixel-snapped.** A declared `1px` reports as `0.667px`
   or `0.740741px` depending on zoom. Font size, padding, radius and
   letter-spacing are reported accurately; border-width is not. Probe with a
   throwaway `1px` element before trusting a measured hairline.

## Line boxes — the thing that breaks alignment

SMC collapses the text line box wherever a control's height should be set by
its padding or its icon, not by the font. Nav rows wrap their label in
`<span class="flex-1 leading-none">` so the 16px icon sets the height; badges,
count pills and status chips do the same.

Inherit a cell's 20px line-height into an 11px badge and the label sits off
centre against its dot, and the row grows ~4px. This was the cause of both.

Rule of thumb: **any pill, chip, badge or nav label gets `leading-none`.**
Prose keeps its natural line-height.

## Surfaces beyond the two shells

Five glass treatments in total, all measured:

| Utility | Fill | Edge | Radius | Used by |
|---|---|---|---|---|
| `glass-surface` | white/.36 | 1px border white/.62 | 16px | top bar, sidebar |
| `glass-card` | white/.36 | 1px ring white/.55 | 14.4px | cards, tiles |
| `glass-toolbar` | white/.36 | 1px border white/.72 | 11.2px | tab rails, segmented |
| `glass-chip` | white/.78 | 1px border white/.92 | 8px | unselected filter chips |
| `filter-control` | white/.42 | inset hairlines only | 8px | dropdown triggers |

`glass-chip` is the brightest surface in the system — it reads as raised
*above* the card it sits on, which is why unselected chips look solid.

## Charts

SMC does **not** use a chart library for its pie and pipeline charts — they
are hand-built SVG, and so are ours:

- `Pie3D` — a circle projected to an ellipse (`ry = rx × 0.7071`, a 45° tilt)
  and extruded by 26px. Side walls are drawn only for the front half of the
  disc (0°–180°) in a darkened shade, then top faces last so they sit above
  the walls. Leader lines run out to labels on whichever side the slice faces.
- `Bar3D` — three faces per bar: the front rectangle, a top parallelogram and
  a right end cap, all sharing one 9px isometric offset so the light direction
  stays constant.

Recharts is still used for the area chart. Whatever the source, tooltips go
through `ChartTip` so all three read identically: the page ground rather than
white, an 8px radius on a 5%-black hairline, 12px type, and a rounded swatch
**bar** against each series — SMC uses a bar, not a dot.

## Tooltips on metrics

Every number whose definition is not self-evident carries an `InfoTip` — the
ⓘ that sits at 45% opacity until hovered. Match SMC's register in the copy:
say exactly what is counted, and name what is *not*, e.g. "(count of
complaints, not money)".

`InfoTip` portals its popover to `document.body`. Tiles clip their overflow
for the specular glint, so an in-flow tooltip is cut off.

## Hover

One pattern, applied everywhere: **`hover:bg-white/40`** on idle controls
(`white/10` in dark), `transition-colors 150ms cubic-bezier(0.4, 0, 0.2, 1)`.
Chips and buttons use `transition-all` at the same timing.

Dashboard tiles (`dash-tile`) are the exception — they settle upward and the
edge lights up:

```
transform    0.4s  cubic-bezier(0.22, 1, 0.36, 1)  → translateY(-6px) scale(1.01)
box-shadow   0.65s cubic-bezier(0.22, 1, 0.36, 1)  → primary ring + glow
border-color 0.65s cubic-bezier(0.22, 1, 0.36, 1)  → primary 42% over white
```

The transform leads and the edge trails; that lag is what makes the tile
settle rather than snap. Tiles also sit on a brighter fill than cards
(white/.58 against white/.36) and carry their own 11.2px radius.

## The badge formula

One colour, three surfaces — measured off the portal and applied everywhere:

```
text        = tone
background  = tone @ 15%
border      = 0.667px solid tone @ 25%
type        = 11px / 600, padding 4px 10px, fully rounded
```

`Badge`, `SlaClock` and the AI check chips all follow it. Adding a new status
means adding a tone, not a new visual treatment.

## Type scale (real CSS pixels)

SMC runs a notably small, dense scale. Measured, not guessed:

| Element | Size / weight |
|---|---|
| Page title | 20px / 700 (detail pages 24px) |
| Section + card heading | 14px / 700 |
| Body, table cell | 14px |
| Sidebar nav link | 14px / 500 |
| Sidebar wordmark | 14px / 700, 0.35px tracking |
| KPI value | 18px / 700 |
| Top bar — user name | 12px / 600 |
| Top bar — status, chips, Sign Out | 11px / 600 |
| Badge, segmented control | 11px / 600 |
| Top bar — role line | 10px / 400 |
| Table header | 10px / 600, uppercase, 0.5px tracking |
| Sidebar section caption | 9px / 700, uppercase, 0.9px tracking |
| KPI delta and caption | 9px |

The top bar runs small — 10–12px throughout. Sizing it at `text-sm` makes the
whole shell read wrong.

The RTA face ships 300/500/700/900 only, so a CSS weight of 600 resolves to
700. `font-semibold` and `font-bold` therefore render identically — both are
used where SMC uses them, to keep the diff against the portal readable.

## File layout

```
src/
  app/        shell, router, session store, complaint store
  components/
    ui/       design-system primitives (Badge, Card, Table, Tabs, …)
    shell/    TopBar, NavDrawer, PageHeader
    complaints/       module components
    complaints/panels/  one panel per file
  data/       deterministic mock dataset + vocabulary
  lib/        pure helpers (formatting, filtering) — all unit-tested
  pages/      one file per route
```

**Pure logic lives in `src/lib/` so it can be tested without a DOM.** When a
component grows filtering or formatting logic, extract it there first —
`lib/filters.js` was pulled out of `FilterBar.jsx` for exactly this reason.

## Data

`src/data/complaints.js` builds 96 complaints from a seeded PRNG. It is
deterministic on purpose: the queue, the KPIs and the charts must agree with
each other and survive a reload.

- `NOW` is the demo's fixed present (`2026-09-18T11:20`). SLA countdowns run
  against it, so the urgent rows are always urgent.
- Vocabulary lives in `catalog.js` and `names.js`; the cross-validation model
  lives in `crossValidation.js`. `complaints.js` only assembles.
- Invariants are asserted in `complaints.test.js` — closed complaints carry an
  outcome, `New` complaints carry no assignee, every narrative names its own
  complaint type. Extend those tests when you extend the generator.
- The seeded PRNG and its `pick` helper live in `src/data/rand.js`. Import
  them; do not paste a third copy.

## The complaint store

`COMPLAINTS` is a **frozen seed**. `src/app/complaintStore.js` owns the mutable
copy that every screen reads, behind a `useSyncExternalStore` — the same shape
as `session.js` and `i18n/index.js`. No provider, no state library.

**Read it with `useComplaints()`, never by importing `COMPLAINTS` into a
page.** A component that imports the seed directly will not re-render when a
decision lands, and that is exactly the bug the store was built to kill.

Writes go through `decide`, `assign`, `fileComplaint`, `pullNext`, `recall` and
`addComment` — nothing else mutates. Each appends to the trail it belongs to:
the first five to the audit log, `addComment` to the comment thread. Keep those
two apart; the log is the evidential record, the thread is a conversation.

Timeline and comment entries are stamped against `NOW`, not wall time, or new
entries land outside every range filter on the reports.

## Complaint Handling Time

`src/lib/cht.js` holds the timed-queue mechanics from the POC scope (§7), and
is the only place that decides what phase a complaint is in:

`closed` · `escalated` · `queued` · `running` · `recallable`

The five minutes run **from the pull**, not from when CRM sent the complaint —
a complaint nobody has pulled is `queued`, not late. The moment the budget
lapses `startRecallSweep()` (wired once, in `App.jsx`) hands the complaint
back to the queue. There is no grace period; there used to be a 20-second
tie-out margin and it was removed.

That sweep is easy to break invisibly: the unit tests call `sweepRecalls`
directly, so a missing `startRecallSweep()` call passes every test and does
nothing in the browser. It shipped dead once. Verify recalls in the browser.

## Live arrivals

`src/app/arrivals.js` hands the officer **one complaint at a time**, on
demand. They sign in to an empty desk; the first complaint is given to them
three seconds later; the next only comes once that one is off their hands,
twenty seconds after. That is what makes the five-minute handling time legible
in a demo — there is exactly one clock running, and it is theirs.

**There is no Main Queue.** Work is pushed, so nothing is ever left unowned
to take. The page and the whole pull path — `pullNext`, `recall`,
`sweepRecalls`, `queueOrder` — were removed rather than left as untriggerable
code. A lapsed handling time is now the `breached` phase: the complaint stays
with the officer, because there is nowhere to send it back to.

`deliverTo()` assigns the complaint and stamps `pulledAt` on delivery, so the
officer's five minutes start when it lands. Such a complaint is marked
`pushed`.

Only an investigation officer is fed this way. A supervisor monitors and rules
on referrals; work is not handed to them, and `startArrivals()` is a no-op for
that role.

The scheduler does not listen for "a decision happened". It subscribes to the
store and asks `deskIsClear()` after every write, which is why closing,
escalating and handing back all behave correctly without the decision path
knowing arrivals exist.

**Nothing seeded is on the officer's name.** `SEED_OFFICERS` in `personas.js`
excludes the signed-in officer, and nothing seeded is `New` either — so the
only work that is ever theirs arrived during this session. Both are asserted
in `complaints.test.js`; if the generator starts loading up the officer again,
those tests are what will tell you.

## Roles and what each one sees

**Centre-wide views are the supervisor's.** All Complaints and Escalations are
gated to `role.id === "supervisor"` in `navItems.js`. Dashboard and Reports
stay for both — that is SMC's own shape, where an inspector keeps them and
only the Alert Management section is reduced to My Alerts and Manual Alerts.
(The routes themselves are not blocked; the gate is the nav.)

**`loggedBy` is not `assignee`.** Logging a complaint and being handed one are
different things, and the officer is in one of those lists but not the other:
nothing seeded is assigned to them, yet they have logged several. Manual
Complaints filters an officer's view by `loggedBy`; a supervisor sees every
manual complaint. `isManual()` in `catalog.js` decides what counts, and both
the generator and that page read it so they cannot drift.

**Assignment lives in `AssignPicker.jsx`**, on the All Complaints table behind
`assignable`. It reads `operatorLoads()` — which is `isOpenFor` again, so the
numbers in the picker match every other count in the app — and flags the
lightest-loaded as Best fit.

**My Complaints defaults to All, not Open.** A complaint the officer has just
closed must stay on screen with its Closed badge; defaulting to Open made
finished work vanish at the moment of finishing it.

**An officer's decision returns them to My Complaints.** The complaint they
just settled is sitting there marked Closed, and the next one lands in the
same list twenty seconds later — so the list is where the work continues. A
supervisor stays on the complaint: they are ruling on a referral, not working
through a queue.

## Live arrivals, continued

- `buildArrival(i)` is the ordinary generator with the age forced to zero. It
  still draws the age from the PRNG before discarding it, so a fresh arrival
  and a seeded row share one stream and stay deterministic.
- Nothing needs a cap: one arrival at a time, gated on the desk being clear,
  cannot run away.
- `startArrivals()` is idempotent: a remount in development must not double
  the rate. Signing out calls `resetArrivals()`, so the next demo starts from
  the top rather than continuing mid-run.

`src/app/notifications.js` is the only store here that is **not** persisted.
A notification is a thing that just happened; replaying yesterday's on the
next sign-in would be noise, and the complaint is already in the store — that
is the durable record.

**Stamp notifications on the demo clock.** `notify()` takes an `at`, and
arrivals pass the complaint's own `receivedAt`. Let it default to wall time
and a toast reads today's date beside a complaint dated 18 September, inside
the same toast.

## Pagination

Tables page at 15 rows. Use `usePaged(rows)` from `src/lib/paging.js` with the
`<Pagination paged={paged} />` component — do not hand-roll a slice. The hook
resets to page 1 whenever `rows` changes, so a filter never strands the reader
on an empty page.

The pager's chevrons use `rtl:rotate-180`, not logical properties: a chevron
points by reading direction and has to mirror physically.

## Roles

Two, and the difference is enforced in `DecisionBar.jsx`, not just displayed:

Both close a complaint the same three ways — **False Positive**, **No Fine
Required**, **Issue Fine**. The fourth action is the difference:

- **Investigation Officer** — plus **Escalate to Supervisor**.
- **Supervisor** — plus **Return to Investigation Officer**, and reassignment.

A fine may carry a driver, vehicle or permit suspension; `decide` drops a
`penalty` passed with any other action, and only `reassign` may change the
owner. If you add an action, put it behind a `roles: [...]` entry in
`DecisionBar.jsx` and a `TRANSITIONS` entry in the store — never a conditional
in the JSX.

**There is one reassignment path.** It is the supervisor's action in the Take
Action card, which goes through the confirmation and lands in the audit trail
with a note. The Assigned To card used to carry a second, silent one on a bare
`<select>`; it was removed. Do not add it back.

## `card-pop` ends transparent — never use it on a floating surface

Its final keyframe is `background-color: #0000`, and `animation: … both`
means that sticks once the animation finishes. On a card sitting on an opaque
panel that is invisible; on anything floating over the page it leaves the
element permanently see-through. The arrival toast shipped that way and read
as a fade caught mid-flight. Floating surfaces use `toast-in`, which touches
only opacity and transform.

## KPI icons carry their own colour

No tinted box behind them. `KpiTile`, `MyProductivity` and the Manual
Complaints mode tiles all render the icon bare at `size-3.5` in the tone.

## Filters are arrays, and the dropdowns are SMC's

Every facet in `EMPTY_FILTERS` is an **array**; empty means the facet is off.
They were single strings with `"all"` as the off value, and the filter tests
kept passing through the change because `"Taxi".includes("Taxi")` is true for
a string as well as an array — a silent false pass. The tests now assert the
array contract, including that adding a second value widens the result.

`FilterSelect` is the dropdown: a 240px popover at 11.2px radius with a
search field over a divider, 28px rows at 6.4px, 14px checkboxes at 4.8px
filling primary when ticked, a primary/10 wash on a chosen row, and a Clear
action once anything is picked. The trigger is the portal's 36px
`filter-control`, turning primary and semibold when the facet is live.

**Escalation is a filter, not a page.** Selecting Escalated in Stage reveals
`EscalationPanel` under the filter card. Stage *Escalated* is the one facet
that is not an exact match: it means **was** escalated (`wasEscalated`, which
reads the audit trail), because the stage moves on once a supervisor rules
and the Outcome facet beside it offers "Escalated and closed".

## Cross-validation is asked for, not given

The verdict is generated with the complaint, but `aiVerified` gates whether
anyone sees it. SMC puts a **Verify** button on the panel and shows nothing
until it is pressed; so do we, because handing an officer the conclusion
before they have read the statement defeats the exercise.

- The panel lives **inline on the Details tab**, under the evidence. SMC has
  no AI tab, and no verdict card in the rail either — both would leak the
  answer early.
- `verifyAi()` in the store flips the flag and appends the audit entry. The
  generator only writes that entry for complaints already verified, so the
  trail and the panel cannot contradict each other — a test asserts exactly
  that correspondence.
- Seeded complaints are verified if they are past `New`; a freshly delivered
  one is not, which is what puts the button in front of the officer.

## RTA's documents are the source of truth

Two documents from the RTA team define the domain, and they win over anything
inferred from the SMC alerts portal:

- **`Book2.xlsx`** — a CRM export of 9 cases with their investigation forms.
  Generated reference data, not production records. Transcribed verbatim into
  `src/data/rtaCases.js` by script, which is why that file says *do not
  hand-edit* — regenerate it rather than patching it.
- **`Investigation_Office_Workflow.pptx`** — the business process. Slides 5
  and 6 are BPMN process maps; they carry detail the text slides do not,
  including the termination approval chain and the fine-dispute route.

**Every picklist in `catalog.js` comes from the export.** Where RTA's value is
bilingual, `i18n/ar/domain.js` uses *their* Arabic, not a translation of ours.
If you need a new value, check the workbook before inventing one.

`COMPLAINTS` is `RTA_CASES` + 96 generated rows in the same shape. The real
ones sort to the top by date and are what a demo should open.

## Statements carry `dir="auto"`

RTA's driver and investigator statements are written in whichever language the
interview happened in, so an Arabic transcript has to render right-to-left
inside an English page. `dir="auto"` lets the browser pick direction from the
first strong character. Any field holding user-written prose needs it —
`InvestigationForm.jsx` is the reference.

## The vocabulary rule

**Nothing in the UI may name an action the officer does not have.** The
actions are the five in `DecisionBar.jsx`; the verdicts are `Confirmed` ·
`Inconclusive` · `False Positive`.

Both were violated by leftovers from the pre-scope action set (Substantiate /
Dismiss), which the POC document replaced: the AI verdict read
`Substantiated`, and its recommendation offered `Dismiss Complaint` and
`Request Additional Evidence` — none of which is a button on the Take Action
card, and none of which is SMC's word either. Two tests in
`complaints.test.js` now assert every generated verdict and every
recommendation is in the current set.

## Persisted data is versioned

`complaintStore.js` saves whole complaints — verdicts, stages and labels
included — so a rename leaves the old word alive in every browser that has
already run the app. That happened with `Substantiated`: the source was clean
and the screen still showed it.

The key carries `DATA_VERSION` (`smc-complaints-data.v2`) and `LEGACY_KEYS`
are swept on load. **Bump the version whenever the generated shape or its
vocabulary changes**, or the next rename will look broken in exactly the same
way.

## One definition of "still on this officer's plate"

`isOpenFor(complaint, officerId)` in `src/lib/cht.js`. Closed is obvious;
**escalated counts as off their plate too**, because the ruling belongs to the
supervisor from that point.

Every "how much has this officer got on" answer comes from it — the queue
tiles, `officerLoads()`, the reassign picker, and the arrival scheduler — so
they cannot disagree. They did once: a queue tile counted a complaint the
officer had already closed, because it only checked `pulledAt` and the
assignee — both of which a closed complaint keeps, for the audit trail.

## The Take Action card

The actions live in the **right-hand rail**, under Assigned To, exactly where
SMC puts them — not under the tab content, where they were first built. They
stay put while the tabs change beside them.

`ActionButton.jsx` is a separate primitive from the shared `Button` because
SMC treats it as one, and the numbers were measured off `/alerts/:id`:

| | |
|---|---|
| height / pitch | 32px / 42px (so a 10px gap) |
| padding / gap / radius | `0 10px` / 8px / 8px |
| type / icon | 14px/500 (600 on primary), 16px icon, left-aligned |
| fill | **the page ground**, `#f3f3f4` — hover `#eee` |
| danger | text `#f87171`, edge `rgb(239 68 68 / .4)` |
| neutral | text `#575757`, edge `rgb(148 163 184 / .3)` |
| success | text `#009a44`, edge `rgb(0 154 68 / .3)` |
| primary | `--primary` fill, white text, transparent edge |

The fill being the page ground rather than a tone tint is the thing to keep:
only the label and the hairline carry colour, which is what makes the stack
read as one block instead of four competing chips. It looks tinted in a
screenshot — that is JPEG chroma bleed off the coloured text, not a fill.
Verified by sampling a blank patch of each button.

## Shell layout

SMC is a full-height flex row: a 256px glass sidebar rail inset from the window
edge, then a content column holding the top bar and a `main` that scrolls. **The
window itself never scrolls** — the rail and top bar are fixed.

The sidebar is persistent from `lg` (1024px) up; below that the same nav renders
as a drawer behind the top bar's hamburger. `navItems.js` is the single source
for both, so they cannot drift. Do not replace the rail with a drawer at desktop
width — that is the portal's most recognisable feature.

Beware when measuring against the live portal: it renders at 1.5× device pixel
ratio, so a 1316px screenshot is only ~877 CSS px and shows the *narrow* layout.
Check `window.innerWidth`, not the screenshot.

## Arabic and RTL

The module is bilingual; **SMC itself is not** — its عربي button is inert, so
this is a deliberate departure rather than a copied behaviour.

- `useT()` translates **by English string**, so the English copy is the key.
  Anything missing from the dictionary renders in English rather than showing
  a placeholder, which keeps a partial dictionary safe to ship.
- Dictionaries live in `src/i18n/ar/` split by area — `shell`, `domain`,
  `pages`, `reports`, `forms`. `i18n.test.js` asserts every enum the queue can
  display has a translation, so adding a complaint type or stage without
  translating it fails the build.
- **Watch for one English string meaning two things.** `"Received"` was a
  timestamp column on the queue and a count column on the reports — the same
  key, two translations. The fix is to disambiguate the English
  (`"Complaints Received"`), not to invent a key scheme.
- **Data stays in its source language.** Driver names, company names and free
  text are not translated — the same convention every bilingual RTA system
  follows. Only UI vocabulary is.

### Writing RTL-safe markup

Use **logical properties**, never physical ones:

| Don't | Do |
|---|---|
| `pl-4` / `pr-4` | `ps-4` / `pe-4` |
| `ml-2` / `mr-2` | `ms-2` / `me-2` |
| `text-left` / `text-right` | `text-start` / `text-end` |
| `left-0` / `right-0` | `start-0` / `end-0` |
| `border-l` / `border-r` | `border-s` / `border-e` |

Three deliberate exceptions:

1. **Horizontal centring** (`left-1/2 -translate-x-1/2`) stays physical — it
   is direction-agnostic.
2. **Charts** carry `direction="ltr"` on the `<svg>`. Data geometry should not
   mirror; only the chrome around it does.
3. **Latin values inside Arabic text** — timestamps, IDs, plates — need the
   `.ltr-value` class (`direction: ltr; unicode-bidi: isolate`), or the bidi
   algorithm reorders them and `18 Sep, 11:20` renders as `Sep, 11:20 18`.

## Panels over modals

SMC opens slide-in panels from the right; so does this. There are no modal
dialogs in this codebase and there should not be any.

## The lint guard that matters

`.oxlintrc.json` enables **`no-undef`**, which oxlint leaves off by default.
It needs `"env": { "browser": true }` — without it around twenty files
false-positive on `document`, `localStorage` and `setInterval`.

This is not housekeeping. `/escalations` once shipped crashing on
`ReferenceError: t is not defined`: an edit script asserted then wrote, one
assertion failed mid-list, that file's write was abandoned, and the follow-up
run added the `t()` call sites without the import. The build passed, because
Vite does no scope analysis. `no-undef` plus the all-routes smoke test in
`routes.test.jsx` is what stops that recurring — leave both on.

## Commands

```bash
npm install --prefix frontend
npm run dev --prefix frontend      # http://localhost:3100
npm test --prefix frontend
npm run lint --prefix frontend
npm run build --prefix frontend
```
