/**
 * Who may sign in, and how the sign-in screen checks them.
 *
 * The username is the account; the role follows from it, which is why there
 * is no role chooser any more. `officer1` is Layla Al-Hammadi, `supervisor1`
 * is Omar Bin Haider — the same two personas, reached by signing in as them
 * rather than by picking them off a card.
 *
 * ## What this is, and is not
 *
 * Passwords are held as SHA-256, not in the clear, which raises the bar from
 * "search the bundle for a quoted string" to "write a script". That is the
 * honest extent of it. This is a **static site**: the whole bundle reaches the
 * visitor before any of this code runs, so a determined person can read the
 * digests and call `authenticate` in a loop. No password checked in a browser
 * can be otherwise.
 *
 * It is the demo's front door — it stops a casual visitor, and it gives RTA a
 * sign-in that looks like the portal it is modelling. The lock is Cloudflare
 * Access, in front of the site, where a stranger is turned away before the app
 * is served at all. See DEPLOY.md.
 */

const ACCOUNTS = [
  {
    username: "officer1",
    roleId: "officer",
    hash: "074564d2857c8dafe660699778c0127dd2b7e53c46e8c3c5c53e30182c9125e8",
  },
  {
    username: "supervisor1",
    roleId: "supervisor",
    hash: "074564d2857c8dafe660699778c0127dd2b7e53c46e8c3c5c53e30182c9125e8",
  },
]

/** The usernames the sign-in screen accepts, for tests and for the help text. */
export const USERNAMES = ACCOUNTS.map((a) => a.username)

async function sha256(text) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text),
  )
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

/**
 * The role behind these credentials, or null.
 *
 * Case and surrounding space are forgiven on the username — nobody should be
 * locked out of a demo by a capital letter — and never on the password.
 *
 * The digest is computed whether or not the username exists, so a wrong
 * username and a wrong password fail the same way rather than the screen
 * quietly confirming which of the two was right.
 */
export async function authenticate(username, password) {
  const account = ACCOUNTS.find(
    (a) => a.username === String(username ?? "").trim().toLowerCase(),
  )
  const digest = await sha256(String(password ?? ""))
  return account && digest === account.hash ? account.roleId : null
}
