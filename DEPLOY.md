# Deployment — putting the demo behind a login

The demo is a static site with no backend, so a password checked in the
browser is theatre: the whole bundle is sent to the visitor before the check
runs, and anyone who opens devtools can read it. The gate has to sit **in
front of the site**, which is what Cloudflare Access does — a stranger is
stopped at Cloudflare's edge and never receives the app at all.

Cloudflare Pages hosts it; Cloudflare Access guards it. Both are free at this
size (Access is free up to 50 users).

The repo side is already done. What follows needs your Cloudflare account, so
it is yours to run.

---

## 1. Create the Cloudflare Pages project

1. Sign in at <https://dash.cloudflare.com> (create a free account if needed).
2. **Compute (Workers & Pages) → Create → Pages → Connect to Git**.
3. Authorise GitHub and pick **RTA-SII/smart-investigator**.
4. Set the build exactly as follows, then **Save and Deploy**:

   | Field | Value |
   |---|---|
   | Production branch | `main` |
   | Framework preset | None |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory | `frontend` |

   Nothing else needs setting. `frontend/.nvmrc` pins Node 22 — Vite 8 needs
   `^20.19 \|\| >=22.12`, and Cloudflare's default is older than that.

   Do **not** set a `VITE_BASE` variable. Cloudflare serves the site from the
   root of its own hostname and the build defaults to that; `VITE_BASE` exists
   only for GitHub Pages, which serves from `/smart-investigator/`.

5. The first build takes a couple of minutes and produces a URL like
   `https://smart-investigator.pages.dev`. **It is public at this point** —
   step 2 is what closes it.

## 2. Put Access in front of it

1. **Zero Trust** in the dashboard sidebar. First visit asks you to pick a
   team name (part of your login URL, e.g. `rta-sii`) and a plan — choose
   **Free**.
2. **Access → Applications → Add an application → Self-hosted**.
3. Name it `Smart Investigation Initiative`. Under **Public hostname**, select
   the Pages project so it covers `smart-investigator.pages.dev` and its
   subdomains.
4. Add a policy:

   | Field | Value |
   |---|---|
   | Policy name | `RTA reviewers` |
   | Action | Allow |
   | Include | **Emails** — list each reviewer's address |

   Use **Emails ending in** `@rta.ae` to admit anyone at RTA instead of
   listing them one by one. Keep your own address on the list or you will lock
   yourself out.
5. Leave the identity method as the default **One-time PIN**. A reviewer enters
   their email, receives a six-digit code, and is in. Nobody needs a Cloudflare
   account and there is no shared password to leak or rotate.

## 3. Verify it is actually closed

Open the `.pages.dev` URL in a private window. You must get Cloudflare's email
prompt, **not** the app. If the app loads, the policy is not attached to the
hostname — fix that before sharing the link.

## 4. Retire the open GitHub Pages copy

Until this is done there is an unauthenticated copy of the demo at
<https://rta-sii.github.io/smart-investigator/> and the gate protects nothing.

**Settings → Pages → Build and deployment → Source → None.** Then delete the
`deploy` job from `.github/workflows/ci.yml` (keep `build` — lint, test and
build should still run on every push) and drop the `VITE_BASE` line with it.

Leave this until Cloudflare is verified, so the demo is never dark.

---

## Custom domain (optional)

A `.pages.dev` URL works, but Pages will serve a custom domain on any zone in
your Cloudflare account: **the Pages project → Custom domains → Set up a
domain**. Point the Access application at the custom hostname as well, or the
new address bypasses the gate.

## What is still true afterwards

Access controls **who can open the demo**. It does not make the repository
private — the source, including the seeded dataset, stays readable on GitHub.
That was a deliberate call (the data is generated, not production records),
but it is worth saying out loud when the link goes to RTA: the site is
restricted, the code is not.
