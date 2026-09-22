# RTA Smart Investigator Initiative — Demo

A working front-end demo of the complaints investigation module for the RTA
Smart Monitoring Centre: a public complaint arrives from CRM, an AI
cross-validation engine weighs it against telematics and camera evidence, and
an investigation officer or supervisor rules on it inside a five-minute
handling target.

**▶ [Open the demo](https://rta-smartinvestigationinitiative-demo.netlify.app/)**

No sign-in: pick a role on the landing screen.

| Role | What they do |
|---|---|
| **Investigation Officer** | Complaints are handed to them one at a time. Run the AI cross-validation, then close as False Positive, No Fine Required, Issue Fine — or escalate where the evidence is thin. |
| **Supervisor** | Monitors the centre, sees every complaint, assigns work by hand, and rules on referrals. |

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
