# RTA Smart Investigation Initiative — Demo

A working front-end demo of the complaints investigation module for the RTA
Smart Monitoring Centre: a public complaint arrives from CRM, an AI
cross-validation engine weighs it against telematics and camera evidence, and
an investigation officer or supervisor rules on it inside a five-minute
handling target.

**▶ [Open the demo](https://rta-sii.github.io/smart-investigator/)**

## Signing in

The username is the account, and the role follows from it — there is no role
picker. Both accounts share one password.

| Username | Password | Role | What they do |
|---|---|---|---|
| `officer1` | `Ducont1234` | **Investigation Officer** | Complaints are handed to them one at a time. Run the AI cross-validation, then rule — or escalate where the evidence is thin. |
| `supervisor1` | `Ducont1234` | **Supervisor** | Monitors the centre, sees every complaint, assigns work by hand, and rules on the referrals officers send up. |

A six-digit passcode step follows, and it fills itself in — there is nowhere
to send an SMS from, and a demo that can lock its own presenter out of the
room is worse than no demo at all. The password is the part that is really
checked.

**That check runs in the browser, so it is a front door and not a lock.** This
is a static site: the whole bundle reaches the visitor before any of it runs.
The passwords are stored as SHA-256 rather than in the clear, which is enough
to stop a casual look and nothing more. Real access control is Cloudflare
Access, in front of the site, where a stranger is turned away before the app is
served at all — see [DEPLOY.md](DEPLOY.md). The GitHub Pages link above is the
open copy and is retired at the end of that process.

Sign in as the officer and the demo runs itself: the queue starts empty, a
complaint is assigned three seconds later with its clock already running, and
the next arrives twenty seconds after that one is settled.

## Running it locally

```bash
npm install --prefix frontend
npm run dev --prefix frontend   # http://localhost:3100
```

```bash
npm test --prefix frontend
npm run lint --prefix frontend
npm run build --prefix frontend
```

## What this is, and is not

It is a **front-end demo against a deterministic mock dataset** — 96 generated
complaints from a seeded PRNG, so the queue, the KPIs and the charts always
agree with one another and survive a reload. There is no backend, no database
and no CRM connection; CRM is represented as provenance, with every complaint
carrying a reference and every audit trail opening with the handover.

Nothing here is real. No personal data of any kind is included: the drivers,
complainants, plates and statements are all generated, and the evidence tiles
render a placeholder frame rather than camera stills.

The look is a deliberate 1:1 replica of the live SMC portal — tokens, type
scale, component specs and animations were measured off the running portal
rather than eyeballed from screenshots.

## Documentation

- `PROJECT.md` — scope, current state, and a phase-by-phase build log
- `CONVENTIONS.md` — design system, code layout, and the rules worth knowing
  before changing anything

## Assets

The RTA wordmark, icon and the four RTA typeface weights in `frontend/public/`
belong to the Roads and Transport Authority and are included so the demo
renders in the authority's own identity. They are not licensed for reuse
outside this demonstration.
